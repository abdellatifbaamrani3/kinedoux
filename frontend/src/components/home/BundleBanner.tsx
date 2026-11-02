"use client";

import { useLocale } from "@/i18n/locale-context";
import { homeCopy } from "@/i18n/home-copy";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { IMAGES } from "@/data/images";
import { fullKitOffer } from "@/data/products";
import { localizeProduct } from "@/i18n/products-copy";
import { BrandImage } from "@/components/ui/BrandImage";
import { useCartStore } from "@/store/useCartStore";

export function BundleBanner() {
  const locale = useLocale();
  const HOME = homeCopy(locale);
  const ui = uiCopy(locale);
  const add = useCartStore((s) => s.addOfferAndOpenCart);
  const kit = fullKitOffer();
  const product = localizeProduct(kit.product, locale);
  const offer = product.offers.find((item) => item.id === kit.offer.id) ?? kit.offer;

  return (
    <section className="kd-container py-16">
      <div className="overflow-hidden rounded-3xl bg-brand-dark text-alabaster shadow-lift">
        <div className="grid items-center lg:grid-cols-2">
          <div className="p-8 md:p-12">
            <p className="kd-kicker mb-3 text-leaf">{ui.bundleKicker}</p>
            <h2 className="text-3xl font-bold leading-snug">{HOME.bundle.title}</h2>
            <p className="mt-4 text-base leading-8 text-alabaster/80">{HOME.bundle.subtitle}</p>
            <p className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-bold tabular-nums text-leaf">{money(HOME.bundle.price, locale)}</span>
              <span className="text-lg tabular-nums text-alabaster/45 line-through">{money(HOME.bundle.compareAt, locale)}</span>
              <span className="rounded-full bg-leaf px-3 py-1 text-sm font-bold text-brand-dark">
                {ui.bundleSave(money(HOME.bundle.save, locale))}
              </span>
            </p>
            <button type="button" className="kd-cta mt-6 sm:w-auto" onClick={() => add(product, offer)}>
              {HOME.bundle.cta}
            </button>
          </div>
          <BrandImage src={IMAGES.bundle} alt={ui.bundleAlt} className="aspect-[4/3] rounded-none border-0" />
        </div>
      </div>
    </section>
  );
}
