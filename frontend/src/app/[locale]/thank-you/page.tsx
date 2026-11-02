"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { getProduct } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { localePath } from "@/i18n/locale";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { api, type ApiOrder, type ApiOrderPublic } from "@/lib/api";
import { fireBrowserPurchase } from "@/lib/tracking";
import { whatsappLink } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";

function ThankYouInner() {
  const locale = useLocale();
  const ui = uiCopy(locale);
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const last = useCartStore((s) => s.lastConfirmedOrder);
  const [order, setOrder] = useState<ApiOrderPublic | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [addState, setAddState] = useState<"idle" | "added" | "failed">("idle");

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    api
      .getOrder(orderId)
      .then((o) => {
        if (cancelled) return;
        setOrder(o);
        const key = `kd_purchase_${o.id}`;
        if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(key) && o.event_id) {
          sessionStorage.setItem(key, "1");
          fireBrowserPurchase({
            eventId: o.event_id,
            orderNumber: o.order_number,
            totalMad: o.total_mad,
            currency: o.currency,
            items: o.items.map((i) => ({
              slug: i.product_slug,
              name: i.title_ar,
              quantity: i.quantity * i.units,
              price: i.price_mad,
            })),
          });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const number = order?.order_number || last?.orderNumber;
  const total = order?.total_mad ?? last?.totalMad;
  const first = order?.customer_first_name || last?.customerName.split(" ")[0] || "";
  const wa = whatsappLink(ui.thanksWaMessage(first, number || ""));
  const offers =
    order && !order.upsell_added
      ? order.upsell_offers?.length
        ? order.upsell_offers
        : order.upsell_offer
          ? [order.upsell_offer]
          : []
      : [];

  function applyUpsell(done: ApiOrder) {
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            status: done.status,
            total_mad: done.total_mad,
            upsell_added: done.upsell_added,
            items: done.items,
            upsell_offer: done.upsell_added ? null : prev.upsell_offer,
            upsell_offers: done.upsell_added ? [] : prev.upsell_offers,
          }
        : prev,
    );
    setAddState(done.upsell_added ? "added" : "failed");
  }

  async function addUpsell(slug: string) {
    if (!orderId || busySlug) return;
    setBusySlug(slug);
    try {
      const done = await api.decideUpsell(orderId, {
        accepted: true,
        upsell_product_slug: slug,
        purchase_event_id: order?.event_id ?? undefined,
      });
      applyUpsell(done);
    } catch {
      setAddState("failed");
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <section className="bg-alabaster">
      <div className="kd-container max-w-xl py-12 text-center md:py-16">
        <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage text-2xl text-brand">✓</p>
        <p className="kd-kicker mt-4">{ui.thanksKicker}</p>
        <h1 className="kd-h1 mt-2">{first ? ui.thanksNamed(first) : ui.thanksTitle}</h1>
        <p className="mx-auto mt-4 max-w-md leading-8 text-muted">{ui.thanksSafe}</p>

        {number ? (
          <div className="kd-card mx-auto mt-8 p-6 text-start">
            <p className="text-sm text-muted">{ui.orderNumber}</p>
            <p className="font-sans text-2xl font-extrabold tabular-nums text-brand">{number}</p>
            {order?.items?.length ? (
              <ul className="mt-4 space-y-1 text-sm">
                {order.items.map((i) => (
                  <li key={i.offer_id + i.product_slug}>
                    {i.quantity}× {i.title_ar} — {money(i.price_mad, locale)}
                  </li>
                ))}
              </ul>
            ) : null}
            {total != null ? (
              <p className="mt-4 border-t border-brand/10 pt-4 text-lg font-extrabold">
                {ui.dueAtDoor} <span className="tabular-nums">{money(total, locale)}</span>
              </p>
            ) : null}
            <p className="mt-2 text-sm font-bold text-brand">{ui.thanksNoFees}</p>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">{ui.orderMissing}</p>
        )}

        {offers.length ? (
          <div className="mt-6 text-start">
            <p className="text-sm font-extrabold text-brand">{ui.thanksUpsellKicker}</p>
            <div className="mt-3 space-y-3">
              {offers.map((offer) => {
                const copy = ui.thanksUpsellOffers[offer.product_slug as keyof typeof ui.thanksUpsellOffers];
                if (!copy) return null;
                const image = getProduct(offer.product_slug)?.image;
                return (
                  <div key={offer.product_slug} className="kd-card p-4">
                    <div className="flex gap-4">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={copy.title} className="h-24 w-24 shrink-0 rounded-xl object-cover" />
                      ) : null}
                      <div>
                        <p className="font-extrabold text-brand-dark">{copy.title}</p>
                        <p className="mt-1 text-sm leading-7 text-muted">{copy.body}</p>
                        <p className="mt-2 text-lg font-extrabold tabular-nums text-brand">
                          +{money(offer.price_mad, locale)}
                          <span className="ms-2 text-sm font-medium text-muted line-through">
                            {money(offer.compare_at_mad, locale)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="kd-cta mt-4"
                      disabled={busySlug != null}
                      onClick={() => void addUpsell(offer.product_slug)}
                    >
                      {busySlug === offer.product_slug
                        ? ui.thanksUpsellBusy
                        : ui.thanksUpsellYes(money(offer.price_mad, locale))}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-sm leading-7 text-muted">{addState === "failed" ? ui.thanksUpsellFail : ui.thanksUpsellNote}</p>
          </div>
        ) : null}

        {addState === "added" ? <p className="mt-4 text-sm font-bold text-brand">{ui.thanksUpsellAdded}</p> : null}

        <ol className="mt-8 space-y-3 text-start">
          {ui.thanksSteps.map((step, i) => (
            <li key={step.title} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-brand/10">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage text-sm font-extrabold text-brand">
                {i + 1}
              </span>
              <span>
                <span className="block font-extrabold text-brand-dark">{step.title}</span>
                <span className="mt-1 block text-sm leading-7 text-muted">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={wa} className="kd-cta bg-wa text-brand-dark hover:bg-[#1ebe5d] sm:w-auto">
            {ui.thanksWa}
          </a>
          <Link href={localePath("/", locale)} className="kd-cta-secondary">
            {ui.thanksHome}
          </Link>
        </div>
      </div>
    </section>
  );
}

function ThankYouLoading() {
  const ui = uiCopy(useLocale());
  return <p className="kd-container py-20 text-center">{ui.thanksLoading}</p>;
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<ThankYouLoading />}>
      <ThankYouInner />
    </Suspense>
  );
}
