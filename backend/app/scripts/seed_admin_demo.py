"""Demo visits and orders so the funnel can be opened before real ads arrive.

The rows are marked demo. They are not sent to the Google Sheet.
Wipe them with: python -m app.scripts.seed_admin_demo --wipe
"""

import uuid
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from app.config import settings
from app.database import SessionLocal
from app.models.analytics import StoreEvent, StoreSession, Visitor
from app.models.order import Order

CASABLANCA = ZoneInfo("Africa/Casablanca")
CITIES = ["الدار البيضاء", "طنجة", "فاس", "مراكش", "الرباط"]
STATUSES = ["new", "no_answer_1", "confirmed", "confirmed", "shipped", "delivered", "delivered", "returned", "fake"]


def wipe(db) -> None:
    from sqlalchemy import delete, select

    demo_orders = list(db.scalars(select(Order.id).where(Order.event_id.like("evt_demo_%"))))
    if demo_orders:
        db.execute(delete(StoreEvent).where(StoreEvent.order_id.in_(demo_orders)))
    db.execute(delete(StoreEvent).where(StoreEvent.visitor_id.like("demo%")))
    db.execute(delete(StoreSession).where(StoreSession.visitor_id.like("demo%")))
    db.execute(delete(Visitor).where(Visitor.id.like("demo%")))
    db.execute(delete(Order).where(Order.event_id.like("evt_demo_%")))
    db.commit()


def seed(db) -> None:
    now = datetime.now(CASABLANCA)
    for index in range(24):
        visitor_id = f"demovisitor{index:04d}"
        session_id = f"demosession{index:04d}"
        seen = now - timedelta(days=index % 10, hours=index)
        city = CITIES[index % len(CITIES)]
        source = "facebook" if index % 3 else "direct"
        campaign = "lumba_broad_ma" if source == "facebook" else None
        db.add(
            Visitor(
                id=visitor_id,
                device="mobile" if index % 2 == 0 else "desktop",
                browser="Chrome",
                country="MA",
                city=city,
                first_seen_at=seen,
                last_seen_at=seen,
            )
        )
        db.add(
            StoreSession(
                id=session_id,
                visitor_id=visitor_id,
                landing_page="/products/kenidoux-lumba",
                referrer="https://facebook.com" if source == "facebook" else None,
                utm_source=source if source != "direct" else None,
                utm_medium="paid" if source == "facebook" else None,
                utm_campaign=campaign,
                utm_content="v1" if campaign else None,
                started_at=seen,
                last_seen_at=seen,
            )
        )
        db.flush()
        db.add(StoreEvent(visitor_id=visitor_id, session_id=session_id, name="page_view", path="/products/kenidoux-lumba", created_at=seen))
        if index % 2 == 0:
            db.add(StoreEvent(visitor_id=visitor_id, session_id=session_id, name="product_view", path="/products/kenidoux-lumba", product_slug="kenidoux-lumba", created_at=seen))
        if index % 4 == 0:
            db.add(StoreEvent(visitor_id=visitor_id, session_id=session_id, name="checkout_form_start", path="/products/kenidoux-lumba", created_at=seen))
        if index < len(STATUSES):
            status = STATUSES[index]
            order = Order(
                id=uuid.uuid4(),
                order_number=f"KD-DEMO-{1000 + index}",
                customer_name=f"DEMO {index} — {city}",
                customer_phone_raw=f"06990000{index:02d}",
                customer_phone_e164=f"+2126990000{index:02d}",
                customer_country="MA",
                status="confirmed",
                subtotal_mad=499,
                upsell_added=False,
                upsell_price_mad=0,
                total_mad=499,
                currency="MAD",
                items_json=[{"product_slug": "kenidoux-lumba", "title_ar": "كينيدو لومبا", "quantity": 1, "units": 1}],
                event_id=f"evt_demo_{index:04d}",
                utm_source=source if source != "direct" else None,
                utm_medium="paid" if source == "facebook" else None,
                utm_campaign=campaign,
                utm_content="v1" if campaign else None,
                city=city,
                fulfillment_status=status,
                analytics_session_id=session_id,
                sheet_synced=True,
                capi_purchase_sent=True,
                notes="demo-seed",
                is_test=True,
                created_at=seen,
            )
            db.add(order)
            db.flush()
            db.add(StoreEvent(visitor_id=visitor_id, session_id=session_id, order_id=order.id, name="order_submitted", path="/products/kenidoux-lumba", created_at=seen))
    db.commit()


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--wipe", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    if settings.is_production and not args.force:
        raise SystemExit("Refusing to change production data. Pass --force if you mean it.")
    with SessionLocal() as db:
        wipe(db)
        if not args.wipe:
            seed(db)
    print("wiped demo data" if args.wipe else "seeded demo visits and orders")


if __name__ == "__main__":
    main()
