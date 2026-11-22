"""Cash-on-delivery desk. Checkout `confirmed` stays the sheet status. This status is the phone call."""

import csv
import io
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.models.admin import OrderEvent, PhoneBlacklist
from app.models.order import Order
from app.services.shipping import get_shipping

FULFILLMENT = (
    "new",
    "no_answer_1",
    "no_answer_2",
    "no_answer_3",
    "confirmed",
    "cancelled",
    "fake",
    "duplicate",
    "shipped",
    "delivered",
    "returned",
)

NEXT_STATUS: dict[str, set[str]] = {
    "new": {"no_answer_1", "confirmed", "cancelled", "fake", "duplicate"},
    "no_answer_1": {"no_answer_2", "confirmed", "cancelled", "fake", "duplicate"},
    "no_answer_2": {"no_answer_3", "confirmed", "cancelled", "fake", "duplicate"},
    "no_answer_3": {"confirmed", "cancelled", "fake", "duplicate"},
    "confirmed": {"shipped", "cancelled"},
    "shipped": {"delivered", "returned"},
    "delivered": {"returned"},
    "returned": set(),
    "cancelled": set(),
    "fake": set(),
    "duplicate": set(),
}

CALL_ATTEMPTS = {"no_answer_1": 1, "no_answer_2": 2, "no_answer_3": 3}


class DeskError(ValueError):
    pass


def split_place(raw: str) -> tuple[str, str | None, str | None]:
    parts = [part.strip() for part in (raw or "").split("—") if part.strip()]
    name = parts[0] if parts else (raw or "").strip()
    city = parts[1] if len(parts) > 1 else None
    address = " — ".join(parts[2:]) if len(parts) > 2 else None
    return name, city, address


def backfill_places(db: Session) -> None:
    rows = list(db.scalars(select(Order).where(Order.city.is_(None))))
    changed = False
    for order in rows:
        before = (order.city, order.address)
        apply_place(order)
        if (order.city, order.address) != before:
            changed = True
    if changed:
        db.commit()


def apply_place(order: Order) -> None:
    if order.city and order.address:
        return
    _name, city, address = split_place(order.customer_name)
    if city and not order.city:
        order.city = city[:120]
    if address and not order.address:
        order.address = address[:300]


def display_name(order: Order) -> str:
    name, _city, _address = split_place(order.customer_name)
    return name


def product_label(order: Order) -> str:
    parts: list[str] = []
    for item in order.items_json or []:
        title = item.get("title_ar") or item.get("product_slug") or "item"
        count = int(item.get("quantity") or 1) * int(item.get("units") or 1)
        parts.append(f"{title} × {count}")
    return " + ".join(parts)


def quantity_of(order: Order) -> int:
    total = 0
    for item in order.items_json or []:
        total += int(item.get("quantity") or 1) * int(item.get("units") or 1)
    return total


def _aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def is_duplicate(order: Order, neighbors: list[Order]) -> bool:
    moment = _aware(order.created_at)
    for other in neighbors:
        if other.id == order.id or other.customer_phone_e164 != order.customer_phone_e164:
            continue
        if abs((_aware(other.created_at) - moment).total_seconds()) <= 7 * 24 * 3600:
            return True
    return False


def _filtered(status: str | None, date_from: datetime | None, date_to: datetime | None, city: str | None, campaign: str | None, query: str | None) -> Select:
    stmt = select(Order)
    if status:
        stmt = stmt.where(Order.fulfillment_status == status)
    if date_from:
        stmt = stmt.where(Order.created_at >= date_from)
    if date_to:
        stmt = stmt.where(Order.created_at < date_to)
    if city:
        stmt = stmt.where(Order.city.ilike(f"%{city.strip()}%"))
    if campaign:
        stmt = stmt.where(Order.utm_campaign.ilike(f"%{campaign.strip()}%"))
    if query:
        needle = f"%{query.strip()}%"
        stmt = stmt.where(or_(Order.customer_name.ilike(needle), Order.customer_phone_raw.ilike(needle), Order.customer_phone_e164.ilike(needle), Order.order_number.ilike(needle)))
    return stmt


def neighbors_for(db: Session, orders: list[Order]) -> list[Order]:
    if not orders:
        return []
    phones = {order.customer_phone_e164 for order in orders}
    start = min(_aware(order.created_at) for order in orders) - timedelta(days=7)
    end = max(_aware(order.created_at) for order in orders) + timedelta(days=7)
    return list(
        db.scalars(
            select(Order).where(
                Order.customer_phone_e164.in_(phones),
                Order.created_at >= start,
                Order.created_at <= end,
            )
        )
    )


def blacklist_set(db: Session, phones: set[str]) -> set[str]:
    if not phones:
        return set()
    return set(db.scalars(select(PhoneBlacklist.phone_e164).where(PhoneBlacklist.phone_e164.in_(phones))))


def list_orders(db: Session, *, status: str | None, date_from: datetime | None, date_to: datetime | None, city: str | None, campaign: str | None, query: str | None, page: int, page_size: int) -> tuple[list[Order], int]:
    stmt = _filtered(status, date_from, date_to, city, campaign, query)
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = list(
        db.scalars(
            stmt.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        )
    )
    return rows, int(total)


def orders_for_export(db: Session, **filters) -> list[Order]:
    stmt = _filtered(filters.get("status"), filters.get("date_from"), filters.get("date_to"), filters.get("city"), filters.get("campaign"), filters.get("query"))
    return list(db.scalars(stmt.order_by(Order.created_at.desc()).limit(5000)))


def to_csv(orders: list[Order], neighbors: list[Order], blocked: set[str]) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["date", "order", "name", "phone", "city", "address", "product", "quantity", "price_mad", "status", "call_attempts", "notes", "campaign", "tracking_number", "duplicate", "blacklisted"])
    for order in orders:
        writer.writerow([
            order.created_at.isoformat() if order.created_at else "",
            order.order_number,
            display_name(order),
            order.customer_phone_e164,
            order.city or "",
            order.address or "",
            product_label(order),
            quantity_of(order),
            order.total_mad,
            order.fulfillment_status,
            order.call_attempts,
            (order.notes or "").replace("\n", " "),
            order.utm_campaign or "",
            order.tracking_number or "",
            "yes" if is_duplicate(order, neighbors) else "",
            "yes" if order.customer_phone_e164 in blocked else "",
        ])
    return buffer.getvalue()


def change_status(db: Session, order: Order, status: str, actor: str, note: str | None = None, tracking_number: str | None = None) -> Order:
    if status not in FULFILLMENT:
        raise DeskError("Unknown status")
    current = order.fulfillment_status or "new"
    if status != current and status not in NEXT_STATUS.get(current, set()):
        raise DeskError(f"Cannot move {current} to {status}")
    previous = current
    if status != current:
        order.fulfillment_status = status
    if status in CALL_ATTEMPTS:
        order.call_attempts = CALL_ATTEMPTS[status]
    if tracking_number is not None:
        order.tracking_number = tracking_number.strip()[:80] or None
    if status == "shipped" and not order.tracking_number:
        issued = get_shipping().register_shipment(order)
        if issued:
            order.tracking_number = issued[:80]
    if note is not None:
        order.notes = note.strip()[:4000] or None
    if status != previous or note:
        db.add(OrderEvent(order_id=order.id, actor_email=actor, from_status=previous, to_status=status, note=note))
    db.commit()
    db.refresh(order)
    return order


def add_blacklist(db: Session, phone_e164: str, reason: str | None, actor: str) -> PhoneBlacklist:
    existing = db.scalar(select(PhoneBlacklist).where(PhoneBlacklist.phone_e164 == phone_e164))
    if existing:
        return existing
    row = PhoneBlacklist(phone_e164=phone_e164, reason=(reason or "")[:300] or None)
    db.add(row)
    db.commit()
    db.refresh(row)
    _ = actor
    return row


def remove_blacklist(db: Session, phone_e164: str) -> None:
    row = db.scalar(select(PhoneBlacklist).where(PhoneBlacklist.phone_e164 == phone_e164))
    if row is not None:
        db.delete(row)
        db.commit()


def history(db: Session, order_id: uuid.UUID) -> list[OrderEvent]:
    return list(db.scalars(select(OrderEvent).where(OrderEvent.order_id == order_id).order_by(OrderEvent.created_at.desc())))
