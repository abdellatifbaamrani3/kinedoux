from fastapi import APIRouter, Request

from app.api.deps import client_ip, user_agent
from app.config import settings
from app.schemas.tracking import TrackEventIn
from app.services import capi_service
from app.services.capi_service import CapiEvent, UserContext
from app.services.phone_normalizer import validate_and_format_phone
from app.services.tasks import spawn

router = APIRouter(prefix="/events", tags=["tracking"])


@router.post("/track", status_code=202)
async def track_event(payload: TrackEventIn, request: Request):
    """Server-side relay for PageView / ViewContent / AddToCart / InitiateCheckout (same event_id as browser)."""
    if not capi_service.capi_enabled():
        return {"ok": True, "relayed": False}

    phone = validate_and_format_phone(payload.user.phone, settings.PHONE_VALIDATION_MODE) if payload.user.phone else None
    user = UserContext(
        phone_digits=phone.digits_no_plus if phone and phone.is_valid else None,
        phone_e164=phone.e164_with_plus if phone and phone.is_valid else None,
        full_name=payload.user.full_name,
        country=phone.country if phone and phone.is_valid else None,
        ip=client_ip(request),
        user_agent=user_agent(request),
        fbp=payload.fbp,
        fbc=payload.fbc,
        ttp=payload.ttp,
        ttclid=payload.ttclid,
        sc_cookie1=payload.sc_cookie1,
        sc_click_id=payload.sc_click_id,
    )
    event = CapiEvent(
        name=payload.event_name,
        event_id=payload.event_id,
        source_url=payload.event_source_url or settings.SITE_URL,
        user=user,
        value=payload.value,
        currency=payload.currency,
        contents=[c.model_dump() for c in payload.contents],
    )
    spawn(capi_service.send_event(event), name=f"capi-{payload.event_name}")
    return {"ok": True, "relayed": True}
