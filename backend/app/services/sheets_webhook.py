"""Google Apps Script webhook dispatcher (docs/07)."""

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

import httpx

from app.config import settings
from app.services.snapshot import OrderSnapshot

log = logging.getLogger("kenidoux.sheets")

CALL_STATUS_DEFAULT = "جديد - في انتظار الاتصال"


def morocco_time(dt: datetime | None) -> str:
    dt = dt or datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    try:
        from zoneinfo import ZoneInfo

        local = dt.astimezone(ZoneInfo("Africa/Casablanca"))
    except Exception:  # noqa: BLE001 - tzdata missing: fall back to UTC+1
        local = dt.astimezone(timezone(timedelta(hours=1)))
    return local.strftime("%Y-%m-%d %H:%M:%S")


def whatsapp_link(snap: OrderSnapshot) -> str:
    first = (snap.customer_name.split() or [""])[0]
    text = f"السلام عليكم {first}، معاك فريق كينيدو (kinedoux.com) لتأكيد طلبك رقم {snap.order_number}"
    return f"https://wa.me/{snap.phone_digits}?text={quote(text)}"


def items_summary(items: list[dict]) -> str:
    parts = []
    for item in items:
        qty = int(item.get("quantity", 1))
        label = item["title_ar"]
        if item.get("is_upsell"):
            label = label.replace("عرض VIP بعد الطلب", "عرض VIP التكميلي")
        parts.append(f"{qty}x {label} [{item['price_mad'] * qty} د.م]")
    return " + ".join(parts)


def build_sheet_payload(snap: OrderSnapshot) -> dict:
    total_units = sum(int(i.get("units", 1)) * int(i.get("quantity", 1)) for i in snap.items) or 1
    upsell_name = "-"
    for item in snap.items:
        if item.get("is_upsell"):
            upsell_name = item["title_ar"].split(" — ")[0]
    return {
        "secret": settings.GOOGLE_SHEETS_WEBHOOK_SECRET or "",
        "type": "order",
        "order_id": str(snap.id),
        "order_number": snap.order_number,
        "created_at_morocco": morocco_time(snap.created_at),
        "call_status": CALL_STATUS_DEFAULT,
        "customer_name": snap.customer_name,
        "customer_phone_local": snap.phone_local,
        "customer_phone_e164": snap.phone_e164,
        "whatsapp_quick_link": whatsapp_link(snap),
        "items_summary": items_summary(snap.items),
        "total_units": total_units,
        "upsell_accepted": f"نعم (+{snap.upsell_price_mad} د.م)" if snap.upsell_added else "لا",
        "upsell_product_name": upsell_name if snap.upsell_added else "-",
        "subtotal_mad": snap.subtotal_mad,
        "upsell_price_mad": snap.upsell_price_mad,
        "total_mad": snap.total_mad,
        "currency": snap.currency,
        "city_and_address": "",
        "agent_notes": "",
        "utm_source": snap.utm_source or "direct",
        "utm_campaign": snap.utm_campaign or "-",
        "event_id": snap.event_id or "",
        "items": [
            {
                "product_slug": i["product_slug"],
                "offer_id": i["offer_id"],
                "title_ar": i["title_ar"],
                "quantity": i["quantity"],
                "price_mad": i["price_mad"],
            }
            for i in snap.items
        ],
    }


async def post_to_sheet(payload: dict, attempts: int = 3) -> bool:
    """POST JSON to the Apps Script Web App. It answers with a 302 -> follow_redirects is mandatory."""
    if not settings.sheets_enabled:
        return True
    last_error = ""
    async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
        for attempt in range(1, attempts + 1):
            try:
                resp = await client.post(settings.GOOGLE_SHEETS_WEBHOOK_URL, json=payload)
                if resp.status_code < 300:
                    try:
                        body = resp.json()
                    except ValueError:
                        body = {}
                    if body.get("status", "success") != "error":
                        return True
                    last_error = str(body.get("message"))
                else:
                    last_error = f"HTTP {resp.status_code}"
            except Exception as exc:  # noqa: BLE001
                last_error = f"{type(exc).__name__}: {exc}"
            if attempt < attempts:
                await asyncio.sleep(1.5 * attempt)
    log.warning("Google Sheets webhook failed after %s attempts: %s", attempts, last_error)
    return False


async def send_order_to_sheet(snap: OrderSnapshot) -> bool:
    return await post_to_sheet(build_sheet_payload(snap))
