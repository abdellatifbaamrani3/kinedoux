# 06 — WEB PIXELS, SERVER-SIDE CAPI & DEDUPLICATION SPECIFICATION (META, TIKTOK, SNAPCHAT)

## 1. Golden Rules Verified Against Official Platform Docs (2026)

This table summarizes the exact normalization, `+` prefix, and SHA-256 hashing requirements across **Web Pixels (Browser)** and **Conversions API (Server-Side CAPI)**:

| Platform | Web Pixel (Browser) Phone Rule | Server CAPI Phone Rule (Before SHA-256) | Event ID Deduplication Key |
|---|---|---|---|
| **Meta (Facebook/IG)** | Unhashed or Advanced Matching via `fbq('init', PIXEL_ID, { ph: '212612345678' })` | **NO `+` sign**, digits only with country code (`212612345678` or `966512345678`), then lowercase **SHA-256** inside `user_data.ph: ["<sha256>"]` | Browser: `{ eventID: id }` <br> Server: `"event_id": id` |
| **TikTok** | **MUST include `+` sign** in E.164 format inside `ttq.identify({ phone_number: '+212612345678' })` (TikTok SDK hashes it client-side) | **MUST include `+` sign** in E.164 format (`+212612345678` or `+966512345678`), then lowercase **SHA-256** inside `user.phone: "<sha256>"` | Browser: `{ event_id: id }` <br> Server: `"event_id": id` |
| **Snapchat** | Unhashed inside `snaptr('init', PIXEL_ID, { user_phone_number: '212612345678' })` | **NO `+` sign**, digits only with country code (`212612345678` or `966512345678`), then lowercase **SHA-256** inside `user_data.ph: ["<sha256>"]` (CAPI v3) | Browser: `client_dedup_id: id` <br> Server: `"event_id": id` |

> **Why this matters:**
> - If you include `+` before hashing for **Meta** or **Snapchat**, your hash will NOT match their user graph.
> - If you omit `+` before hashing for **TikTok**, your hash will NOT match TikTok's user graph!
> - Always normalize once into two formats:
>   1. `phone_e164_with_plus` = `"+212612345678"` (or `"+966512345678"`) -> **For TikTok Web & TikTok CAPI**
>   2. `phone_digits_no_plus` = `"212612345678"` (or `"966512345678"`) -> **For Meta CAPI & Snapchat CAPI**

---

## 2. Deferred Web Pixel Loading for 95+ Mobile PageSpeed

Never block initial rendering with third-party pixel scripts. Implement `<PixelManager />` in `frontend/src/components/tracking/PixelManager.tsx` using a **Deferred Loader**:

1. Create an in-memory `window.__kdEventQueue = []` immediately so any event triggered in the first 2 seconds is queued with its generated `event_id`.
2. Inject the actual external scripts (`connect.facebook.net/en_US/fbevents.js`, `analytics.tiktok.com/i18n/pixel/events.js`, `sc-static.net/scevent.min.js`) **only when**:
   - `window.requestIdleCallback` fires (with a `2500ms` delay), **OR**
   - The user scrolls, touches, moves the mouse, or clicks anywhere on the page (`{ once: true, passive: true }`).
3. Also capture URL click IDs on initial landing and store them in `localStorage` / cookies so they are never lost during internal navigation:
   - `fbclid` -> Construct `_fbc` in format `fb.1.{timestamp_ms}.{fbclid}` if `_fbc` cookie is missing.
   - `ttclid` -> Save in `kd_ttclid` cookie/storage.
   - `ScCid` -> Save in `kd_sccid` cookie/storage.

---

## 3. Unified Browser + Server Deduplication Flow

Every tracked event generates **one UUIDv4 `event_id`** in the browser at the moment of the action (e.g. `evt_atc_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`) and sends that exact `event_id` to:
1. **Meta Web Pixel** (`fbq('track', EventName, params, { eventID: eventId })`)
2. **TikTok Web Pixel** (`ttq.track(EventName, params, { event_id: eventId })`)
3. **Snapchat Web Pixel** (`snaptr('track', SnapEventName, { ...params, client_dedup_id: eventId })`)
4. **FastAPI Server CAPI** (`POST /api/v1/events/track` or `POST /api/v1/orders/{id}/upsell`)

### Event Mapping Table Across the 3 Platforms:
| Store Funnel Moment | Meta Event Name | TikTok Event Name | Snapchat Event Name |
|---|---|---|---|
| Any page load | `PageView` | `PageView` | `PAGE_VIEW` |
| Viewing a Product Page (`/products/[slug]`) | `ViewContent` | `ViewContent` | `VIEW_CONTENT` |
| Clicking Product CTA (Adds offer & opens Cart Drawer) | `AddToCart` | `AddToCart` | `ADD_CART` |
| Clicking Cart Drawer CTA (Opens 2-Field Checkout Popup) | `InitiateCheckout` | `InitiateCheckout` | `START_CHECKOUT` |
| Finalizing COD Order (After 15s Upsell or on Thank You) | `Purchase` | `CompletePayment` *(or `PlaceAnOrder` + `CompletePayment`)* | `PURCHASE` |

---

## 4. Exact Browser Web Pixel Calls (No Manual Hashing Required)

```typescript
// 1. Identify user on Checkout / Purchase (Browser Side - Unhashed, E.164 with '+' for TikTok)
export function identifyUserOnWebPixels(phoneE164WithPlus: string, phoneDigitsNoPlus: string) {
  // TikTok Web Pixel: Pass E.164 WITH '+' (TikTok SDK hashes automatically)
  if (typeof window !== 'undefined' && (window as any).ttq) {
    (window as any).ttq.identify({
      phone_number: phoneE164WithPlus, // e.g. "+212612345678" or "+966512345678"
    });
  }
  // Snapchat Web Pixel: Pass digits without '+'
  if (typeof window !== 'undefined' && (window as any).snaptr && process.env.NEXT_PUBLIC_SNAP_PIXEL_ID) {
    (window as any).snaptr('init', process.env.NEXT_PUBLIC_SNAP_PIXEL_ID, {
      user_phone_number: phoneDigitsNoPlus,
    });
  }
}

// 2. Fire Purchase on Browser Pixels with exact deduplication eventId
export function fireBrowserPurchase(order: {
  eventId: string;
  orderNumber: string;
  totalMad: number;
  currency: string;
  items: Array<{ slug: string; name: string; quantity: number; price: number }>;
}) {
  const contentIds = order.items.map((i) => i.slug);
  const numItems = order.items.reduce((sum, i) => sum + i.quantity, 0);

  // Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq(
      'track',
      'Purchase',
      {
        value: order.totalMad,
        currency: order.currency || 'MAD',
        content_ids: contentIds,
        content_type: 'product',
        num_items: numItems,
        contents: order.items.map((i) => ({ id: i.slug, quantity: i.quantity, item_price: i.price })),
      },
      { eventID: order.eventId }
    );
  }

  // TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.track(
      'CompletePayment',
      {
        value: order.totalMad,
        currency: order.currency || 'MAD',
        content_type: 'product',
        contents: order.items.map((i) => ({
          content_id: i.slug,
          content_name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      },
      { event_id: order.eventId }
    );
  }

  // Snapchat Pixel
  if ((window as any).snaptr) {
    (window as any).snaptr('track', 'PURCHASE', {
      price: order.totalMad,
      currency: order.currency || 'MAD',
      transaction_id: order.orderNumber,
      item_ids: contentIds,
      number_items: numItems,
      client_dedup_id: order.eventId,
    });
  }
}
```

---

## 5. Exact Server-Side CAPI Payloads (`backend/app/services/capi_service.py`)

### 5.1 Python SHA-256 Normalization Helper
```python
import hashlib
import re

def sha256_hash(value: str | None) -> str | None:
    if not value:
        return None
    normalized = value.strip().lower()
    if not normalized:
        return None
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

def split_and_hash_name(full_name: str | None) -> tuple[str | None, str | None]:
    if not full_name:
        return None, None
    # Remove punctuation, keep Arabic & Latin letters and spaces
    cleaned = re.sub(r"[^\w\s]", "", full_name.strip().lower())
    parts = [p for p in cleaned.split() if p]
    if not parts:
        return None, None
    first_name_hash = sha256_hash(parts[0])
    last_name_hash = sha256_hash("".join(parts[1:])) if len(parts) > 1 else None
    return first_name_hash, last_name_hash
```

---

### 5.2 Meta Conversions API (Graph API v21.0) Payload
- **Endpoint**: `POST https://graph.facebook.com/v21.0/{META_PIXEL_ID}/events?access_token={META_CAPI_ACCESS_TOKEN}`
- **Phone Rule**: Hash `phone_digits_no_plus` (e.g. `212612345678` or `966512345678` — **NO `+`**).
- **JSON Payload**:
```json
{
  "data": [
    {
      "event_name": "Purchase",
      "event_time": 1730200000,
      "event_id": "evt_purchase_9b1deb4d",
      "event_source_url": "https://kenidoux.com/thank-you",
      "action_source": "website",
      "user_data": {
        "ph": ["<sha256_of_212612345678_without_plus>"],
        "fn": ["<sha256_of_lowercase_first_name>"],
        "ln": ["<sha256_of_lowercase_last_name>"],
        "country": ["<sha256_of_ma_or_sa>"],
        "client_ip_address": "196.200.140.12",
        "client_user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...",
        "fbp": "fb.1.1730199000.123456789",
        "fbc": "fb.1.1730199000.IwAR0xyz..."
      },
      "custom_data": {
        "currency": "MAD",
        "value": 698.0,
        "order_id": "KD-10428",
        "content_type": "product",
        "content_ids": ["kenidoux-lumba", "kenidoux-calma"],
        "num_items": 2,
        "contents": [
          {"id": "kenidoux-lumba", "quantity": 1, "item_price": 499},
          {"id": "kenidoux-calma", "quantity": 1, "item_price": 199}
        ]
      }
    }
  ]
}
```
*(Note: If `META_TEST_EVENT_CODE` is set in `.env`, include `"test_event_code": META_TEST_EVENT_CODE` at the root of the JSON payload for testing in Meta Events Manager).*

---

### 5.3 TikTok Events API v1.3 Payload
- **Endpoint**: `POST https://business-api.tiktok.com/open_api/v1.3/event/track/`
- **Headers**: `{"Access-Token": TIKTOK_ACCESS_TOKEN, "Content-Type": "application/json"}`
- **Phone Rule**: Hash `phone_e164_with_plus` (e.g. `+212612345678` or `+966512345678` — **MUST HAVE `+` BEFORE HASHING**).
- **JSON Payload**:
```json
{
  "event_source": "web",
  "event_source_id": "<TIKTOK_PIXEL_ID>",
  "data": [
    {
      "event": "CompletePayment",
      "event_time": 1730200000,
      "event_id": "evt_purchase_9b1deb4d",
      "page": {
        "url": "https://kenidoux.com/thank-you"
      },
      "user": {
        "phone": "<sha256_of_+212612345678_WITH_plus>",
        "ip": "196.200.140.12",
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...",
        "ttp": "2a4e8f...",
        "ttclid": "E.C.P.v1..."
      },
      "properties": {
        "currency": "MAD",
        "value": 698.0,
        "content_type": "product",
        "order_id": "KD-10428",
        "contents": [
          {
            "content_id": "kenidoux-lumba",
            "content_name": "كينيدو لومبا",
            "quantity": 1,
            "price": 499.0
          },
          {
            "content_id": "kenidoux-calma",
            "content_name": "كينيدو كالما",
            "quantity": 1,
            "price": 199.0
          }
        ]
      }
    }
  ]
}
```

---

### 5.4 Snapchat Conversions API v3 Payload
- **Endpoint**: `POST https://tr.snapchat.com/v3/{SNAP_PIXEL_ID}/events?access_token={SNAP_CAPI_ACCESS_TOKEN}`
- **Phone Rule**: Hash `phone_digits_no_plus` (e.g. `212612345678` or `966512345678` — **NO `+`**).
- **JSON Payload**:
```json
{
  "data": [
    {
      "event_name": "PURCHASE",
      "event_time": 1730200000,
      "event_source_url": "https://kenidoux.com/thank-you",
      "event_id": "evt_purchase_9b1deb4d",
      "action_source": "WEB",
      "user_data": {
        "ph": ["<sha256_of_212612345678_without_plus>"],
        "fn": ["<sha256_of_lowercase_first_name>"],
        "ln": ["<sha256_of_lowercase_last_name>"],
        "country": ["<sha256_of_ma_or_sa>"],
        "client_ip_address": "196.200.140.12",
        "client_user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...",
        "sc_cookie1": "57cf8a96-99ff-4260-a6b0-219820d2860e",
        "sc_click_id": "7b3a7917-a82a-47e8-9728-e1b3b045abb2"
      },
      "custom_data": {
        "currency": "MAD",
        "value": 698.0,
        "order_id": "KD-10428",
        "content_ids": ["kenidoux-lumba", "kenidoux-calma"],
        "num_items": 2,
        "contents": [
          {"id": "kenidoux-lumba", "quantity": "1", "item_price": "499"},
          {"id": "kenidoux-calma", "quantity": "1", "item_price": "199"}
        ]
      }
    }
  ]
}
```
