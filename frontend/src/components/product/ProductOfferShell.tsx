"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, ShieldCheck, Truck, Wallet } from "lucide-react";

import { useLocale } from "@/i18n/locale-context";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { defaultOffer, type Product } from "@/data/products";
import { trackEvent } from "@/lib/tracking";
import { ProductGallery } from "./ProductGallery";
import { OfferTierSelector } from "./OfferTierSelector";
import { StickyAddToCart } from "./StickyAddToCart";
import { useCartStore } from "@/store/useCartStore";

export function ProductOfferShell({
  product,
  children,
  guaranteeTitle,
  finalTitle,
  finalSub,
  finalNote,
  trustPills,
}: {
  product: Product;
  children: ReactNode;
  guaranteeTitle: string;
  finalTitle: string;
  finalSub: string;
  finalNote: string;
  trustPills: readonly string[];
}) {
  const buyNow = useCartStore((s) => s.buyNow);
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const isCheckoutOpen = useCartStore((s) => s.isCheckoutOpen);
  const locale = useLocale();
  const ui = uiCopy(locale);
  const [offer, setOffer] = useState(() => defaultOffer(product));

  useEffect(() => {
    setOffer(defaultOffer(product));
    trackEvent("ViewContent", {
      value: product.price,
      contents: [{ id: product.slug, quantity: 1, item_price: product.price, name: product.nameAr }],
    });
  }, [product]);

  const addSelected = () => buyNow(product, offer);

  return (
    <>
      <section id="offer" className="kd-section bg-alabaster pt-6 lg:pt-10">
        <div className="kd-container">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="order-1 lg:order-2">
              <ProductGallery product={product} />
              <div className="mt-6 hidden grid-cols-3 gap-3 sm:grid">
                <TrustMini icon={Truck} title={ui.trustDelivery} sub={ui.trustDeliverySub} />
                <TrustMini icon={Wallet} title={ui.trustPay} sub={ui.trustPaySub} />
                <TrustMini icon={ShieldCheck} title={ui.trustSwap} sub={ui.trustSwapSub} />
              </div>
            </div>

            <div className="order-2 lg:order-1">
              <span className="inline-block rounded-full bg-sage px-3 py-1 text-xs font-bold text-brand">
                {product.category}
              </span>
              <h1 className="mt-3 text-3xl font-bold text-brand-dark md:text-4xl">{product.nameAr}</h1>
              <p className="mt-2 font-sans text-sm font-semibold tracking-wide text-muted">{product.latinSubtitle}</p>
              <p className="mt-3 text-base leading-8 text-muted">{product.cardSubheading}</p>
              <p className="mt-3 text-sm font-bold text-brand">{ui.priceLock}</p>

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
                  {ui.giftNote((offer.compareAt - offer.price).toLocaleString("en-US"))}
                </p>
              ) : null}

              <button type="button" className="kd-cta mt-5" onClick={addSelected}>
                {ui.addCta(money(offer.price, locale))}
              </button>
              <p className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-brand">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
                {guaranteeTitle}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:hidden">
                <TrustMini icon={Wallet} title={ui.trustPayShort} compact />
                <TrustMini icon={Truck} title={ui.trustShipShort} compact />
                <TrustMini icon={ShieldCheck} title={ui.trustSwap} compact />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-muted">
                {trustPills.map((t) => (
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
            {ui.swapPill}
          </span>
          <h2 className="text-3xl font-bold text-white">{finalTitle}</h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-leaf/80">{finalSub}</p>
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white p-5 text-start">
            <OfferTierSelector name="final-offer" offers={product.offers} selectedId={offer.id} onSelect={setOffer} />
          </div>
          <button type="button" className="kd-cta mx-auto mt-8 sm:w-auto" onClick={addSelected}>
            {ui.addCta(money(offer.price, locale))}
          </button>
          <p className="mt-5 text-sm text-leaf/70">{finalNote}</p>
        </div>
      </section>

      <div className="pb-[88px] lg:pb-0" />
      {!isCartOpen && !isCheckoutOpen ? <StickyAddToCart product={product} offer={offer} onAdd={addSelected} /> : null}
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
