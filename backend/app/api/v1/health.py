from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.database import SessionLocal

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return {"status": "ok", "brand": "kenidoux", "database": "connected"}
    except Exception:  # noqa: BLE001
        return JSONResponse(
            status_code=503, content={"status": "degraded", "brand": "kenidoux", "database": "unreachable"}
        )
