"use client";

import { useState } from "react";

import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const current = product.gallery[active] ?? product.gallery[0];

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-brand/10 bg-sage shadow-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.src}
          alt={current.label}
          width={800}
          height={600}
          decoding="async"
          fetchPriority="high"
          className="aspect-[4/3] w-full object-cover"
        />
        <span className="absolute top-4 right-4 rounded-full border border-leaf bg-white/95 px-3 py-1 text-xs font-bold text-brand">
          الدار البيضاء · 14 يوم تبديل
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {product.gallery.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "overflow-hidden rounded-xl border-2 bg-white",
              i === active ? "border-brand" : "border-transparent opacity-80 hover:opacity-100",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt="" width={160} height={160} loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
            <span className="block truncate bg-alabaster px-1 py-1 text-center text-[10px] font-bold text-muted">
              {img.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
