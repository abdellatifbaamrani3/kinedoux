"""First-party shop visits. The Meta pixel is a separate path and is not changed here."""

import re
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.analytics import StoreEvent, StoreSession, Visitor
from app.models.order import Order

EVENTS = {"page_view", "product_view", "add_to_cart", "checkout_form_start", "order_submitted"}
_ID = re.compile(r"^[A-Za-z0-9]{16,64}$")
_BOT = re.compile(
    r"bot|crawl|spider|slurp|preview|facebookexternalhit|meta-externalagent|whatsapp|"
    r"headless|bytespider|petalbot|semrush|ahrefs|python-requests|curl/|wget|go-http|"
    r"monitoring|uptimerobot|pingdom",
    re.I,
)
_HITS: dict[str, list[datetime]] = {}
_LIMIT = 120
_WINDOW = timedelta(minutes=1)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _clip(value: str | None, limit: int) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text[:limit] or None


def clean_id(value: str | None) -> str | None:
    if not value or not _ID.match(value):
        return None
    return value


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


def _touch_session(db: Session, session_id: str, visitor_id: str, fields: dict) -> StoreSession:
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
            fbclid=_clip(fields.get("fbclid"), 2048),
            started_at=now,
            last_seen_at=now,
        )
        db.add(row)
        return row
    row.last_seen_at = now
    return row


def record_visit(db: Session, payload: dict, user_agent: str | None, country: str | None, city: str | None) -> str:
    if is_bot(user_agent):
        return "ignored"
    visitor_id = clean_id(payload.get("visitor_id"))
    session_id = clean_id(payload.get("session_id"))
    name = payload.get("event")
    if not visitor_id or not session_id or name not in EVENTS or name == "order_submitted":
        return "ignored"
    _touch_visitor(db, visitor_id, user_agent or "", country, city)
    db.flush()
    _touch_session(db, session_id, visitor_id, payload)
    db.flush()
    db.add(
        StoreEvent(
            visitor_id=visitor_id,
            session_id=session_id,
            name=name,
            path=_clip(payload.get("path"), 500),
            product_slug=_clip(payload.get("product_slug"), 100),
            created_at=_now(),
        )
    )
    db.commit()
    return "stored"


def attach_order(db: Session, order: Order, tracking) -> None:
    """Copy the visit's campaign onto the order and count one submission."""
    visitor_id = clean_id(getattr(tracking, "visitor_id", None))
    session_id = clean_id(getattr(tracking, "session_id", None))
    if not visitor_id or not session_id:
        return
    fields = {
        "landing_page": order.page_url,
        "utm_source": getattr(tracking, "utm_source", None),
        "utm_medium": getattr(tracking, "utm_medium", None),
        "utm_campaign": getattr(tracking, "utm_campaign", None),
        "utm_content": getattr(tracking, "utm_content", None),
    }
    _touch_visitor(db, visitor_id, order.client_user_agent or "Mozilla/5.0", None, None)
    db.flush()
    session = _touch_session(db, session_id, visitor_id, fields)
    db.flush()
    order.analytics_session_id = session_id
    if not order.utm_source and session.utm_source:
        order.utm_source = session.utm_source
    if not order.utm_medium and session.utm_medium:
        order.utm_medium = session.utm_medium
    if not order.utm_campaign and session.utm_campaign:
        order.utm_campaign = session.utm_campaign
    if not order.utm_content and session.utm_content:
        order.utm_content = session.utm_content
    if getattr(tracking, "utm_content", None) and not order.utm_content:
        order.utm_content = _clip(tracking.utm_content, 150)
    db.add(
        StoreEvent(
            visitor_id=visitor_id,
            session_id=session_id,
            order_id=order.id,
            name="order_submitted",
            path=_clip(order.page_url, 500),
            created_at=_now(),
        )
    )
