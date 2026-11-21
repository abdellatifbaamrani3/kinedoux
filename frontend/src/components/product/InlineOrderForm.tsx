"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { CITIES } from "@/data/cities";
import type { Offer, Product } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { localePath } from "@/i18n/locale";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { api } from "@/lib/api";
import { firePurchaseOnce, settleCodOrder } from "@/lib/confirm-order";
import { phonePlaceholder, validateAndFormatPhone } from "@/lib/phone";
import { getTrackingContext, identifyUserOnWebPixels, makeEventId, trackEvent } from "@/lib/tracking";
import { cn } from "@/lib/utils";

export function InlineOrderForm({
  product,
  offer,
  onBuyTap,
}: {
  product: Product;
  offer: Offer;
  onBuyTap: () => void;
}) {
  const router = useRouter();
  const locale = useLocale();
  const ui = uiCopy(locale);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkoutSent = useRef(false);

  const phoneResult = useMemo(() => validateAndFormatPhone(phone, locale), [phone, locale]);
  const nameOk = name.trim().length >= 3;
  const cityOk = (CITIES as readonly string[]).includes(city);
  const canSubmit = nameOk && phoneResult.isValid && cityOk && !submitting;

  function noteCheckout() {
    if (checkoutSent.current) return;
    checkoutSent.current = true;
    trackEvent("InitiateCheckout", {
      value: offer.price,
      currency: "MAD",
      contents: [{ id: product.slug, quantity: offer.units, item_price: offer.price, name: product.nameAr }],
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    onBuyTap();
    setError(null);
    if (!canSubmit) {
      setError(!nameOk ? ui.fullName : !phoneResult.isValid ? phoneResult.errorMessage || ui.phoneHint : ui.city);
      return;
    }
    setSubmitting(true);
    const eventId = makeEventId("Purchase");
    const fullName = name.trim();
    const line = address.trim();
    let customerName = `${fullName} — ${city}`;
    if (line) {
      const withAddress = `${customerName} — ${line}`;
      customerName = withAddress.length <= 200 ? withAddress : customerName;
    }
    try {
      identifyUserOnWebPixels(phoneResult, fullName);
      const order = await api.createOrder({
        customer_name: customerName,
        customer_phone: phone,
        items: [{ product_slug: product.slug, offer_id: offer.id, quantity: 1, is_cross_sell: false }],
        event_id: eventId,
        tracking: getTrackingContext(),
      });
      const settled = await settleCodOrder(order);
      firePurchaseOnce(settled);
      router.push(localePath(`/thank-you?order_id=${settled.id}`, locale));
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : ui.orderError);
    }
  }

  return (
    <form id="order-form" className="scroll-mt-28 space-y-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-brand/10" onSubmit={onSubmit} onFocus={noteCheckout}>
      <p className="text-sm font-bold text-brand">{ui.checkoutNote}</p>
      <label className="block">
        <span className="mb-1 block text-sm font-extrabold">{ui.fullName}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={ui.namePlaceholder}
          autoComplete="name"
          required
          minLength={3}
          className={cn(
            "w-full rounded-xl border-2 bg-alabaster px-4 py-3 text-base outline-none",
            name.length === 0 ? "border-brand/15" : nameOk ? "border-brand" : "border-coral",
          )}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-extrabold">{ui.phone}</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={phonePlaceholder(locale)}
          dir="ltr"
          inputMode="numeric"
          autoComplete="tel"
          required
          className={cn(
            "w-full rounded-xl border-2 bg-alabaster px-4 py-3 text-left font-sans text-base tabular-nums outline-none",
            phone.length === 0 ? "border-brand/15" : phoneResult.isValid ? "border-brand" : "border-coral",
          )}
        />
        <p className={cn("mt-1 text-xs font-bold", phone.length > 0 && !phoneResult.isValid ? "text-coral" : "text-muted")}>
          {phone.length === 0 ? ui.phoneHint : phoneResult.isValid ? ui.phoneOk : phoneResult.errorMessage}
        </p>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-extrabold">{ui.city}</span>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className={cn(
            "w-full rounded-xl border-2 bg-alabaster px-4 py-3 text-base outline-none",
            city.length === 0 ? "border-brand/15" : cityOk ? "border-brand" : "border-coral",
          )}
        >
          <option value="">{ui.chooseCity}</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-extrabold">{ui.address}</span>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={ui.addressPlaceholder}
          autoComplete="street-address"
          maxLength={120}
          className="w-full rounded-xl border-2 border-brand/15 bg-alabaster px-4 py-3 text-base outline-none"
        />
      </label>
      {error ? <p className="rounded-xl bg-coral/10 p-3 text-sm font-bold text-coral">{error}</p> : null}
      <button type="submit" className="kd-cta" disabled={submitting}>
        {submitting ? ui.confirming : ui.addCta(money(offer.price, locale))}
      </button>
      <p className="text-center text-xs leading-6 text-muted">{ui.checkoutFoot}</p>
    </form>
  );
}
