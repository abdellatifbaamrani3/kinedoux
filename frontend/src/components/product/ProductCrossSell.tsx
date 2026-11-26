"use client";

import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { localePath } from "@/i18n/locale";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { useOfferActions } from "./offer-context";

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
    <section id="line" className="px-4 py-6 lg:px-0">
      <h2 className="text-lg font-bold text-brand-dark">{heading}</h2>
      <p className="mt-1 text-sm leading-6 text-muted">{sub}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {products.map((item) => (
          <Link
            key={item.slug}
            href={localePath(`/products/${item.slug}`, locale)}
            className="overflow-hidden rounded-2xl border border-brand/10 bg-white"
          >
            <span className="relative block aspect-[4/3] bg-sage">
              <Image
                src={item.image}
                alt={item.nameAr}
                fill
                sizes="(max-width: 640px) 92vw, 280px"
                quality={70}
                loading="lazy"
                unoptimized={item.image.endsWith(".svg")}
                className="object-cover"
              />
            </span>
            <span className="block p-4">
              <span className="block font-bold text-brand-dark">{item.nameAr}</span>
              <span className="mt-1 block text-sm leading-6 text-muted">{item.outcome}</span>
              <span className="mt-2 block text-sm font-bold tabular-nums text-brand-dark">{money(item.price, locale)}</span>
            </span>
          </Link>
        ))}
        <article className="flex flex-col rounded-2xl border border-brand/10 bg-white p-4">
          <p className="text-xs font-bold text-brand">{ui.tileBundle}</p>
          <h3 className="mt-1 font-bold text-brand-dark">{bundle.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">{bundle.subtitle}</p>
          <p className="mt-3 text-[22px] font-bold tabular-nums text-brand-dark">{money(bundle.price, locale)}</p>
          <p className="mt-1 text-xs font-bold text-brand">{ui.offerSave(bundle.save.toLocaleString("en-US"))}</p>
          <button
            type="button"
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-action px-4 text-sm font-bold text-white hover:bg-action-hover"
            onClick={selectBundle}
          >
            {ui.orderCta(money(bundle.price, locale))}
          </button>
        </article>
      </div>
    </section>
  );
}
