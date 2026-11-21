import { api, type ApiOrder } from "./api";
import { fireBrowserPurchase } from "./tracking";

/**
 * Confirms the order the same way a declined upsell used to: the sheet row is sent once,
 * and the server Purchase (when the token is set) uses this order's event_id.
 * A failed call leaves the order pending. The existing safety net still confirms it.
 */
export async function settleCodOrder(order: ApiOrder): Promise<ApiOrder> {
  try {
    return await api.decideUpsell(order.id, {
      accepted: false,
      purchase_event_id: order.event_id ?? undefined,
    });
  } catch {
    return order;
  }
}

/** Browser Purchase once per order. The thank-you page sees the same key and does not send it again. */
export function firePurchaseOnce(order: ApiOrder): void {
  const eventId = order.event_id;
  if (!eventId || typeof window === "undefined") return;
  const key = `kd_purchase_${order.id}`;
  try {
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* private mode: the event_id still lets Meta drop a second copy */
  }
  fireBrowserPurchase({
    eventId,
    orderNumber: order.order_number,
    totalMad: order.total_mad,
    currency: order.currency || "MAD",
    items: order.items.map((item) => ({
      slug: item.product_slug,
      name: item.title_ar,
      quantity: item.quantity * item.units,
      price: item.price_mad,
    })),
  });
}
