"use client";

import { useLocale } from "@/i18n/locale-context";
import { uiCopy } from "@/i18n/ui";
import { formatOfferAmount, offerCardView } from "./offer-card-copy";
import { useOfferActions } from "./offer-context";

export function MidOrderCta() {
  const locale = useLocale();
  const ui = uiCopy(locale);
  const { product, offer, scrollToForm } = useOfferActions();
  const card = offerCardView(product, offer, locale);
  const amount = formatOfferAmount(card.price);
  const label = locale === "ar" ? `اطلب الآن — ${amount} درهم` : ui.midOrder(amount);

  return (
    <div className="px-4 py-2 lg:px-0">
      <div className="rounded-2xl border border-brand/10 bg-white p-4">
        <p className="text-kd-h3 font-bold text-brand-dark">{card.name}</p>
        <p className="mt-1 text-kd-secondary font-bold tabular-nums text-brand-dark">
          {amount} {locale === "ar" ? "درهم" : ""}
        </p>
        <button
          type="button"
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-action px-4 text-kd-button font-bold text-white hover:bg-action-hover"
          onClick={scrollToForm}
        >
          {label}
        </button>
      </div>
    </div>
  );
}
