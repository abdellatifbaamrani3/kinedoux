"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";

import { formatClock, formatMad } from "@/lib/utils";
import {
  getCrossSells,
  selectCount,
  selectTotal,
  useCartStore,
} from "@/store/useCartStore";

export function CartDrawer() {
  const open = useCartStore((s) => s.isCartOpen);
  const close = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const addCross = useCartStore((s) => s.addCrossSellItem);
  const checkout = useCartStore((s) => s.openCheckoutFromCart);
  const reservedUntil = useCartStore((s) => s.reservedUntil);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [open]);

  if (!open) return null;

  const total = selectTotal(items);
  const count = selectCount(items);
  const remain = reservedUntil ? Math.max(0, Math.floor((reservedUntil - now) / 1000)) : 0;
  const crosses = getCrossSells(items);

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-brand-dark/50" aria-label="إغلاق السلة" onClick={close} />
      <aside className="absolute inset-y-0 left-0 flex w-full max-w-md animate-slide-in-left flex-col bg-alabaster shadow-lift">
        <header className="flex items-center justify-between border-b border-brand/10 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-bold">سلة طلباتك من كينيدو</h2>
            {remain > 0 ? (
              <p className="mt-1 text-xs font-bold text-brand">طلبك محجوز مع التوصيل المجاني لمدة {formatClock(remain)}</p>
            ) : null}
          </div>
          <button type="button" onClick={close} className="rounded-full p-2 hover:bg-sage" aria-label="إغلاق">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 rounded-xl bg-sage p-3 text-sm font-bold text-brand">
            التوصيل مجاني + دليل الروتين اليومي مع كل طلب
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full w-full bg-brand" />
            </div>
          </div>

          {items.length === 0 ? (
            <p className="py-10 text-center text-muted">سلتك فارغة. اكتشف خط كينيدو.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.lineId} className="flex gap-3 rounded-xl bg-white p-3 shadow-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-5">{item.title}</p>
                    <p className="mt-1 text-sm font-bold tabular-nums text-brand">{formatMad(item.price)}</p>
                    {item.compareAtPrice > item.price ? (
                      <p className="text-xs tabular-nums text-muted line-through">{formatMad(item.compareAtPrice)}</p>
                    ) : null}
                    <div className="mt-2 flex items-center gap-2">
                      <button type="button" className="rounded-full border p-1" onClick={() => setQty(item.lineId, item.quantity - 1)}>
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                      <button type="button" className="rounded-full border p-1" onClick={() => setQty(item.lineId, item.quantity + 1)}>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" className="mr-auto text-xs text-coral" onClick={() => removeItem(item.lineId)}>
                        حذف
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {crosses.length > 0 ? (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-bold text-brand">كمّل نفس الكولية، بلا توصيل زايد</h3>
              <p className="mb-3 text-xs text-muted">إضافات تُشحن مع طلبك الحالي</p>
              <div className="space-y-3">
                {crosses.map((p) => (
                  <div key={p.slug} className="flex gap-3 rounded-xl border border-leaf/50 bg-white p-3">
                    <Link href={`/products/${p.slug}`} onClick={close}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.nameAr} className="h-16 w-16 rounded-lg object-cover" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${p.slug}`} onClick={close} className="text-sm font-bold hover:underline">
                        {p.nameAr}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">{p.crossSellPitches[items[0]?.productSlug] ?? p.cardSubheading}</p>
                      <p className="mt-1 text-sm font-bold text-brand">
                        +{formatMad(p.crossSellPrice)}{" "}
                        <span className="text-xs font-medium text-muted line-through">{formatMad(p.price)}</span>
                      </p>
                      <button
                        type="button"
                        className="mt-2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white"
                        onClick={() => addCross(p)}
                      >
                        + أضف للسلة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <footer className="border-t border-brand/10 bg-white p-5">
          <div className="mb-3 flex justify-between text-sm">
            <span>المجموع الفرعي ({count})</span>
            <span className="font-bold tabular-nums">{formatMad(total)}</span>
          </div>
          <div className="mb-3 flex justify-between text-sm">
            <span>التوصيل</span>
            <span className="font-bold text-brand">مجاني 0 د.م</span>
          </div>
          <div className="mb-4 flex justify-between text-base font-bold">
            <span>المجموع شامل التوصيل</span>
            <span className="tabular-nums text-brand">{formatMad(total)}</span>
          </div>
          <button type="button" className="kd-cta" disabled={!items.length} onClick={checkout}>
            إتمام الطلب — الخلاص عند الاستلام
          </button>
        </footer>
      </aside>
    </div>
  );
}
