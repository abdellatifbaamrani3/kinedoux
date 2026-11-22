"""First-party shop visits. The Meta pixel is a separate path and is not changed here."""

import re
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.analytics import StoreEvent, StoreSession, Visitor
from app.models.order import Order

PUBLIC_EVENTS = {
    "page_view",
    "product_view",
    "variant_select",
    "add_to_cart",
    "checkout_started",
    "checkout_form_start",
    "form_field_completed",
    "order_submit_attempt",
    "order_submit_error",
    "scroll_depth",
    "time_on_page",
    "outbound_click",
}
ALIASES = {"checkout_form_start": "checkout_started", "order_submitted": "order_placed"}
_ID = re.compile(r"^[A-Za-z0-9]{16,64}$")
_KEY = re.compile(r"^[A-Za-z0-9]{8,64}$")
_BOT = re.compile(
    r"bot|crawl|spider|slurp|preview|facebookexternalhit|meta-externalagent|whatsapp|"
    r"headless|bytespider|petalbot|semrush|ahrefs|python-requests|curl/|wget|go-http|"
    r"monitoring|uptimerobot|pingdom",
    re.I,
)
_HITS: dict[str, list[datetime]] = {}
_LIMIT = 180
_WINDOW = timedelta(minutes=1)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _clip(value: str | None, limit: int) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text[:limit] or None


def clean_id(value: str | None) -> str | None:
    if not value:
        return None
    text = re.sub(r"[^A-Za-z0-9]", "", str(value))
    if not _ID.match(text):
        return None
    return text


def _event_key(value: str | None) -> str | None:
    if not value or not _KEY.match(str(value)):
        return None
    return str(value)


def _meta(value) -> dict | None:
    if not isinstance(value, dict):
        return None
    clean: dict = {}
    for key, item in list(value.items())[:12]:
        if not isinstance(key, str):
            continue
        if isinstance(item, bool):
            continue
        if isinstance(item, (int, float)):
            clean[key[:40]] = item
        elif isinstance(item, str) and item.strip():
            clean[key[:40]] = item.strip()[:300]
    return clean or None


def is_bot(user_agent: str | None) -> bool:
    if not user_agent or not user_agent.strip():
        return True
    return _BOT.search(user_agent) is not None


def too_many(ip: str) -> bool:
    now = _now()
    recent = [stamp for stamp in _HITS.get(ip, []) if now - stamp < _WINDOW]
    if len(recent) >= _LIMIT:
        _HITS[ip] = recent
        return True
    recent.append(now)
    _HITS[ip] = recent
    return False


def device_of(user_agent: str) -> str:
    if re.search(r"Mobi|Android|iPhone|iPad", user_agent or "", re.I):
        return "mobile"
    return "desktop"


def browser_of(user_agent: str) -> str:
    ua = user_agent or ""
    if "Edg/" in ua:
        return "Edge"
    if "Chrome/" in ua:
        return "Chrome"
    if "Firefox/" in ua:
        return "Firefox"
    if "Safari/" in ua:
        return "Safari"
    return "Other"


def _touch_visitor(db: Session, visitor_id: str, user_agent: str, country: str | None, city: str | None) -> Visitor:
    row = db.get(Visitor, visitor_id)
    now = _now()
    if row is None:
        row = Visitor(
            id=visitor_id,
            device=device_of(user_agent),
            browser=browser_of(user_agent),
            country=_clip(country, 8),
            city=_clip(city, 120),
            first_seen_at=now,
            last_seen_at=now,
        )
        db.add(row)
        return row
    row.last_seen_at = now
    row.device = device_of(user_agent)
    row.browser = browser_of(user_agent)
    if country and not row.country:
        row.country = _clip(country, 8)
    if city and not row.city:
        row.city = _clip(city, 120)
    return row


def _assign_last(row: StoreSession, fields: dict) -> None:
    pairs = (
        ("last_utm_source", "utm_source", 100),
        ("last_utm_medium", "utm_medium", 100),
        ("last_utm_campaign", "utm_campaign", 150),
        ("last_utm_content", "utm_content", 150),
        ("last_utm_term", "utm_term", 150),
        ("last_fbclid", "fbclid", 2048),
        ("last_ttclid", "ttclid", 255),
    )
    for last_name, first_name, limit in pairs:
        value = _clip(fields.get(last_name) or fields.get(first_name), limit)
        if value:
            setattr(row, last_name, value)


def _touch_session(db: Session, session_id: str, visitor_id: str, fields: dict, ip: str | None, user_agent: str | None) -> StoreSession:
    row = db.get(StoreSession, session_id)
    now = _now()
    if row is None:
        row = StoreSession(
            id=session_id,
            visitor_id=visitor_id,
            landing_page=_clip(fields.get("landing_page"), 1000),
            referrer=_clip(fields.get("referrer"), 1000),
            utm_source=_clip(fields.get("utm_source"), 100),
            utm_medium=_clip(fields.get("utm_medium"), 100),
            utm_campaign=_clip(fields.get("utm_campaign"), 150),
            utm_content=_clip(fields.get("utm_content"), 150),
            utm_term=_clip(fields.get("utm_term"), 150),
            fbclid=_clip(fields.get("fbclid"), 2048),
            ttclid=_clip(fields.get("ttclid"), 255),
            client_ip=_clip(ip, 64),
            user_agent=_clip(user_agent, 500),
            started_at=now,
            last_seen_at=now,
        )
        _assign_last(row, fields)
        db.add(row)
        return row
    row.last_seen_at = now
    _assign_last(row, fields)
    if ip:
        row.client_ip = _clip(ip, 64)
    if user_agent:
        row.user_agent = _clip(user_agent, 500)
    return row


def record_visit(db: Session, payload: dict, user_agent: str | None, country: str | None, city: str | None, ip: str | None = None) -> str:
    if is_bot(user_agent):
        return "ignored"
    path = _clip(payload.get("path"), 500) or ""
    if path == "/admin" or path.startswith("/admin/"):
        return "ignored"
    visitor_id = clean_id(payload.get("visitor_id"))
    session_id = clean_id(payload.get("session_id"))
    name = ALIASES.get(str(payload.get("event") or ""), str(payload.get("event") or ""))
    if not visitor_id or not session_id or name not in PUBLIC_EVENTS or name == "order_placed":
        return "ignored"
    event_key = _event_key(payload.get("event_id"))
    if event_key and db.scalar(select(StoreEvent.id).where(StoreEvent.event_key == event_key)):
        return "duplicate"
    _touch_visitor(db, visitor_id, user_agent or "", country, city)
    db.flush()
    _touch_session(db, session_id, visitor_id, payload, ip, user_agent)
    db.flush()
    value = payload.get("value_mad")
    try:
        amount = int(value) if value is not None and value != "" else None
    except (TypeError, ValueError):
        amount = None
    event = StoreEvent(
        event_key=event_key,
        visitor_id=visitor_id,
        session_id=session_id,
        name=name,
        path=path or None,
        page_url=_clip(payload.get("page_url"), 1000),
        referrer=_clip(payload.get("referrer"), 1000),
        product_slug=_clip(payload.get("product_slug"), 100),
        utm_source=_clip(payload.get("utm_source"), 100),
        utm_medium=_clip(payload.get("utm_medium"), 100),
        utm_campaign=_clip(payload.get("utm_campaign"), 150),
        utm_content=_clip(payload.get("utm_content"), 150),
        utm_term=_clip(payload.get("utm_term"), 150),
        fbclid=_clip(payload.get("fbclid"), 2048),
        ttclid=_clip(payload.get("ttclid"), 255),
        device=device_of(user_agent or ""),
        browser=browser_of(user_agent or ""),
        country=_clip(country, 8),
        city=_clip(city, 120),
        value_mad=amount,
        details=_meta(payload.get("metadata")),
        created_at=_now(),
    )
    try:
        with db.begin_nested():
            db.add(event)
            db.flush()
    except IntegrityError:
        return "duplicate"
    db.commit()
    return "stored"


def attach_order(db: Session, order: Order, tracking) -> None:
    """Link the order to the visit and write order_placed on the server."""
    visitor_id = clean_id(getattr(tracking, "visitor_id", None))
    session_id = clean_id(getattr(tracking, "session_id", None))
    if getattr(tracking, "utm_term", None) and not order.utm_term:
        order.utm_term = _clip(tracking.utm_term, 150)
    if not visitor_id or not session_id:
        return
    fields = {
        "landing_page": order.page_url,
        "utm_source": getattr(tracking, "utm_source", None),
        "utm_medium": getattr(tracking, "utm_medium", None),
        "utm_campaign": getattr(tracking, "utm_campaign", None),
        "utm_content": getattr(tracking, "utm_content", None),
        "utm_term": getattr(tracking, "utm_term", None),
        "fbclid": getattr(tracking, "fbclid", None),
        "ttclid": getattr(tracking, "ttclid", None),
    }
    _touch_visitor(db, visitor_id, order.client_user_agent or "Mozilla/5.0", None, None)
    db.flush()
    session = _touch_session(db, session_id, visitor_id, fields, order.client_ip, order.client_user_agent)
    db.flush()
    order.visitor_id = visitor_id
    order.analytics_session_id = session_id
    for name in ("utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"):
        if not getattr(order, name) and getattr(session, name):
            setattr(order, name, getattr(session, name))
    event_key = f"order{order.id.hex}"
    if db.scalar(select(StoreEvent.id).where(StoreEvent.event_key == event_key)):
        return
    db.add(
        StoreEvent(
            event_key=event_key,
            visitor_id=visitor_id,
            session_id=session_id,
            order_id=order.id,
            name="order_placed",
            path=_clip(order.page_url, 500),
            page_url=_clip(order.page_url, 1000),
            product_slug=_clip(getattr(tracking, "product_slug", None), 100),
            utm_source=order.utm_source,
            utm_medium=order.utm_medium,
            utm_campaign=order.utm_campaign,
            utm_content=order.utm_content,
            utm_term=order.utm_term,
            value_mad=order.total_mad,
            created_at=_now(),
        )
    )


def backfill_order_visitors(db: Session) -> int:
    """Attach old orders to a visit when the session, IP, and browser still match."""
    linked = 0
    pending = list(db.scalars(select(Order).where(Order.visitor_id.is_(None), Order.analytics_session_id.is_not(None))))
    for order in pending:
        session = db.get(StoreSession, order.analytics_session_id)
        if session is None:
            continue
        order.visitor_id = session.visitor_id
        linked += 1
    unmatched = list(
        db.scalars(
            select(Order).where(
                Order.visitor_id.is_(None),
                Order.client_ip.is_not(None),
                Order.client_user_agent.is_not(None),
            )
        )
    )
    for order in unmatched:
        created = order.created_at
        if created is None:
            continue
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        session = db.scalar(
            select(StoreSession)
            .where(
                StoreSession.client_ip == order.client_ip,
                StoreSession.user_agent == order.client_user_agent,
                StoreSession.started_at <= created,
                StoreSession.last_seen_at >= created - timedelta(minutes=30),
            )
            .order_by(StoreSession.started_at.desc())
            .limit(1)
        )
        if session is None:
            continue
        order.visitor_id = session.visitor_id
        if not order.analytics_session_id:
            order.analytics_session_id = session.id
        linked += 1
    if linked:
        db.commit()
    return linked
