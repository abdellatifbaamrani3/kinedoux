"use client";

import { Check, Flame, Truck, Wallet } from "lucide-react";

import type { Offer, Product } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { cn } from "@/lib/utils";
import { formatOfferAmount, offerBlockCopy, offerCardView } from "./offer-card-copy";

export function OfferTierSelector({
  product,
  offers,
  selectedId,
  onSelect,
  name = "offer",
}: {
  product: Product;
  offers: Offer[];
  selectedId: string;
  onSelect: (offer: Offer) => void;
  name?: string;
}) {
  const locale = useLocale();
  const copy = offerBlockCopy(locale);
  const thumb = product.gallery[0]?.src ?? product.image;

  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="mb-2 w-full text-kd-h3 font-bold text-brand-dark">{copy.header}</legend>
      <ul className="flex flex-wrap gap-2">
        <li className="inline-flex items-center gap-1 rounded-full bg-sage px-2.5 py-1 text-kd-small font-medium text-brand">
          <Truck className="h-3.5 w-3.5" aria-hidden />
          {copy.ship}
        </li>
        <li className="inline-flex items-center gap-1 rounded-full bg-sage px-2.5 py-1 text-kd-small font-medium text-brand">
          <Wallet className="h-3.5 w-3.5" aria-hidden />
          {copy.door}
        </li>
      </ul>
      <div className="mt-3 grid gap-3.5">
        {offers.map((offer) => {
          const card = offerCardView(product, offer, locale);
          const active = offer.id === selectedId;
          return (
            <label
              key={offer.id}
              className={cn(
                "block cursor-pointer overflow-hidden rounded-[18px] border-2 bg-white",
                active
                  ? "border-action shadow-[0_0_0_4px_rgba(249,115,22,0.15)]"
                  : "border-slate-200",
              )}
            >
              {active ? (
                <span className="flex items-center justify-start gap-1.5 bg-action px-3 py-1.5 text-kd-small font-bold text-white">
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                  {copy.chosen}
                </span>
              ) : null}
              {card.ribbon ? (
                <span className="inline-flex items-center gap-1 bg-sage px-2.5 py-1 text-kd-small font-bold text-brand">
                  <Flame className="h-3.5 w-3.5 text-argan" aria-hidden />
                  {copy.ribbon}
                </span>
              ) : null}
              <span className="flex items-center gap-2.5 px-3 py-3">
                <input
                  type="radio"
                  name={name}
                  value={offer.id}
                  checked={active}
                  onChange={() => onSelect(offer)}
                  aria-label={`${card.name} — ${formatOfferAmount(card.price)}`}
                  className="kd-offer-radio"
                />
                <span className="relative h-16 w-16 shrink-0">
                  <img src={thumb} alt="" width={64} height={64} className="h-16 w-16 rounded-[14px] object-cover" />
                  <span className="absolute -bottom-1 -start-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-dark text-kd-small font-bold leading-none text-white">
                    {card.qty}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-kd-body font-bold leading-snug text-brand-dark">{card.name}</span>
                  {card.detail ? <span className="mt-1 block text-kd-small font-medium leading-5 text-muted">{card.detail}</span> : null}
                </span>
                <span className="shrink-0 text-end">
                  {card.oldPrice != null ? (
                    <span className="block text-kd-small font-medium text-muted line-through">{formatOfferAmount(card.oldPrice)}</span>
                  ) : null}
                  <span className="block text-kd-name font-bold tabular-nums leading-none text-brand-dark">{formatOfferAmount(card.price)}</span>
                  <span className="mt-1 block text-kd-small font-medium text-brand-dark">{locale === "ar" ? "درهم" : "DH"}</span>
                </span>
              </span>
              {card.saveLabel ? (
                <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-sage px-3 py-2">
                  <span className="text-kd-small font-bold text-brand">{card.saveLabel}</span>
                  {card.math ? <span className="text-end text-kd-small font-medium text-brand-dark">{card.math}</span> : null}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
      <p className="mt-3 text-center text-kd-small font-medium leading-6 text-muted">{copy.note}</p>
    </fieldset>
  );
}
