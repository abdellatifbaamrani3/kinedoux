"""Server-side Conversions APIs: Meta (Graph v21), TikTok Events API v1.3, Snapchat CAPI v3.

Phone rules (docs/06):
  * Meta + Snapchat : digits only WITHOUT '+'  (212612345678 / 966512345678) -> SHA-256
  * TikTok          : E.164 WITH '+'           (+212612345678 / +966512345678) -> SHA-256
Every event carries the SAME event_id the browser pixel used, so platforms deduplicate 100%.
"""

import asyncio
import hashlib
import logging
import re
import time
import uuid
from dataclasses import dataclass, field

import httpx
from starlette.concurrency import run_in_threadpool

from app.config import settings
from app.database import SessionLocal
from app.models.tracking import PixelEventLog
from app.services.snapshot import OrderSnapshot

log = logging.getLogger("kenidoux.capi")

META_GRAPH_VERSION = "v21.0"
TIKTOK_URL = "https://business-api.tiktok.com/open_api/v1.3/event/track/"

# canonical event -> (meta, tiktok, snapchat)
EVENT_MAP: dict[str, tuple[str, str, str]] = {
    "PageView": ("PageView", "Pageview", "PAGE_VIEW"),
    "ViewContent": ("ViewContent", "ViewContent", "VIEW_CONTENT"),
    "AddToCart": ("AddToCart", "AddToCart", "ADD_CART"),
    "InitiateCheckout": ("InitiateCheckout", "InitiateCheckout", "START_CHECKOUT"),
    "Purchase": ("Purchase", "CompletePayment", "PURCHASE"),
}


# --------------------------------------------------------------------------- hashing helpers
def sha256_hash(value: str | None) -> str | None:
    if not value:
        return None
    normalized = value.strip().lower()
    if not normalized:
        return None
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def split_and_hash_name(full_name: str | None) -> tuple[str | None, str | None]:
    if not full_name:
        return None, None
    cleaned = re.sub(r"[^\w\s]", "", full_name.strip().lower())
    parts = [p for p in cleaned.split() if p]
    if not parts:
        return None, None
    first = sha256_hash(parts[0])
    last = sha256_hash("".join(parts[1:])) if len(parts) > 1 else None
    return first, last


# --------------------------------------------------------------------------- event model
@dataclass
class UserContext:
    phone_digits: str | None = None  # no '+'
    phone_e164: str | None = None  # with '+'
    full_name: str | None = None
    country: str | None = None  # "MA" | "SA"
    ip: str | None = None
    user_agent: str | None = None
    fbp: str | None = None
    fbc: str | None = None
    ttp: str | None = None
    ttclid: str | None = None
    sc_cookie1: str | None = None
    sc_click_id: str | None = None


@dataclass
class CapiEvent:
    name: str  # canonical key of EVENT_MAP
    event_id: str
    source_url: str
    user: UserContext
    event_time: int = field(default_factory=lambda: int(time.time()))
    value: float | None = None
    currency: str = "MAD"
    order_id: str | None = None
    order_uuid: str | None = None
    contents: list[dict] = field(default_factory=list)  # {"id","quantity","item_price","name"}


def contents_from_items(items: list[dict]) -> list[dict]:
    """Order line items -> per-product contents. The 3-product kit is expanded to its 3 slugs."""
    out: list[dict] = []
    names = {
        "kenidoux-lumba": "كينيدو لومبا",
        "kenidoux-posta": "كينيدو بوسطا",
        "kenidoux-calma": "كينيدو كالما",
    }
    for item in items:
        qty = int(item.get("quantity", 1))
        includes = item.get("includes") or [item["product_slug"]]
        if len(includes) > 1:  # bundle -> split the bundle price evenly across its products
            per = round(item["price_mad"] / len(includes), 2)
            for slug in includes:
                out.append({"id": slug, "quantity": qty, "item_price": per, "name": names.get(slug, slug)})
        else:
            units = max(int(item.get("units", 1)), 1)
            out.append(
                {
                    "id": includes[0],
                    "quantity": qty * units,
                    "item_price": round(item["price_mad"] / units, 2),
                    "name": names.get(includes[0], includes[0]),
                }
            )
    return out


def purchase_event_from_snapshot(snap: OrderSnapshot) -> CapiEvent:
    return CapiEvent(
        name="Purchase",
        event_id=snap.event_id or f"evt_purchase_{snap.id.hex}",
        source_url=f"{settings.SITE_URL.rstrip('/')}/thank-you",
        user=UserContext(
            phone_digits=snap.phone_digits,
            phone_e164=snap.phone_e164,
            full_name=snap.customer_name,
            country=snap.country,
            ip=snap.client_ip,
            user_agent=snap.client_user_agent,
            fbp=snap.fbp,
            fbc=snap.fbc,
            ttp=snap.ttp,
            ttclid=snap.ttclid,
            sc_cookie1=snap.sc_cookie1,
            sc_click_id=snap.sc_click_id,
        ),
        value=float(snap.total_mad),
        currency=snap.currency or "MAD",
        order_id=snap.order_number,
        order_uuid=str(snap.id),
        contents=contents_from_items(snap.items),
    )


# --------------------------------------------------------------------------- payload builders (pure)
def _hash_country(country: str | None) -> list[str] | None:
    h = sha256_hash(country)
    return [h] if h else None


def _clean(d: dict) -> dict:
    return {k: v for k, v in d.items() if v not in (None, "", [], {})}


def build_meta_payload(ev: CapiEvent) -> dict:
    u = ev.user
    fn, ln = split_and_hash_name(u.full_name)
    ph = sha256_hash(u.phone_digits)  # digits only, NO '+'
    user_data = _clean(
        {
            "ph": [ph] if ph else None,
            "fn": [fn] if fn else None,
            "ln": [ln] if ln else None,
            "country": _hash_country(u.country),
            "client_ip_address": u.ip,
            "client_user_agent": u.user_agent,
            "fbp": u.fbp,
            "fbc": u.fbc,
        }
    )
    custom: dict = {}
    if ev.name != "PageView":
        custom = _clean(
            {
                "currency": ev.currency if ev.value is not None else None,
                "value": ev.value,
                "order_id": ev.order_id,
                "content_type": "product" if ev.contents else None,
                "content_ids": [c["id"] for c in ev.contents],
                "num_items": sum(c["quantity"] for c in ev.contents) or None,
                "contents": [{"id": c["id"], "quantity": c["quantity"], "item_price": c["item_price"]} for c in ev.contents],
            }
        )
    event = _clean(
        {
            "event_name": EVENT_MAP[ev.name][0],
            "event_time": ev.event_time,
            "event_id": ev.event_id,
            "event_source_url": ev.source_url,
            "action_source": "website",
            "user_data": user_data,
            "custom_data": custom,
        }
    )
    payload: dict = {"data": [event]}
    if settings.META_TEST_EVENT_CODE:
        payload["test_event_code"] = settings.META_TEST_EVENT_CODE
    return payload


def build_tiktok_payload(ev: CapiEvent) -> dict:
    u = ev.user
    phone = sha256_hash(u.phone_e164)  # E.164 WITH '+'
    user = _clean(
        {
            "phone": phone,
            "ip": u.ip,
            "user_agent": u.user_agent,
            "ttp": u.ttp,
            "ttclid": u.ttclid,
        }
    )
    props: dict = {}
    if ev.name != "PageView":
        props = _clean(
            {
                "currency": ev.currency if ev.value is not None else None,
                "value": ev.value,
                "content_type": "product" if ev.contents else None,
                "order_id": ev.order_id,
                "contents": [
                    {
                        "content_id": c["id"],
                        "content_name": c.get("name") or c["id"],
                        "quantity": c["quantity"],
                        "price": float(c["item_price"]),
                    }
                    for c in ev.contents
                ],
            }
        )
    event = _clean(
        {
            "event": EVENT_MAP[ev.name][1],
            "event_time": ev.event_time,
            "event_id": ev.event_id,
            "page": {"url": ev.source_url},
            "user": user,
            "properties": props,
        }
    )
    payload: dict = {
        "event_source": "web",
        "event_source_id": settings.TIKTOK_PIXEL_ID,
        "data": [event],
    }
    if settings.TIKTOK_TEST_EVENT_CODE:
        payload["test_event_code"] = settings.TIKTOK_TEST_EVENT_CODE
    return payload


def build_snap_payload(ev: CapiEvent) -> dict:
    u = ev.user
    fn, ln = split_and_hash_name(u.full_name)
    ph = sha256_hash(u.phone_digits)  # digits only, NO '+'
    user_data = _clean(
        {
            "ph": [ph] if ph else None,
            "fn": [fn] if fn else None,
            "ln": [ln] if ln else None,
            "country": _hash_country(u.country),
            "client_ip_address": u.ip,
            "client_user_agent": u.user_agent,
            "sc_cookie1": u.sc_cookie1,
            "sc_click_id": u.sc_click_id,
        }
    )
    custom: dict = {}
    if ev.name != "PageView":
        custom = _clean(
            {
                "currency": ev.currency if ev.value is not None else None,
                "value": ev.value,
                "order_id": ev.order_id,
                "content_ids": [c["id"] for c in ev.contents],
                "num_items": sum(c["quantity"] for c in ev.contents) or None,
                "contents": [
                    {"id": c["id"], "quantity": str(c["quantity"]), "item_price": str(c["item_price"])}
                    for c in ev.contents
                ],
            }
        )
    event = _clean(
        {
            "event_name": EVENT_MAP[ev.name][2],
            "event_time": ev.event_time,
            "event_source_url": ev.source_url,
            "event_id": ev.event_id,
            "action_source": "WEB",
            "user_data": user_data,
            "custom_data": custom,
        }
    )
    return {"data": [event]}


# --------------------------------------------------------------------------- transport
_client: httpx.AsyncClient | None = None


def _http() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0))
    return _client


async def close_client() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


def configured_platforms() -> list[str]:
    out = []
    if settings.META_PIXEL_ID and settings.META_CAPI_ACCESS_TOKEN:
        out.append("meta")
    if settings.TIKTOK_PIXEL_ID and settings.TIKTOK_ACCESS_TOKEN:
        out.append("tiktok")
    if settings.SNAP_PIXEL_ID and settings.SNAP_CAPI_ACCESS_TOKEN:
        out.append("snapchat")
    return out


def capi_enabled() -> bool:
    return bool(configured_platforms())


def _write_log(rows: list[dict]) -> None:
    with SessionLocal() as db:
        db.add_all(PixelEventLog(**row) for row in rows)
        db.commit()


async def _post(platform: str, url: str, payload: dict, headers: dict | None = None) -> dict:
    row = {"platform": platform, "status": "failed", "http_status": None, "response_excerpt": None}
    try:
        resp = await _http().post(url, json=payload, headers=headers)
        row["http_status"] = resp.status_code
        row["response_excerpt"] = resp.text[:500]
        ok = resp.status_code < 300
        if ok and platform == "tiktok":
            try:
                ok = resp.json().get("code", 0) == 0
            except ValueError:
                ok = False
        row["status"] = "sent" if ok else "failed"
        if not ok:
            log.warning("%s CAPI rejected (%s): %s", platform, resp.status_code, resp.text[:300])
    except Exception as exc:  # noqa: BLE001 - tracking must never break an order
        row["response_excerpt"] = f"{type(exc).__name__}: {exc}"[:500]
        log.warning("%s CAPI error: %s", platform, exc)
    return row


async def send_event(ev: CapiEvent) -> bool:
    """Send one event to every configured platform in parallel. Returns True if nothing failed."""
    jobs = []
    if "meta" in configured_platforms():
        url = (
            f"https://graph.facebook.com/{META_GRAPH_VERSION}/{settings.META_PIXEL_ID}/events"
            f"?access_token={settings.META_CAPI_ACCESS_TOKEN}"
        )
        jobs.append(_post("meta", url, build_meta_payload(ev)))
    if "tiktok" in configured_platforms():
        jobs.append(
            _post(
                "tiktok",
                TIKTOK_URL,
                build_tiktok_payload(ev),
                {"Access-Token": settings.TIKTOK_ACCESS_TOKEN, "Content-Type": "application/json"},
            )
        )
    if "snapchat" in configured_platforms():
        url = (
            f"https://tr.snapchat.com/v3/{settings.SNAP_PIXEL_ID}/events"
            f"?access_token={settings.SNAP_CAPI_ACCESS_TOKEN}"
        )
        jobs.append(_post("snapchat", url, build_snap_payload(ev)))

    if not jobs:
        return True

    rows = await asyncio.gather(*jobs)
    for row in rows:
        row.update(
            event_name=ev.name,
            event_id=ev.event_id,
            order_id=uuid.UUID(ev.order_uuid) if ev.order_uuid else None,
        )
        # never persist access tokens that may appear in echoed error bodies
        if row.get("response_excerpt"):
            row["response_excerpt"] = re.sub(r"access_token=[^&\s\"]+", "access_token=***", row["response_excerpt"])
    try:
        await run_in_threadpool(_write_log, list(rows))
    except Exception as exc:  # noqa: BLE001
        log.warning("could not persist tracking log: %s", exc)
    return all(r["status"] == "sent" for r in rows)


async def send_purchase(snap: OrderSnapshot) -> bool:
    return await send_event(purchase_event_from_snapshot(snap))


__all__ = [
    "CapiEvent",
    "UserContext",
    "build_meta_payload",
    "build_snap_payload",
    "build_tiktok_payload",
    "capi_enabled",
    "send_event",
    "send_purchase",
    "sha256_hash",
]
