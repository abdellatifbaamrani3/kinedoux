"use client";

import { useEffect, useRef, useState } from "react";

import type { Product } from "@/data/products";
import { GALLERY_BLUR } from "@/data/gallery-blur";
import { useLocale } from "@/i18n/locale-context";
import { uiCopy } from "@/i18n/ui";
import { cn } from "@/lib/utils";

export function ProductGallery({ product }: { product: Product }) {
  const ui = uiCopy(useLocale());
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const slides = product.gallery.length > 0 ? product.gallery : [{ src: product.image, label: product.nameAr, alt: product.nameAr, fit: "cover" as const }];

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
    <div className="kd-hero-wrap">
      <div className="kd-hero-frame">
        <div
          ref={scroller}
          className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((img, i) => {
            const fit = img.fit ?? "cover";
            const blur = GALLERY_BLUR[img.src];
            return (
              <div key={`${img.src}-${i}`} data-index={i} className="relative h-full min-w-full shrink-0 snap-center snap-always overflow-hidden">
                {fit === "blur" ? (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 scale-[1.15] bg-cover bg-center blur-[24px] brightness-[.85]"
                    style={{ backgroundImage: `url(${img.src})` }}
                  />
                ) : null}
                <img
                  src={img.src}
                  alt={img.alt ?? img.label}
                  width={900}
                  height={1600}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "auto"}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full"
                  style={{
                    objectFit: fit === "blur" ? "contain" : "cover",
                    objectPosition: img.focus || "center",
                    backgroundImage: blur ? `url("${blur}")` : undefined,
                    backgroundSize: fit === "blur" ? "contain" : "cover",
                    backgroundPosition: img.focus || "center",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="kd-hero-fade" aria-hidden="true" />
        <span className="absolute top-3 right-3 z-[2] rounded-full bg-sage px-2.5 py-1 text-[11px] font-bold text-brand">
          {ui.payOnDelivery}
        </span>
        <span className="absolute top-3 left-3 z-[2] rounded-full border border-brand/10 bg-white px-2.5 py-1 text-[11px] font-bold text-brand-dark">
          {ui.trustShipShort}
        </span>
        {slides.length > 1 ? (
          <div className="absolute bottom-14 left-0 right-0 z-[2] flex justify-center lg:bottom-3">
            <div className="flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-1.5">
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
          </div>
        ) : null}
      </div>
    </div>
  );
}
