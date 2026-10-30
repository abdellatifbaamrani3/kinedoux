"use client";

import { useMemo, useState, type FormEvent } from "react";

import { api } from "@/lib/api";
import { phonePlaceholder, validateAndFormatPhone } from "@/lib/phone";
import { getTrackingContext, identifyUserOnWebPixels, makeEventId } from "@/lib/tracking";
import { cn, formatMad } from "@/lib/utils";
import { selectTotal, useCartStore } from "@/store/useCartStore";

export function CheckoutPopupModal() {
  const open = useCartStore((s) => s.isCheckoutOpen);
  const close = useCartStore((s) => s.closeCheckout);
  const items = useCartStore((s) => s.items);
  const openUpsell = useCartStore((s) => s.setActiveOrderAndOpenUpsell);
  const total = selectTotal(items);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneResult = useMemo(() => validateAndFormatPhone(phone), [phone]);
  const nameOk = name.trim().length >= 3;
  const canSubmit = nameOk && phoneResult.isValid && items.length > 0 && !submitting;

  if (!open) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      identifyUserOnWebPixels(phoneResult, name.trim());
      const eventId = makeEventId("Purchase");
      const order = await api.createOrder({
        customer_name: name.trim(),
        customer_phone: phone,
        items: items.map((i) => ({
          product_slug: i.productSlug,
          offer_id: i.offerId,
          quantity: i.quantity,
          is_cross_sell: i.isCrossSell,
        })),
        event_id: eventId,
        tracking: getTrackingContext(),
      });
      openUpsell(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تأكيد الطلب. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-brand-dark/60" aria-label="إغلاق" onClick={close} />
      <div className="relative max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift animate-pop-in sm:rounded-3xl">
        <h2 className="text-xl font-bold">إتمام الطلب — الخلاص عند الاستلام</h2>
        <p className="mt-2 rounded-xl bg-sage px-3 py-2 text-sm font-bold text-brand">
          تفحص الكولية قبل ما تخلّص · تبديل فابور فـ 14 يوم · توصيل مجاني
        </p>

        <div className="mt-4 rounded-2xl bg-sage p-4 text-sm">
          <ul className="space-y-1.5">
            {items.map((i) => (
              <li key={i.lineId} className="flex justify-between gap-3">
                <span>
                  {i.quantity}× {i.title}
                </span>
                <span className="shrink-0 font-bold tabular-nums">{formatMad(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs">التوصيل: مجاني (0 د.م)</p>
          <p className="mt-2 text-base font-extrabold">
            المبلغ الإجمالي عند الاستلام: <span className="tabular-nums text-brand">{formatMad(total)}</span>
          </p>
        </div>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-extrabold">الاسم الكامل *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك الكامل (مثال: محمد العلمي)"
              className={cn(
                "w-full rounded-xl border-2 bg-alabaster px-4 py-3 outline-none",
                name.length === 0 ? "border-brand/15" : nameOk ? "border-brand" : "border-coral",
              )}
              autoComplete="name"
              required
              minLength={3}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-extrabold">رقم الهاتف لتأكيد الطلب *</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={phonePlaceholder()}
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              className={cn(
                "w-full rounded-xl border-2 bg-alabaster px-4 py-3 text-left font-sans tabular-nums outline-none",
                phone.length === 0 ? "border-brand/15" : phoneResult.isValid ? "border-brand" : "border-coral",
              )}
              required
            />
            {phone.length > 0 ? (
              <p className={cn("mt-1 text-xs font-bold", phoneResult.isValid ? "text-brand" : "text-coral")}>
                {phoneResult.isValid ? "✔ رقم هاتف صحيح" : phoneResult.errorMessage}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted">05XXXXXXXX أو 06XXXXXXXX</p>
            )}
          </label>
          {error ? <p className="rounded-xl bg-coral/10 p-3 text-sm font-bold text-coral">{error}</p> : null}
          <button type="submit" className="kd-cta" disabled={!canSubmit}>
            {submitting ? "جاري تأكيد الطلب..." : "تأكيد الطلب — الخلاص عند الاستلام"}
          </button>
        </form>
      </div>
    </div>
  );
}
