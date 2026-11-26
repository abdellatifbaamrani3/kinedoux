import { trackStore } from "./store-track";

type PixelWindow = Window & {
  fbq?: (...args: unknown[]) => void;
  ttq?: { track?: (...args: unknown[]) => void };
};

/** Custom click. Does not fire Lead or Purchase. */
export function trackWhatsappClick(productSlug: string, productName: string) {
  trackStore("whatsapp_click", {
    product_slug: productSlug,
    metadata: { product_name: productName },
  });
  const w = window as PixelWindow;
  const data = { content_name: productName, content_ids: [productSlug] };
  w.fbq?.("trackCustom", "whatsapp_click", data);
  w.ttq?.track?.("whatsapp_click", data);
}
