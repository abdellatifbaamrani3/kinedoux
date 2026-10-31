# 08 — DOCKER, EASYPANEL DEPLOYMENT & ENVIRONMENT VARIABLES GUIDE

## 1. Domain & EasyPanel Architecture Overview

| Service | Domain | Internal EasyPanel Port | Dockerfile Path |
|---|---|---|---|
| **Frontend (Next.js 15)** | `https://kinedoux.com` (`www.kinedoux.com`) | `3000` | `frontend/Dockerfile` |
| **Backend (Python FastAPI)** | `https://api.kinedoux.com` | `8000` | `backend/Dockerfile` |
| **Database (PostgreSQL)** | Internal: `kinedoux_database:5432` | `5432` | Created in EasyPanel, not public |

---

## 2. Database Connection String Handling (`kenidoux` / `namabeauty`)

The user provided their exact EasyPanel internal database connection link:
```text
postgres://kinedoux:kinedoux@kinedoux_database:5432/kinedoux?sslmode=disable
```
*(Or if using database name `kenidoux`: `postgres://kenidoux:kenidoux@kenidoux_database:5432/kenidoux?sslmode=disable`)*

### Mandatory URL Normalization in `backend/app/config.py`:
In Python `SQLAlchemy 2.0`, passing a raw `postgres://` URI raises `NoSuchModuleError: Can't load plugin: sqlalchemy.dialects:postgres`.
Therefore, `backend/app/config.py` MUST include a property `sqlalchemy_database_url` that automatically transforms `postgres://` into `postgresql+psycopg2://`:

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgres://kinedoux:kinedoux@kinedoux_database:5432/kinedoux?sslmode=disable"
    
    @property
    def sqlalchemy_database_url(self) -> str:
        url = self.DATABASE_URL.strip()
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url
```
This guarantees that pasting `postgres://kinedoux:kinedoux@kinedoux_database:5432/kinedoux?sslmode=disable` or `postgres://kenidoux:kenidoux@kenidoux_database:5432/kenidoux?sslmode=disable` in EasyPanel works on the very first boot with zero errors!

---

## 3. Environment Variable Templates (`.env.example`)

### 3.1 `frontend/.env.example` (Variables to add in EasyPanel Frontend Service)
```env
# ============================================================================
# KINÉDOUX™ (kinedoux.com) — FRONTEND ENVIRONMENT VARIABLES (EASYPANEL)
# ============================================================================

# 1. Public URLs
NEXT_PUBLIC_SITE_URL=https://kinedoux.com
NEXT_PUBLIC_API_URL=https://api.kinedoux.com

# 2. Phone Validation Mode
# Options: "KSA" (only valid 05/+966 numbers), "MA" (only valid 06/07/+212 numbers), or "BOTH" (accepts valid KSA & Moroccan numbers)
NEXT_PUBLIC_PHONE_VALIDATION_MODE=MA

# 3. WhatsApp Customer Support Number (International format without '+')
NEXT_PUBLIC_WHATSAPP_NUMBER=212600000000

# 4. Web Pixels (Deferred Loading in Browser — Leave empty if not active yet)
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
NEXT_PUBLIC_SNAP_PIXEL_ID=

# 5. Store Currency & Upsell Timer
NEXT_PUBLIC_CURRENCY=MAD
NEXT_PUBLIC_UPSELL_TIMER_SECONDS=15
```

### 3.2 `backend/.env.example` (Variables to add in EasyPanel Backend Service)
```env
# ============================================================================
# KINÉDOUX™ (api.kinedoux.com) — BACKEND ENVIRONMENT VARIABLES (EASYPANEL)
# ============================================================================

# 1. Server & Environment
APP_ENV=production
PORT=8000
FRONTEND_URL=https://kinedoux.com
CORS_ORIGINS=https://kinedoux.com,https://www.kinedoux.com,https://api.kinedoux.com,http://localhost:3000

# 2. PostgreSQL Database Connection (EasyPanel Internal URL)
# Paste the EasyPanel internal URL. postgres:// is converted automatically.
DATABASE_URL=postgres://kinedoux:kinedoux@kinedoux_database:5432/kinedoux?sslmode=disable

# 3. Google Sheets Apps Script Webhook URL (Deploy google_apps_script_webhook.js and paste Web App URL here)
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
GOOGLE_SHEETS_WEBHOOK_SECRET=
# Fallback seconds before auto-sending order to Sheet if customer closes browser tab during the 15s upsell
UPSELL_AUTO_FINALIZE_SECONDS=20

# 4. Meta (Facebook/Instagram) Conversions API (CAPI)
META_PIXEL_ID=
META_CAPI_ACCESS_TOKEN=
META_TEST_EVENT_CODE=

# 5. TikTok Events API v1.3 (CAPI)
TIKTOK_PIXEL_ID=
TIKTOK_ACCESS_TOKEN=
TIKTOK_TEST_EVENT_CODE=

# 6. Snapchat Conversions API v3 (CAPI)
SNAP_PIXEL_ID=
SNAP_CAPI_ACCESS_TOKEN=
```

---

## 4. Production Dockerfiles Specification

### 4.1 `frontend/Dockerfile` (Multi-Stage Next.js 15 Standalone)
```dockerfile
FROM node:20-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# Stage 2: Build Next.js application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time NEXT_PUBLIC_ variables (can be passed as build args in EasyPanel or runtime config)
ARG NEXT_PUBLIC_SITE_URL=https://kinedoux.com
ARG NEXT_PUBLIC_API_URL=https://api.kinedoux.com
ARG NEXT_PUBLIC_PHONE_VALIDATION_MODE=MA
ARG NEXT_PUBLIC_WHATSAPP_NUMBER=212600000000
ARG NEXT_PUBLIC_META_PIXEL_ID=""
ARG NEXT_PUBLIC_TIKTOK_PIXEL_ID=""
ARG NEXT_PUBLIC_SNAP_PIXEL_ID=""
ARG NEXT_PUBLIC_CURRENCY=MAD
ARG NEXT_PUBLIC_UPSELL_TIMER_SECONDS=15

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PHONE_VALIDATION_MODE=$NEXT_PUBLIC_PHONE_VALIDATION_MODE
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER
ENV NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID
ENV NEXT_PUBLIC_TIKTOK_PIXEL_ID=$NEXT_PUBLIC_TIKTOK_PIXEL_ID
ENV NEXT_PUBLIC_SNAP_PIXEL_ID=$NEXT_PUBLIC_SNAP_PIXEL_ID
ENV NEXT_PUBLIC_CURRENCY=$NEXT_PUBLIC_CURRENCY
ENV NEXT_PUBLIC_UPSELL_TIMER_SECONDS=$NEXT_PUBLIC_UPSELL_TIMER_SECONDS
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### 4.2 `backend/Dockerfile` (Python 3.12 FastAPI + Auto-Migration on Start)
```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies for psycopg2 / PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

# Fix Windows CRLF line endings if built from Windows git repo and make entrypoint executable
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
```

---

## 5. Step-by-Step EasyPanel Deployment Checklist

1. **Push Repository to GitHub**: Push the root repository containing `frontend/`, `backend/`, `sheets/`, and `docs/`.
2. **Backend Service on EasyPanel (`api.kinedoux.com`)**:
   - Create an **App** service -> Connect GitHub Repo -> Set Build Path to `/backend` and Dockerfile to `Dockerfile`.
   - Under **Environment**, paste the contents of `backend/.env.example` and set `DATABASE_URL=postgres://kinedoux:kinedoux@kinedoux_database:5432/kinedoux?sslmode=disable` (or `/kenidoux?sslmode=disable`).
   - Under **Domains**, add `api.kinedoux.com` pointing to container port `8000` with HTTPS enabled.
   - Click **Deploy** — the container will automatically run `alembic upgrade head`, create all tables, and seed the 3 Kinédoux products!
3. **Frontend Service on EasyPanel (`kinedoux.com`)**:
   - Create an **App** service -> Connect GitHub Repo -> Set Build Path to `/frontend` and Dockerfile to `Dockerfile`.
   - Under **Environment**, paste the contents of `frontend/.env.example` (enable "Pass as Build Arguments" in EasyPanel so `NEXT_PUBLIC_*` variables are baked into the client bundle).
   - Under **Domains**, add `kinedoux.com` and `www.kinedoux.com` pointing to container port `3000` with HTTPS enabled.
   - Click **Deploy**.
