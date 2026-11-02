"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, ShieldCheck, Truck, Wallet } from "lucide-react";

import { CTA_TRUST, HOME } from "@/data/content";
import { defaultOffer, type Product } from "@/data/products";
import { formatMad } from "@/lib/utils";
import { trackEvent } from "@/lib/tracking";
import { RatingRow } from "@/components/ui/Stars";
import { ProductGallery } from "./ProductGallery";
import { OfferTierSelector } from "./OfferTierSelector";
import { StickyAddToCart } from "./StickyAddToCart";
import { useCartStore } from "@/store/useCartStore";

export function ProductOfferShell({ product, children }: { product: Product; children: ReactNode }) {
  const add = useCartStore((s) => s.addOfferAndOpenCart);
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const [offer, setOffer] = useState(() => defaultOffer(product));

  useEffect(() => {
    setOffer(defaultOffer(product));
    trackEvent("ViewContent", {
      value: product.price,
      contents: [{ id: product.slug, quantity: 1, item_price: product.price, name: product.nameAr }],
    });
  }, [product]);

  const addSelected = () => add(product, offer);

  return (
    <>
      <section id="offer" className="kd-section bg-alabaster pt-6 lg:pt-10">
        <div className="kd-container">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="order-1 lg:order-2">
              <ProductGallery product={product} />
              <div className="mt-6 hidden grid-cols-3 gap-3 sm:grid">
                <TrustMini icon={Truck} title="توصيل مجاني" sub="24–48 ساعة لجميع المدن" />
                <TrustMini icon={Wallet} title="الخلاص عند الاستلام" sub="نقداً بعد فتح الكولية" />
                <TrustMini icon={ShieldCheck} title="تبديل 14 يوم" sub="عبر الواتساب بلا جدال" />
              </div>
            </div>

            <div className="order-2 lg:order-1">
              <span className="inline-block rounded-full bg-sage px-3 py-1 text-xs font-bold text-brand">
                {product.category}
              </span>
              <h1 className="mt-3 text-3xl font-bold text-brand-dark md:text-4xl">{product.nameAr}</h1>
              <p className="mt-2 font-sans text-sm font-semibold tracking-wide text-muted">{product.latinSubtitle}</p>
              <p className="mt-3 text-base leading-8 text-muted">{product.cardSubheading}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <RatingRow rating={product.rating} count={product.reviewCount} />
              </div>

              <ul className="mt-6 space-y-3">
                {product.bonuses.map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-muted">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage text-brand">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <OfferTierSelector offers={product.offers} selectedId={offer.id} onSelect={setOffer} />
              </div>

              {offer.units > 1 && offer.compareAt > offer.price ? (
                <p className="mt-4 rounded-xl bg-white p-3 text-sm font-bold text-brand shadow-card">
                  هدية أوفر: كتوفر {(offer.compareAt - offer.price).toLocaleString("en-US")} د.م، والكولية وحدة.
                </p>
              ) : null}

              <button type="button" className="kd-cta mt-5" onClick={addSelected}>
                أضف للسلة — {formatMad(offer.price)} · الخلاص عند الاستلام
              </button>
              <p className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-brand">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
                {HOME.guarantee.title}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:hidden">
                <TrustMini icon={Wallet} title="خلاص عند الباب" compact />
                <TrustMini icon={Truck} title="توصيل فابور" compact />
                <TrustMini icon={ShieldCheck} title="تبديل 14 يوم" compact />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-muted">
                {CTA_TRUST.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {children}

      <section className="bg-brand-dark py-20 lg:py-28">
        <div className="kd-container text-center">
          <span className="mb-3 inline-block rounded-full bg-action px-3 py-1 text-xs font-bold text-white">
            تبديل فابور 14 يوم
          </span>
          <h2 className="text-3xl font-bold text-white">{HOME.finalCta.title}</h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-leaf/80">{HOME.finalCta.sub}</p>
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white p-5 text-right">
            <OfferTierSelector name="final-offer" offers={product.offers} selectedId={offer.id} onSelect={setOffer} />
          </div>
          <button type="button" className="kd-cta mx-auto mt-8 sm:w-auto" onClick={addSelected}>
            أضف للسلة — {formatMad(offer.price)} · الخلاص عند الاستلام
          </button>
          <p className="mt-5 text-sm text-leaf/70">{HOME.finalCta.reassurance}</p>
        </div>
      </section>

      <div className="pb-[88px] lg:pb-0" />
      {!isCartOpen ? <StickyAddToCart product={product} offer={offer} onAdd={addSelected} /> : null}
    </>
  );
}

function TrustMini({
  icon: Icon,
  title,
  sub,
  compact,
}: {
  icon: typeof Truck;
  title: string;
  sub?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-xl bg-white p-2.5 text-center ring-1 ring-brand/10">
        <Icon className="h-4 w-4 text-brand" />
        <span className="text-[11px] font-bold text-brand-dark">{title}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white p-3 ring-1 ring-brand/10">
      <Icon className="h-5 w-5 shrink-0 text-brand" />
      <div className="text-xs">
        <p className="font-bold text-brand-dark">{title}</p>
        {sub ? <p className="text-muted">{sub}</p> : null}
      </div>
    </div>
  );
}
