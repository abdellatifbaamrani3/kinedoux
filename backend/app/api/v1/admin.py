"""Private order desk. The shop never calls these routes."""

import uuid
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import client_ip
from app.database import get_db
from app.models.admin import AdminUser
from app.models.order import Order
from app.services import admin_auth, admin_desk

router = APIRouter(prefix="/admin", tags=["admin"])
CASABLANCA = ZoneInfo("Africa/Casablanca")


class LoginIn(BaseModel):
    email: str = Field(min_length=3, max_length=200)
    password: str = Field(min_length=1, max_length=200)


class PatchIn(BaseModel):
    status: str | None = None
    notes: str | None = Field(default=None, max_length=4000)
    tracking_number: str | None = Field(default=None, max_length=80)
    city: str | None = Field(default=None, max_length=120)
    address: str | None = Field(default=None, max_length=300)


class BulkIn(BaseModel):
    ids: list[uuid.UUID] = Field(min_length=1, max_length=200)
    status: str


class BlacklistIn(BaseModel):
    phone_e164: str = Field(min_length=8, max_length=30)
    reason: str | None = Field(default=None, max_length=300)


def require_admin(request: Request, db: Session = Depends(get_db)) -> AdminUser:
    token = admin_auth.bearer_token(request.headers.get("authorization"))
    if token is None:
        token = request.cookies.get("kd_admin")
    user = admin_auth.user_for_token(db, token)
    if user is None:
        raise HTTPException(status_code=401, detail="Login required")
    return user


def _day(value: str | None, end: bool) -> datetime | None:
    if not value:
        return None
    try:
        day = datetime.strptime(value, "%Y-%m-%d")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Dates use YYYY-MM-DD") from exc
    if end:
        day += timedelta(days=1)
    return day.replace(tzinfo=CASABLANCA)


def _public(order: Order, neighbors: list[Order], blocked: set[str]) -> dict:
    status = order.fulfillment_status or "new"
    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "name": admin_desk.display_name(order),
        "phone": order.customer_phone_e164,
        "city": order.city,
        "address": order.address,
        "product": admin_desk.product_label(order),
        "quantity": admin_desk.quantity_of(order),
        "price_mad": order.total_mad,
        "status": status,
        "allowed_next": sorted(admin_desk.NEXT_STATUS.get(status, set())),
        "checkout_status": order.status,
        "call_attempts": order.call_attempts,
        "notes": order.notes,
        "campaign": order.utm_campaign,
        "tracking_number": order.tracking_number,
        "duplicate": admin_desk.is_duplicate(order, neighbors),
        "blacklisted": order.customer_phone_e164 in blocked,
        "is_test": bool(order.is_test),
    }


def _pack(db: Session, orders: list[Order]) -> list[dict]:
    neighbors = admin_desk.neighbors_for(db, orders)
    blocked = admin_desk.blacklist_set(db, {order.customer_phone_e164 for order in orders})
    return [_public(order, neighbors, blocked) for order in orders]


@router.post("/login")
def login(body: LoginIn, request: Request, db: Session = Depends(get_db)):
    ip = client_ip(request) or "unknown"
    if admin_auth.too_many_attempts(ip):
        raise HTTPException(status_code=429, detail="Too many attempts. Wait 15 minutes.")
    user = admin_auth.authenticate(db, body.email, body.password)
    if user is None:
        admin_auth.record_attempt(ip)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    admin_auth.clear_attempts(ip)
    token = admin_auth.start_session(db, user)
    return {"token": token, "email": user.email}


@router.post("/logout")
def logout(request: Request, db: Session = Depends(get_db), _user: AdminUser = Depends(require_admin)):
    token = admin_auth.bearer_token(request.headers.get("authorization")) or request.cookies.get("kd_admin")
    admin_auth.end_session(db, token)
    return {"ok": True}


@router.get("/me")
def me(user: AdminUser = Depends(require_admin)):
    return {"email": user.email}


@router.get("/orders")
def orders(
    status: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    city: str | None = None,
    campaign: str | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_admin),
):
    if status and status not in admin_desk.FULFILLMENT:
        raise HTTPException(status_code=422, detail="Unknown status")
    rows, total = admin_desk.list_orders(
        db,
        status=status,
        date_from=_day(date_from, end=False),
        date_to=_day(date_to, end=True),
        city=city,
        campaign=campaign,
        query=q,
        page=page,
        page_size=page_size,
    )
    return {"items": _pack(db, rows), "total": total, "page": page, "page_size": page_size}


@router.get("/orders/export")
def export_orders(
    status: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    city: str | None = None,
    campaign: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_admin),
):
    rows = admin_desk.orders_for_export(
        db,
        status=status,
        date_from=_day(date_from, end=False),
        date_to=_day(date_to, end=True),
        city=city,
        campaign=campaign,
        query=q,
    )
    neighbors = admin_desk.neighbors_for(db, rows)
    blocked = admin_desk.blacklist_set(db, {order.customer_phone_e164 for order in rows})
    body = "\ufeff" + admin_desk.to_csv(rows, neighbors, blocked)
    return Response(
        content=body,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=kinedoux-orders.csv", "X-Robots-Tag": "noindex, nofollow"},
    )


@router.post("/orders/bulk-status")
def bulk_status(body: BulkIn, db: Session = Depends(get_db), user: AdminUser = Depends(require_admin)):
    from sqlalchemy import select

    found = list(db.scalars(select(Order).where(Order.id.in_(body.ids))))
    if len(found) != len(set(body.ids)):
        raise HTTPException(status_code=404, detail="One or more orders were not found")
    try:
        for order in found:
            current = order.fulfillment_status or "new"
            if body.status != current and body.status not in admin_desk.NEXT_STATUS.get(current, set()):
                raise admin_desk.DeskError(f"Cannot move {current} to {body.status}")
        for order in found:
            admin_desk.change_status(db, order, body.status, user.email)
    except admin_desk.DeskError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {"items": _pack(db, found)}


@router.patch("/orders/{order_id}")
def patch_order(order_id: uuid.UUID, body: PatchIn, db: Session = Depends(get_db), user: AdminUser = Depends(require_admin)):
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if body.city is not None:
        order.city = body.city.strip()[:120] or None
    if body.address is not None:
        order.address = body.address.strip()[:300] or None
    try:
        admin_desk.change_status(
            db,
            order,
            body.status or order.fulfillment_status or "new",
            user.email,
            note=body.notes,
            tracking_number=body.tracking_number,
        )
    except admin_desk.DeskError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return _public(order, admin_desk.neighbors_for(db, [order]), admin_desk.blacklist_set(db, {order.customer_phone_e164}))


@router.get("/orders/{order_id}/history")
def order_history(order_id: uuid.UUID, db: Session = Depends(get_db), _user: AdminUser = Depends(require_admin)):
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "items": [
            {
                "id": event.id,
                "actor_email": event.actor_email,
                "from_status": event.from_status,
                "to_status": event.to_status,
                "note": event.note,
                "created_at": event.created_at.isoformat() if event.created_at else None,
            }
            for event in admin_desk.history(db, order_id)
        ]
    }


@router.get("/blacklist")
def blacklist(db: Session = Depends(get_db), _user: AdminUser = Depends(require_admin)):
    from sqlalchemy import select

    from app.models.admin import PhoneBlacklist

    rows = list(db.scalars(select(PhoneBlacklist).order_by(PhoneBlacklist.created_at.desc())))
    return {
        "items": [
            {"phone_e164": row.phone_e164, "reason": row.reason, "created_at": row.created_at.isoformat() if row.created_at else None}
            for row in rows
        ]
    }


@router.post("/blacklist")
def add_blacklist(body: BlacklistIn, db: Session = Depends(get_db), user: AdminUser = Depends(require_admin)):
    row = admin_desk.add_blacklist(db, body.phone_e164.strip(), body.reason, user.email)
    return {"phone_e164": row.phone_e164, "reason": row.reason}


@router.delete("/blacklist/{phone_e164}")
def delete_blacklist(phone_e164: str, db: Session = Depends(get_db), _user: AdminUser = Depends(require_admin)):
    admin_desk.remove_blacklist(db, phone_e164)
    return {"ok": True}


@router.get("/activity")
def activity(limit: int = Query(default=40, ge=1, le=100), db: Session = Depends(get_db), _user: AdminUser = Depends(require_admin)):
    from sqlalchemy import select

    from app.models.analytics import StoreEvent

    rows = list(db.scalars(select(StoreEvent).order_by(StoreEvent.created_at.desc()).limit(limit)))
    return {
        "items": [
            {
                "id": row.id,
                "event": row.name,
                "visitor": (row.visitor_id or "")[:8],
                "path": row.path,
                "source": row.utm_source or "direct",
                "campaign": row.utm_campaign,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in rows
        ]
    }


@router.get("/metrics")
def metrics(
    range: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    db: Session = Depends(get_db),
    _user: AdminUser = Depends(require_admin),
):
    from app.services import metrics as metrics_service

    try:
        return metrics_service.report(db, range, date_from, date_to)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
