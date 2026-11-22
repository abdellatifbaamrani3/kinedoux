/**
 * Public Meta dataset id. The env var wins when the host sets it at build time.
 * The fallback is the dataset already installed on kinedoux.com.
 */
const FROM_ENV = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
export const META_PIXEL_ID = /^\d{8,20}$/.test(FROM_ENV) ? FROM_ENV : "2399710514127012";

/** Head snippet. PageView is queued before fbevents.js arrives, so Meta can count the landing. */
export function metaPixelBootScript(id: string): string {
  if (!/^\d{8,20}$/.test(id)) return "";
  return `(function(pixelId){
    var path = location.pathname;
    if (path === "/admin" || path.indexOf("/admin/") === 0) return;
    if (window.fbq) return;
    var fbq = window.fbq = function(){
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    var uuid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(16) + Math.random().toString(16).slice(2));
    var eventId = "evt_pv_" + uuid;
    window.__kdPv = { path: location.pathname, eventId: eventId };
    fbq("init", pixelId);
    fbq("track", "PageView", {}, { eventID: eventId });
  })("${id}");`;
}
