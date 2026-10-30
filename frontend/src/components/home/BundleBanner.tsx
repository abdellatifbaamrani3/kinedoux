"use client";

import { HOME } from "@/data/content";
import { IMAGES } from "@/data/images";
import { fullKitOffer } from "@/data/products";
import { formatMad } from "@/lib/utils";
import { BrandImage } from "@/components/ui/BrandImage";
import { useCartStore } from "@/store/useCartStore";

export function BundleBanner() {
  const add = useCartStore((s) => s.addOfferAndOpenCart);
  const { product, offer } = fullKitOffer();

  return (
    <section className="kd-container py-16">
      <div className="overflow-hidden rounded-3xl bg-brand-dark text-alabaster shadow-lift">
        <div className="grid items-center lg:grid-cols-2">
          <div className="p-8 md:p-12">
            <p className="kd-kicker mb-3 text-leaf">Pack Complet</p>
            <h2 className="text-3xl font-bold leading-snug">{HOME.bundle.title}</h2>
            <p className="mt-4 text-base leading-8 text-alabaster/80">{HOME.bundle.subtitle}</p>
            <p className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-bold tabular-nums text-leaf">{formatMad(HOME.bundle.price)}</span>
              <span className="text-lg tabular-nums text-alabaster/45 line-through">{formatMad(HOME.bundle.compareAt)}</span>
              <span className="rounded-full bg-leaf px-3 py-1 text-sm font-bold text-brand-dark">
                وفّر {HOME.bundle.save} د.م مقابل الشراء فرادى
              </span>
            </p>
            <button
              type="button"
              className="kd-cta mt-6 bg-leaf text-brand-dark hover:bg-leaf-deep hover:text-white sm:w-auto"
              onClick={() => add(product, offer)}
            >
              {HOME.bundle.cta}
            </button>
          </div>
          <BrandImage src={IMAGES.bundle} alt="باقة كينيدو الشاملة" className="aspect-[4/3] rounded-none border-0" />
        </div>
      </div>
    </section>
  );
}
