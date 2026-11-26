"use client";

import { useEffect, useState, type ReactNode } from "react";

import type { Product } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { uiCopy } from "@/i18n/ui";
import { trackWhatsappClick } from "@/lib/whatsapp-track";
import { whatsappLink } from "@/lib/utils";

export function WhatsAppAskLink({
  product,
  className,
  children,
}: {
  product: Product;
  className?: string;
  children: ReactNode;
}) {
  const locale = useLocale();
  const ui = uiCopy(locale);
  const short = product.nameAr.replace(/^كينيدو\s+/, "");
  return (
    <a
      href={whatsappLink(ui.askProduct(short))}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackWhatsappClick(product.slug, product.nameAr)}
    >
      {children}
    </a>
  );
}

export function WhatsAppFloat({ product }: { product: Product }) {
  const locale = useLocale();
  const ui = uiCopy(locale);
  const [formInView, setFormInView] = useState(false);
  const [lift, setLift] = useState(0);

  useEffect(() => {
    const el = document.getElementById("order");
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setFormInView(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    const update = () => {
      const bar = document.querySelector("[data-sticky-open='1']");
      setLift(bar ? Math.ceil(bar.getBoundingClientRect().height) + 12 : 0);
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-sticky-open"] });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [product.slug]);

  if (formInView) return null;

  const short = product.nameAr.replace(/^كينيدو\s+/, "");
  const href = whatsappLink(ui.askProduct(short));

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ui.orderAsk}
      onClick={() => trackWhatsappClick(product.slug, product.nameAr)}
      className="fixed left-3 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-wa text-white shadow-md"
      style={{ bottom: `calc(${lift > 0 ? lift : 16}px + env(safe-area-inset-bottom))` }}
    >
      <WhatsAppGlyph />
    </a>
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 fill-current">
      <path d="M20.5 3.5A11 11 0 0 0 2.1 17.2L1 23l6-1.6A11 11 0 0 0 20.5 3.5Zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.5.9.9-3.4-.2-.3A9.1 9.1 0 1 1 12 20.5Zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.2-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 12 12 0 0 0 4.5 4 4.2 4.2 0 0 0 3.1.2 2.5 2.5 0 0 0 1.6-1.2 2 2 0 0 0 .1-1.2c-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  );
}
