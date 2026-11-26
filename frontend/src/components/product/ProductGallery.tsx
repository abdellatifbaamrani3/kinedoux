"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { Product } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { uiCopy } from "@/i18n/ui";
import { cn } from "@/lib/utils";

export function ProductGallery({ product }: { product: Product }) {
  const ui = uiCopy(useLocale());
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const slides = product.gallery.length > 0 ? product.gallery : [{ src: product.image, label: product.nameAr, alt: product.nameAr }];

  useEffect(() => {
    const root = scroller.current;
    if (!root || slides.length < 2) return;
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const next = Number((best.target as HTMLElement).dataset.index);
        if (!Number.isNaN(next)) setIndex(next);
      },
      { root, threshold: [0.6, 0.8] },
    );
    root.querySelectorAll<HTMLElement>("[data-index]").forEach((slide) => io.observe(slide));
    return () => io.disconnect();
  }, [slides.length]);

  function goTo(next: number) {
    const root = scroller.current;
    const slide = root?.querySelector<HTMLElement>(`[data-index="${next}"]`);
    slide?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  return (
    <div className="relative max-w-full bg-sage lg:overflow-hidden lg:rounded-2xl lg:border lg:border-brand/10">
      <div
        ref={scroller}
        className="flex h-[280px] w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] lg:aspect-[4/5] lg:h-auto lg:max-h-[640px] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((img, i) => (
          <div key={`${img.src}-${i}`} data-index={i} className="relative h-[280px] min-w-full shrink-0 snap-center snap-always lg:h-full">
            <Image
              src={img.src}
              alt={img.alt ?? img.label}
              width={800}
              height={1000}
              sizes="(max-width: 1024px) 100vw, 55vw"
              quality={75}
              priority={i === 0}
              fetchPriority={i === 0 ? "high" : "auto"}
              loading={i === 0 ? "eager" : "lazy"}
              unoptimized={img.src.endsWith(".svg")}
              className="absolute inset-0"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
      <span className="absolute top-3 right-3 z-[1] rounded-full bg-sage px-2.5 py-1 text-[11px] font-bold text-brand">
        {ui.payOnDelivery}
      </span>
      <span className="absolute top-3 left-3 z-[1] rounded-full border border-brand/10 bg-white px-2.5 py-1 text-[11px] font-bold text-brand-dark">
        {ui.trustShipShort}
      </span>
      {slides.length > 1 ? (
        <div className="absolute bottom-14 left-0 right-0 z-[1] flex justify-center gap-1.5 lg:bottom-3">
          {slides.map((img, i) => (
            <button
              key={`${img.src}-dot-${i}`}
              type="button"
              aria-label={img.label}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={cn("h-1.5 w-1.5 rounded-full", i === index ? "bg-white" : "bg-white/55")}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
