/**
 * Deferred web pixels (Meta, TikTok, Snapchat) + server-side CAPI relay with 100% event_id deduplication.
 *
 * - Events are queued in `window.__kdEventQueue` until the pixel scripts are injected.
 * - Scripts are injected on first user interaction OR after requestIdleCallback (2.5s) — never in <head>.
 * - Every event gets ONE event_id that is sent to the 3 browser pixels AND to the FastAPI CAPI relay.
 */
import { relayEventToServer, type TrackingContextPayload } from "./api";
import type { PhoneValidationResult } from "./phone";

export type EventName = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";
export type TrackContent = { id: string; quantity: number; item_price: number; name?: string };
export type TrackParams = { value?: number; currency?: string; contents?: TrackContent[]; orderId?: string };

type QueuedEvent = { name: EventName; params: TrackParams; eventId: string };
type PixelFn = (...args: unknown[]) => void;

type KDWindow = Window & {
  __kdEventQueue?: QueuedEvent[];
  __kdPixelsLoaded?: boolean;
  fbq?: PixelFn & { queue?: unknown[]; callMethod?: PixelFn; push?: unknown; loaded?: boolean; version?: string };
  _fbq?: unknown;
  ttq?: Record<string, unknown> & { track?: PixelFn; identify?: PixelFn; page?: PixelFn; load?: PixelFn };
  TiktokAnalyticsObject?: string;
  snaptr?: PixelFn & { queue?: unknown[]; handleRequest?: PixelFn };
};

const META_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
const TIKTOK_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "";
const SNAP_ID = process.env.NEXT_PUBLIC_SNAP_PIXEL_ID || "";
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "MAD";

const SNAP_EVENT: Record<EventName, string> = {
  PageView: "PAGE_VIEW",
  ViewContent: "VIEW_CONTENT",
  AddToCart: "ADD_CART",
  InitiateCheckout: "START_CHECKOUT",
  Purchase: "PURCHASE",
};

const ID_PREFIX: Record<EventName, string> = {
  PageView: "pv",
  ViewContent: "vc",
  AddToCart: "atc",
  InitiateCheckout: "ic",
  Purchase: "purchase",
};

const win = (): KDWindow | null => (typeof window === "undefined" ? null : (window as KDWindow));

// --------------------------------------------------------------------------- ids, cookies, attribution
export function makeEventId(name: EventName): string {
  const w = win();
  const uuid =
    w?.crypto && "randomUUID" in w.crypto
      ? w.crypto.randomUUID()
      : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
  return `evt_${ID_PREFIX[name]}_${uuid}`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, days = 90): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${days * 86400}; path=/; SameSite=Lax`;
}

type Attribution = {
  fbclid?: string;
  ttclid?: string;
  sccid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

function readAttribution(): Attribution {
  try {
    return JSON.parse(localStorage.getItem("kd_attr") || "{}") as Attribution;
  } catch {
    return {};
  }
}

/** Capture ad click ids once on landing so they survive internal navigation. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const q = new URLSearchParams(window.location.search);
    const found: Attribution = {};
    const fbclid = q.get("fbclid");
    const ttclid = q.get("ttclid");
    const sccid = q.get("ScCid") || q.get("sccid");
    if (fbclid) found.fbclid = fbclid;
    if (ttclid) found.ttclid = ttclid;
    if (sccid) found.sccid = sccid;
    for (const key of ["utm_source", "utm_medium", "utm_campaign"] as const) {
      const v = q.get(key);
      if (v) found[key] = v.slice(0, 150);
    }
    if (!Object.keys(found).length) return;
    localStorage.setItem("kd_attr", JSON.stringify({ ...readAttribution(), ...found }));
    if (fbclid && !readCookie("_fbc")) writeCookie("_fbc", `fb.1.${Date.now()}.${fbclid}`);
    if (ttclid) writeCookie("kd_ttclid", ttclid);
    if (sccid) writeCookie("kd_sccid", sccid);
  } catch {
    /* storage may be unavailable (private mode) */
  }
}

export function getTrackingContext(): TrackingContextPayload {
  if (typeof window === "undefined") return {};
  const attr = readAttribution();
  const fbc = readCookie("_fbc") || (attr.fbclid ? `fb.1.${Date.now()}.${attr.fbclid}` : null);
  return {
    fbp: readCookie("_fbp"),
    fbc,
    ttp: readCookie("_ttp"),
    ttclid: attr.ttclid || readCookie("kd_ttclid"),
    sc_cookie1: readCookie("_scid"),
    sc_click_id: attr.sccid || readCookie("kd_sccid"),
    utm_source: attr.utm_source || null,
    utm_medium: attr.utm_medium || null,
    utm_campaign: attr.utm_campaign || null,
    page_url: window.location.href,
  };
}

type KnownUser = { phone?: string; full_name?: string };

export function saveKnownUser(user: KnownUser): void {
  try {
    localStorage.setItem("kd_user", JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

function readKnownUser(): KnownUser {
  try {
    return JSON.parse(localStorage.getItem("kd_user") || "{}") as KnownUser;
  } catch {
    return {};
  }
}

// --------------------------------------------------------------------------- pixel bootstrap (deferred)
function loadScript(src: string): void {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function injectMeta(id: string): void {
  const w = win();
  if (!w || w.fbq) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as NonNullable<KDWindow["fbq"]> & { queue: unknown[] };
  fbq.queue = [];
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  w.fbq = fbq;
  if (!w._fbq) w._fbq = fbq;
  loadScript("https://connect.facebook.net/en_US/fbevents.js");
  fbq("init", id);
}

function injectTikTok(id: string): void {
  const w = win();
  if (!w || w.ttq) return;
  w.TiktokAnalyticsObject = "ttq";

  // Mirrors TikTok's official base code: `ttq` is a queue (array) with deferred methods until events.js loads.
  type Stub = unknown[] & Record<string, unknown>;
  const ttq = [] as unknown as Stub;
  const methods = [
    "page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group",
    "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent",
  ];
  const defer = (target: Stub, method: string) => {
    target[method] = (...args: unknown[]) => target.push([method, ...args]);
  };
  methods.forEach((m) => defer(ttq, m));

  const instances: Record<string, Stub> = {};
  const loadedAt: Record<string, number> = {};
  const options: Record<string, unknown> = {};
  ttq._i = instances;
  ttq._t = loadedAt;
  ttq._o = options;
  ttq.instance = (name: string) => {
    const inst = instances[name] || ([] as unknown as Stub);
    methods.forEach((m) => defer(inst, m));
    return inst;
  };
  ttq.load = (pixelId: string, opts?: unknown) => {
    const src = "https://analytics.tiktok.com/i18n/pixel/events.js";
    const inst = [] as unknown as Stub;
    inst._u = src;
    instances[pixelId] = inst;
    loadedAt[pixelId] = Date.now();
    options[pixelId] = opts || {};
    loadScript(`${src}?sdkid=${pixelId}&lib=ttq`);
  };

  w.ttq = ttq as unknown as KDWindow["ttq"];
  (ttq.load as (pixelId: string) => void)(id);
  // NOTE: no automatic ttq.page() here — PageView is fired by trackEvent() with a dedup event_id.
}

function injectSnap(id: string): void {
  const w = win();
  if (!w || w.snaptr) return;
  const snaptr = function (...args: unknown[]) {
    if (snaptr.handleRequest) snaptr.handleRequest(...args);
    else snaptr.queue.push(args);
  } as NonNullable<KDWindow["snaptr"]> & { queue: unknown[] };
  snaptr.queue = [];
  w.snaptr = snaptr;
  loadScript("https://sc-static.net/scevent.min.js");
  snaptr("init", id, {});
}

function fireBrowser(ev: QueuedEvent): void {
  const w = win();
  if (!w) return;
  const { name, params, eventId } = ev;
  const contents = params.contents || [];
  const value = params.value;
  const currency = params.currency || CURRENCY;
  const numItems = contents.reduce((s, c) => s + c.quantity, 0) || undefined;

  if (w.fbq && META_ID) {
    const data: Record<string, unknown> = {};
    if (name !== "PageView") {
      if (value !== undefined) Object.assign(data, { value, currency });
      if (contents.length)
        Object.assign(data, {
          content_ids: contents.map((c) => c.id),
          content_type: "product",
          num_items: numItems,
          contents: contents.map((c) => ({ id: c.id, quantity: c.quantity, item_price: c.item_price })),
        });
    }
    w.fbq("track", name, data, { eventID: eventId });
  }

  if (w.ttq && TIKTOK_ID) {
    if (name === "PageView") {
      w.ttq.page?.({ event_id: eventId });
    } else {
      w.ttq.track?.(
        name === "Purchase" ? "CompletePayment" : name,
        {
          value,
          currency,
          content_type: "product",
          contents: contents.map((c) => ({
            content_id: c.id,
            content_name: c.name || c.id,
            quantity: c.quantity,
            price: c.item_price,
          })),
        },
        { event_id: eventId },
      );
    }
  }

  if (w.snaptr && SNAP_ID) {
    const data: Record<string, unknown> = { client_dedup_id: eventId };
    if (name !== "PageView") {
      if (value !== undefined) Object.assign(data, { price: value, currency });
      if (contents.length) Object.assign(data, { item_ids: contents.map((c) => c.id), number_items: numItems });
      if (params.orderId) data.transaction_id = params.orderId;
    }
    w.snaptr("track", SNAP_EVENT[name], data);
  }
}

function flushQueue(): void {
  const w = win();
  if (!w) return;
  const queue = w.__kdEventQueue || [];
  w.__kdEventQueue = [];
  queue.forEach(fireBrowser);
}

export function loadPixels(): void {
  const w = win();
  if (!w || w.__kdPixelsLoaded) return;
  w.__kdPixelsLoaded = true;
  try {
    if (META_ID) injectMeta(META_ID);
    if (TIKTOK_ID) injectTikTok(TIKTOK_ID);
    if (SNAP_ID) injectSnap(SNAP_ID);
  } finally {
    flushQueue();
  }
}

/** Schedule pixel injection: first interaction OR idle callback after 2.5s. Returns a cleanup function. */
export function schedulePixelLoad(): () => void {
  const w = win();
  if (!w) return () => undefined;
  const events = ["scroll", "touchstart", "mousemove", "click", "keydown"] as const;
  const trigger = () => {
    cleanup();
    loadPixels();
  };
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cleanup = () => {
    events.forEach((e) => window.removeEventListener(e, trigger));
    if (timer) clearTimeout(timer);
  };
  events.forEach((e) => window.addEventListener(e, trigger, { once: true, passive: true }));
  timer = setTimeout(() => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(trigger, { timeout: 1000 });
    else trigger();
  }, 2500);
  return cleanup;
}

// --------------------------------------------------------------------------- public tracking API
export function trackEvent(
  name: EventName,
  params: TrackParams = {},
  opts: { eventId?: string; skipServer?: boolean } = {},
): string {
  const eventId = opts.eventId ?? makeEventId(name);
  const w = win();
  if (!w) return eventId;

  const ev: QueuedEvent = { name, params, eventId };
  if (w.__kdPixelsLoaded) fireBrowser(ev);
  else (w.__kdEventQueue ||= []).push(ev);

  // Purchase is relayed by the backend itself (POST /orders/{id}/upsell) with the same event_id.
  if (name !== "Purchase" && !opts.skipServer) {
    const user = readKnownUser();
    relayEventToServer({
      event_name: name,
      event_id: eventId,
      event_source_url: window.location.href,
      value: params.value,
      currency: params.currency || CURRENCY,
      contents: (params.contents || []).map((c) => ({ id: c.id, quantity: c.quantity, item_price: c.item_price, name: c.name })),
      user: { phone: user.phone, full_name: user.full_name },
      ...serverCookies(),
    });
  }
  return eventId;
}

function serverCookies() {
  const ctx = getTrackingContext();
  return {
    fbp: ctx.fbp ?? undefined,
    fbc: ctx.fbc ?? undefined,
    ttp: ctx.ttp ?? undefined,
    ttclid: ctx.ttclid ?? undefined,
    sc_cookie1: ctx.sc_cookie1 ?? undefined,
    sc_click_id: ctx.sc_click_id ?? undefined,
  };
}

/**
 * Advanced matching on the browser pixels (no manual hashing needed).
 *  - TikTok: E.164 WITH '+'        (SDK hashes it)
 *  - Snapchat / Meta: digits only, NO '+'
 */
export function identifyUserOnWebPixels(phone: PhoneValidationResult, fullName?: string): void {
  const w = win();
  if (!w || !phone.isValid) return;
  saveKnownUser({ phone: phone.localDisplay, full_name: fullName });
  const apply = () => {
    if (w.ttq && TIKTOK_ID) w.ttq.identify?.({ phone_number: phone.e164WithPlus });
    if (w.snaptr && SNAP_ID) w.snaptr("init", SNAP_ID, { user_phone_number: phone.digitsOnlyNoPlus });
    if (w.fbq && META_ID) w.fbq("init", META_ID, { ph: phone.digitsOnlyNoPlus });
  };
  if (w.__kdPixelsLoaded) apply();
  else {
    // pixels are still deferred: load them now (the user is mid-checkout anyway), then identify
    loadPixels();
    apply();
  }
}

export type PurchasePayload = {
  eventId: string;
  orderNumber: string;
  totalMad: number;
  currency: string;
  items: Array<{ slug: string; name: string; quantity: number; price: number }>;
};

/** Browser `Purchase` with the SAME event_id the backend used for the server-side CAPI Purchase. */
export function fireBrowserPurchase(order: PurchasePayload): void {
  trackEvent(
    "Purchase",
    {
      value: order.totalMad,
      currency: order.currency || CURRENCY,
      orderId: order.orderNumber,
      contents: order.items.map((i) => ({ id: i.slug, name: i.name, quantity: i.quantity, item_price: i.price })),
    },
    { eventId: order.eventId, skipServer: true },
  );
}
