import type { ProductSlug } from "./products";

/**
 * TODO: the real phone that calls the customer to confirm the order.
 * Empty on purpose. Do not show the WhatsApp placeholder 212600000000 as this number.
 * When this is a real line, the "شكون حنا" card, the thank-you steps, and the vCard use it.
 */
export const CONFIRMATION_PHONE = "";

/**
 * TODO: bump price in MAD for the paired product.
 * lumba → posta, posta → palma, calma → palma, palma → calma.
 * Leave the number out until you send the price. An empty price hides the checkbox and the thank-you upsell.
 * Attaching the extra item to the order is not wired. That needs your approval first.
 */
export const BUMP_PRICE_MAD: Partial<Record<ProductSlug, number>> = {};

export const BUMP_PAIR: Record<ProductSlug, ProductSlug> = {
  "kenidoux-lumba": "kenidoux-posta",
  "kenidoux-posta": "kenidoux-palma",
  "kenidoux-calma": "kenidoux-palma",
  "kenidoux-palma": "kenidoux-calma",
};

export function bumpPrice(slug: ProductSlug): number | null {
  const price = BUMP_PRICE_MAD[slug];
  if (price == null || !Number.isFinite(price) || price <= 0) return null;
  return price;
}
