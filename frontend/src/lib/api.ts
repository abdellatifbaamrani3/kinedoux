const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type ApiOrderItem = {
  product_slug: string;
  offer_id: string;
  title_ar: string;
  quantity: number;
  units: number;
  price_mad: number;
  compare_at_mad: number | null;
  is_cross_sell: boolean;
  is_upsell: boolean;
};

export type ApiUpsellOffer = {
  product_slug: string;
  title_ar: string;
  headline_ar: string;
  pitch_ar: string;
  price_mad: number;
  compare_at_mad: number;
};

export type ApiOrder = {
  id: string;
  order_number: string;
  status: "pending_upsell" | "confirmed" | string;
  customer_name: string;
  customer_phone_local: string;
  customer_phone_e164: string;
  customer_phone_digits: string;
  customer_country: string;
  subtotal_mad: number;
  upsell_added: boolean;
  upsell_product_slug: string | null;
  upsell_price_mad: number;
  total_mad: number;
  currency: string;
  items: ApiOrderItem[];
  event_id: string | null;
  upsell_offer: ApiUpsellOffer | null;
};

export type ApiOrderPublic = {
  id: string;
  order_number: string;
  status: string;
  customer_first_name: string;
  total_mad: number;
  currency: string;
  upsell_added: boolean;
  items: ApiOrderItem[];
  event_id: string | null;
  upsell_offer: ApiUpsellOffer | null;
  upsell_offers: ApiUpsellOffer[];
};

export type TrackingContextPayload = {
  fbp?: string | null;
  fbc?: string | null;
  ttp?: string | null;
  ttclid?: string | null;
  sc_cookie1?: string | null;
  sc_click_id?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  page_url?: string | null;
};

export type CreateOrderBody = {
  customer_name: string;
  customer_phone: string;
  items: Array<{ product_slug: string; offer_id: string; quantity: number; is_cross_sell: boolean }>;
  event_id: string;
  tracking: TrackingContextPayload;
};

const GENERIC_ERROR = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو التواصل معنا عبر الواتساب.";

async function request<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), init?.timeoutMs ?? 15000);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
    if (!res.ok) {
      let message = GENERIC_ERROR;
      try {
        const body = await res.json();
        if (typeof body?.detail === "string") message = body.detail;
        else if (res.status === 422) message = "المرجو التأكد من الاسم ورقم الهاتف ثم المحاولة مرة أخرى.";
      } catch {
        /* keep generic message */
      }
      throw new ApiError(res.status, message);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, "تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.");
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  createOrder: (body: CreateOrderBody) =>
    request<ApiOrder>("/api/v1/orders", { method: "POST", body: JSON.stringify(body) }),

  decideUpsell: (
    orderId: string,
    body: {
      accepted: boolean;
      upsell_product_slug?: string;
      upsell_title_ar?: string;
      upsell_price_mad?: number;
      purchase_event_id?: string;
    },
  ) => request<ApiOrder>(`/api/v1/orders/${orderId}/upsell`, { method: "POST", body: JSON.stringify(body) }),

  getOrder: (orderId: string) => request<ApiOrderPublic>(`/api/v1/orders/${orderId}`, { timeoutMs: 8000 }),

  sendContact: (body: { full_name: string; phone: string; subject: string; message: string }) =>
    request<{ ok: boolean }>("/api/v1/contact", { method: "POST", body: JSON.stringify(body) }),
};

/** Fire-and-forget server-side CAPI relay (same event_id as the browser pixel). */
export function relayEventToServer(payload: Record<string, unknown>): void {
  try {
    void fetch(`${API_URL}/api/v1/events/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* tracking must never break the UI */
  }
}
