/** First-party visit log. Posts to this site only. The Meta pixel is unchanged. */

type StoreEventName = "page_view" | "product_view" | "add_to_cart" | "checkout_form_start";

type Attribution = {
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, seconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${seconds}; path=/; SameSite=Lax`;
}

function newId() {
  const cryptoRef = globalThis.crypto;
  if (cryptoRef?.randomUUID) return cryptoRef.randomUUID().replace(/-/g, "");
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
}

function attribution(): Attribution {
  try {
    return JSON.parse(localStorage.getItem("kd_attr") || "{}") as Attribution;
  } catch {
    return {};
  }
}

export function ensureStoreIds() {
  let visitor = readCookie("kd_vid");
  if (!visitor) {
    visitor = newId();
    writeCookie("kd_vid", visitor, 60 * 60 * 24 * 365);
  }
  let session = readCookie("kd_sid");
  const fresh = !session;
  if (!session) {
    session = newId();
    try {
      sessionStorage.setItem("kd_landing", `${location.pathname}${location.search}`);
      sessionStorage.setItem("kd_referrer", document.referrer || "");
    } catch {
      /* private mode */
    }
  }
  writeCookie("kd_sid", session, 60 * 30);
  return { visitor, session, fresh };
}

export function trackStore(event: StoreEventName, extra?: { product_slug?: string }) {
  if (typeof window === "undefined") return;
  const path = location.pathname;
  if (path === "/admin" || path.startsWith("/admin/")) return;
  const mark = `${event}:${extra?.product_slug || path}`;
  try {
    const last = Number(sessionStorage.getItem(`kd_seen_${mark}`) || 0);
    if (Date.now() - last < 1500) return;
    sessionStorage.setItem(`kd_seen_${mark}`, String(Date.now()));
  } catch {
    /* still send */
  }
  const ids = ensureStoreIds();
  const attr = attribution();
  const body = JSON.stringify({
    visitor_id: ids.visitor,
    session_id: ids.session,
    event,
    path,
    product_slug: extra?.product_slug || null,
    landing_page: sessionStorage.getItem("kd_landing") || path,
    referrer: sessionStorage.getItem("kd_referrer") || "",
    utm_source: attr.utm_source || null,
    utm_medium: attr.utm_medium || null,
    utm_campaign: attr.utm_campaign || null,
    utm_content: attr.utm_content || null,
    fbclid: attr.fbclid || null,
  });
  void fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
