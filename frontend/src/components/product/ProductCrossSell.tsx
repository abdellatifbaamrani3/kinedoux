"use client";

import Link from "next/link";

import type { Product } from "@/data/products";
import { sectionImageSize } from "@/data/section-image-size";
import { useLocale } from "@/i18n/locale-context";
import { localePath } from "@/i18n/locale";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { useOfferActions } from "./offer-context";
import { SectionImage } from "./SectionImage";

export function ProductCrossSell({
  products,
  heading,
  sub,
  bundle,
}: {
  products: Product[];
  heading: string;
  sub: string;
  bundle: { title: string; subtitle: string; price: number; save: number };
}) {
  const locale = useLocale();
  const ui = uiCopy(locale);
  const { selectBundle } = useOfferActions();

  return (
    <section id="line" className="px-4 py-4 lg:px-0">
      <h2 className="text-kd-h2 font-bold text-brand-dark">{heading}</h2>
      <p className="kd-copy mt-3 text-kd-secondary text-muted">{sub}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {products.map((item) => (
          <Link
            key={item.slug}
            href={localePath(`/products/${item.slug}`, locale)}
            className="overflow-hidden rounded-2xl border border-brand/10 bg-white"
          >
            <SectionImage {...sectionImageSize(item.image)} src={item.image} alt={item.nameAr} row />
            <span className="block p-4">
              <span className="block text-kd-h3 font-bold text-brand-dark">{item.nameAr}</span>
              <span className="mt-3 block text-kd-secondary text-muted">{item.outcome}</span>
              <span className="mt-3 block text-kd-body font-bold tabular-nums text-brand-dark">{money(item.price, locale)}</span>
            </span>
          </Link>
        ))}
        <article className="flex flex-col rounded-2xl border border-brand/10 bg-white p-4">
          <p className="text-kd-small font-medium text-brand">{ui.tileBundle}</p>
          <h3 className="mt-1 text-kd-h3 font-bold text-brand-dark">{bundle.title}</h3>
          <p className="kd-copy mt-3 text-kd-secondary text-muted">{bundle.subtitle}</p>
          <p className="mt-3 text-kd-price font-bold tabular-nums text-brand-dark">{money(bundle.price, locale)}</p>
          <p className="mt-1 text-kd-small font-medium text-brand">{ui.offerSave(bundle.save.toLocaleString("en-US"))}</p>
          <button
            type="button"
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-action px-4 text-kd-button font-bold text-white hover:bg-action-hover"
            onClick={selectBundle}
          >
            {ui.orderCta(money(bundle.price, locale))}
          </button>
        </article>
      </div>
    </section>
  );
}
