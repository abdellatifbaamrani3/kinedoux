"use client";

import type { Offer } from "@/data/products";
import { cn, formatMad } from "@/lib/utils";

export function OfferTierSelector({
  offers,
  selectedId,
  onSelect,
}: {
  offers: Offer[];
  selectedId: string;
  onSelect: (offer: Offer) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-base font-bold text-brand-dark">اختر العرض المناسب ليك ولدارك</legend>
      <div className="space-y-3">
        {offers.map((offer) => {
          const selected = offer.id === selectedId;
          const save = offer.compareAt - offer.price;
          return (
            <label
              key={offer.id}
              className={cn(
                "flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition",
                selected ? "border-brand bg-sage shadow-card" : "border-brand/10 bg-white hover:border-brand/30",
              )}
            >
              <input
                type="radio"
                name="offer"
                className="mt-1 accent-brand"
                checked={selected}
                onChange={() => onSelect(offer)}
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-brand-dark">{offer.title}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-bold",
                      offer.isDefault ? "bg-brand text-white" : "bg-sage text-brand",
                    )}
                  >
                    {offer.badge}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-muted">{offer.subtitle}</p>
                <p className="mt-2 flex flex-wrap items-baseline gap-2">
                  <span className="text-xl font-bold tabular-nums text-brand">{formatMad(offer.price)}</span>
                  {save > 0 ? (
                    <>
                      <span className="text-sm tabular-nums text-muted line-through">{formatMad(offer.compareAt)}</span>
                      <span className="text-xs font-bold text-brand">وفّر {save.toLocaleString("en-US")} د.م</span>
                      {offer.units > 1 ? (
                        <span className="text-xs text-muted">
                          ({formatMad(Math.round(offer.price / offer.units))} للقطعة)
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-xs font-bold text-muted">التوصيل مشمول</span>
                  )}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
