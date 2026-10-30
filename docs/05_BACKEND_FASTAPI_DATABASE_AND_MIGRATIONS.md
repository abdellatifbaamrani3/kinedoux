# 05 — BACKEND ARCHITECTURE (PYTHON FASTAPI, POSTGRESQL & AUTO-MIGRATIONS)

## 1. Backend Tech Stack & Responsibilities
- **Framework**: **Python 3.12 + FastAPI** (`fastapi`, `uvicorn[standard]`, `pydantic`, `pydantic-settings`)
- **Database & ORM**: **PostgreSQL** + **SQLAlchemy 2.0** + **Alembic**
- **Async HTTP Client**: **`httpx`** (for non-blocking calls to Meta CAPI, TikTok Events API, Snapchat CAPI, and Google Sheets Webhook)
- **Database Connection String Normalization**:
  - EasyPanel provides PostgreSQL internal URLs in the format:
    `postgres://kenidoux:kenidoux@kenidoux_database:5432/namabeauty?sslmode=disable` (or `/kenidoux?sslmode=disable`)
  - SQLAlchemy 2.0 requires `postgresql+psycopg2://` (or `postgresql+psycopg://` / `postgresql+asyncpg://`) instead of `postgres://`.
  - Therefore, `app/config.py` MUST automatically normalize any `postgres://` prefix and handle `sslmode=disable` cleanly so the user can paste their exact EasyPanel URL without any crash!

---

## 2. Automatic Database Migration on Backend Start
**CRITICAL REQUIREMENT:** When the backend container starts on EasyPanel, it must automatically run database migrations and seed the 3 products (`كينيدو لومبا`, `كينيدو بوسطا`, `كينيدو كالما`) so the user never has to run manual CLI commands.

Implement **both** layers of safety:
1. **`backend/entrypoint.sh`**:
   ```bash
   #!/bin/sh
   set -e
   echo "Running Alembic database migrations..."
   alembic upgrade head
   echo "Starting Kinédoux FastAPI Server..."
   exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips="*"
   ```
2. **FastAPI `lifespan` Hook in `app/main.py`**:
   - On startup, runs `Base.metadata.create_all(bind=engine)` (as a fallback if Alembic wasn't invoked) and executes `seed_initial_products(db)` to ensure the 3 core products exist in PostgreSQL.

---

## 3. PostgreSQL Database Schema (`app/models/`)

### 3.1 `products` Table
| Column | Type | Description |
|---|---|---|
| `id` | `UUID` / `Integer` PK | Primary key |
| `slug` | `String(100)` Unique | `kenidoux-lumba`, `kenidoux-posta`, `kenidoux-calma` |
| `name_ar` | `String(200)` | `كينيدو لومبا`, `كينيدو بوسطا`, `كينيدو كالما` |
| `name_en` | `String(200)` | `Kinédoux Lumba™`, `Kinédoux Posta™`, `Kinédoux Calma™` |
| `base_price_mad` | `Integer` | `499`, `379`, `349` |
| `compare_price_mad` | `Integer` | `699`, `549`, `499` |
| `cross_sell_price_mad` | `Integer` | `379`, `249`, `199` |
| `stock_count` | `Integer` | Default `7`, `9`, `6` (for scarcity display) |
| `offers_json` | `JSONB` | Array of the 3 tiered offers per product |
| `is_active` | `Boolean` | Default `True` |
| `created_at` | `DateTime(timezone=True)` | Timestamp |

### 3.2 `orders` Table
| Column | Type | Description |
|---|---|---|
| `id` | `UUID` PK | Unique order UUID |
| `order_number` | `String(32)` Unique | Human-friendly COD reference, e.g., `KD-2026-1042` |
| `customer_name` | `String(200)` | Customer's full name from field 1 |
| `customer_phone_raw` | `String(50)` | Raw phone entered in field 2 |
| `customer_phone_e164` | `String(30)` | E.164 format with `+` (e.g., `+212612345678` or `+966512345678`) |
| `customer_country` | `String(10)` | Detected country code (`MA` or `SA`) |
| `status` | `String(40)` | `pending_upsell` -> `confirmed` |
| `subtotal_mad` | `Integer` | Subtotal before upsell |
| `upsell_added` | `Boolean` | `True` if customer accepted the 10–15s one-click upsell |
| `upsell_product_slug` | `String(100)` Nullable | Slug of added upsell product (e.g. `kenidoux-calma`) |
| `upsell_price_mad` | `Integer` | Default `0` (or `199` / `229` when accepted) |
| `total_mad` | `Integer` | Final COD amount to collect on delivery |
| `currency` | `String(10)` | Default `MAD` |
| `items_json` | `JSONB` | Full array of ordered items, offer tiers, quantities, and prices |
| `event_id` | `String(100)` | Shared browser/server deduplication `event_id` for Purchase |
| `client_ip` | `String(64)` | Extracted client IP from `X-Forwarded-For` / request |
| `client_user_agent` | `Text` | Browser User-Agent string |
| `fbp` | `String(255)` Nullable | Meta `_fbp` cookie |
| `fbc` | `String(255)` Nullable | Meta `_fbc` cookie or constructed from `fbclid` |
| `ttp` | `String(255)` Nullable | TikTok `_ttp` cookie |
| `ttclid` | `String(255)` Nullable | TikTok `ttclid` click ID |
| `sc_cookie1` | `String(255)` Nullable | Snapchat `_scid` cookie |
| `sc_click_id` | `String(255)` Nullable | Snapchat `ScCid` click ID |
| `utm_source` | `String(100)` Nullable | Ad attribution source |
| `utm_medium` | `String(100)` Nullable | Ad attribution medium |
| `utm_campaign` | `String(150)` Nullable | Ad attribution campaign |
| `page_url` | `Text` Nullable | Checkout source URL |
| `sheet_synced` | `Boolean` | Whether order has been sent to Google Sheets webhook |
| `sheet_synced_at` | `DateTime(timezone=True)` Nullable | Timestamp of Google Sheets webhook delivery |
| `capi_Purchase_sent` | `Boolean` | Prevents duplicate server-side `Purchase` CAPI firing |
| `created_at` | `DateTime(timezone=True)` | Creation timestamp |
| `updated_at` | `DateTime(timezone=True)` | Last update timestamp |

### 3.3 `contact_messages` Table
Stores inquiries submitted on `/contact` (`id`, `full_name`, `phone`, `subject`, `message`, `created_at`).

---

## 4. REST API Endpoints & The 15-Second Upsell Lifecycle

All endpoints are prefixed with `/api/v1`:

### 4.1 `GET /api/v1/health`
Returns `{ "status": "ok", "brand": "kenidoux", "database": "connected" }`. Used by EasyPanel healthchecks.

### 4.2 `GET /api/v1/products` & `GET /api/v1/products/{slug}`
Returns the 3 products (`كينيدو لومبا`, `كينيدو بوسطا`, `كينيدو كالما`) with their offers, cross-sell prices, and metadata.

### 4.3 `POST /api/v1/orders` (Triggered when user clicks CTA on the 2-Field Checkout Popup)
1. Validates `customer_name` and `customer_phone` (using the backend `phone_normalizer.py`).
2. Generates a unique `order_number` (e.g., `KD-10428`) and persists the order in PostgreSQL with `status = "pending_upsell"`.
3. Schedules an **async safety-net background timer (`20 seconds`)**:
   - Why? Because the frontend will now show the **10 to 15-second Post-Checkout Upsell Modal**.
   - If the customer clicks **"Yes, Add Upsell"** or **"No Thanks"** (or the 15s frontend timer finishes), the frontend calls `POST /api/v1/orders/{order_id}/upsell` which immediately finalizes the order, fires the Google Sheets webhook, and fires the server-side `Purchase` CAPI.
   - **What if the customer closes their phone browser during the 15-second upsell countdown?** After 20 seconds, the backend safety-net task checks `if not order.sheet_synced:` and automatically finalizes the order, sends it to the Google Sheets webhook, and fires the `Purchase` CAPI so **zero orders are ever lost!**
4. Returns the created order object + recommended `upsell_offer` to the frontend so the 15-second modal displays immediately.

### 4.4 `POST /api/v1/orders/{order_id}/upsell` (Triggered on Upsell Accept, Decline, or 15s Timeout)
Request body:
```json
{
  "accepted": true,
  "upsell_product_slug": "kenidoux-calma",
  "upsell_title_ar": "كينيدو كالما — جهاز الكاسات الحرارية الذكية (عرض VIP)",
  "upsell_price_mad": 199,
  "purchase_event_id": "evt_purchase_..."
}
```
1. Locks the order row in PostgreSQL.
2. If `accepted == true`:
   - Appends the upsell product to `items_json`.
   - Sets `upsell_added = True`, `upsell_product_slug`, `upsell_price_mad = 199`, and adds `199` to `total_mad`.
3. Sets `status = "confirmed"`.
4. If `not order.sheet_synced`:
   - Marks `sheet_synced = True` and dispatches the complete order payload to the **Google Sheets Webhook URL** (`GOOGLE_SHEETS_WEBHOOK_URL`) in the background.
5. If `not order.capi_purchase_sent`:
   - Marks `capi_purchase_sent = True` and dispatches the deduplicated **`Purchase`** event to **Meta CAPI**, **TikTok Events API v1.3**, and **Snapchat CAPI v3** using the shared `purchase_event_id`.
6. Returns the finalized order for the `/thank-you` page.

### 4.5 `POST /api/v1/events/track` (Server-Side CAPI Relay for Non-Purchase Funnel Events)
Relays `PageView`, `ViewContent`, `AddToCart`, and `InitiateCheckout` from the frontend to Meta, TikTok, and Snapchat CAPI with the exact same `event_id` fired by the browser web pixels.

### 4.6 `POST /api/v1/contact`
Saves customer support / exchange requests to PostgreSQL and optionally forwards them to the Google Sheet webhook.

---

## 5. CORS Configuration (`app/main.py`)
Must explicitly allow requests from:
- `https://kenidoux.com`
- `https://www.kenidoux.com`
- `https://api.kenidoux.com.shop`
- `http://localhost:3000`
Plus any additional origins configured in `CORS_ORIGINS` env variable.
