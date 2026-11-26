"use client";

import { useState } from "react";

import { bumpPrice, BUMP_PAIR } from "@/data/order-upgrade";
import { getProduct, type Product } from "@/data/products";
import { formatOfferAmount } from "./offer-card-copy";

/**
 * Hidden while BUMP_PRICE_MAD has no price for this product.
 * The checkbox does not change the submitted order. Adding the item needs approval first.
 */
export function OrderBump({ product }: { product: Product }) {
  const price = bumpPrice(product.slug);
  const extra = getProduct(BUMP_PAIR[product.slug]);
  const [on, setOn] = useState(false);
  if (price == null || !extra) return null;

  const thumb = extra.gallery[0]?.src || extra.image;
  return (
    <label className="flex gap-3 rounded-2xl border border-brand/10 bg-sage/40 p-3">
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => setOn(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-[#128C7E]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumb} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
      <span>
        <span className="block text-kd-secondary font-bold text-brand-dark">
          زيد {extra.nameAr} مع نفس الكولية بـ {formatOfferAmount(price)} درهم
        </span>
        <span className="mt-1 block text-kd-small font-medium text-muted">{extra.outcome}</span>
        <span className="mt-1 block text-kd-small font-medium text-brand">التوصيل ديما فابور</span>
      </span>
    </label>
  );
}
