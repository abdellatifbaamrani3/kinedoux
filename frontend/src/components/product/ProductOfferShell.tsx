"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ShieldCheck, Truck, Wallet } from "lucide-react";

import { useLocale } from "@/i18n/locale-context";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { defaultOffer, isBundleOffer, submitLine, type Offer, type Product } from "@/data/products";
import { trackStore } from "@/lib/store-track";
import { trackEvent } from "@/lib/tracking";
import { useCartStore } from "@/store/useCartStore";
import { sectionImageSize } from "@/data/section-image-size";
import { ProductGallery } from "./ProductGallery";
import { offerOrderText } from "./offer-card-copy";
import { OfferTierSelector } from "./OfferTierSelector";
import { StickyAddToCart } from "./StickyAddToCart";
import { InlineOrderForm } from "./InlineOrderForm";
import { OfferActionsProvider } from "./offer-context";
import { SectionImage } from "./SectionImage";
import { WhatsAppFloat } from "./WhatsAppFloat";

export function ProductOfferShell({
  product,
  bundleOffer,
  children,
  finalTitle,
  finalSub,
  finalNote,
  finalImage,
}: {
  product: Product;
  bundleOffer: Offer;
  children: ReactNode;
  finalTitle: string;
  finalSub: string;
  finalNote: string;
  finalImage?: string;
}) {
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const isCheckoutOpen = useCartStore((s) => s.isCheckoutOpen);
  const locale = useLocale();
  const ui = uiCopy(locale);
  const offers = useMemo(() => {
    const own = product.offers.filter((item) => item.showInPicker !== false && !isBundleOffer(item)).slice(0, 2);
    if (product.slug === "kenidoux-palma") return own;
    return [...own, bundleOffer];
  }, [product, bundleOffer]);
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
    const line = submitLine(product, next);
    trackEvent("AddToCart", {
      value: next.price,
      currency: "MAD",
      contents: [
        {
          id: line.product_slug,
          quantity: next.units,
          item_price: next.price,
          name: isBundleOffer(next) ? next.title : product.nameAr,
        },
      ],
    });
    trackStore("add_to_cart", { product_slug: line.product_slug, value_mad: next.price });
  }

  function choose(next: Offer) {
    setOffer(next);
    const line = submitLine(product, next);
    trackStore("variant_select", {
      product_slug: line.product_slug,
      value_mad: next.price,
      metadata: { offer_id: line.offer_id, units: next.units },
    });
    trackAdd(next);
  }

  function focusOrder() {
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      document.getElementById("order-name")?.focus({ preventScroll: true });
    }, 350);
  }

  function scrollToForm() {
    trackAdd(offer);
    focusOrder();
  }

  function selectBundle() {
    choose(bundleOffer);
    focusOrder();
  }

  const trust = [
    { icon: Wallet, label: ui.trustDoor },
    { icon: Truck, label: ui.trustFree },
    { icon: ShieldCheck, label: ui.trustDays },
  ];

  return (
    <OfferActionsProvider value={{ product, offer, selectBundle, scrollToForm }}>
      <div className="overflow-x-clip lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] lg:items-start lg:gap-10 lg:px-8 lg:pt-6">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <ProductGallery product={product} />
        </div>

        <div className="relative z-10 -mt-10 min-w-0 px-4 lg:sticky lg:top-32 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:max-h-[calc(100vh-9rem)] lg:self-start lg:overflow-y-auto lg:px-0">
          <div id="offer" className="scroll-mt-32 rounded-2xl border border-brand/10 bg-white p-4">
            <h1 className="text-kd-name font-bold text-brand-dark">{product.nameAr}</h1>
            <p className="mt-3 text-kd-secondary text-muted">{product.outcome}</p>
            <p className="mt-3 text-kd-price font-bold tabular-nums text-brand-dark">{money(offer.price, locale)}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {product.chips.map((chip) => (
                <li key={chip} className="rounded-full bg-sage px-2 py-0.5 text-kd-small font-medium text-brand">
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3">
            <OfferTierSelector product={product} offers={offers} selectedId={offer.id} onSelect={choose} />
          </div>

          <div className="mt-3">
            <InlineOrderForm product={product} offer={offer} onBuyTap={() => trackAdd(offer)} />
          </div>

          <ul className="mt-3 grid grid-cols-3 gap-1.5">
            {trust.map((item) => (
              <li key={item.label} className="flex flex-col items-center gap-1 rounded-2xl border border-brand/10 bg-white px-1 py-3 text-center">
                <item.icon className="h-4 w-4 text-brand" aria-hidden />
                <span className="text-kd-small font-medium text-brand-dark">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">{children}</div>
      </div>

      <section className="px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-brand/10 bg-white text-center">
          {finalImage ? (
            <SectionImage {...sectionImageSize(finalImage)} src={finalImage} alt={finalTitle} className="rounded-none" />
          ) : null}
          <div className="px-5 py-8">
          <h2 className="text-kd-h2 font-bold text-brand-dark">{finalTitle}</h2>
          <p className="mx-auto mt-3 max-w-[36em] text-kd-secondary text-muted">{finalSub}</p>
          <button
            type="button"
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-action px-6 text-kd-button font-bold text-white hover:bg-action-hover sm:w-auto sm:px-10"
            onClick={scrollToForm}
          >
            {offerOrderText(product, offer, locale)}
          </button>
          <p className="mt-3 text-kd-small font-medium leading-6 text-muted">{finalNote}</p>
          </div>
        </div>
      </section>

      {!isCartOpen && !isCheckoutOpen ? <StickyAddToCart product={product} offer={offer} onAdd={scrollToForm} /> : null}
      {!isCartOpen && !isCheckoutOpen ? <WhatsAppFloat product={product} /> : null}
    </OfferActionsProvider>
  );
}
