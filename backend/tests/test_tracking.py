import uuid

API = "/api/v1"
VISITOR = "a1b2c3d4e5f67890"
SESSION = "b1b2c3d4e5f67890"


def _login(client) -> dict:
    from app.services.admin_auth import clear_attempts

    clear_attempts("testclient")
    response = client.post(f"{API}/admin/login", json={"email": "admin@kinedoux.com", "password": "test-admin-pass"})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['token']}"}


def _visit(client, event: str, visitor: str = VISITOR, session: str = SESSION, **extra):
    body = {
        "visitor_id": visitor,
        "session_id": session,
        "event": event,
        "path": "/products/kenidoux-lumba",
        "utm_source": "facebook",
        "utm_campaign": "lumba_broad_ma",
        "utm_content": "v1",
        "fbclid": "AbC+keep",
    }
    body.update(extra)
    return client.post(f"{API}/track", json=body, headers={"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"})


def test_bots_and_admin_visits_are_ignored(client):
    bot = client.post(
        f"{API}/track",
        json={"visitor_id": VISITOR, "session_id": SESSION, "event": "page_view"},
        headers={"User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)"},
    )
    assert bot.status_code == 202 and bot.json()["stored"] is False
    own = client.post(
        f"{API}/track",
        json={"visitor_id": VISITOR, "session_id": SESSION, "event": "page_view"},
        headers={"User-Agent": "Mozilla/5.0", "Cookie": "kd_admin=desk"},
    )
    assert own.status_code == 202 and own.json()["ignored"] is True


def test_visit_is_stored_and_order_keeps_the_campaign(client):
    auth = _login(client)
    before = client.get(f"{API}/admin/metrics", params={"range": "today"}, headers=auth).json()
    first = _visit(client, "page_view")
    second = _visit(client, "page_view")
    product = _visit(client, "product_view", product_slug="kenidoux-lumba")
    checkout = _visit(client, "checkout_started", product_slug="kenidoux-lumba")
    assert first.status_code == 202 and first.json()["stored"] is True
    assert second.json()["stored"] is True and product.json()["stored"] is True and checkout.json()["stored"] is True

    created = client.post(
        f"{API}/orders",
        json={
            "customer_name": "هند — الرباط",
            "customer_phone": "0691000099",
            "items": [{"product_slug": "kenidoux-lumba", "offer_id": "lumba-2", "quantity": 1}],
            "event_id": f"evt_purchase_{uuid.uuid4()}",
            "tracking": {"visitor_id": VISITOR, "session_id": SESSION, "page_url": "https://kinedoux.com/products/kenidoux-lumba"},
        },
    )
    assert created.status_code == 201, created.text

    listed = client.get(f"{API}/admin/orders", headers=auth, params={"q": "0691000099"})
    row = listed.json()["items"][0]
    assert row["campaign"] == "lumba_broad_ma"
    assert row["status"] == "new"

    after = client.get(f"{API}/admin/metrics", params={"range": "today"}, headers=auth).json()
    assert after["traffic"]["page_views"] == before["traffic"]["page_views"] + 2
    assert after["traffic"]["visitors"] == before["traffic"]["visitors"] + 1
    assert after["traffic"]["sessions"] == before["traffic"]["sessions"] + 1
    assert after["pipeline"]["orders"] == before["pipeline"]["orders"] + 1
    steps = {step["step"]: step["count"] for step in after["funnel"]}
    assert steps["visitors"] >= 1
    assert steps["product_views"] <= steps["visitors"]
    assert steps["checkout_starts"] <= steps["product_views"]
    assert steps["orders"] <= steps["checkout_starts"]
    assert steps["orders"] >= 1
    assert after["conversion_rate"] is not None and after["conversion_rate"] <= 100
    assert after["untracked_orders"] == before.get("untracked_orders", 0)


def test_duplicate_event_and_untracked_order(client):
    auth = _login(client)
    event_id = "a1b2c3d4e5"
    first = _visit(client, "page_view", event_id=event_id)
    second = _visit(client, "page_view", event_id=event_id)
    assert first.json()["stored"] is True
    assert second.json()["stored"] is False
    created = client.post(
        f"{API}/orders",
        json={
            "customer_name": "هند — الرباط",
            "customer_phone": "0691000088",
            "items": [{"product_slug": "kenidoux-lumba", "offer_id": "lumba-1", "quantity": 1}],
            "event_id": f"evt_purchase_{uuid.uuid4()}",
            "tracking": {},
        },
    )
    assert created.status_code == 201, created.text
    report = client.get(f"{API}/admin/metrics", params={"range": "today"}, headers=auth).json()
    assert report["untracked_orders"] >= 1
    assert report["conversion_rate"] is None or report["conversion_rate"] <= 100
    counts = [step["count"] for step in report["funnel"]]
    assert counts == sorted(counts, reverse=True)


def test_url_flag_is_not_a_test_and_admin_session_is(client):
    from app.services.sheets_webhook import build_sheet_payload
    from app.services.snapshot import OrderSnapshot
    from datetime import datetime, timezone

    auth = _login(client)
    hidden = client.post(
        f"{API}/track",
        json={"visitor_id": VISITOR, "session_id": SESSION, "event": "page_view", "path": "/admin/orders"},
        headers={"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"},
    )
    assert hidden.json()["stored"] is False
    before = client.get(f"{API}/admin/metrics", params={"range": "today"}, headers=auth).json()
    spoofed = client.post(
        f"{API}/orders",
        json={
            "customer_name": "هند — الرباط",
            "customer_phone": "0691000077",
            "items": [{"product_slug": "kenidoux-lumba", "offer_id": "lumba-1", "quantity": 1}],
            "event_id": f"evt_purchase_{uuid.uuid4()}",
            "tracking": {"visitor_id": VISITOR, "session_id": SESSION, "is_test": True, "utm_source": "facebook", "utm_campaign": "test"},
        },
    )
    assert spoofed.status_code == 201, spoofed.text
    listed = client.get(f"{API}/admin/orders", headers=auth, params={"q": "0691000077"}).json()
    assert listed["items"][0]["is_test"] is False
    mid = client.get(f"{API}/admin/metrics", params={"range": "today"}, headers=auth).json()
    assert mid["pipeline"]["orders"] == before["pipeline"]["orders"] + 1
    assert mid["pipeline"]["revenue_placed"] == before["pipeline"]["revenue_placed"] + 499

    token = client.post(f"{API}/admin/login", json={"email": "admin@kinedoux.com", "password": "test-admin-pass"}).json()["token"]
    admin_order = client.post(
        f"{API}/orders",
        json={
            "customer_name": "هند — الرباط",
            "customer_phone": "0691000076",
            "items": [{"product_slug": "kenidoux-lumba", "offer_id": "lumba-1", "quantity": 1}],
            "event_id": f"evt_purchase_{uuid.uuid4()}",
            "tracking": {"visitor_id": VISITOR, "session_id": SESSION, "utm_source": "facebook", "utm_campaign": "test"},
        },
        headers={"x-admin-session": token, "User-Agent": "Mozilla/5.0"},
    )
    assert admin_order.status_code == 201, admin_order.text
    marked = client.get(f"{API}/admin/orders", headers=auth, params={"q": "0691000076"}).json()
    assert marked["items"][0]["is_test"] is True
    assert marked["items"][0]["campaign"] == "test"
    snap = OrderSnapshot(
        id=uuid.uuid4(),
        order_number="KD-TEST",
        customer_name="هند",
        phone_e164="+212600000000",
        phone_digits="212600000000",
        phone_local="0600000000",
        country="MA",
        status="confirmed",
        items=[],
        subtotal_mad=499,
        upsell_added=False,
        upsell_product_slug=None,
        upsell_price_mad=0,
        total_mad=499,
        currency="MAD",
        event_id="evt",
        created_at=datetime.now(timezone.utc),
        is_test=True,
    )
    payload = build_sheet_payload(snap)
    assert payload["agent_notes"] == "TEST"
    assert payload["customer_name"].startswith("TEST — ")
    after = client.get(f"{API}/admin/metrics", params={"range": "today"}, headers=auth).json()
    assert after["pipeline"]["orders"] == mid["pipeline"]["orders"]
    assert after["pipeline"]["revenue_placed"] == mid["pipeline"]["revenue_placed"]


def test_in_app_browser_visit_is_stored_and_dashed_id_links(client):
    auth = _login(client)
    facebook = (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 "
        "(KHTML, like Gecko) Mobile/21F79 [FBAN/FBIOS;FBAV/470.1.0.0.0;FBDV/iPhone15,2]"
    )
    instagram = (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 "
        "(KHTML, like Gecko) Mobile/21F79 Instagram 350.0.0.0.0"
    )
    dashed_visitor = "c1b2c3d4-e5f6-7890-abcd-ef1234567890"
    dashed_session = "d1b2c3d4-e5f6-7890-abcd-ef1234567890"
    visit = client.post(
        f"{API}/track",
        json={
            "visitor_id": dashed_visitor,
            "session_id": dashed_session,
            "event": "page_view",
            "path": "/products/kenidoux-lumba",
            "utm_source": "facebook",
            "utm_campaign": "iab",
        },
        headers={"User-Agent": facebook},
    )
    assert visit.status_code == 202 and visit.json()["stored"] is True
    ig = client.post(
        f"{API}/track",
        json={
            "visitor_id": "e1b2c3d4e5f6789012345678abcdef90",
            "session_id": "f1b2c3d4e5f6789012345678abcdef90",
            "event": "page_view",
            "path": "/products/kenidoux-lumba",
        },
        headers={"User-Agent": instagram},
    )
    assert ig.status_code == 202 and ig.json()["stored"] is True
    created = client.post(
        f"{API}/orders",
        json={
            "customer_name": "هند — الرباط",
            "customer_phone": "0691000074",
            "items": [{"product_slug": "kenidoux-lumba", "offer_id": "lumba-1", "quantity": 1}],
            "event_id": f"evt_purchase_{uuid.uuid4()}",
            "tracking": {"visitor_id": dashed_visitor, "session_id": dashed_session, "utm_source": "facebook", "utm_campaign": "iab"},
        },
    )
    assert created.status_code == 201, created.text
    listed = client.get(f"{API}/admin/orders", headers=auth, params={"q": "0691000074"}).json()
    assert listed["items"][0]["tracked"] is True
    assert listed["items"][0]["campaign"] == "iab"
    assert listed["items"][0]["is_test"] is False
