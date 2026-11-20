/**
 * Fires Lead and Purchase once, only after a real order redirect in this tab.
 * A refresh or a direct visit does not send them again.
 * The same event IDs were posted to the webhook for a future Conversions API call.
 * In Ads Manager, optimize on one of the two events. For cash on delivery, Lead
 * matches "order placed" until the parcel is paid.
 */
(function () {
  var raw = '';
  try { raw = sessionStorage.getItem('kd_last_order') || ''; } catch (e) { return; }
  if (!raw) return;
  var order;
  try { order = JSON.parse(raw); } catch (e) { return; }
  if (!order || !order.eventId) return;

  var confirmed = document.querySelector('[data-confirmed]');
  var direct = document.querySelector('[data-direct]');
  var number = document.querySelector('[data-order-number]');
  if (confirmed) confirmed.hidden = false;
  if (direct) direct.hidden = true;
  if (number && order.orderNumber) number.textContent = order.orderNumber;

  if (typeof window.fbq !== 'function') return;
  var seen = '';
  try { seen = sessionStorage.getItem('kd_tracked') || ''; } catch (e) {}
  if (seen === order.eventId) return;
  try { sessionStorage.setItem('kd_tracked', order.eventId); } catch (e) {}

  var pixel = document.body.getAttribute('data-pixel') || '';
  if (pixel && /^\d{8,20}$/.test(pixel) && order.phone) {
    window.fbq('init', pixel, { ph: order.phone, fn: order.name || '' });
  }
  var payload = {
    content_ids: [order.contentId],
    content_name: order.contentName,
    content_type: 'product',
    value: order.value,
    currency: order.currency || 'MAD',
    num_items: order.qty,
    order_id: order.orderNumber,
  };
  window.fbq('track', 'Lead', payload, { eventID: order.eventId });
  window.fbq('track', 'Purchase', payload, { eventID: order.purchaseEventId || order.eventId });

  try {
    delete order.phone;
    delete order.name;
    sessionStorage.setItem('kd_last_order', JSON.stringify(order));
  } catch (e) {}
})();
