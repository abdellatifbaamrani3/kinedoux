import uuid
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class PixelEventLog(Base):
    """One row per server-side CAPI delivery attempt (Meta / TikTok / Snapchat)."""

    __tablename__ = "tracking_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    platform: Mapped[str] = mapped_column(String(20), index=True)
    event_name: Mapped[str] = mapped_column(String(50))
    event_id: Mapped[str] = mapped_column(String(100), index=True)
    order_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(20))  # sent | failed
    http_status: Mapped[int | None] = mapped_column(Integer, nullable=True)
    response_excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
