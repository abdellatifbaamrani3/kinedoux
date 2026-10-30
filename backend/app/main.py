import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from app.api.v1.router import api_router
from app.config import settings
from app.database import SessionLocal, engine
from app.models import Base
from app.seed import seed_initial_products
from app.services import capi_service, order_service
from app.services.tasks import spawn

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("kenidoux")


def init_db() -> None:
    """Fallback for runs without entrypoint.sh: create missing tables, then seed the 3 products."""
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_initial_products(db)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await run_in_threadpool(init_db)
    log.info("KINÉDOUX API ready — products seeded, CORS: %s", ", ".join(settings.cors_origin_list))
    sweeper = spawn(order_service.sweeper_loop(), name="order-sweeper")
    try:
        yield
    finally:
        sweeper.cancel()
        await capi_service.close_client()


app = FastAPI(
    title="KINÉDOUX™ API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/api/docs",
    redoc_url=None,
    openapi_url=None if settings.is_production else "/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,
)

app.include_router(api_router)


@app.get("/", include_in_schema=False)
def root():
    return {"service": "kenidoux-api", "status": "ok"}
