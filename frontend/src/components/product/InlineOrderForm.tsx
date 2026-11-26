"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { CITIES } from "@/data/cities";
import { isBundleOffer, submitLine, type Offer, type Product } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { localePath } from "@/i18n/locale";
import { uiCopy } from "@/i18n/ui";
import { api } from "@/lib/api";
import { firePurchaseOnce, settleCodOrder } from "@/lib/confirm-order";
import { validateAndFormatPhone } from "@/lib/phone";
import { trackStore } from "@/lib/store-track";
import { getTrackingContext, identifyUserOnWebPixels, makeEventId, trackEvent } from "@/lib/tracking";
import { trackWhatsappClick } from "@/lib/whatsapp-track";
import { cn, whatsappLink } from "@/lib/utils";
import { offerOrderText } from "./offer-card-copy";
import { OrderBump } from "./OrderBump";

const fieldClass =
  "min-h-12 w-full rounded-[10px] border border-transparent bg-alabaster px-4 text-base text-brand-dark outline-none focus:border-brand/20";

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
  const [submitCount, setSubmitCount] = useState(0);
  const checkoutSent = useRef(false);
  const lock = useRef(false);

  const phoneResult = useMemo(() => validateAndFormatPhone(phone, locale), [phone, locale]);
  const nameOk = name.trim().length >= 3;
  const cityOk = (CITIES as readonly string[]).includes(city);
  const canSubmit = nameOk && phoneResult.isValid && cityOk && !submitting;
  const line = submitLine(product, offer);
  const showNameError = submitCount > 0 && !nameOk;
  const showCityError = submitCount > 0 && !cityOk;
  const phoneError =
    phone.length > 0 && !phoneResult.isValid
      ? phoneResult.errorMessage
      : submitCount > 0 && !phoneResult.isValid
        ? phoneResult.errorMessage || ui.phoneHint
        : null;

  function noteCheckout() {
    if (checkoutSent.current) return;
    checkoutSent.current = true;
    trackEvent("InitiateCheckout", {
      value: offer.price,
      currency: "MAD",
      contents: [
        {
          id: line.product_slug,
          quantity: offer.units,
          item_price: offer.price,
          name: isBundleOffer(offer) ? offer.title : product.nameAr,
        },
      ],
    });
    trackStore("checkout_started", { product_slug: line.product_slug, value_mad: offer.price });
  }

  function markField(field: "name" | "phone" | "city" | "address", ok: boolean) {
    if (!ok) return;
    try {
      const key = `kd_field_${field}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* still send */
    }
    trackStore("form_field_completed", { product_slug: line.product_slug, metadata: { field } });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (lock.current) return;
    onBuyTap();
    noteCheckout();
    trackStore("order_submit_attempt", { product_slug: line.product_slug, value_mad: offer.price });
    setError(null);
    if (!canSubmit) {
      setSubmitCount((count) => count + 1);
      const message = !nameOk ? ui.nameError : !phoneResult.isValid ? phoneResult.errorMessage || ui.phoneHint : ui.cityError;
      const focusId = !nameOk ? "order-name" : !phoneResult.isValid ? "order-phone" : "order-city";
      document.getElementById(focusId)?.focus();
      trackStore("order_submit_error", { product_slug: line.product_slug, metadata: { message: message.slice(0, 180) } });
      return;
    }
    lock.current = true;
    setSubmitting(true);
    const eventId = makeEventId("Purchase");
    const fullName = name.trim();
    const addressLine = address.trim();
    let customerName = `${fullName} — ${city}`;
    if (addressLine) {
      const withAddress = `${customerName} — ${addressLine}`;
      customerName = withAddress.length <= 200 ? withAddress : customerName;
    }
    try {
      identifyUserOnWebPixels(phoneResult, fullName);
      const order = await api.createOrder({
        customer_name: customerName,
        customer_phone: phone,
        items: [{ product_slug: line.product_slug, offer_id: line.offer_id, quantity: 1, is_cross_sell: false }],
        event_id: eventId,
        tracking: getTrackingContext(),
      });
      const settled = await settleCodOrder(order);
      firePurchaseOnce(settled);
      router.push(localePath(`/thank-you?order_id=${settled.id}`, locale));
    } catch (err) {
      lock.current = false;
      setSubmitting(false);
      const message = err instanceof Error ? err.message : ui.orderError;
      setError(message);
      trackStore("order_submit_error", { product_slug: line.product_slug, metadata: { message: message.slice(0, 180) } });
    }
  }

  return (
    <form id="order" className="scroll-mt-32 space-y-3 rounded-2xl border border-brand/10 bg-white p-4" onSubmit={onSubmit} onFocus={noteCheckout}>
      <label className="block" htmlFor="order-name">
        <span className="mb-1 block text-kd-label font-bold text-brand-dark">{ui.fieldName}</span>
        <input
          id="order-name"
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            markField("name", e.target.value.trim().length >= 3);
          }}
          placeholder={ui.namePlaceholder}
          autoComplete="name"
          aria-invalid={showNameError}
          className={cn(fieldClass, showNameError && "border-coral/40")}
        />
        {showNameError ? <p className="mt-1 text-kd-small font-medium text-coral">{ui.nameError}</p> : null}
      </label>
      <label className="block" htmlFor="order-phone">
        <span className="mb-1 block text-kd-label font-bold text-brand-dark">{ui.fieldPhone}</span>
        <input
          id="order-phone"
          name="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            markField("phone", validateAndFormatPhone(e.target.value, locale).isValid);
          }}
          placeholder={ui.orderPhonePlaceholder}
          dir="ltr"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={Boolean(phoneError)}
          className={cn(fieldClass, "text-left font-sans tabular-nums", phoneError && "border-coral/40")}
        />
        <p className="mt-1 text-kd-small font-medium leading-6 text-muted">{ui.phoneHint}</p>
        {phoneError ? <p className="mt-1 text-kd-small font-medium text-coral">{phoneError}</p> : null}
      </label>
      <label className="block" htmlFor="order-city">
        <span className="mb-1 block text-kd-label font-bold text-brand-dark">{ui.fieldCity}</span>
        <select
          id="order-city"
          name="city"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            markField("city", (CITIES as readonly string[]).includes(e.target.value));
          }}
          aria-invalid={showCityError}
          className={cn(fieldClass, showCityError && "border-coral/40")}
        >
          <option value="">{ui.chooseCity}</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {showCityError ? <p className="mt-1 text-kd-small font-medium text-coral">{ui.cityError}</p> : null}
      </label>
      <label className="block" htmlFor="order-address">
        <span className="mb-1 block text-kd-label font-bold text-brand-dark">{ui.fieldAddress}</span>
        <input
          id="order-address"
          name="street-address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            markField("address", e.target.value.trim().length > 0);
          }}
          placeholder={ui.addressPlaceholder}
          autoComplete="street-address"
          maxLength={120}
          className={fieldClass}
        />
      </label>
      {error ? <p className="text-kd-secondary font-bold text-coral">{error}</p> : null}
      <OrderBump product={product} />
      <button
        type="submit"
        className="kd-order-shine inline-flex min-h-12 w-full items-center justify-center rounded-full bg-action px-4 text-center text-kd-button font-bold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? ui.confirming : offerOrderText(product, offer, locale)}
      </button>
      <p className="text-center text-kd-small font-medium leading-6 text-muted">{ui.orderCallNote}</p>
      <a
        href={whatsappLink(ui.askProduct(product.nameAr.replace(/^كينيدو\s+/, "")))}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsappClick(product.slug, product.nameAr)}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border-2 border-wa bg-white px-4 text-center text-kd-button font-bold text-[#075E54] hover:bg-sage"
      >
        {ui.orderAsk}
      </a>
    </form>
  );
}
