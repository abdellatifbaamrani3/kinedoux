"use client";

import type { Offer } from "@/data/products";
import { isBundleOffer } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { cn } from "@/lib/utils";
import { offerTileLabel } from "./offer-label";

export function OfferTierSelector({
  offers,
  selectedId,
  onSelect,
  name = "offer",
}: {
  offers: Offer[];
  selectedId: string;
  onSelect: (offer: Offer) => void;
  name?: string;
}) {
  const locale = useLocale();
  const ui = uiCopy(locale);
  const selected = offers.find((offer) => offer.id === selectedId) ?? offers[0];

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-bold text-brand-dark">{ui.offerPick}</legend>
      <div className="grid grid-cols-3 gap-1.5">
        {offers.map((offer) => {
          const active = offer.id === selectedId;
          const save = offer.compareAt - offer.price;
          const bundle = isBundleOffer(offer);
          return (
            <label
              key={offer.id}
              className={cn(
                "flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border-2 bg-white p-2 text-center focus-within:ring-2 focus-within:ring-action",
                active ? "border-action bg-action/10" : "border-brand/10",
              )}
            >
              <input
                type="radio"
                name={name}
                value={offer.id}
                checked={active}
                onChange={() => onSelect(offer)}
                aria-label={`${offer.title} — ${money(offer.price, locale)}`}
                className="sr-only"
              />
              <span className="text-[12px] font-bold leading-4 text-brand-dark">{offerTileLabel(offer, ui)}</span>
              {bundle ? <span className="mt-1 block whitespace-pre-line text-[10px] font-bold leading-tight text-muted">{ui.bundleNames}</span> : null}
              <span className="mt-1 text-[13px] font-bold tabular-nums leading-5 text-brand-dark">{money(offer.price, locale)}</span>
              {save > 0 ? (
                <span className="mx-auto mt-1 rounded-full bg-sage px-1.5 py-0.5 text-[10px] font-bold leading-4 text-brand">
                  {ui.offerSave(save.toLocaleString("en-US"))}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
      {selected ? <p className="mt-2 text-xs leading-5 text-muted">{selected.subtitle}</p> : null}
    </fieldset>
  );
}
