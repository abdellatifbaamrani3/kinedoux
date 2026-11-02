import re
import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

ShortStr = Annotated[str, StringConstraints(strip_whitespace=True, max_length=255)]
EVENT_ID_RE = re.compile(r"^[A-Za-z0-9_\-]{8,100}$")


class OrderItemIn(BaseModel):
    """Client sends only *what* was chosen. Prices are always resolved server-side."""

    model_config = ConfigDict(extra="ignore")

    product_slug: str = Field(max_length=100)
    offer_id: str = Field(max_length=60)
    quantity: int = Field(default=1, ge=1, le=10)
    is_cross_sell: bool = False


class TrackingContext(BaseModel):
    model_config = ConfigDict(extra="ignore")

    fbp: ShortStr | None = None
    fbc: ShortStr | None = None
    ttp: ShortStr | None = None
    ttclid: ShortStr | None = None
    sc_cookie1: ShortStr | None = None
    sc_click_id: ShortStr | None = None
    utm_source: Annotated[str, StringConstraints(strip_whitespace=True, max_length=100)] | None = None
    utm_medium: Annotated[str, StringConstraints(strip_whitespace=True, max_length=100)] | None = None
    utm_campaign: Annotated[str, StringConstraints(strip_whitespace=True, max_length=150)] | None = None
    page_url: Annotated[str, StringConstraints(strip_whitespace=True, max_length=1000)] | None = None


class OrderCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    customer_name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=200)]
    customer_phone: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=50)]
    items: list[OrderItemIn] = Field(min_length=1, max_length=12)
    event_id: str | None = None  # shared browser/server Purchase dedup id
    tracking: TrackingContext = Field(default_factory=TrackingContext)

    @field_validator("event_id")
    @classmethod
    def _valid_event_id(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        if not EVENT_ID_RE.match(v):
            raise ValueError("invalid event_id")
        return v


class UpsellDecision(BaseModel):
    """Accept / decline / timeout. Price & product are decided by the server."""

    model_config = ConfigDict(extra="ignore")

    accepted: bool
    upsell_product_slug: str | None = None
    upsell_title_ar: str | None = None
    upsell_price_mad: int | None = None
    purchase_event_id: str | None = None


class UpsellOfferOut(BaseModel):
    product_slug: str
    title_ar: str
    headline_ar: str
    pitch_ar: str
    price_mad: int
    compare_at_mad: int


class OrderItemOut(BaseModel):
    product_slug: str
    offer_id: str
    title_ar: str
    quantity: int
    units: int
    price_mad: int
    compare_at_mad: int | None = None
    is_cross_sell: bool = False
    is_upsell: bool = False


class OrderOut(BaseModel):
    id: uuid.UUID
    order_number: str
    status: str
    customer_name: str
    customer_phone_local: str
    customer_phone_e164: str
    customer_phone_digits: str
    customer_country: str
    subtotal_mad: int
    upsell_added: bool
    upsell_product_slug: str | None
    upsell_price_mad: int
    total_mad: int
    currency: str
    items: list[OrderItemOut]
    event_id: str | None
    upsell_offer: UpsellOfferOut | None = None
    created_at: datetime | None = None


class OrderPublicOut(BaseModel):
    """Reduced view for GET /orders/{id} (thank-you page reload). No phone / tracking data."""

    id: uuid.UUID
    order_number: str
    status: str
    customer_first_name: str
    total_mad: int
    currency: str
    upsell_added: bool
    items: list[OrderItemOut]
    event_id: str | None
    upsell_offer: UpsellOfferOut | None = None
    upsell_offers: list[UpsellOfferOut] = Field(default_factory=list)
