# 07 — GOOGLE SHEETS WEBHOOK INTEGRATION & CSV TEMPLATE SPECIFICATION

## 1. Overview of the Order-to-Sheet Pipeline
Every order placed on `kenidoux.com` is saved immediately to PostgreSQL and then dispatched via an HTTP `POST` request from the FastAPI backend (`backend/app/services/sheets_webhook.py`) to a **Google Apps Script Web App URL** (`GOOGLE_SHEETS_WEBHOOK_URL` in backend `.env`).

The AI coder must deliver two ready-to-use files inside the `sheets/` folder at the repository root (and they are also pre-generated in `sheets/` right now):
1. `sheets/google_apps_script_webhook.js` — The exact Google Apps Script code to paste into Google Sheets (`Extensions -> Apps Script -> Deploy as Web App`).
2. `sheets/kenidoux_orders_template.csv` — The CSV template containing the exact header columns and a sample row so the user can import it into Google Sheets in 10 seconds.

---

## 2. Exact Google Sheets Columns (18 Columns for COD Call Center & Accounting)

| Col # | Column Header (Arabic / English) | JSON Payload Key | Description |
|---|---|---|---|
| **A** | `رقم الطلب (Order ID)` | `order_number` | e.g., `KD-2026-1042` |
| **B** | `تاريخ ووقت الطلب (Created At)` | `created_at_morocco` | Formatted timestamp (`2026-10-29 14:32:10`) |
| **C** | `حالة التأكيد (Call Status)` | `call_status` | Default: `جديد - في انتظار الاتصال` (Call center updates to `مؤكد`, `لا يجيب 1`, `ملغى`) |
| **D** | `الاسم الكامل (Customer Name)` | `customer_name` | Customer's name from Checkout Popup Field 1 |
| **E** | `رقم الهاتف (Phone Local)` | `customer_phone_local` | Pre-formatted with leading apostrophe `'0612345678` or `'0512345678` so Google Sheets never strips the leading zero! |
| **F** | `رقم الهاتف الدولي (Phone E.164)` | `customer_phone_e164` | `'+212612345678` or `'+966512345678` |
| **G** | `رابط واتساب سريع (WhatsApp Link)` | `whatsapp_quick_link` | Clickable `https://wa.me/212612345678?text=...` pre-filled with the Darija confirmation message! |
| **H** | `المنتجات والعروض المطلوبة (Items Summary)` | `items_summary` | Human-readable summary, e.g., `1x عرض العائلة (حزامين كينيدو لومبا) + 1x كينيدو كالما (عرض VIP)` |
| **I** | `عدد القطع الإجمالي (Total Units)` | `total_units` | Total physical units to pack |
| **J** | `هل قبل عرض الـ Upsell؟ (Upsell Accepted)` | `upsell_accepted` | `نعم (+199 د.م)` or `لا` |
| **K** | `منتج الـ Upsell (Upsell Item)` | `upsell_product_name` | e.g., `كينيدو كالما` or `-` |
| **L** | `المبلغ الإجمالي عند الاستلام (Total COD MAD)` | `total_mad` | e.g., `1048` |
| **M** | `العملة (Currency)` | `currency` | `MAD` |
| **N** | `المدينة والعنوان (تُملأ عند التأكيد)` | `city_and_address` | Left blank for call center agent to fill during the confirmation call |
| **O** | `مقاس الخصر / ملاحظات الكول سنتر` | `agent_notes` | Left blank for waist size (`M` / `L`) & delivery time notes |
| **P** | `مصدر الإعلان (UTM Source / Platform)` | `utm_source` | `facebook`, `tiktok`, `snapchat`, `direct` |
| **Q** | `الحملة الإعلانية (UTM Campaign)` | `utm_campaign` | Campaign name if present |
| **R** | `معرف الحدث (Pixel Event ID)` | `event_id` | Deduplication ID (`evt_purchase_...`) |

---

## 3. Webhook JSON Payload Sent by FastAPI (`backend/app/services/sheets_webhook.py`)

When an order is finalized (either when the customer accepts/declines the 10–15s upsell, or when the 20s backend fallback timer runs), FastAPI sends a `POST` request with `Content-Type: application/json` (and `follow_redirects=True` in `httpx.AsyncClient(follow_redirects=True, timeout=15.0)` because Google Apps Script Web Apps return a `302` redirect on completion!):

```json
{
  "secret": "<WEBHOOK_SECRET_IF_SET>",
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "order_number": "KD-2026-1042",
  "created_at_morocco": "2026-10-29 14:32:10",
  "call_status": "جديد - في انتظار الاتصال",
  "customer_name": "محمد العلمي",
  "customer_phone_local": "0612345678",
  "customer_phone_e164": "+212612345678",
  "whatsapp_quick_link": "https://wa.me/212612345678?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%20%D9%85%D8%AD%D9%85%D8%AF...",
  "items_summary": "1x عرض العائلة والوالدين (حزامين كينيدو لومبا 2x) [849 د.م] + 1x كينيدو كالما (عرض VIP بعد الطلب) [199 د.م]",
  "total_units": 3,
  "upsell_accepted": "نعم (+199 د.م)",
  "upsell_product_name": "كينيدو كالما",
  "subtotal_mad": 849,
  "upsell_price_mad": 199,
  "total_mad": 1048,
  "currency": "MAD",
  "utm_source": "facebook",
  "utm_campaign": "lumba_broad_ma",
  "event_id": "evt_purchase_9b1deb4d",
  "items": [
    {
      "product_slug": "kenidoux-lumba",
      "offer_id": "lumba-2",
      "title_ar": "كينيدو لومبا — عرض العائلة والوالدين (2x)",
      "quantity": 2,
      "price_mad": 849
    },
    {
      "product_slug": "kenidoux-calma",
      "offer_id": "upsell-calma",
      "title_ar": "كينيدو كالما — عرض VIP التكميلي",
      "quantity": 1,
      "price_mad": 199
    }
  ]
}
```

> **CRITICAL IMPLEMENTATION DETAIL FOR FASTAPI:**
> Google Apps Script Web Apps (`https://script.google.com/macros/s/.../exec`) respond with an HTTP `302 Found` redirect to `script.googleusercontent.com`. Always instantiate `httpx.AsyncClient(follow_redirects=True, timeout=15.0)` when sending the webhook so `httpx` follows the redirect cleanly.

---

## 4. Google Apps Script Features (`sheets/google_apps_script_webhook.js`)
The Google Apps Script (`doPost(e)`) must:
1. Automatically create and format the header row (`Row 1`) with brand green background (`#1E4D3B`) and white bold text if the sheet is empty.
2. Check if a row with the same `order_number` (`Column A`) already exists:
   - **If it already exists** (e.g. initial order was logged and then updated with the 15s upsell): **Update that existing row in-place** so there are never duplicate rows for the same order!
   - **If it does not exist**: Append a new row at the bottom of the sheet.
3. Prefix phone numbers with `'` so Google Sheets preserves the leading `0` or `+`.
4. Return `{ "status": "success", "order_number": data.order_number }`.
