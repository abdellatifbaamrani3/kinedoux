import re
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

from app.schemas.order import EVENT_ID_RE

TrackableEvent = Literal["PageView", "ViewContent", "AddToCart", "InitiateCheckout"]
_Short = Annotated[str, StringConstraints(strip_whitespace=True, max_length=255)]


class TrackContent(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(max_length=100)
    quantity: int = Field(default=1, ge=1, le=100)
    item_price: float = Field(default=0, ge=0)
    name: str | None = Field(default=None, max_length=200)


class TrackUser(BaseModel):
    model_config = ConfigDict(extra="ignore")

    phone: str | None = Field(default=None, max_length=50)
    full_name: str | None = Field(default=None, max_length=200)


class TrackEventIn(BaseModel):
    """Browser -> server relay for non-Purchase events. `event_id` is the SAME id the web pixels used."""

    model_config = ConfigDict(extra="ignore")

    event_name: TrackableEvent
    event_id: str
    event_source_url: str | None = Field(default=None, max_length=1000)
    value: float | None = Field(default=None, ge=0)
    currency: str = Field(default="MAD", max_length=10)
    contents: list[TrackContent] = Field(default_factory=list, max_length=12)
    user: TrackUser = Field(default_factory=TrackUser)
    fbp: _Short | None = None
    fbc: _Short | None = None
    ttp: _Short | None = None
    ttclid: _Short | None = None
    sc_cookie1: _Short | None = None
    sc_click_id: _Short | None = None

    @field_validator("event_id")
    @classmethod
    def _valid_event_id(cls, v: str) -> str:
        if not EVENT_ID_RE.match(v):
            raise ValueError("invalid event_id")
        return v

    @field_validator("currency")
    @classmethod
    def _currency(cls, v: str) -> str:
        v = v.upper()
        if not re.fullmatch(r"[A-Z]{3}", v):
            raise ValueError("invalid currency")
        return v
