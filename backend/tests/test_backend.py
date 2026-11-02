import hashlib
import time
import uuid

import pytest

API = "/api/v1"


def sha(v: str) -> str:
    return hashlib.sha256(v.encode()).hexdigest()


def wait_for(predicate, timeout=8.0, step=0.1):
    end = time.time() + timeout
    while time.time() < end:
        value = predicate()
        if value:
            return value
        time.sleep(step)
    return None


def order_payload(items=None, phone="0612345678", event_id=None, name="محمد العلمي"):
    return {
        "customer_name": name,
        "customer_phone": phone,
        "items": items or [{"product_slug": "kenidoux-lumba", "offer_id": "lumba-2", "quantity": 1}],
        "event_id": event_id or f"evt_purchase_{uuid.uuid4()}",
        "tracking": {"fbp": "fb.1.1.123", "utm_source": "facebook", "utm_campaign": "lumba_broad_ma"},
    }


# ----------------------------------------------------------------------------- config / phone
def test_database_url_normalization():
    from app.config import normalize_database_url

    for name in ("namabeauty", "kenidoux"):
        out = normalize_database_url(f"postgres://kenidoux:kenidoux@kenidoux_database:5432/{name}?sslmode=disable")
        assert out == f"postgresql+psycopg2://kenidoux:kenidoux@kenidoux_database:5432/{name}?sslmode=disable"
    assert normalize_database_url("postgresql://u:p@h/db").startswith("postgresql+psycopg2://")
    assert normalize_database_url("postgresql+asyncpg://u:p@h/db").startswith("postgresql+psycopg2://")


@pytest.mark.parametrize(
    "raw,country,e164,digits",
    [
        ("0612345678", "MA", "+212612345678", "212612345678"),
        ("0712345678", "MA", "+212712345678", "212712345678"),
        ("+212612345678", "MA", "+212612345678", "212612345678"),
        ("٠٦١٢٣٤٥٦٧٨", "MA", "+212612345678", "212612345678"),
        ("0512345678", "SA", "+966512345678", "966512345678"),
        ("+966 51 234 5678", "SA", "+966512345678", "966512345678"),
        ("512345678", "SA", "+966512345678", "966512345678"),
    ],
)
def test_phone_valid(raw, country, e164, digits):
    from app.services.phone_normalizer import validate_and_format_phone

    r = validate_and_format_phone(raw)
    assert r.is_valid and r.country == country
    assert r.e164_with_plus == e164 and r.digits_no_plus == digits
    assert not r.digits_no_plus.startswith("+")


@pytest.mark.parametrize("raw", ["", "06123", "0412345678", "061234567890", "abcdefghij"])
def test_phone_invalid(raw):
    from app.services.phone_normalizer import validate_and_format_phone

    assert not validate_and_format_phone(raw).is_valid


def test_phone_modes():
    from app.services.phone_normalizer import validate_and_format_phone

    assert not validate_and_format_phone("0612345678", "KSA").is_valid
    assert not validate_and_format_phone("0512345678", "MA").is_valid
    assert validate_and_format_phone("0512345678", "KSA").is_valid


# ----------------------------------------------------------------------------- startup / catalog
def test_health_and_seed(client):
    r = client.get(f"{API}/health")
    assert r.status_code == 200 and r.json() == {"status": "ok", "brand": "kenidoux", "database": "connected"}

    products = {p["slug"]: p for p in client.get(f"{API}/products").json()}
    assert set(products) == {"kenidoux-lumba", "kenidoux-posta", "kenidoux-calma"}
    assert products["kenidoux-lumba"]["base_price_mad"] == 499
    assert [o["price_mad"] for o in products["kenidoux-lumba"]["offers_json"]] == [499, 849, 1149]
    assert [o["price_mad"] for o in products["kenidoux-posta"]["offers_json"]] == [379, 649, 899]
    assert [o["price_mad"] for o in products["kenidoux-calma"]["offers_json"]] == [349, 599, 890]
    assert products["kenidoux-calma"]["cross_sell_price_mad"] == 199
    assert client.get(f"{API}/products/kenidoux-posta").json()["name_ar"] == "كينيدو بوسطا"
    assert client.get(f"{API}/products/nope").status_code == 404


def test_cors_allows_site_and_api_origins(client):
    for origin in ("https://kinedoux.com", "https://www.kinedoux.com", "http://localhost:3000"):
        r = client.options(
            f"{API}/orders",
            headers={"Origin": origin, "Access-Control-Request-Method": "POST"},
        )
        assert r.headers.get("access-control-allow-origin") == origin


# ----------------------------------------------------------------------------- order funnel
def test_order_accept_upsell_flow(client, sheet_calls):
    r = client.post(f"{API}/orders", json=order_payload(), headers={"User-Agent": "UA/1", "X-Forwarded-For": "196.200.1.2"})
    assert r.status_code == 201, r.text
    order = r.json()
    assert order["status"] == "pending_upsell"
    assert order["subtotal_mad"] == order["total_mad"] == 849
    assert order["order_number"].startswith("KD-")
    assert order["customer_phone_e164"] == "+212612345678"
    assert order["customer_phone_digits"] == "212612345678"
    offer = order["upsell_offer"]
    assert (offer["product_slug"], offer["price_mad"], offer["compare_at_mad"]) == ("kenidoux-calma", 199, 349)

    r = client.post(f"{API}/orders/{order['id']}/upsell", json={"accepted": True, "upsell_price_mad": 1})
    assert r.status_code == 200, r.text
    done = r.json()
    assert done["status"] == "confirmed" and done["upsell_added"] is True
    assert done["upsell_price_mad"] == 199  # client-sent price ignored
    assert done["total_mad"] == 1048
    assert done["upsell_product_slug"] == "kenidoux-calma"

    call = wait_for(lambda: sheet_calls[0] if sheet_calls else None)
    assert call, "Google Sheets webhook was not called"
    assert call["secret"] == "s3cret"
    assert call["order_number"] == order["order_number"]
    assert call["customer_phone_local"] == "0612345678"
    assert call["customer_phone_e164"] == "+212612345678"
    assert call["total_mad"] == 1048 and call["total_units"] == 3
    assert call["upsell_accepted"] == "نعم (+199 د.م)"
    assert call["upsell_product_name"] == "كينيدو كالما"
    assert call["utm_source"] == "facebook" and call["event_id"] == order["event_id"]
    assert call["whatsapp_quick_link"].startswith("https://wa.me/212612345678?text=")

    # idempotent: a second decision must not re-send anything
    client.post(f"{API}/orders/{order['id']}/upsell", json={"accepted": False})
    time.sleep(0.6)
    assert len(sheet_calls) == 1

    pub = client.get(f"{API}/orders/{order['id']}").json()
    assert pub["status"] == "confirmed" and pub["total_mad"] == 1048
    assert "customer_phone_e164" not in pub


def test_thank_you_offer_can_be_added_after_decline(client):
    order = client.post(f"{API}/orders", json=order_payload()).json()
    client.post(f"{API}/orders/{order['id']}/upsell", json={"accepted": False})
    pub = client.get(f"{API}/orders/{order['id']}").json()
    assert pub["upsell_added"] is False
    assert (pub["upsell_offer"]["product_slug"], pub["upsell_offer"]["price_mad"]) == ("kenidoux-calma", 199)

    done = client.post(
        f"{API}/orders/{order['id']}/upsell",
        json={"accepted": True, "upsell_price_mad": 1},
    ).json()
    assert done["upsell_added"] is True and done["upsell_price_mad"] == 199
    assert done["total_mad"] == order["total_mad"] + 199

    again = client.get(f"{API}/orders/{order['id']}").json()
    assert again["upsell_added"] is True and again["upsell_offer"] is None
    assert again["total_mad"] == order["total_mad"] + 199


def test_order_decline_flow(client, sheet_calls):
    order = client.post(
        f"{API}/orders",
        json=order_payload([{"product_slug": "kenidoux-posta", "offer_id": "posta-1", "quantity": 1}]),
    ).json()
    done = client.post(f"{API}/orders/{order['id']}/upsell", json={"accepted": False}).json()
    assert done["status"] == "confirmed" and done["upsell_added"] is False and done["total_mad"] == 379
    call = wait_for(lambda: sheet_calls[0] if sheet_calls else None)
    assert call and call["upsell_accepted"] == "لا" and call["total_mad"] == 379


def test_safety_net_finalizes_when_customer_closes_tab(client, sheet_calls):
    order = client.post(f"{API}/orders", json=order_payload()).json()
    assert order["status"] == "pending_upsell"
    assert not sheet_calls
    call = wait_for(lambda: sheet_calls[0] if sheet_calls else None, timeout=10)  # UPSELL_AUTO_FINALIZE_SECONDS=2
    assert call, "safety net did not push the order to the sheet"
    assert call["order_number"] == order["order_number"] and call["total_mad"] == 849
    assert call["upsell_accepted"] == "لا"
    assert client.get(f"{API}/orders/{order['id']}").json()["status"] == "confirmed"


def test_create_is_idempotent_on_event_id(client):
    payload = order_payload()
    a = client.post(f"{API}/orders", json=payload).json()
    b = client.post(f"{API}/orders", json=payload).json()
    assert a["id"] == b["id"] and a["order_number"] == b["order_number"]


def test_prices_are_server_side_and_inputs_validated(client):
    tampered = order_payload(
        [{"product_slug": "kenidoux-lumba", "offer_id": "lumba-1", "quantity": 1, "price": 1, "price_mad": 1}]
    )
    assert client.post(f"{API}/orders", json=tampered).json()["total_mad"] == 499

    cross = order_payload(
        [
            {"product_slug": "kenidoux-lumba", "offer_id": "lumba-1", "quantity": 1},
            {"product_slug": "kenidoux-calma", "offer_id": "crosssell-kenidoux-calma", "quantity": 1, "is_cross_sell": True},
        ]
    )
    assert client.post(f"{API}/orders", json=cross).json()["total_mad"] == 499 + 199

    bad_offer = order_payload([{"product_slug": "kenidoux-lumba", "offer_id": "lumba-99", "quantity": 1}])
    assert client.post(f"{API}/orders", json=bad_offer).status_code == 422
    bad_slug = order_payload([{"product_slug": "nope", "offer_id": "x", "quantity": 1}])
    assert client.post(f"{API}/orders", json=bad_slug).status_code == 422
    assert client.post(f"{API}/orders", json=order_payload(phone="12345")).status_code == 422
    assert client.post(f"{API}/orders", json=order_payload(name="ab")).status_code == 422
    assert client.post(f"{API}/orders", json={**order_payload(), "items": []}).status_code == 422
    assert client.post(f"{API}/orders/{uuid.uuid4()}/upsell", json={"accepted": False}).status_code == 404


def test_ksa_number_accepted(client):
    r = client.post(f"{API}/orders", json=order_payload(phone="0512345678"))
    assert r.status_code == 201 and r.json()["customer_phone_e164"] == "+966512345678"
    assert r.json()["customer_country"] == "SA"


def test_upsell_matrix(client):
    def offer_for(items):
        return client.post(f"{API}/orders", json=order_payload(items)).json()["upsell_offer"]

    lumba = {"product_slug": "kenidoux-lumba", "offer_id": "lumba-1", "quantity": 1}
    calma = {"product_slug": "kenidoux-calma", "offer_id": "calma-1", "quantity": 1}
    kit = {"product_slug": "kenidoux-calma", "offer_id": "calma-3", "quantity": 1}

    assert offer_for([lumba])["product_slug"] == "kenidoux-calma" and offer_for([lumba])["price_mad"] == 199
    posta = offer_for([lumba, calma])
    assert (posta["product_slug"], posta["price_mad"]) == ("kenidoux-posta", 229)
    last = offer_for([kit])
    assert (last["product_slug"], last["price_mad"]) == ("kenidoux-lumba", 299)

    kit_order = client.post(f"{API}/orders", json=order_payload([kit])).json()
    assert kit_order["total_mad"] == 890 and kit_order["items"][0]["units"] == 3


def test_event_tracking_relay_and_contact(client):
    r = client.post(
        f"{API}/events/track",
        json={"event_name": "AddToCart", "event_id": "evt_atc_" + uuid.uuid4().hex, "value": 849},
    )
    assert r.status_code == 202
    assert client.post(f"{API}/events/track", json={"event_name": "Purchase", "event_id": "evt_purchase_12345678"}).status_code == 422
    assert client.post(f"{API}/events/track", json={"event_name": "PageView", "event_id": "bad id!"}).status_code == 422

    ok = client.post(
        f"{API}/contact",
        json={"full_name": "سناء", "phone": "0612345678", "subject": "تتبع طلب", "message": "بغيت نتبع الكولية ديالي"},
    )
    assert ok.status_code == 201 and ok.json()["ok"] is True
    bad = client.post(
        f"{API}/contact", json={"full_name": "سناء", "phone": "999", "subject": "تتبع طلب", "message": "مرحبا"}
    )
    assert bad.status_code == 422


# ----------------------------------------------------------------------------- CAPI payloads
def _event(**kw):
    from app.services.capi_service import CapiEvent, UserContext

    user = UserContext(
        phone_digits="212612345678",
        phone_e164="+212612345678",
        full_name="Mohamed Alami Idrissi",
        country="MA",
        ip="196.200.140.12",
        user_agent="UA",
        fbp="fb.1.1.1",
        fbc="fb.1.1.abc",
        ttp="ttp1",
        ttclid="tt1",
        sc_cookie1="sc1",
        sc_click_id="scc1",
    )
    return CapiEvent(
        name=kw.get("name", "Purchase"),
        event_id="evt_purchase_9b1deb4d",
        source_url="https://kenidoux.com/thank-you",
        user=user,
        value=1048.0,
        order_id="KD-2026-1042",
        contents=[
            {"id": "kenidoux-lumba", "quantity": 2, "item_price": 424.5, "name": "كينيدو لومبا"},
            {"id": "kenidoux-calma", "quantity": 1, "item_price": 199, "name": "كينيدو كالما"},
        ],
    )


def test_capi_phone_rules_and_dedup(client, monkeypatch):
    from app.config import settings
    from app.services import capi_service as c

    monkeypatch.setattr(settings, "META_TEST_EVENT_CODE", "TEST123")
    monkeypatch.setattr(settings, "TIKTOK_PIXEL_ID", "TTPIXEL")
    monkeypatch.setattr(settings, "TIKTOK_TEST_EVENT_CODE", "TTTEST")
    ev = _event()

    meta = c.build_meta_payload(ev)
    m = meta["data"][0]
    assert m["event_name"] == "Purchase" and m["event_id"] == ev.event_id and m["action_source"] == "website"
    assert m["user_data"]["ph"] == [sha("212612345678")]  # digits only, NO plus
    assert m["user_data"]["ph"] != [sha("+212612345678")]
    assert m["user_data"]["country"] == [sha("ma")]
    assert m["user_data"]["fn"] == [sha("mohamed")] and m["user_data"]["ln"] == [sha("alamiidrissi")]
    assert m["custom_data"]["content_ids"] == ["kenidoux-lumba", "kenidoux-calma"]
    assert m["custom_data"]["num_items"] == 3 and meta["test_event_code"] == "TEST123"

    tt = c.build_tiktok_payload(ev)
    t = tt["data"][0]
    assert tt["event_source"] == "web" and tt["event_source_id"] == "TTPIXEL" and tt["test_event_code"] == "TTTEST"
    assert t["event"] == "CompletePayment" and t["event_id"] == ev.event_id
    assert t["user"]["phone"] == sha("+212612345678")  # WITH plus
    assert t["user"]["phone"] != sha("212612345678")
    assert t["page"]["url"].endswith("/thank-you") and t["properties"]["order_id"] == "KD-2026-1042"

    sn = c.build_snap_payload(ev)["data"][0]
    assert sn["event_name"] == "PURCHASE" and sn["event_id"] == ev.event_id and sn["action_source"] == "WEB"
    assert sn["user_data"]["ph"] == [sha("212612345678")]  # NO plus
    assert sn["user_data"]["sc_cookie1"] == "sc1"
    assert sn["custom_data"]["contents"][0] == {"id": "kenidoux-lumba", "quantity": "2", "item_price": "424.5"}


@pytest.mark.parametrize(
    "name,meta,tiktok,snap",
    [
        ("PageView", "PageView", "Pageview", "PAGE_VIEW"),
        ("ViewContent", "ViewContent", "ViewContent", "VIEW_CONTENT"),
        ("AddToCart", "AddToCart", "AddToCart", "ADD_CART"),
        ("InitiateCheckout", "InitiateCheckout", "InitiateCheckout", "START_CHECKOUT"),
        ("Purchase", "Purchase", "CompletePayment", "PURCHASE"),
    ],
)
def test_event_name_mapping(client, name, meta, tiktok, snap):
    from app.services import capi_service as c

    ev = _event(name=name)
    assert c.build_meta_payload(ev)["data"][0]["event_name"] == meta
    assert c.build_tiktok_payload(ev)["data"][0]["event"] == tiktok
    assert c.build_snap_payload(ev)["data"][0]["event_name"] == snap
    for p in (c.build_meta_payload(ev), c.build_tiktok_payload(ev), c.build_snap_payload(ev)):
        assert p["data"][0]["event_id"] == ev.event_id


def test_capi_sends_to_all_platforms_when_configured(client, monkeypatch):
    import asyncio

    import httpx

    from app.config import settings
    from app.services import capi_service as c

    for k, v in dict(
        META_PIXEL_ID="111", META_CAPI_ACCESS_TOKEN="mtok", TIKTOK_PIXEL_ID="TT", TIKTOK_ACCESS_TOKEN="ttok",
        SNAP_PIXEL_ID="SN", SNAP_CAPI_ACCESS_TOKEN="stok",
    ).items():
        monkeypatch.setattr(settings, k, v)

    seen = []

    def handler(request: httpx.Request):
        seen.append((str(request.url), dict(request.headers)))
        return httpx.Response(200, json={"code": 0})

    c._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        ok = asyncio.run(c.send_event(_event()))
    finally:
        c._client = None
    urls = [u for u, _ in seen]
    assert ok
    assert any(u.startswith("https://graph.facebook.com/v21.0/111/events?access_token=mtok") for u in urls)
    assert any(u == "https://business-api.tiktok.com/open_api/v1.3/event/track/" for u in urls)
    assert any(u.startswith("https://tr.snapchat.com/v3/SN/events?access_token=stok") for u in urls)
    tiktok_headers = next(h for u, h in seen if "tiktok" in u)
    assert tiktok_headers["access-token"] == "ttok"


def test_migration_matches_models(client):
    """The hand-written Alembic migration must produce exactly the schema the ORM models expect."""
    from alembic.autogenerate import compare_metadata
    from alembic.migration import MigrationContext

    from app.database import engine
    from app.models import Base

    with engine.connect() as conn:
        diff = compare_metadata(MigrationContext.configure(conn, opts={"compare_type": True}), Base.metadata)
    # `alembic_version` is not part of the metadata; anything else is real drift
    diff = [d for d in diff if not (d[0] == "remove_table" and d[1].name == "alembic_version")]
    assert diff == []
