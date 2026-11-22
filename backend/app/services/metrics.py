"""Shop funnel. Counts come from SQL. Costs and ad spend are a later phase."""

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.analytics import StoreEvent, StoreSession, Visitor
from app.models.admin import OrderEvent
from app.models.order import Order

CASABLANCA = ZoneInfo("Africa/Casablanca")
REACHED_CONFIRMED = ("confirmed", "shipped", "delivered", "returned")
LEFT_WAREHOUSE = ("shipped", "delivered", "returned")


def _day_start(moment: datetime) -> datetime:
    return moment.replace(hour=0, minute=0, second=0, microsecond=0)


def window(preset: str | None, date_from: str | None, date_to: str | None, now: datetime | None = None) -> tuple[datetime, datetime, str]:
    moment = now or datetime.now(CASABLANCA)
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=CASABLANCA)
    name = preset or "7d"
    if name == "today":
        start = _day_start(moment)
        end = start + timedelta(days=1)
    elif name == "yesterday":
        end = _day_start(moment)
        start = end - timedelta(days=1)
    elif name == "30d":
        end = _day_start(moment) + timedelta(days=1)
        start = end - timedelta(days=30)
    elif name == "month":
        start = _day_start(moment).replace(day=1)
        end = _day_start(moment) + timedelta(days=1)
    elif name == "custom":
        start = datetime.strptime(date_from or "", "%Y-%m-%d").replace(tzinfo=CASABLANCA)
        end = datetime.strptime(date_to or "", "%Y-%m-%d").replace(tzinfo=CASABLANCA) + timedelta(days=1)
        if end <= start:
            raise ValueError("date_to is before date_from")
    else:
        name = "7d"
        end = _day_start(moment) + timedelta(days=1)
        start = end - timedelta(days=7)
    return start, end, name


def _change(current: float, previous: float) -> float | None:
    if previous == 0:
        return 0 if current == 0 else None
    return round((current - previous) / previous * 100, 1)


def _aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=CASABLANCA)
    return value


def _distinct(db: Session, start: datetime, end: datetime, name: str | None = None) -> int:
    stmt = select(func.count(func.distinct(StoreEvent.visitor_id))).where(StoreEvent.created_at >= start, StoreEvent.created_at < end)
    if name:
        stmt = stmt.where(StoreEvent.name == name)
    return int(db.scalar(stmt) or 0)


def _event_count(db: Session, start: datetime, end: datetime, name: str) -> int:
    return int(
        db.scalar(
            select(func.count(StoreEvent.id)).where(
                StoreEvent.created_at >= start, StoreEvent.created_at < end, StoreEvent.name == name
            )
        )
        or 0
    )


def _sessions(db: Session, start: datetime, end: datetime) -> int:
    return int(
        db.scalar(
            select(func.count(func.distinct(StoreEvent.session_id))).where(
                StoreEvent.created_at >= start, StoreEvent.created_at < end
            )
        )
        or 0
    )


def _bounces(db: Session, start: datetime, end: datetime) -> int:
    engaged = (
        select(StoreEvent.session_id)
        .where(
            StoreEvent.created_at >= start,
            StoreEvent.created_at < end,
            StoreEvent.name != "page_view",
        )
        .scalar_subquery()
    )
    return int(
        db.scalar(
            select(func.count(func.distinct(StoreEvent.session_id))).where(
                StoreEvent.created_at >= start,
                StoreEvent.created_at < end,
                StoreEvent.session_id.not_in(engaged),
            )
        )
        or 0
    )


def _orders(db: Session, start: datetime, end: datetime) -> int:
    return int(db.scalar(select(func.count(Order.id)).where(Order.created_at >= start, Order.created_at < end)) or 0)


def _status_counts(db: Session, start: datetime, end: datetime) -> dict[str, int]:
    rows = db.execute(
        select(Order.fulfillment_status, func.count(Order.id))
        .where(Order.created_at >= start, Order.created_at < end)
        .group_by(Order.fulfillment_status)
    ).all()
    return {status or "new": int(count) for status, count in rows}


def _rate(part: int, whole: int) -> float | None:
    if whole <= 0:
        return None
    return round(part / whole * 100, 1)


def _hours(db: Session, start: datetime, end: datetime) -> dict[str, float | None]:
    rows = db.execute(
        select(Order.id, Order.created_at, OrderEvent.to_status, OrderEvent.created_at)
        .join(OrderEvent, OrderEvent.order_id == Order.id)
        .where(
            Order.created_at >= start,
            Order.created_at < end,
            OrderEvent.to_status.in_(("confirmed", "delivered")),
        )
    ).all()
    marks: dict[str, dict[str, datetime]] = {}
    for order_id, created_at, status, at in rows:
        slot = marks.setdefault(str(order_id), {"created": _aware(created_at)})
        current = slot.get(status)
        moment = _aware(at)
        if current is None or moment < current:
            slot[status] = moment
    to_confirm = []
    to_deliver = []
    for slot in marks.values():
        if "confirmed" in slot:
            to_confirm.append((slot["confirmed"] - slot["created"]).total_seconds())
            if "delivered" in slot:
                to_deliver.append((slot["delivered"] - slot["confirmed"]).total_seconds())
    def avg(values: list[float]) -> float | None:
        if not values:
            return None
        return round(sum(values) / len(values) / 3600, 1)

    return {"hours_to_confirm": avg(to_confirm), "hours_to_deliver": avg(to_deliver)}


def _pipeline(counts: dict[str, int], total: int) -> dict:
    pending = counts.get("new", 0)
    calling = counts.get("no_answer_1", 0) + counts.get("no_answer_2", 0) + counts.get("no_answer_3", 0)
    confirmed = sum(counts.get(status, 0) for status in REACHED_CONFIRMED)
    shipped = counts.get("shipped", 0)
    delivered = counts.get("delivered", 0)
    returned = counts.get("returned", 0)
    fake = counts.get("fake", 0)
    duplicate = counts.get("duplicate", 0)
    cancelled = counts.get("cancelled", 0)
    left = shipped + delivered + returned
    base = total - fake - duplicate
    return {
        "orders": total,
        "pending": pending,
        "calling": calling,
        "confirmed": confirmed,
        "cancelled": cancelled,
        "fake": fake,
        "duplicate": duplicate,
        "shipped": shipped,
        "in_transit": shipped,
        "delivered": delivered,
        "returned": returned,
        "confirmation_rate": _rate(confirmed, base),
        "delivery_rate": _rate(delivered, left),
        "success_rate": _rate(delivered, total),
    }


def _traffic_block(db: Session, start: datetime, end: datetime) -> dict:
    visitors = _distinct(db, start, end)
    sessions = _sessions(db, start, end)
    bounces = _bounces(db, start, end)
    return {
        "visitors": visitors,
        "sessions": sessions,
        "page_views": _event_count(db, start, end, "page_view"),
        "product_views": _event_count(db, start, end, "product_view"),
        "checkout_starts": _distinct(db, start, end, "checkout_form_start"),
        "product_visitors": _distinct(db, start, end, "product_view"),
        "bounce_rate": _rate(bounces, sessions),
    }


def _funnel(traffic: dict, orders: int) -> list[dict]:
    steps = [
        ("visitors", traffic["visitors"]),
        ("product_views", traffic["product_visitors"]),
        ("checkout_starts", traffic["checkout_starts"]),
        ("orders", orders),
    ]
    rows = []
    previous = None
    for key, count in steps:
        drop = None
        if previous:
            drop = _rate(previous - count, previous) if previous else None
            if previous == 0:
                drop = None
        rows.append({"step": key, "count": count, "drop_pct": drop})
        previous = count
    return rows


def _grouped_visits(db: Session, start: datetime, end: datetime, column) -> list[tuple[str, int]]:
    label = func.coalesce(column, "direct")
    rows = db.execute(
        select(label, func.count(func.distinct(StoreEvent.visitor_id)))
        .join(StoreSession, StoreSession.id == StoreEvent.session_id)
        .where(StoreEvent.created_at >= start, StoreEvent.created_at < end)
        .group_by(label)
        .order_by(func.count(func.distinct(StoreEvent.visitor_id)).desc())
        .limit(20)
    ).all()
    return [(str(key), int(count)) for key, count in rows]


def _grouped_orders(db: Session, start: datetime, end: datetime, column) -> dict[str, int]:
    label = func.coalesce(column, "direct")
    rows = db.execute(
        select(label, func.count(Order.id))
        .where(Order.created_at >= start, Order.created_at < end)
        .group_by(label)
        .limit(20)
    ).all()
    return {str(key): int(count) for key, count in rows}


def _merge(visits: list[tuple[str, int]], orders: dict[str, int]) -> list[dict]:
    keys = []
    for key, _count in visits:
        if key not in keys:
            keys.append(key)
    for key in orders:
        if key not in keys:
            keys.append(key)
    return [{"key": key, "visitors": dict(visits).get(key, 0), "orders": orders.get(key, 0)} for key in keys][:20]


def _devices(db: Session, start: datetime, end: datetime) -> list[dict]:
    label = func.coalesce(Visitor.device, "desktop")
    rows = db.execute(
        select(label, func.count(func.distinct(StoreEvent.visitor_id)))
        .join(Visitor, Visitor.id == StoreEvent.visitor_id)
        .where(StoreEvent.created_at >= start, StoreEvent.created_at < end)
        .group_by(label)
    ).all()
    return [{"key": str(key), "visitors": int(count)} for key, count in rows]


def _cities(db: Session, start: datetime, end: datetime) -> list[dict]:
    rows = db.execute(
        select(Order.city, Order.fulfillment_status, func.count(Order.id))
        .where(Order.created_at >= start, Order.created_at < end, Order.city.is_not(None))
        .group_by(Order.city, Order.fulfillment_status)
    ).all()
    folded: dict[str, dict[str, int]] = {}
    for city, status, count in rows:
        slot = folded.setdefault(city, {})
        slot[status or "new"] = int(count)
    result = []
    for city, counts in folded.items():
        total = sum(counts.values())
        confirmed = sum(counts.get(status, 0) for status in REACHED_CONFIRMED)
        delivered = counts.get("delivered", 0)
        left = sum(counts.get(status, 0) for status in LEFT_WAREHOUSE)
        fake = counts.get("fake", 0) + counts.get("duplicate", 0)
        result.append(
            {
                "key": city,
                "orders": total,
                "confirmation_rate": _rate(confirmed, total - fake),
                "delivery_rate": _rate(delivered, left),
            }
        )
    result.sort(key=lambda row: row["orders"], reverse=True)
    return result[:20]


def report(db: Session, preset: str | None, date_from: str | None, date_to: str | None) -> dict:
    start, end, name = window(preset, date_from, date_to)
    span = end - start
    previous_start, previous_end = start - span, start
    current = _traffic_block(db, start, end)
    previous = _traffic_block(db, previous_start, previous_end)
    orders = _orders(db, start, end)
    orders_prev = _orders(db, previous_start, previous_end)
    counts = _status_counts(db, start, end)
    pipeline = _pipeline(counts, orders)
    pipeline.update(_hours(db, start, end))
    conversion = _rate(orders, current["visitors"])
    conversion_prev = _rate(orders_prev, previous["visitors"])
    traffic = {
        "visitors": current["visitors"],
        "visitors_change": _change(current["visitors"], previous["visitors"]),
        "sessions": current["sessions"],
        "sessions_change": _change(current["sessions"], previous["sessions"]),
        "page_views": current["page_views"],
        "page_views_change": _change(current["page_views"], previous["page_views"]),
        "product_views": current["product_views"],
        "product_views_change": _change(current["product_views"], previous["product_views"]),
        "bounce_rate": current["bounce_rate"],
        "bounce_rate_change": _change(current["bounce_rate"] or 0, previous["bounce_rate"] or 0),
    }
    return {
        "range": {"preset": name, "from": start.date().isoformat(), "to": (end - timedelta(days=1)).date().isoformat()},
        "traffic": traffic,
        "funnel": _funnel(current, orders),
        "conversion_rate": conversion,
        "conversion_rate_change": None if conversion is None or conversion_prev is None else _change(conversion, conversion_prev),
        "orders_change": _change(orders, orders_prev),
        "pipeline": pipeline,
        "by_source": _merge(_grouped_visits(db, start, end, StoreSession.utm_source), _grouped_orders(db, start, end, Order.utm_source)),
        "by_campaign": _merge(_grouped_visits(db, start, end, StoreSession.utm_campaign), _grouped_orders(db, start, end, Order.utm_campaign)),
        "by_ad": _merge(_grouped_visits(db, start, end, StoreSession.utm_content), _grouped_orders(db, start, end, Order.utm_content)),
        "by_device": _devices(db, start, end),
        "by_city": _cities(db, start, end),
    }
