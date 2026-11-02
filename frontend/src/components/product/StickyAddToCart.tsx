"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";

import type { Offer, Product } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";

export function StickyAddToCart({
  product,
  offer,
  onAdd,
}: {
  product: Product;
  offer: Offer;
  onAdd: () => void;
}) {
  const locale = useLocale();
  const ui = uiCopy(locale);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById("offer");
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible((prev) => {
          const next = !entry.isIntersecting;
          return prev !== next ? next : prev;
        });
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-brand/10 bg-white shadow-lift md:hidden"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <div className="kd-container flex h-[68px] items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-brand-dark">
            {product.nameAr} <span className="font-normal text-muted">· {offer.title}</span>
          </p>
          <p className="flex items-center gap-1 text-xs font-bold text-brand">
            <Wallet className="h-3 w-3" aria-hidden />
            {money(offer.price, locale)} · {ui.payOnDelivery}
          </p>
        </div>
        <button type="button" className="kd-cta w-auto shrink-0 px-5 py-3 text-sm" onClick={onAdd}>
          {ui.stickyAdd}
        </button>
      </div>
    </div>
  );
}
