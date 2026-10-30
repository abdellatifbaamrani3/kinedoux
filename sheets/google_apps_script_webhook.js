/**
 * ============================================================================
 * KINÉDOUX™ (kenidoux.com) — GOOGLE SHEETS ORDER WEBHOOK SCRIPT
 * ============================================================================
 * HOW TO INSTALL & DEPLOY:
 * 1. Open your Google Sheet (or import `kenidoux_orders_template.csv` first).
 * 2. Click `Extensions` > `Apps Script`.
 * 3. Delete any code in `Code.gs` and paste this entire file.
 * 4. Click `Save` (disk icon).
 * 5. Click `Deploy` > `New deployment`.
 * 6. Select type: `Web app`.
 *    - Description: `Kenidoux Orders Webhook v1`
 *    - Execute as: `Me`
 *    - Who has access: `Anyone` (Required so FastAPI backend can POST without OAuth popup)
 * 7. Click `Deploy`, authorize access, and copy the `Web app URL` (ends with `/exec`).
 * 8. Paste that URL into EasyPanel Backend `.env` as `GOOGLE_SHEETS_WEBHOOK_URL`.
 * ============================================================================
 */

const EXPECTED_SECRET = ""; // Optional: Set to match GOOGLE_SHEETS_WEBHOOK_SECRET if you want token verification

const HEADERS = [
  "رقم الطلب (Order ID)",
  "تاريخ ووقت الطلب (Created At)",
  "حالة التأكيد (Call Status)",
  "الاسم الكامل (Customer Name)",
  "رقم الهاتف (Phone Local)",
  "رقم الهاتف الدولي (Phone E.164)",
  "رابط واتساب سريع (WhatsApp Link)",
  "المنتجات والعروض المطلوبة (Items Summary)",
  "عدد القطع الإجمالي (Total Units)",
  "هل قبل عرض الـ Upsell؟ (Upsell Accepted)",
  "منتج الـ Upsell (Upsell Item)",
  "المبلغ الإجمالي عند الاستلام (Total COD MAD)",
  "العملة (Currency)",
  "المدينة والعنوان (تُملأ عند التأكيد)",
  "مقاس الخصر / ملاحظات الكول سنتر",
  "مصدر الإعلان (UTM Source)",
  "الحملة الإعلانية (UTM Campaign)",
  "معرف الحدث (Pixel Event ID)"
];

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#1E4D3B");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.setRightToLeft(true);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Empty request body" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);

    if (EXPECTED_SECRET && data.secret !== EXPECTED_SECRET) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Invalid webhook secret" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0];
    ensureHeaders(sheet);

    const orderNumber = String(data.order_number || "KD-UNKNOWN");
    const createdAt = String(data.created_at_morocco || new Date().toISOString());
    const callStatus = String(data.call_status || "جديد - في انتظار الاتصال");
    const customerName = String(data.customer_name || "");
    // Prefix phones with apostrophe so Google Sheets keeps leading 0 and +
    const phoneLocal = "'" + String(data.customer_phone_local || "");
    const phoneE164 = "'" + String(data.customer_phone_e164 || "");
    const whatsappLink = String(data.whatsapp_quick_link || "");
    const itemsSummary = String(data.items_summary || "");
    const totalUnits = Number(data.total_units || 1);
    const upsellAccepted = String(data.upsell_accepted || "لا");
    const upsellProductName = String(data.upsell_product_name || "-");
    const totalMad = Number(data.total_mad || 0);
    const currency = String(data.currency || "MAD");
    const cityAndAddress = String(data.city_and_address || "");
    const agentNotes = String(data.agent_notes || "");
    const utmSource = String(data.utm_source || "direct");
    const utmCampaign = String(data.utm_campaign || "-");
    const eventId = String(data.event_id || "");

    const rowValues = [
      orderNumber,
      createdAt,
      callStatus,
      customerName,
      phoneLocal,
      phoneE164,
      whatsappLink,
      itemsSummary,
      totalUnits,
      upsellAccepted,
      upsellProductName,
      totalMad,
      currency,
      cityAndAddress,
      agentNotes,
      utmSource,
      utmCampaign,
      eventId
    ];

    // Check if orderNumber already exists in Column A (to update in-place if upsell was added)
    const lastRow = sheet.getLastRow();
    let existingRowIndex = -1;

    if (lastRow > 1) {
      const orderIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < orderIds.length; i++) {
        if (String(orderIds[i][0]).trim() === orderNumber.trim()) {
          existingRowIndex = i + 2;
          break;
        }
      }
    }

    if (existingRowIndex !== -1) {
      sheet.getRange(existingRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        order_number: orderNumber,
        updated_existing: existingRowIndex !== -1
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "ok",
      service: "Kinédoux (kenidoux.com) Google Sheets Order Webhook is active"
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
