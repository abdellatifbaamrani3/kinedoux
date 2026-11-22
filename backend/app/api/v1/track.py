"""Public visit log. Admin cookies and bots are dropped. This does not call Meta."""

from urllib.parse import unquote

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.api.deps import client_ip, user_agent
from app.database import get_db
from app.services import store_track

router = APIRouter(prefix="/track", tags=["track"])


class VisitIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    visitor_id: str = Field(max_length=64)
    session_id: str = Field(max_length=64)
    event: str = Field(max_length=40)
    path: str | None = Field(default=None, max_length=500)
    product_slug: str | None = Field(default=None, max_length=100)
    landing_page: str | None = Field(default=None, max_length=1000)
    referrer: str | None = Field(default=None, max_length=1000)
    utm_source: str | None = Field(default=None, max_length=100)
    utm_medium: str | None = Field(default=None, max_length=100)
    utm_campaign: str | None = Field(default=None, max_length=150)
    utm_content: str | None = Field(default=None, max_length=150)
    fbclid: str | None = Field(default=None, max_length=2048)


@router.post("", status_code=202)
def track_visit(body: VisitIn, request: Request, db: Session = Depends(get_db)):
    if request.cookies.get("kd_admin") or request.headers.get("x-kd-admin") == "1":
        return {"ok": True, "ignored": True}
    ip = client_ip(request) or "unknown"
    if store_track.too_many(ip):
        return {"ok": True, "ignored": True}
    country = request.headers.get("cf-ipcountry") or request.headers.get("x-vercel-ip-country")
    raw_city = request.headers.get("x-vercel-ip-city") or ""
    city = unquote(raw_city) or None
    stored = store_track.record_visit(db, body.model_dump(), user_agent(request), country, city)
    return {"ok": True, "stored": stored == "stored"}
