"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ShieldCheck, Truck, Wallet } from "lucide-react";

import { useLocale } from "@/i18n/locale-context";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { defaultOffer, type Offer, type Product } from "@/data/products";
import { trackStore } from "@/lib/store-track";
import { trackEvent } from "@/lib/tracking";
import { ProductGallery } from "./ProductGallery";
import { OfferTierSelector } from "./OfferTierSelector";
import { StickyAddToCart } from "./StickyAddToCart";
import { InlineOrderForm } from "./InlineOrderForm";
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
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const isCheckoutOpen = useCartStore((s) => s.isCheckoutOpen);
  const locale = useLocale();
  const ui = uiCopy(locale);
  const [offer, setOffer] = useState(() => defaultOffer(product));
  const trackedOffer = useRef<string | null>(null);

  useEffect(() => {
    const first = defaultOffer(product);
    setOffer(first);
    trackedOffer.current = null;
    trackEvent("ViewContent", {
      value: first.price,
      currency: "MAD",
      contents: [{ id: product.slug, quantity: first.units, item_price: first.price, name: product.nameAr }],
    });
    trackStore("product_view", { product_slug: product.slug, value_mad: first.price });
  }, [product]);

  function trackAdd(next: Offer) {
    if (trackedOffer.current === next.id) return;
    trackedOffer.current = next.id;
    trackEvent("AddToCart", {
      value: next.price,
      currency: "MAD",
      contents: [{ id: product.slug, quantity: next.units, item_price: next.price, name: product.nameAr }],
    });
    trackStore("add_to_cart", { product_slug: product.slug, value_mad: next.price });
  }

  function choose(next: Offer) {
    setOffer(next);
    trackStore("variant_select", {
      product_slug: product.slug,
      value_mad: next.price,
      metadata: { offer_id: next.id, units: next.units },
    });
    trackAdd(next);
  }

  function scrollToForm() {
    trackAdd(offer);
    const el = document.getElementById("order-form");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    const field = el?.querySelector("input");
    if (field instanceof HTMLElement) field.focus();
  }

  const save = offer.compareAt - offer.price;

  return (
    <>
      <section className="bg-alabaster pt-4 lg:pt-10">
        <div className="kd-container">
          <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-14">
            <div className="lg:order-2">
              <div className="flex items-start gap-3 lg:block">
                <div className="w-[42%] shrink-0 lg:w-auto">
                  <ProductGallery product={product} />
                </div>
                <div className="min-w-0 flex-1 lg:hidden">
                  <h1 className="text-2xl font-bold leading-snug text-brand-dark">{product.nameAr}</h1>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{product.heroHook.title}</p>
                  <PriceBlock offer={offer} save={save} />
                  <button type="button" className="kd-cta mt-3 px-3 py-3 text-sm" onClick={scrollToForm}>
                    {ui.orderNow}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="hidden lg:block">
                <span className="inline-block rounded-full bg-sage px-3 py-1 text-xs font-bold text-brand">{product.category}</span>
                <h1 className="mt-3 text-4xl font-bold text-brand-dark">{product.nameAr}</h1>
                <p className="mt-2 font-sans text-sm font-semibold tracking-wide text-muted">{product.latinSubtitle}</p>
                <p className="mt-3 text-base leading-8 text-muted">{product.heroHook.title}</p>
                <PriceBlock offer={offer} save={save} />
              </div>

              <div className="mt-4">
                <OfferTierSelector offers={product.offers} selectedId={offer.id} onSelect={choose} />
              </div>

              <div className="mt-4">
                <InlineOrderForm product={product} offer={offer} onBuyTap={() => trackAdd(offer)} />
              </div>

              <ul className="mt-5 space-y-3">
                {product.bonuses.map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-muted">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage text-brand">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-brand">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
                {guaranteeTitle}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
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

      <section className="bg-brand-dark py-16 lg:py-28">
        <div className="kd-container text-center">
          <span className="mb-3 inline-block rounded-full bg-action px-3 py-1 text-xs font-bold text-white">{ui.swapPill}</span>
          <h2 className="text-3xl font-bold text-white">{finalTitle}</h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-leaf/80">{finalSub}</p>
          <button type="button" className="kd-cta mx-auto mt-8 sm:w-auto" onClick={scrollToForm}>
            {ui.addCta(money(offer.price, locale))}
          </button>
          <p className="mt-5 text-sm text-leaf/70">{finalNote}</p>
        </div>
      </section>

      <div className="pb-[88px] lg:pb-0" />
      {!isCartOpen && !isCheckoutOpen ? <StickyAddToCart product={product} offer={offer} onAdd={scrollToForm} /> : null}
    </>
  );
}

function PriceBlock({ offer, save }: { offer: Offer; save: number }) {
  const locale = useLocale();
  const ui = uiCopy(locale);
  return (
    <div className="mt-3">
      <p className="flex flex-wrap items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums text-brand-dark">{money(offer.price, locale)}</span>
        {save > 0 ? <span className="text-sm tabular-nums text-muted line-through">{money(offer.compareAt, locale)}</span> : null}
      </p>
      <p className="mt-2 inline-flex rounded-full bg-sage px-3 py-1 text-xs font-bold text-brand">{ui.payOnDelivery}</p>
      <p className="mt-2 text-xs font-bold text-muted">
        {ui.trustDelivery} · {ui.shippingFree}
      </p>
    </div>
  );
}

function TrustMini({
  icon: Icon,
  title,
}: {
  icon: typeof Truck;
  title: string;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-white p-2.5 text-center ring-1 ring-brand/10">
      <Icon className="h-4 w-4 text-brand" />
      <span className="text-[11px] font-bold text-brand-dark">{title}</span>
    </div>
  );
}
