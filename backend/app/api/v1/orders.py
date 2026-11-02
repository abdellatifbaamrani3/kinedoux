import uuid

from fastapi import APIRouter, HTTPException, Request
from starlette.concurrency import run_in_threadpool

from app.api.deps import client_ip, user_agent
from app.database import SessionLocal
from app.models.order import Order
from app.schemas.order import (
    OrderCreate,
    OrderItemOut,
    OrderOut,
    OrderPublicOut,
    UpsellDecision,
    UpsellOfferOut,
)
from app.services import order_service
from app.services.offers import recommend_upsell, upsell_choices
from app.services.snapshot import OrderSnapshot, snapshot_from_order

router = APIRouter(prefix="/orders", tags=["orders"])


def _items_out(items: list[dict]) -> list[OrderItemOut]:
    return [OrderItemOut(**{k: i.get(k) for k in OrderItemOut.model_fields}) for i in items]


def _order_out(snap: OrderSnapshot, created_at, with_offer: bool) -> OrderOut:
    offer = recommend_upsell(snap.items) if with_offer else None
    return OrderOut(
        id=snap.id,
        order_number=snap.order_number,
        status=snap.status,
        customer_name=snap.customer_name,
        customer_phone_local=snap.phone_local,
        customer_phone_e164=snap.phone_e164,
        customer_phone_digits=snap.phone_digits,
        customer_country=snap.country,
        subtotal_mad=snap.subtotal_mad,
        upsell_added=snap.upsell_added,
        upsell_product_slug=snap.upsell_product_slug,
        upsell_price_mad=snap.upsell_price_mad,
        total_mad=snap.total_mad,
        currency=snap.currency,
        items=_items_out(snap.items),
        event_id=snap.event_id,
        upsell_offer=UpsellOfferOut(**offer.as_dict()) if offer else None,
        created_at=created_at,
    )


@router.post("", response_model=OrderOut, status_code=201)
async def create_order(payload: OrderCreate, request: Request):
    """Called by the 2-field checkout popup. Saves `pending_upsell`, arms the 20s safety net."""
    ip, ua = client_ip(request), user_agent(request)

    def _create() -> tuple[OrderSnapshot, bool]:
        with SessionLocal() as db:
            order, created = order_service.create_order(db, payload, ip, ua)
            return snapshot_from_order(order), created

    try:
        snap, created = await run_in_threadpool(_create)
    except order_service.OrderError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    if created:
        order_service.schedule_safety_net(snap.id)
    return _order_out(snap, snap.created_at, with_offer=snap.status == "pending_upsell")


@router.post("/{order_id}/upsell", response_model=OrderOut)
async def decide_upsell(order_id: uuid.UUID, decision: UpsellDecision):
    """Accept / decline / 15s timeout -> finalize, then Sheets + Purchase CAPI run in the background."""
    try:
        result = await order_service.finalize_and_dispatch(
            order_id,
            decision.accepted,
            source="customer",
            upsell_slug=decision.upsell_product_slug,
        )
    except order_service.OrderNotFound as exc:
        raise HTTPException(status_code=404, detail="الطلب غير موجود") from exc
    return _order_out(result.snapshot, result.snapshot.created_at, with_offer=False)


@router.get("/{order_id}", response_model=OrderPublicOut)
async def get_order(order_id: uuid.UUID):
    def _load():
        with SessionLocal() as db:
            order = db.get(Order, order_id)
            return snapshot_from_order(order) if order else None

    snap = await run_in_threadpool(_load)
    if snap is None:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    offers = [] if snap.upsell_added else upsell_choices(snap.items)
    return OrderPublicOut(
        id=snap.id,
        order_number=snap.order_number,
        status=snap.status,
        customer_first_name=(snap.customer_name.split() or [""])[0],
        total_mad=snap.total_mad,
        currency=snap.currency,
        upsell_added=snap.upsell_added,
        items=_items_out(snap.items),
        event_id=snap.event_id,
        upsell_offer=UpsellOfferOut(**offers[0].as_dict()) if offers else None,
        upsell_offers=[UpsellOfferOut(**offer.as_dict()) for offer in offers],
    )
