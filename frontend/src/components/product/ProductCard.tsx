"use client";

import Link from "next/link";
import Image from "next/image";

import type { Product } from "@/data/products";
import { defaultOffer } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { localePath } from "@/i18n/locale";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { RatingRow } from "@/components/ui/Stars";
import { useCartStore } from "@/store/useCartStore";

export function ProductCard({ product }: { product: Product }) {
  const add = useCartStore((s) => s.addOfferAndOpenCart);
  const locale = useLocale();
  const ui = uiCopy(locale);
  const popular = defaultOffer(product);
  const save = product.compareAt - product.price;
  const price = money(product.price, locale);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-sage shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <Link href={localePath(`/products/${product.slug}`, locale)} className="relative block aspect-[4/3] overflow-hidden bg-white">
        <Image
          src={product.image}
          alt={product.nameAr}
          fill
          sizes="(max-width: 768px) 92vw, 33vw"
          quality={70}
          unoptimized={product.image.endsWith(".svg")}
          className="object-cover transition duration-500 hover:scale-105"
        />
        <span className="absolute top-3 right-3 max-w-[75%] rounded-full bg-brand px-3 py-1 text-[11px] font-bold leading-4 text-white">
          {product.category}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-brand shadow-sm">
          {product.scarcityShort}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <RatingRow rating={product.rating} count={product.reviewCount} className="mb-3" />
        <h3 className="mb-2 text-lg font-bold leading-7 text-brand-dark">
          <Link href={localePath(`/products/${product.slug}`, locale)}>{product.cardHeading}</Link>
        </h3>
        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-6 text-muted">{product.cardSubheading}</p>
        <div className="mb-4 rounded-xl bg-white/80 p-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-brand-dark">{price}</span>
            {save > 0 ? (
              <>
                <span className="text-sm tabular-nums text-muted line-through">{money(product.compareAt, locale)}</span>
                <span className="rounded-full bg-sage-deep px-2 py-0.5 text-xs font-bold text-brand">{ui.save(save.toLocaleString("en-US"))}</span>
              </>
            ) : (
              <span className="text-xs font-bold text-muted">{ui.shippingIncluded}</span>
            )}
          </div>
          <p className="mt-2 text-xs font-bold text-brand">
            {popular.units > 1
              ? ui.popularLine(popular.units, money(popular.price, locale))
              : ui.singleLine(money(popular.price, locale))}
          </p>
        </div>
        <button type="button" className="kd-cta py-3 text-base" onClick={() => add(product, popular)}>
          {ui.addToCart}
        </button>
        <Link href={localePath(`/products/${product.slug}`, locale)} className="mt-3 text-center text-sm font-bold text-brand hover:underline">
          {ui.details}
        </Link>
      </div>
    </article>
  );
}
