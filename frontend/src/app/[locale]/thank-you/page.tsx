"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useLocale } from "@/i18n/locale-context";
import { localePath } from "@/i18n/locale";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { api, type ApiOrderPublic } from "@/lib/api";
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

  return (
    <section className="kd-container max-w-2xl py-16 text-center">
      <p className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage text-3xl text-brand">✓</p>
      <h1 className="kd-h1 mt-4">{ui.thanksTitle}</h1>
      <p className="mt-4 leading-8 text-muted">{ui.thanksBody}</p>
      {number ? (
        <div className="kd-card mx-auto mt-8 p-6 text-start">
          <p className="text-sm text-muted">{ui.orderNumber}</p>
          <p className="font-sans text-2xl font-extrabold tabular-nums text-brand">{number}</p>
          {total != null ? (
            <p className="mt-3 text-lg font-extrabold">
              {ui.dueAtDoor} <span className="tabular-nums">{money(total, locale)}</span>
            </p>
          ) : null}
          {order?.items?.length ? (
            <ul className="mt-4 space-y-1 text-sm">
              {order.items.map((i) => (
                <li key={i.offer_id + i.product_slug}>
                  {i.quantity}× {i.title_ar} — {money(i.price_mad, locale)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">{ui.orderMissing}</p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a href={wa} className="kd-cta bg-wa text-brand-dark hover:bg-[#1ebe5d] sm:w-auto">
          {ui.thanksWa}
        </a>
        <Link href={localePath("/", locale)} className="kd-cta-secondary">
          {ui.thanksHome}
        </Link>
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
