"""Order lifecycle: pending_upsell -> confirmed, plus the integrations fired exactly once on confirmation."""

import asyncio
import logging
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.config import settings
from app.database import SessionLocal
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate
from app.services import capi_service, sheets_webhook
from app.services.offers import (
    PricingError,
    price_items,
    recommend_upsell,
    upsell_line_item,
)
from app.services.phone_normalizer import validate_and_format_phone
from app.services.snapshot import OrderSnapshot, snapshot_from_order
from app.services.tasks import spawn

log = logging.getLogger("kenidoux.orders")

LATE_UPSELL_GRACE_SECONDS = 120


class OrderError(ValueError):
    """Validation problem that should be reported to the shopper (HTTP 422)."""


class OrderNotFound(LookupError):
    pass


@dataclass
class FinalizeResult:
    snapshot: OrderSnapshot
    send_sheet: bool
    send_capi: bool


def _now() -> datetime:
    return datetime.now(timezone.utc)


# --------------------------------------------------------------------------- create
def _new_order_number(db: Session) -> int:
    count = db.scalar(select(func.count(Order.id))) or 0
    return 1000 + count + 1


def _write_items(order: Order, items: list[dict]) -> None:
    for item in items:
        order.order_items.append(
            OrderItem(
                product_slug=item["product_slug"],
                offer_id=item["offer_id"],
                title_ar=item["title_ar"],
                quantity=item["quantity"],
                units=item["units"],
                price_mad=item["price_mad"],
                is_cross_sell=item["is_cross_sell"],
                is_upsell=item["is_upsell"],
            )
        )


def create_order(
    db: Session, payload: OrderCreate, client_ip: str | None, user_agent: str | None
) -> tuple[Order, bool]:
    """Persist a `pending_upsell` order. Returns (order, created). Idempotent on `event_id`."""
    phone = validate_and_format_phone(payload.customer_phone, settings.PHONE_VALIDATION_MODE)
    if not phone.is_valid:
        raise OrderError(phone.error_message or "رقم الهاتف غير صحيح")

    if payload.event_id:
        existing = db.scalar(select(Order).where(Order.event_id == payload.event_id))
        if existing is not None:  # double-click / network retry -> never create a duplicate order
            return existing, False

    try:
        items = price_items(db, payload.items)
    except PricingError as exc:
        raise OrderError(str(exc)) from exc

    subtotal = sum(i["price_mad"] * i["quantity"] for i in items)
    event_id = payload.event_id or f"evt_purchase_{uuid.uuid4()}"
    t = payload.tracking
    year = _now().year
    base = _new_order_number(db)

    for attempt in range(10):
        order = Order(
            order_number=f"KD-{year}-{base + attempt}",
            customer_name=payload.customer_name,
            customer_phone_raw=payload.customer_phone[:50],
            customer_phone_e164=phone.e164_with_plus,
            customer_country=phone.country or "MA",
            status="pending_upsell",
            subtotal_mad=subtotal,
            upsell_added=False,
            upsell_price_mad=0,
            total_mad=subtotal,
            currency="MAD",
            items_json=items,
            event_id=event_id,
            client_ip=client_ip,
            client_user_agent=user_agent,
            fbp=t.fbp,
            fbc=t.fbc,
            ttp=t.ttp,
            ttclid=t.ttclid,
            sc_cookie1=t.sc_cookie1,
            sc_click_id=t.sc_click_id,
            utm_source=t.utm_source,
            utm_medium=t.utm_medium,
            utm_campaign=t.utm_campaign,
            page_url=t.page_url,
        )
        _write_items(order, items)
        try:
            with db.begin_nested():
                db.add(order)
                db.flush()
            break
        except IntegrityError:
            db.expire_all()
            if payload.event_id:
                existing = db.scalar(select(Order).where(Order.event_id == payload.event_id))
                if existing is not None:
                    return existing, False
    else:
        raise RuntimeError("could not allocate a unique order number")

    db.commit()
    db.refresh(order)
    return order, True


# --------------------------------------------------------------------------- finalize
def finalize_order(
    db: Session, order_id: uuid.UUID, accepted: bool, source: str = "customer"
) -> FinalizeResult:
    """Lock the order row, apply (or skip) the upsell, confirm, and claim the one-shot integrations."""
    order = db.execute(select(Order).where(Order.id == order_id).with_for_update()).scalar_one_or_none()
    if order is None:
        raise OrderNotFound(str(order_id))

    now = _now()
    offer = recommend_upsell(order.items_json)

    def apply_upsell() -> None:
        names = {p.slug: p.name_ar for p in db.scalars(select(Product))}
        line = upsell_line_item(offer, names)
        order.items_json = [*order.items_json, line]  # reassign: JSON columns don't track in-place edits
        order.order_items.append(
            OrderItem(
                product_slug=line["product_slug"],
                offer_id=line["offer_id"],
                title_ar=line["title_ar"],
                quantity=1,
                units=1,
                price_mad=line["price_mad"],
                is_cross_sell=False,
                is_upsell=True,
            )
        )
        order.upsell_added = True
        order.upsell_product_slug = offer.product_slug
        order.upsell_price_mad = offer.price_mad
        order.total_mad = order.subtotal_mad + offer.price_mad

    if order.status == "pending_upsell":
        if accepted:
            apply_upsell()
        order.status = "confirmed"
        order.finalized_at = now
        log.info("order %s confirmed (%s, upsell=%s)", order.order_number, source, accepted)
    elif accepted and not order.upsell_added and order.finalized_at is not None:
        # Late acceptance (safety net already fired): still honour it and let the sheet row update in place.
        finalized = order.finalized_at if order.finalized_at.tzinfo else order.finalized_at.replace(tzinfo=timezone.utc)
        if (now - finalized).total_seconds() <= LATE_UPSELL_GRACE_SECONDS:
            apply_upsell()
            order.sheet_synced = False
            log.info("order %s: late upsell acceptance applied", order.order_number)

    send_sheet = settings.sheets_enabled and not order.sheet_synced
    send_capi = capi_service.capi_enabled() and not order.capi_purchase_sent
    if send_sheet:
        order.sheet_synced = True  # claim before dispatch -> never double-send
        order.sheet_synced_at = now
    if send_capi:
        order.capi_purchase_sent = True

    db.commit()
    db.refresh(order)
    return FinalizeResult(snapshot_from_order(order), send_sheet, send_capi)


def _load_snapshot(order_id: uuid.UUID) -> OrderSnapshot | None:
    with SessionLocal() as db:
        order = db.get(Order, order_id)
        return snapshot_from_order(order) if order else None


def _release_claims(order_id: uuid.UUID, sheet_failed: bool, capi_failed: bool) -> None:
    with SessionLocal() as db:
        order = db.get(Order, order_id)
        if order is None:
            return
        if sheet_failed:
            order.sheet_synced = False
            order.sheet_synced_at = None
        if capi_failed:
            order.capi_purchase_sent = False
        db.commit()


async def dispatch_integrations(order_id: uuid.UUID, send_sheet: bool, send_capi: bool) -> None:
    """Google Sheets row + server-side Purchase (Meta / TikTok / Snapchat). Never raises."""
    if not (send_sheet or send_capi):
        return
    try:
        snap = await run_in_threadpool(_load_snapshot, order_id)
        if snap is None:
            return
        sheet_ok, capi_ok = True, True
        if send_sheet:
            sheet_ok = await sheets_webhook.send_order_to_sheet(snap)
        if send_capi:
            capi_ok = await capi_service.send_purchase(snap)
        if not (sheet_ok and capi_ok):
            # release the claim so the sweeper retries (Sheet upserts by order number; CAPI dedups by event_id)
            await run_in_threadpool(_release_claims, order_id, not sheet_ok, not capi_ok)
    except Exception:  # noqa: BLE001
        log.exception("integration dispatch failed for order %s", order_id)
        await run_in_threadpool(_release_claims, order_id, send_sheet, send_capi)


async def finalize_and_dispatch(order_id: uuid.UUID, accepted: bool, source: str) -> FinalizeResult:
    def _run() -> FinalizeResult:
        with SessionLocal() as db:
            return finalize_order(db, order_id, accepted, source)

    result = await run_in_threadpool(_run)
    spawn(dispatch_integrations(order_id, result.send_sheet, result.send_capi), name=f"dispatch-{order_id}")
    return result


# --------------------------------------------------------------------------- safety net + sweeper
async def _safety_net(order_id: uuid.UUID) -> None:
    """If the shopper closes the tab during the upsell countdown, confirm the order anyway."""
    await asyncio.sleep(max(settings.UPSELL_AUTO_FINALIZE_SECONDS, 1))
    try:
        await finalize_and_dispatch(order_id, accepted=False, source="safety_net")
    except OrderNotFound:
        pass
    except Exception:  # noqa: BLE001
        log.exception("safety-net finalize failed for %s (sweeper will retry)", order_id)


def schedule_safety_net(order_id: uuid.UUID) -> None:
    spawn(_safety_net(order_id), name=f"safety-net-{order_id}")


def _sweep_once() -> tuple[list[uuid.UUID], list[tuple[uuid.UUID, bool, bool]]]:
    cutoff_pending = _now() - timedelta(seconds=settings.UPSELL_AUTO_FINALIZE_SECONDS + 10)
    cutoff_retry = _now() - timedelta(hours=24)
    with SessionLocal() as db:
        stuck = list(
            db.scalars(
                select(Order.id).where(Order.status == "pending_upsell", Order.created_at < cutoff_pending).limit(50)
            )
        )
        retry: list[tuple[uuid.UUID, bool, bool]] = []
        conds = []
        if settings.sheets_enabled:
            conds.append(Order.sheet_synced.is_(False))
        if capi_service.capi_enabled():
            conds.append(Order.capi_purchase_sent.is_(False))
        if conds:
            rows = db.execute(
                select(Order.id, Order.sheet_synced, Order.capi_purchase_sent)
                .where(Order.status == "confirmed", Order.created_at > cutoff_retry, or_(*conds))
                .limit(50)
            ).all()
            for oid, sheet_done, capi_done in rows:
                retry.append((oid, settings.sheets_enabled and not sheet_done, capi_service.capi_enabled() and not capi_done))
    return stuck, retry


async def sweeper_loop(interval_seconds: int = 60) -> None:
    """Recovers orders if the container restarted mid-countdown or an integration failed transiently."""
    await asyncio.sleep(5)
    while True:
        try:
            stuck, retry = await run_in_threadpool(_sweep_once)
            for oid in stuck:
                await finalize_and_dispatch(oid, accepted=False, source="sweeper")
            for oid, send_sheet, send_capi in retry:
                def _claim(oid=oid, send_sheet=send_sheet, send_capi=send_capi) -> None:
                    with SessionLocal() as db:
                        o = db.get(Order, oid)
                        if o is None:
                            return
                        if send_sheet:
                            o.sheet_synced = True
                        if send_capi:
                            o.capi_purchase_sent = True
                        db.commit()

                await run_in_threadpool(_claim)
                await dispatch_integrations(oid, send_sheet, send_capi)
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001
            log.exception("sweeper iteration failed")
        await asyncio.sleep(interval_seconds)
