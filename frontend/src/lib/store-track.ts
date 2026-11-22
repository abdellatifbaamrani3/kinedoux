/** First-party visit log. Posts to this site only. The Meta pixel is unchanged. */

type StoreEventName =
  | "page_view"
  | "product_view"
  | "variant_select"
  | "add_to_cart"
  | "checkout_started"
  | "form_field_completed"
  | "order_submit_attempt"
  | "order_submit_error"
  | "scroll_depth"
  | "time_on_page"
  | "outbound_click";

type Attribution = {
  fbclid?: string;
  ttclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

type Extra = {
  product_slug?: string;
  value_mad?: number;
  metadata?: Record<string, string | number>;
};

const QUEUE_KEY = "kd_event_queue";

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

function readJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function landingTouch(): Attribution {
  const found: Attribution = {};
  try {
    const params = new URLSearchParams(location.search);
    const fbclid = params.get("fbclid");
    const ttclid = params.get("ttclid");
    if (fbclid) found.fbclid = fbclid;
    if (ttclid) found.ttclid = ttclid;
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const) {
      const value = params.get(key);
      if (value) found[key] = value.slice(0, 150);
    }
  } catch {
    /* private mode */
  }
  return found;
}

export function sessionFirstTouch(): Attribution {
  try {
    return readJson<Attribution>(sessionStorage.getItem("kd_first"), {});
  } catch {
    return {};
  }
}

function lastTouch(): Attribution {
  return readJson<Attribution>(localStorage.getItem("kd_attr"), {});
}

export function ensureStoreIds() {
  let visitor = readCookie("kd_vid");
  try {
    visitor = visitor || localStorage.getItem("kd_vid");
  } catch {
    /* private mode */
  }
  if (!visitor) visitor = newId();
  writeCookie("kd_vid", visitor, 60 * 60 * 24 * 365);
  try {
    localStorage.setItem("kd_vid", visitor);
  } catch {
    /* private mode */
  }

  const incoming = landingTouch();
  let session = readCookie("kd_sid");
  let saved = { utm_source: "", utm_campaign: "" };
  try {
    saved = readJson(sessionStorage.getItem("kd_session_utm"), saved);
  } catch {
    /* private mode */
  }
  const utmChanged = Boolean(
    session &&
      (incoming.utm_source || incoming.utm_campaign) &&
      (incoming.utm_source !== saved.utm_source || incoming.utm_campaign !== saved.utm_campaign),
  );
  const fresh = !session || utmChanged;
  if (fresh) {
    session = newId();
    try {
      sessionStorage.setItem("kd_landing", `${location.pathname}${location.search}`);
      sessionStorage.setItem("kd_referrer", document.referrer || "");
      sessionStorage.setItem("kd_first", JSON.stringify(incoming));
      sessionStorage.setItem(
        "kd_session_utm",
        JSON.stringify({ utm_source: incoming.utm_source || "", utm_campaign: incoming.utm_campaign || "" }),
      );
    } catch {
      /* private mode */
    }
  }
  writeCookie("kd_sid", session || newId(), 60 * 30);
  return { visitor, session: session || newId(), fresh };
}

function payload(event: StoreEventName, extra?: Extra) {
  const ids = ensureStoreIds();
  const first = sessionFirstTouch();
  const last = lastTouch();
  return {
    event_id: newId(),
    visitor_id: ids.visitor,
    session_id: ids.session,
    event,
    path: location.pathname,
    page_url: location.href.slice(0, 1000),
    product_slug: extra?.product_slug || null,
    value_mad: extra?.value_mad ?? null,
    metadata: extra?.metadata || null,
    landing_page: sessionStorage.getItem("kd_landing") || location.pathname,
    referrer: sessionStorage.getItem("kd_referrer") || "",
    utm_source: first.utm_source || null,
    utm_medium: first.utm_medium || null,
    utm_campaign: first.utm_campaign || null,
    utm_content: first.utm_content || null,
    utm_term: first.utm_term || null,
    fbclid: first.fbclid || null,
    ttclid: first.ttclid || null,
    last_utm_source: last.utm_source || first.utm_source || null,
    last_utm_medium: last.utm_medium || first.utm_medium || null,
    last_utm_campaign: last.utm_campaign || first.utm_campaign || null,
    last_utm_content: last.utm_content || first.utm_content || null,
    last_utm_term: last.utm_term || first.utm_term || null,
    last_fbclid: last.fbclid || first.fbclid || null,
    last_ttclid: last.ttclid || first.ttclid || null,
  };
}

function readQueue(): unknown[] {
  return readJson<unknown[]>(localStorage.getItem(QUEUE_KEY), []);
}

function enqueue(body: unknown) {
  try {
    const queue = readQueue();
    queue.push(body);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-40)));
  } catch {
    /* private mode */
  }
}

function deliver(body: unknown) {
  const raw = JSON.stringify(body);
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([raw], { type: "application/json" });
      if (navigator.sendBeacon("/api/track", blob)) return;
    }
  } catch {
    /* fall through */
  }
  void fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: raw,
    keepalive: true,
  }).catch(() => enqueue(body));
}

function flushQueue() {
  let queue: unknown[] = [];
  try {
    queue = readQueue();
    localStorage.removeItem(QUEUE_KEY);
  } catch {
    return;
  }
  queue.forEach(deliver);
}

export function trackStore(event: StoreEventName, extra?: Extra) {
  if (typeof window === "undefined") return;
  const path = location.pathname;
  if (path === "/admin" || path.startsWith("/admin/")) return;
  const mark = `${event}:${extra?.product_slug || path}:${extra?.metadata?.field || extra?.metadata?.depth || ""}`;
  try {
    const last = Number(sessionStorage.getItem(`kd_seen_${mark}`) || 0);
    if (Date.now() - last < 1500) return;
    sessionStorage.setItem(`kd_seen_${mark}`, String(Date.now()));
  } catch {
    /* still send */
  }
  deliver(payload(event, extra));
}

export function installStoreObservers() {
  if (typeof window === "undefined") return;
  const flag = window as Window & { __kdObs?: boolean };
  if (flag.__kdObs) return;
  flag.__kdObs = true;
  flushQueue();
  window.addEventListener("online", flushQueue);
  const started = Date.now();
  const depths = new Set<string>();
  const onScroll = () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    if (height <= 0) return;
    const ratio = Math.min(100, Math.round((window.scrollY / height) * 100));
    for (const mark of [25, 50, 75, 100]) {
      const key = `${location.pathname}:${mark}`;
      if (ratio >= mark && !depths.has(key)) {
        depths.add(key);
        trackStore("scroll_depth", { metadata: { depth: mark } });
      }
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("click", (event) => {
    const node = event.target instanceof Element ? event.target.closest("a") : null;
    if (!(node instanceof HTMLAnchorElement)) return;
    const href = node.href;
    if (!href) return;
    let url: URL;
    try {
      url = new URL(href);
    } catch {
      return;
    }
    if (url.host === location.host && !url.hostname.includes("wa.me")) return;
    trackStore("outbound_click", { metadata: { url: href.slice(0, 300) } });
  });
  const sendTime = () => {
    const seconds = Math.max(1, Math.round((Date.now() - started) / 1000));
    trackStore("time_on_page", { metadata: { seconds } });
  };
  window.addEventListener("pagehide", sendTime);
}
