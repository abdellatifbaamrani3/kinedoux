"use client";

import { useState } from "react";
import Image from "next/image";

import type { Product } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { uiCopy } from "@/i18n/ui";
import { cn } from "@/lib/utils";

export function ProductGallery({ product, frameClassName }: { product: Product; frameClassName?: string }) {
  const ui = uiCopy(useLocale());
  const [active, setActive] = useState(0);
  const current = product.gallery[active] ?? product.gallery[0];
  return (
    <div>
      <div className={cn("relative aspect-square overflow-hidden rounded-2xl border border-brand/10 bg-sage shadow-card lg:aspect-[4/3]", frameClassName)}>
        <Image
          src={current.src}
          alt={current.alt ?? current.label}
          fill
          sizes="(max-width: 1024px) 42vw, 540px"
          quality={70}
          priority={active === 0}
          loading={active === 0 ? "eager" : "lazy"}
          unoptimized={current.src.endsWith(".svg")}
          className="object-cover"
        />
        <span className="absolute top-4 right-4 z-[1] hidden rounded-full border border-leaf bg-white/95 px-3 py-1 text-xs font-bold text-brand lg:inline">
          {ui.galleryBadge}
        </span>
      </div>
      <div className="mt-2 hidden grid-cols-6 gap-1 lg:grid">
        {product.gallery.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "min-w-0 overflow-hidden rounded-lg border-2 bg-white",
              i === active ? "border-brand" : "border-transparent opacity-80 hover:opacity-100",
            )}
          >
            <span className="relative block aspect-square">
              <Image
                src={img.src}
                alt=""
                fill
                sizes="64px"
                quality={60}
                loading="lazy"
                unoptimized={img.src.endsWith(".svg")}
                className="object-cover"
              />
            </span>
            <span className="block truncate bg-alabaster px-0.5 py-0.5 text-center text-[9px] font-bold leading-tight text-muted">
              {img.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
