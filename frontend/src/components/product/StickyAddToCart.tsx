"use client";

import { useEffect, useState } from "react";

import type { Offer, Product } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { offerTileLabel } from "./offer-label";

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
    const el = document.getElementById("order");
    if (!el) return;
    const update = () => {
      setVisible(el.getBoundingClientRect().bottom < 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [product.slug]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-brand/10 bg-white lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-kd-small font-medium text-brand-dark">{offerTileLabel(offer, ui)}</p>
          <p className="text-kd-secondary font-bold tabular-nums text-brand-dark">{money(offer.price, locale)}</p>
        </div>
        <button type="button" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-action px-4 text-kd-button font-bold text-white hover:bg-action-hover" onClick={onAdd}>
          {ui.stickyAdd}
        </button>
      </div>
    </div>
  );
}
