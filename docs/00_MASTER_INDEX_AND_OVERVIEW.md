# 00 — MASTER INDEX & PROJECT OVERVIEW: KINÉDOUX™ (كينيدو)

## 1. Project Mission
Build **KINÉDOUX™ (`kenidoux.com` — كينيدو)**, a premium, clinical-natural Direct-to-Consumer (DTC) Cash-On-Delivery (COD) e-commerce store in **Arabic (Moroccan High-Trust Darija + Modern Standard Arabic)** engineered to sell 3 proprietary-looking ergonomic & physical comfort products at **high prices and high Average Order Value (AOV)**.

The store must look, feel, and convert like an established **French-Moroccan Parapharmacie & Biomechanical Comfort Laboratory** (*Laboratoire de Confort Dorsal & Corporel*)—never like a generic dropshipping store. Every section is designed for **12/10 Conversion Rate Optimization (CRO)**, **maximum AOV** (tiered bundles + in-cart cross-sells + 10–15s post-checkout one-click upsells), **high call-center confirmation rate**, and **high courier delivery rate**.

---

## 2. Infrastructure & Domain Topology

| Parameter | Value / Specification |
|---|---|
| **Brand Name (Arabic)** | **كينيدو** |
| **Brand Name (Latin)** | **kenidoux** / **KINÉDOUX™** |
| **Brand Monogram** | **KD** inside a circular emblem with the primary brand color (`#1E4D3B`) |
| **Frontend Domain** | `https://kenidoux.com` (and `https://www.kenidoux.com`) |
| **Backend API Domain** | `https://api.kenidoux.com.shop` |
| **Hosting Platform** | **EasyPanel** (Docker-based deployment from GitHub repository) |
| **Database Engine** | PostgreSQL (Hosted on EasyPanel internal network) |
| **Database Name / URL** | Logical DB: `kenidoux` \| Internal EasyPanel URL: `postgres://kenidoux:kenidoux@kenidoux_database:5432/namabeauty?sslmode=disable` *(Backend must auto-normalize `postgres://` to `postgresql+asyncpg://` and `postgresql+psycopg2://` so the exact EasyPanel string works out of the box)* |
| **Payment Method** | **100% Cash on Delivery (COD — الدفع عند الاستلام)** |
| **Currency** | Moroccan Dirham (`MAD` / `د.م`) |
| **Direction & Locale** | `dir="rtl"` `lang="ar-MA"` (Right-to-Left Arabic interface throughout) |

---

## 3. The 3 Core Products (Sold Everywhere Across the Store)

| # | Product Slug | Arabic Name | Latin Subtitle | Role in Funnel | Standalone / 1-Unit Price |
|---|---|---|---|---|---|
| **1** | `kenidoux-lumba` | **كينيدو لومبا** | `Kinédoux Lumba™` | Flagship Lower-Back Air Decompression Belt | **499 د.م** |
| **2** | `kenidoux-posta` | **كينيدو بوسطا** | `Kinédoux Posta™` | Smart Posture Sensor + Cervical Neck Stretcher Kit | **379 د.م** |
| **3** | `kenidoux-calma` | **كينيدو كالما** | `Kinédoux Calma™` | Smart Thermal & Red-Light Dynamic Cupping Massager | **349 د.م** *(+199 د.م as Cross-Sell / Upsell)* |

All 3 products must be showcased across the **Home Page**, **Collection Page**, **Header/Footer Menus**, **In-Cart Cross-Sells**, and **Post-Checkout Upsells**, and each has its own dedicated **High-Converting Product Landing Page (`/products/[slug]`)**.

---

## 4. Target Deliverables for the AI Coder

The AI coder must produce the following exact repository structure at the workspace root:

```text
/
├── frontend/                          # Next.js 15 (App Router, TypeScript, Tailwind CSS)
│   ├── public/
│   │   └── images/                    # SVG/WebP high-end clinical sample placeholders (easily replaceable)
│   ├── src/
│   │   ├── app/                       # RTL Pages: /, /collections, /products/[slug], /about, /contact, /thank-you
│   │   ├── components/
│   │   │   ├── layout/                # Header (KD Circle + كينيدو + kenidoux), Footer, AnnouncementBar
│   │   │   ├── home/                  # Hero, TrustBar, ProblemSolution, AlternatingSections, Reviews, FAQ
│   │   │   ├── product/               # ProductCard, ProductGallery, OfferSelector, BiomechanicsSection, IngredientsSection
│   │   │   ├── cart/                  # CartDrawer (with Cross-Sells), CheckoutPopupModal (2 fields), UpsellCountdownModal (10-15s)
│   │   │   └── tracking/              # DeferredPixels (Meta, TikTok, Snapchat web scripts + event dispatcher)
│   │   ├── data/                      # Complete Arabic product catalog, offers, cross-sells, reviews, FAQs
│   │   ├── lib/                       # API client, phone validator, pixel deduplication event_id generator, utils
│   │   └── store/                     # Zustand Cart + Checkout + Upsell Funnel state store
│   ├── Dockerfile                     # Production multi-stage Next.js standalone Dockerfile
│   ├── .dockerignore
│   ├── .env.example                   # Frontend EasyPanel environment variables template
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                           # Python 3.12 + FastAPI + SQLAlchemy 2.0 + Alembic
│   ├── alembic/                       # Database migrations directory
│   │   ├── versions/                  # Initial migration creating products, orders, order_items, tracking_logs, contacts
│   │   └── env.py
│   ├── alembic.ini
│   ├── app/
│   │   ├── main.py                    # FastAPI app + CORS + Lifespan auto-migration + seed runner
│   │   ├── config.py                  # Pydantic Settings (auto-converting postgres:// URL)
│   │   ├── database.py                # Async & Sync SQLAlchemy engine + session makers
│   │   ├── models/                    # SQLAlchemy ORM models (Order, OrderItem, Product, ContactMessage, PixelEventLog)
│   │   ├── schemas/                   # Pydantic v2 request/response validation schemas
│   │   ├── api/
│   │   │   └── v1/                    # /orders, /orders/{id}/upsell, /products, /events/track, /contact, /health
│   │   └── services/
│   │       ├── capi_service.py        # Meta CAPI, TikTok Events API v1.3, Snapchat CAPI v3 (with exact SHA-256 & phone rules)
│   │       ├── sheets_webhook.py      # Google Sheets Apps Script Webhook dispatcher + 15s upsell timeout task
│   │       └── phone_normalizer.py    # Moroccan (+212) & KSA (+966) E.164 & digits-only normalizer
│   ├── entrypoint.sh                  # Runs `alembic upgrade head` then starts `uvicorn`
│   ├── Dockerfile                     # Production Python FastAPI Dockerfile
│   ├── .dockerignore
│   ├── .env.example                   # Backend EasyPanel environment variables template
│   └── requirements.txt
│
├── sheets/                            # Ready-to-deploy Google Sheets integration files
│   ├── google_apps_script_webhook.js  # Complete Google Apps Script code to paste into Extensions > Apps Script
│   └── kenidoux_orders_template.csv   # CSV template with exact columns for importing into Google Sheets
│
└── docs/                              # Complete specification documentation (this folder)
```

---

## 5. Documentation Map (`docs/`)

Read all documents in `docs/` before writing code:

1. **`docs/00_MASTER_INDEX_AND_OVERVIEW.md`** *(This file)* — Project scope, deliverables, and architecture overview.
2. **`docs/01_BRAND_POSITIONING_AND_ICP_PSYCHOLOGY.md`** — Brand authority, visual design system, Moroccan ICP psychology, emotional selling framework, biomechanical science, and "ingredients/materials" engineering proof.
3. **`docs/02_PRODUCTS_OFFERS_AND_MOROCCAN_COPYWRITING.md`** — Full production-ready Arabic/Darija copywriting for `كينيدو لومبا`, `كينيدو بوسطا`, `كينيدو كالما`, bundle tiers, cross-sells, 15s upsells, reviews, FAQs, and all static pages.
4. **`docs/03_CRO_UI_UX_AND_PAGE_WIREFRAMES.md`** — Exact UI/UX specifications: Header (`KD` circle + `كينيدو` + `kenidoux`), RTL alternating desktop sections, Product Cards, Product Landing Pages, Cart Drawer with Cross-Sells, 2-Field Checkout Popup, 10–15s Upsell Modal, and Thank You page.
5. **`docs/04_FRONTEND_ARCHITECTURE_AND_CODING_RULES.md`** — Next.js 15, Tailwind CSS, Zustand state machine, phone validation rules, sample SVG/image placeholders, and performance engineering.
6. **`docs/05_BACKEND_FASTAPI_DATABASE_AND_MIGRATIONS.md`** — FastAPI backend, PostgreSQL schema, automatic startup migrations, order lifecycle (`pending_upsell` -> `confirmed`), and webhook background scheduling.
7. **`docs/06_PIXELS_CAPI_AND_DEDUPLICATION_SPEC.md`** — Deferred Web Pixels + Server-Side CAPI payloads, SHA-256 hashing rules, phone formatting (`+` for TikTok vs. digits-only for Meta/Snap), and `event_id` deduplication.
8. **`docs/07_GOOGLE_SHEETS_WEBHOOK_AND_TEMPLATES.md`** — Google Apps Script `.js` webhook code and `.csv` template specification.
9. **`docs/08_DOCKER_EASYPANEL_DEPLOYMENT_AND_ENVS.md`** — Dockerfiles, `.env.example` files, CORS configuration for `kenidoux.com` & `api.kenidoux.com.shop`, and EasyPanel deployment guide.
