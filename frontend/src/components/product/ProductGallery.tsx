"use client";

import { useState } from "react";
import Image from "next/image";

import type { Product } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { uiCopy } from "@/i18n/ui";
import { cn } from "@/lib/utils";

export function ProductGallery({ product }: { product: Product }) {
  const ui = uiCopy(useLocale());
  const [active, setActive] = useState(0);
  const current = product.gallery[active] ?? product.gallery[0];
  const cols = product.gallery.length > 4 ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-4";

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-brand/10 bg-sage shadow-card">
        <Image
          src={current.src}
          alt={current.alt ?? current.label}
          fill
          sizes="(max-width: 1024px) 92vw, 540px"
          quality={70}
          priority={active === 0}
          loading={active === 0 ? "eager" : "lazy"}
          unoptimized={current.src.endsWith(".svg")}
          className="object-cover"
        />
        <span className="absolute top-4 right-4 z-[1] rounded-full border border-leaf bg-white/95 px-3 py-1 text-xs font-bold text-brand">
          {ui.galleryBadge}
        </span>
      </div>
      <div className={cn("mt-3 grid gap-2", cols)}>
        {product.gallery.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "min-w-0 overflow-hidden rounded-xl border-2 bg-white",
              i === active ? "border-brand" : "border-transparent opacity-80 hover:opacity-100",
            )}
          >
            <span className="relative block aspect-square">
              <Image
                src={img.src}
                alt=""
                fill
                sizes="80px"
                quality={60}
                loading="lazy"
                unoptimized={img.src.endsWith(".svg")}
                className="object-cover"
              />
            </span>
            <span className="block truncate bg-alabaster px-1 py-1 text-center text-[10px] font-bold text-muted">
              {img.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
