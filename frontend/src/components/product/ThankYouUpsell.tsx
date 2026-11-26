"use client";

import { bumpPrice, BUMP_PAIR } from "@/data/order-upgrade";
import { getProduct, type ProductSlug } from "@/data/products";
import { formatOfferAmount } from "./offer-card-copy";

/**
 * Hidden while the bump price is empty.
 * "إيه، زيدو" is not wired. The current upsell API uses fixed prices in backend/app/services/offers.py
 * and does not read BUMP_PRICE_MAD. Attaching this to the same order needs your approval.
 */
export function ThankYouUpsell({ productSlug }: { productSlug?: string }) {
  if (!productSlug) return null;
  const price = bumpPrice(productSlug as ProductSlug);
  const extra = getProduct(BUMP_PAIR[productSlug as ProductSlug] ?? "kenidoux-palma");
  if (price == null || !extra || !BUMP_PAIR[productSlug as ProductSlug]) return null;

  return (
    <div className="mt-6 rounded-2xl border border-brand/10 bg-white p-4 text-start">
      <p className="text-kd-secondary font-bold text-brand-dark">
        قبل ما نعيطو ليك: بغيتي تزيد {extra.nameAr} بـ {formatOfferAmount(price)} درهم فنفس الكولية؟
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="kd-cta" disabled>
          إيه، زيدو
        </button>
        <button type="button" className="kd-cta-secondary" disabled>
          لا، شكرا
        </button>
      </div>
    </div>
  );
}
