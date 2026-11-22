# Kinédoux order desk

Private page: `https://kinedoux.com/admin`

Phase 1 is login and the cash-on-delivery desk. Phase 2 is the shop's own visit log and the funnel. Profit, ad spend, charts, and alerts are later. The desk does not invent numbers.

## Password

Set these on the **API** service only (EasyPanel backend, repo `kinedoux-backend`). Do not put them in the website build.

```
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=a-long-password
```

The API hashes the password with PBKDF2 when it boots and stores the hash in `admin_users`. The site never receives the password or the hash. Session cookie name: `kd_admin` (httpOnly, 14 days). Login allows 8 tries per IP per 15 minutes.

Dates on the desk use Africa/Casablanca. Money is MAD.

## What a status means

The shop status `pending_upsell` / `confirmed` only means the order form was saved and the Google Sheet path ran. It does not mean anyone answered the phone.

The desk status starts at **New** for every order, including orders already in the database. You move it by hand:

New → No answer 1 → No answer 2 → No answer 3, and from any of those to Confirmed, Cancelled, Fake, or Duplicate.

Confirmed → Shipped or Cancelled. Shipped → Delivered or Returned. Delivered → Returned.

A repeated phone within 7 days shows a duplicate badge. It does not change the status. A blocked phone shows a badge and stays in the list.

Call opens the phone dialer. WhatsApp opens a chat with the customer, not the store number.

Shipping is a manual status. The adapter in `backend/app/services/shipping.py` returns no tracking number until a carrier is connected.

## Visits and the funnel

The shop sends `page_view`, `product_view`, `add_to_cart`, and `checkout_form_start` to `/api/track`. An order submission is counted on the API when the order is saved. The Meta pixel is unchanged.

A visitor cookie `kd_vid` lasts a year. A session cookie `kd_sid` lasts 30 minutes. The order stores that session, so the campaign on the visit is copied onto the order when the form itself has none.

Your admin cookie is not counted. Browsers that identify as bots are not counted. Country is stored only when the host sends it (Cloudflare or Vercel). City on the funnel's city list is the city the customer typed, not a guess from the IP.

Open `/admin` for the funnel and `/admin/analytics` for source, campaign, ad, device, and city. Dates use Africa/Casablanca. The percent next to a number is the change versus the previous period of the same length.

To preview the funnel before real traffic:

```
python -m app.scripts.seed_admin_demo
python -m app.scripts.seed_admin_demo --wipe
```

Demo rows are named DEMO and are not sent to the Google Sheet. The command refuses to run when `APP_ENV` is production unless you pass `--force`.

## Run it locally

1. In `backend/.env`, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (10 characters or more).
2. Start the API: `alembic upgrade head`, then uvicorn. The entrypoint already migrates.
3. Point the site at that API with `API_PROXY_TARGET=http://127.0.0.1:8000` (or `NEXT_PUBLIC_API_URL`).
4. Open `http://localhost:3000/admin`.

## Deploy

Frontend: push the monorepo `kinedoux`. EasyPanel builds `/frontend`.

API: copy the backend changes into `kinedoux-backend` and push that repo. EasyPanel runs `alembic upgrade head` before the API starts. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` there before the first login. This is not a Hostinger static upload.
