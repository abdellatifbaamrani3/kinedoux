"use client";

import type { ReactNode } from "react";

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
