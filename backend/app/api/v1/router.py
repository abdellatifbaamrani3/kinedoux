from fastapi import APIRouter

from app.api.v1 import contact, events, health, orders, products

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(products.router)
api_router.include_router(orders.router)
api_router.include_router(events.router)
api_router.include_router(contact.router)
