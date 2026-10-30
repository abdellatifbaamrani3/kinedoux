"""Plain-python, session-independent view of an order (safe to pass across `await`s)."""

import uuid
from dataclasses import dataclass, field
from datetime import datetime

from app.models.order import Order
from app.services.phone_normalizer import normalize_digits


@dataclass
class OrderSnapshot:
    id: uuid.UUID
    order_number: str
    customer_name: str
    phone_e164: str
    phone_digits: str
    phone_local: str
    country: str
    status: str
    items: list[dict]
    subtotal_mad: int
    upsell_added: bool
    upsell_product_slug: str | None
    upsell_price_mad: int
    total_mad: int
    currency: str
    event_id: str | None
    created_at: datetime | None
    client_ip: str | None = None
    client_user_agent: str | None = None
    fbp: str | None = None
    fbc: str | None = None
    ttp: str | None = None
    ttclid: str | None = None
    sc_cookie1: str | None = None
    sc_click_id: str | None = None
    utm_source: str | None = None
    utm_campaign: str | None = None
    page_url: str | None = None
    extra: dict = field(default_factory=dict)


def snapshot_from_order(order: Order) -> OrderSnapshot:
    e164 = order.customer_phone_e164
    digits = normalize_digits(e164).lstrip("+")
    local = "0" + digits[-9:]
    return OrderSnapshot(
        id=order.id,
        order_number=order.order_number,
        customer_name=order.customer_name,
        phone_e164=e164,
        phone_digits=digits,
        phone_local=local,
        country=order.customer_country,
        status=order.status,
        items=list(order.items_json or []),
        subtotal_mad=order.subtotal_mad,
        upsell_added=order.upsell_added,
        upsell_product_slug=order.upsell_product_slug,
        upsell_price_mad=order.upsell_price_mad,
        total_mad=order.total_mad,
        currency=order.currency,
        event_id=order.event_id,
        created_at=order.created_at,
        client_ip=order.client_ip,
        client_user_agent=order.client_user_agent,
        fbp=order.fbp,
        fbc=order.fbc,
        ttp=order.ttp,
        ttclid=order.ttclid,
        sc_cookie1=order.sc_cookie1,
        sc_click_id=order.sc_click_id,
        utm_source=order.utm_source,
        utm_campaign=order.utm_campaign,
        page_url=order.page_url,
    )
