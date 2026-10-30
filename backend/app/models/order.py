import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, JSONType


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    order_number: Mapped[str] = mapped_column(String(32), unique=True, index=True)

    customer_name: Mapped[str] = mapped_column(String(200))
    customer_phone_raw: Mapped[str] = mapped_column(String(50))
    customer_phone_e164: Mapped[str] = mapped_column(String(30))
    customer_country: Mapped[str] = mapped_column(String(10))

    status: Mapped[str] = mapped_column(String(40), default="pending_upsell", index=True)
    subtotal_mad: Mapped[int] = mapped_column(Integer)
    upsell_added: Mapped[bool] = mapped_column(Boolean, default=False)
    upsell_product_slug: Mapped[str | None] = mapped_column(String(100), nullable=True)
    upsell_price_mad: Mapped[int] = mapped_column(Integer, default=0)
    total_mad: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(10), default="MAD")
    items_json: Mapped[list] = mapped_column(JSONType, default=list)

    event_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    client_ip: Mapped[str | None] = mapped_column(String(64), nullable=True)
    client_user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)

    fbp: Mapped[str | None] = mapped_column(String(255), nullable=True)
    fbc: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ttp: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ttclid: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sc_cookie1: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sc_click_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    utm_source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    utm_medium: Mapped[str | None] = mapped_column(String(100), nullable=True)
    utm_campaign: Mapped[str | None] = mapped_column(String(150), nullable=True)
    page_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    sheet_synced: Mapped[bool] = mapped_column(Boolean, default=False)
    sheet_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    capi_purchase_sent: Mapped[bool] = mapped_column(Boolean, default=False)

    finalized_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    order_items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", order_by="OrderItem.id"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    product_slug: Mapped[str] = mapped_column(String(100))
    offer_id: Mapped[str] = mapped_column(String(60))
    title_ar: Mapped[str] = mapped_column(String(300))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    units: Mapped[int] = mapped_column(Integer, default=1)
    price_mad: Mapped[int] = mapped_column(Integer)
    is_cross_sell: Mapped[bool] = mapped_column(Boolean, default=False)
    is_upsell: Mapped[bool] = mapped_column(Boolean, default=False)

    order: Mapped[Order] = relationship(back_populates="order_items")
