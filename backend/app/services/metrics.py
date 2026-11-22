"""Shop funnel. Every tile reads these queries. Costs and ad spend are a later phase."""

import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.analytics import StoreEvent, StoreSession, Visitor
from app.models.admin import OrderEvent
from app.models.order import Order, OrderItem

log = logging.getLogger("kenidoux.metrics")

CASABLANCA = ZoneInfo("Africa/Casablanca")
REACHED_CONFIRMED = ("confirmed", "shipped", "delivered", "returned")
CHECKOUT_NAMES = ("checkout_started", "checkout_form_start")


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
        return None
    return round((current - previous) / previous * 100, 1)


def _aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=CASABLANCA)
    return value


def _event_ids(db: Session, start: datetime, end: datetime, names: tuple[str, ...] | None = None) -> set[str]:
    stmt = select(StoreEvent.visitor_id).where(StoreEvent.created_at >= start, StoreEvent.created_at < end)
    if names:
        stmt = stmt.where(StoreEvent.name.in_(names))
    return {row for row in db.scalars(stmt) if row}


def _event_count(db: Session, start: datetime, end: datetime, name: str) -> int:
    return int(
        db.scalar(
            select(func.count(StoreEvent.id)).where(
                StoreEvent.created_at >= start, StoreEvent.created_at < end, StoreEvent.name == name
            )
        )
        or 0
    )


def _orders_query(start: datetime, end: datetime):
    return select(Order).where(Order.created_at >= start, Order.created_at < end)


def _order_rows(db: Session, start: datetime, end: datetime) -> list[Order]:
    return list(db.scalars(_orders_query(start, end)))


def _rate(part: int | float, whole: int | float) -> float | None:
    if whole <= 0:
        return None
    return round(part / whole * 100, 1)


def _capped_rate(part: int, whole: int) -> float | None:
    if whole <= 0:
        return None
    if part > whole:
        log.warning("conversion above 100%% buyers=%s visitors=%s", part, whole)
    return round(min(part, whole) / whole * 100, 1)


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


def _pipeline(orders: list[Order]) -> dict:
    counts: dict[str, int] = {}
    for order in orders:
        status = order.fulfillment_status or "new"
        counts[status] = counts.get(status, 0) + 1
    total = len(orders)
    pending = counts.get("new", 0)
    calling = counts.get("no_answer_1", 0) + counts.get("no_answer_2", 0) + counts.get("no_answer_3", 0)
    confirmed = sum(counts.get(status, 0) for status in REACHED_CONFIRMED)
    shipped = counts.get("shipped", 0)
    delivered = counts.get("delivered", 0)
    returned = counts.get("returned", 0)
    revenue_placed = sum(order.total_mad or 0 for order in orders)
    revenue_delivered = sum(order.total_mad or 0 for order in orders if (order.fulfillment_status or "") == "delivered")
    return {
        "orders": total,
        "pending": pending,
        "calling": calling,
        "confirmed": confirmed,
        "cancelled": counts.get("cancelled", 0),
        "fake": counts.get("fake", 0),
        "duplicate": counts.get("duplicate", 0),
        "shipped": shipped,
        "in_transit": shipped,
        "delivered": delivered,
        "returned": returned,
        "confirmation_rate": _rate(confirmed, total),
        "delivery_rate": _rate(delivered, delivered + returned),
        "success_rate": _rate(delivered, total),
        "revenue_placed": revenue_placed,
        "revenue_delivered": revenue_delivered,
        "untracked": sum(1 for order in orders if not order.visitor_id),
    }


def _traffic_block(db: Session, start: datetime, end: datetime) -> dict:
    visitors = _event_ids(db, start, end, ("page_view",))
    sessions = {
        row
        for row in db.scalars(
            select(StoreEvent.session_id).where(StoreEvent.created_at >= start, StoreEvent.created_at < end, StoreEvent.name == "page_view")
        )
        if row
    }
    page_views = _event_count(db, start, end, "page_view")
    single_page = set()
    rows = db.execute(
        select(StoreEvent.session_id, StoreEvent.name).where(StoreEvent.created_at >= start, StoreEvent.created_at < end)
    ).all()
    by_session: dict[str, list[str]] = {}
    for session_id, name in rows:
        by_session.setdefault(session_id, []).append(name)
    for session_id, names in by_session.items():
        if names == ["page_view"] or (len(names) == 1 and names[0] == "page_view"):
            single_page.add(session_id)
        elif names.count("page_view") == 1 and all(name == "page_view" for name in names):
            single_page.add(session_id)
    return {
        "visitor_ids": visitors,
        "visitors": len(visitors),
        "sessions": len(sessions),
        "page_views": page_views,
        "product_views": _event_count(db, start, end, "product_view"),
        "product_ids": _event_ids(db, start, end, ("product_view",)),
        "checkout_ids": _event_ids(db, start, end, CHECKOUT_NAMES),
        "bounce_rate": _rate(len(single_page), len(sessions)),
        "bounces": len(single_page),
    }


def _funnel(current: dict, orders: list[Order]) -> list[dict]:
    visitors = set(current["visitor_ids"])
    product = visitors & set(current["product_ids"])
    checkout = product & set(current["checkout_ids"])
    placed_visitors = {order.visitor_id for order in orders if order.visitor_id}
    placed = checkout & visitors & placed_visitors
    confirmed_ids = {order.visitor_id for order in orders if order.visitor_id and (order.fulfillment_status or "") in REACHED_CONFIRMED}
    delivered_ids = {order.visitor_id for order in orders if order.visitor_id and (order.fulfillment_status or "") == "delivered"}
    confirmed = placed & confirmed_ids
    delivered = confirmed & delivered_ids
    steps = [
        ("visitors", len(visitors)),
        ("product_views", len(product)),
        ("checkout_starts", len(checkout)),
        ("orders", len(placed)),
        ("confirmed", len(confirmed)),
        ("delivered", len(delivered)),
    ]
    rows = []
    previous = None
    base = steps[0][1]
    for key, count in steps:
        if previous is not None and count > previous:
            log.warning("funnel widened at %s count=%s previous=%s", key, count, previous)
            count = previous
        drop = None if not previous else _rate(previous - count, previous)
        rows.append({"step": key, "count": count, "drop_pct": drop, "pct": _rate(count, base)})
        previous = count
    return rows


def _merge_source(db: Session, start: datetime, end: datetime, visit_column, order_column) -> list[dict]:
    label = func.coalesce(visit_column, "direct")
    visit_rows = db.execute(
        select(label, func.count(func.distinct(StoreEvent.visitor_id)))
        .join(StoreSession, StoreSession.id == StoreEvent.session_id)
        .where(StoreEvent.created_at >= start, StoreEvent.created_at < end, StoreEvent.name == "page_view")
        .group_by(label)
    ).all()
    checkout_label = func.coalesce(visit_column, "direct")
    checkout_rows = db.execute(
        select(checkout_label, func.count(func.distinct(StoreEvent.visitor_id)))
        .join(StoreSession, StoreSession.id == StoreEvent.session_id)
        .where(StoreEvent.created_at >= start, StoreEvent.created_at < end, StoreEvent.name.in_(CHECKOUT_NAMES))
        .group_by(checkout_label)
    ).all()
    orders = _order_rows(db, start, end)
    folded: dict[str, dict] = {}
    for key, count in visit_rows:
        folded.setdefault(str(key), {"visitors": 0, "checkout": 0, "orders": 0, "confirmed": 0, "delivered": 0})
        folded[str(key)]["visitors"] = int(count)
    for key, count in checkout_rows:
        slot = folded.setdefault(str(key), {"visitors": 0, "checkout": 0, "orders": 0, "confirmed": 0, "delivered": 0})
        slot["checkout"] = int(count)
    for order in orders:
        key = getattr(order, order_column.key) or "direct"
        if order.visitor_id is None:
            key = "untracked"
        slot = folded.setdefault(str(key), {"visitors": 0, "checkout": 0, "orders": 0, "confirmed": 0, "delivered": 0})
        slot["orders"] += 1
        if (order.fulfillment_status or "") in REACHED_CONFIRMED:
            slot["confirmed"] += 1
        if (order.fulfillment_status or "") == "delivered":
            slot["delivered"] += 1
    rows = []
    for key, slot in folded.items():
        slot["key"] = key
        slot["conversion"] = _capped_rate(min(slot["orders"], slot["visitors"]), slot["visitors"]) if slot["visitors"] else None
        rows.append(slot)
    rows.sort(key=lambda row: (row["orders"], row["visitors"]), reverse=True)
    return rows[:20]


def _slot() -> dict:
    return {"visitors": 0, "checkout": 0, "orders": 0, "confirmed": 0, "delivered": 0}


def _finish(folded: dict[str, dict]) -> list[dict]:
    rows = []
    for key, slot in folded.items():
        slot["key"] = key
        visitors = slot["visitors"]
        slot["conversion"] = _capped_rate(min(slot["orders"], visitors), visitors) if visitors else None
        rows.append(slot)
    rows.sort(key=lambda row: (row["orders"], row["visitors"]), reverse=True)
    return rows[:20]


def _devices(db: Session, start: datetime, end: datetime) -> list[dict]:
    label = func.coalesce(Visitor.device, "desktop")
    folded: dict[str, dict] = {}
    for key, count in db.execute(
        select(label, func.count(func.distinct(StoreEvent.visitor_id)))
        .join(Visitor, Visitor.id == StoreEvent.visitor_id)
        .where(StoreEvent.created_at >= start, StoreEvent.created_at < end, StoreEvent.name == "page_view")
        .group_by(label)
    ).all():
        folded.setdefault(str(key), _slot())["visitors"] = int(count)
    for key, count in db.execute(
        select(label, func.count(func.distinct(StoreEvent.visitor_id)))
        .join(Visitor, Visitor.id == StoreEvent.visitor_id)
        .where(StoreEvent.created_at >= start, StoreEvent.created_at < end, StoreEvent.name.in_(CHECKOUT_NAMES))
        .group_by(label)
    ).all():
        folded.setdefault(str(key), _slot())["checkout"] = int(count)
    for order in _order_rows(db, start, end):
        device = "untracked"
        if order.visitor_id:
            visitor = db.get(Visitor, order.visitor_id)
            device = (visitor.device if visitor and visitor.device else "desktop")
        slot = folded.setdefault(device, _slot())
        slot["orders"] += 1
        if (order.fulfillment_status or "") in REACHED_CONFIRMED:
            slot["confirmed"] += 1
        if (order.fulfillment_status or "") == "delivered":
            slot["delivered"] += 1
    return _finish(folded)


def _cities(db: Session, start: datetime, end: datetime) -> list[dict]:
    folded: dict[str, dict] = {}
    for key, count in db.execute(
        select(StoreEvent.city, func.count(func.distinct(StoreEvent.visitor_id)))
        .where(StoreEvent.created_at >= start, StoreEvent.created_at < end, StoreEvent.name == "page_view", StoreEvent.city.is_not(None))
        .group_by(StoreEvent.city)
    ).all():
        folded.setdefault(str(key), _slot())["visitors"] = int(count)
    for key, count in db.execute(
        select(StoreEvent.city, func.count(func.distinct(StoreEvent.visitor_id)))
        .where(StoreEvent.created_at >= start, StoreEvent.created_at < end, StoreEvent.name.in_(CHECKOUT_NAMES), StoreEvent.city.is_not(None))
        .group_by(StoreEvent.city)
    ).all():
        folded.setdefault(str(key), _slot())["checkout"] = int(count)
    for order in _order_rows(db, start, end):
        city = order.city or "—"
        slot = folded.setdefault(city, _slot())
        slot["orders"] += 1
        if (order.fulfillment_status or "") in REACHED_CONFIRMED:
            slot["confirmed"] += 1
        if (order.fulfillment_status or "") == "delivered":
            slot["delivered"] += 1
    return _finish(folded)


def _products(db: Session, start: datetime, end: datetime) -> list[dict]:
    folded: dict[str, dict] = {}
    for slug, count in db.execute(
        select(StoreEvent.product_slug, func.count(func.distinct(StoreEvent.visitor_id))).where(
            StoreEvent.created_at >= start,
            StoreEvent.created_at < end,
            StoreEvent.name == "product_view",
            StoreEvent.product_slug.is_not(None),
        ).group_by(StoreEvent.product_slug)
    ).all():
        folded.setdefault(slug, _slot())["visitors"] = int(count)
    for slug, count in db.execute(
        select(StoreEvent.product_slug, func.count(func.distinct(StoreEvent.visitor_id))).where(
            StoreEvent.created_at >= start,
            StoreEvent.created_at < end,
            StoreEvent.name.in_(CHECKOUT_NAMES),
            StoreEvent.product_slug.is_not(None),
        ).group_by(StoreEvent.product_slug)
    ).all():
        folded.setdefault(slug, _slot())["checkout"] = int(count)
    for slug, status, count in db.execute(
        select(OrderItem.product_slug, Order.fulfillment_status, func.count(func.distinct(Order.id)))
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.created_at >= start, Order.created_at < end)
        .group_by(OrderItem.product_slug, Order.fulfillment_status)
    ).all():
        slot = folded.setdefault(slug, _slot())
        slot["orders"] += int(count)
        if status in REACHED_CONFIRMED:
            slot["confirmed"] += int(count)
        if status == "delivered":
            slot["delivered"] += int(count)
    return _finish(folded)


def _form(db: Session, start: datetime, end: datetime, orders: list[Order]) -> dict:
    started = len(_event_ids(db, start, end, CHECKOUT_NAMES))
    attempts = len(_event_ids(db, start, end, ("order_submit_attempt",)))
    errors = len(_event_ids(db, start, end, ("order_submit_error",)))
    fields = {"name": set(), "phone": set(), "city": set(), "address": set()}
    rows = db.execute(
        select(StoreEvent.visitor_id, StoreEvent.details).where(
            StoreEvent.created_at >= start,
            StoreEvent.created_at < end,
            StoreEvent.name == "form_field_completed",
        )
    ).all()
    for visitor_id, details in rows:
        field = (details or {}).get("field") if isinstance(details, dict) else None
        if field in fields and visitor_id:
            fields[field].add(visitor_id)
    return {
        "checkout_started": started,
        "name": len(fields["name"]),
        "phone": len(fields["phone"]),
        "city": len(fields["city"]),
        "address": len(fields["address"]),
        "submit_attempt": attempts,
        "submit_error": errors,
        "order_placed": len({order.visitor_id for order in orders if order.visitor_id}),
    }


def _buyers(current: dict, orders: list[Order]) -> int:
    visitors = set(current["visitor_ids"])
    buyers = {order.visitor_id for order in orders if order.visitor_id} & visitors
    return len(buyers)


def report(db: Session, preset: str | None, date_from: str | None, date_to: str | None) -> dict:
    start, end, name = window(preset, date_from, date_to)
    span = end - start
    previous_start, previous_end = start - span, start
    current = _traffic_block(db, start, end)
    previous = _traffic_block(db, previous_start, previous_end)
    orders = _order_rows(db, start, end)
    orders_prev = _order_rows(db, previous_start, previous_end)
    pipeline = _pipeline(orders)
    previous_pipeline = _pipeline(orders_prev)
    pipeline.update(_hours(db, start, end))
    buyers = _buyers(current, orders)
    buyers_prev = _buyers(previous, orders_prev)
    if current["visitors"] and len(orders) > current["visitors"]:
        log.warning("orders exceed visitors orders=%s visitors=%s untracked=%s", len(orders), current["visitors"], pipeline["untracked"])
    conversion = _capped_rate(buyers, current["visitors"])
    conversion_prev = _capped_rate(buyers_prev, previous["visitors"])
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
        "bounce_rate_change": _change(current["bounce_rate"] or 0, previous["bounce_rate"] or 0) if previous["bounce_rate"] else None,
    }
    return {
        "range": {"preset": name, "from": start.date().isoformat(), "to": (end - timedelta(days=1)).date().isoformat()},
        "traffic": traffic,
        "funnel": _funnel(current, orders),
        "untracked_orders": pipeline["untracked"],
        "conversion_rate": conversion,
        "conversion_rate_change": None if conversion is None or conversion_prev is None else _change(conversion, conversion_prev),
        "orders_change": _change(pipeline["orders"], previous_pipeline["orders"]),
        "confirmed_change": _change(pipeline["confirmed"], previous_pipeline["confirmed"]),
        "delivered_change": _change(pipeline["delivered"], previous_pipeline["delivered"]),
        "revenue_placed_change": _change(pipeline["revenue_placed"], previous_pipeline["revenue_placed"]),
        "revenue_delivered_change": _change(pipeline["revenue_delivered"], previous_pipeline["revenue_delivered"]),
        "confirmation_rate_change": None
        if pipeline["confirmation_rate"] is None or previous_pipeline["confirmation_rate"] is None
        else _change(pipeline["confirmation_rate"], previous_pipeline["confirmation_rate"]),
        "delivery_rate_change": None
        if pipeline["delivery_rate"] is None or previous_pipeline["delivery_rate"] is None
        else _change(pipeline["delivery_rate"], previous_pipeline["delivery_rate"]),
        "pipeline": pipeline,
        "form": _form(db, start, end, orders),
        "by_source": _merge_source(db, start, end, StoreSession.utm_source, Order.utm_source),
        "by_campaign": _merge_source(db, start, end, StoreSession.utm_campaign, Order.utm_campaign),
        "by_ad": _merge_source(db, start, end, StoreSession.utm_content, Order.utm_content),
        "by_device": _devices(db, start, end),
        "by_city": _cities(db, start, end),
        "by_product": _products(db, start, end),
    }
