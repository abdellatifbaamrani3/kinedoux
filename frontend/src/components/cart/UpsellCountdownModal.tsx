"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getProduct } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { localePath } from "@/i18n/locale";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { api } from "@/lib/api";
import { fireBrowserPurchase } from "@/lib/tracking";
import { UPSELL_SECONDS, formatClock } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";

export function UpsellCountdownModal() {
  const open = useCartStore((s) => s.isUpsellOpen);
  const active = useCartStore((s) => s.activeOrder);
  const mark = useCartStore((s) => s.markOrderConfirmed);
  const router = useRouter();
  const locale = useLocale();
  const ui = uiCopy(locale);
  const [seconds, setSeconds] = useState(UPSELL_SECONDS);
  const [busy, setBusy] = useState(false);
  const finishing = useRef(false);

  useEffect(() => {
    if (!open) {
      setSeconds(UPSELL_SECONDS);
      finishing.current = false;
      return;
    }
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [open, active?.id]);

  useEffect(() => {
    if (open && seconds === 0) void decide(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, open]);

  if (!open || !active) return null;

  const offer = active.upsellOffer;
  const product = offer ? getProduct(offer.product_slug) : undefined;

  async function decide(accepted: boolean) {
    if (!active || finishing.current) return;
    finishing.current = true;
    setBusy(true);
    try {
      const done = await api.decideUpsell(active.id, {
        accepted,
        upsell_product_slug: offer?.product_slug,
        upsell_title_ar: offer?.title_ar,
        upsell_price_mad: offer?.price_mad,
        purchase_event_id: active.eventId ?? undefined,
      });
      fireBrowserPurchase({
        eventId: done.event_id || active.eventId || "",
        orderNumber: done.order_number,
        totalMad: done.total_mad,
        currency: done.currency,
        items: done.items.map((i) => ({
          slug: i.product_slug,
          name: i.title_ar,
          quantity: i.quantity * i.units,
          price: i.price_mad,
        })),
      });
      try {
        sessionStorage.setItem(`kd_purchase_${done.id}`, "1");
      } catch {
        /* private mode */
      }
      mark(done);
      router.push(localePath(`/thank-you?order_id=${done.id}`, locale));
    } catch {
      useCartStore.getState().closeUpsell();
      router.push(localePath(`/thank-you?order_id=${active.id}`, locale));
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-brand-dark/70" />
      <div className="relative max-h-[96vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift animate-pop-in sm:rounded-3xl">
        <p className="rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white">{ui.upsellBanner}</p>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm font-bold text-brand">
            <span>{ui.upsellTimer(formatClock(seconds))}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sage">
            <div
              className="h-full origin-right bg-brand"
              style={{ width: `${(seconds / UPSELL_SECONDS) * 100}%` }}
            />
          </div>
        </div>

        {offer ? (
          <div className="mt-5 rounded-2xl border border-leaf bg-sage/60 p-4">
            {product ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt={offer.title_ar} className="mb-3 h-40 w-full rounded-xl object-cover" />
            ) : null}
            <h3 className="text-lg font-extrabold leading-7">{offer.headline_ar}</h3>
            <p className="mt-2 text-sm leading-7 text-[#24323A]">{offer.pitch_ar}</p>
            <p className="mt-3 text-2xl font-extrabold tabular-nums text-brand">
              +{money(offer.price_mad, locale)} {ui.upsellOnly}
              <span className="ms-2 text-sm font-medium text-muted line-through">{money(offer.compare_at_mad, locale)}</span>
            </p>
          </div>
        ) : (
          <p className="mt-5 text-sm">{ui.upsellPreparing}</p>
        )}

        <button
          type="button"
          className="kd-cta mt-5"
          disabled={busy}
          onClick={() => void decide(true)}
        >
          {ui.upsellYes(offer ? money(offer.price_mad, locale) : money(199, locale))}
        </button>
        <button
          type="button"
          className="mt-3 w-full py-2 text-sm font-bold text-muted hover:text-brand-dark"
          disabled={busy}
          onClick={() => void decide(false)}
        >
          {ui.upsellNo}
        </button>
      </div>
    </div>
  );
}
