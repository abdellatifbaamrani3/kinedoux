from datetime import datetime

import uuid

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, JSONType


class Visitor(Base):
    __tablename__ = "visitors"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    device: Mapped[str | None] = mapped_column(String(16), nullable=True)
    browser: Mapped[str | None] = mapped_column(String(40), nullable=True)
    country: Mapped[str | None] = mapped_column(String(8), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    first_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class StoreSession(Base):
    __tablename__ = "sessions"
    __table_args__ = (Index("ix_sessions_campaign_started", "utm_campaign", "started_at"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    visitor_id: Mapped[str] = mapped_column(String(64), ForeignKey("visitors.id", ondelete="CASCADE"), index=True)
    landing_page: Mapped[str | None] = mapped_column(Text, nullable=True)
    referrer: Mapped[str | None] = mapped_column(Text, nullable=True)
    utm_source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    utm_medium: Mapped[str | None] = mapped_column(String(100), nullable=True)
    utm_campaign: Mapped[str | None] = mapped_column(String(150), nullable=True)
    utm_content: Mapped[str | None] = mapped_column(String(150), nullable=True)
    utm_term: Mapped[str | None] = mapped_column(String(150), nullable=True)
    fbclid: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    ttclid: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_utm_source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_utm_medium: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_utm_campaign: Mapped[str | None] = mapped_column(String(150), nullable=True)
    last_utm_content: Mapped[str | None] = mapped_column(String(150), nullable=True)
    last_utm_term: Mapped[str | None] = mapped_column(String(150), nullable=True)
    last_fbclid: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    last_ttclid: Mapped[str | None] = mapped_column(String(255), nullable=True)
    client_ip: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class StoreEvent(Base):
    __tablename__ = "store_events"
    __table_args__ = (
        Index("ix_store_events_name_created", "name", "created_at"),
        Index("ix_store_events_event_key", "event_key", unique=True),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_key: Mapped[str | None] = mapped_column(String(64), nullable=True)
    visitor_id: Mapped[str] = mapped_column(String(64), ForeignKey("visitors.id", ondelete="CASCADE"), index=True)
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    order_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(40))
    path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    page_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    referrer: Mapped[str | None] = mapped_column(Text, nullable=True)
    product_slug: Mapped[str | None] = mapped_column(String(100), nullable=True)
    utm_source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    utm_medium: Mapped[str | None] = mapped_column(String(100), nullable=True)
    utm_campaign: Mapped[str | None] = mapped_column(String(150), nullable=True)
    utm_content: Mapped[str | None] = mapped_column(String(150), nullable=True)
    utm_term: Mapped[str | None] = mapped_column(String(150), nullable=True)
    fbclid: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    ttclid: Mapped[str | None] = mapped_column(String(255), nullable=True)
    device: Mapped[str | None] = mapped_column(String(16), nullable=True)
    browser: Mapped[str | None] = mapped_column(String(40), nullable=True)
    country: Mapped[str | None] = mapped_column(String(8), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    value_mad: Mapped[int | None] = mapped_column(Integer, nullable=True)
    details: Mapped[dict | None] = mapped_column("metadata", JSONType, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
