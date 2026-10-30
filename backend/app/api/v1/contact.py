from fastapi import APIRouter, HTTPException
from starlette.concurrency import run_in_threadpool

from app.config import settings
from app.database import SessionLocal
from app.models.contact import ContactMessage
from app.schemas.contact import ContactIn
from app.services.phone_normalizer import validate_and_format_phone
from app.services.sheets_webhook import morocco_time, post_to_sheet
from app.services.tasks import spawn

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", status_code=201)
async def submit_contact(payload: ContactIn):
    phone = validate_and_format_phone(payload.phone, settings.PHONE_VALIDATION_MODE)
    if not phone.is_valid:
        raise HTTPException(status_code=422, detail=phone.error_message)

    def _save() -> tuple[str, object]:
        with SessionLocal() as db:
            msg = ContactMessage(
                full_name=payload.full_name,
                phone=phone.local_display,
                subject=payload.subject,
                message=payload.message,
            )
            db.add(msg)
            db.commit()
            db.refresh(msg)
            return str(msg.id), msg.created_at

    msg_id, created_at = await run_in_threadpool(_save)

    if settings.FORWARD_CONTACT_TO_SHEET and settings.sheets_enabled:
        spawn(
            post_to_sheet(
                {
                    "secret": settings.GOOGLE_SHEETS_WEBHOOK_SECRET,
                    "type": "contact",
                    "created_at_morocco": morocco_time(created_at),
                    "full_name": payload.full_name,
                    "phone_local": phone.local_display,
                    "phone_e164": phone.e164_with_plus,
                    "subject": payload.subject,
                    "message": payload.message,
                }
            ),
            name="contact-sheet",
        )
    return {"ok": True, "id": msg_id}
