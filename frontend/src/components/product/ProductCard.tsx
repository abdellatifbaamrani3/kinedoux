"use client";

import Link from "next/link";

import type { Product } from "@/data/products";
import { defaultOffer } from "@/data/products";
import { formatMad } from "@/lib/utils";
import { RatingRow } from "@/components/ui/Stars";
import { useCartStore } from "@/store/useCartStore";

export function ProductCard({ product }: { product: Product }) {
  const add = useCartStore((s) => s.addOfferAndOpenCart);
  const popular = defaultOffer(product);
  const save = product.compareAt - product.price;

  return (
    <article className="kd-card flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-sage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.nameAr}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <span className="absolute top-3 right-3 max-w-[75%] rounded-full bg-brand px-3 py-1 text-[11px] font-bold leading-4 text-alabaster">
          {product.category}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-brand shadow-sm">
          {product.scarcityShort}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <RatingRow rating={product.rating} count={product.reviewCount} className="mb-3" />
        <h3 className="mb-2 text-lg font-bold leading-7 text-brand-dark">
          <Link href={`/products/${product.slug}`}>{product.cardHeading}</Link>
        </h3>
        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-6 text-muted">{product.cardSubheading}</p>
        <div className="mb-4 rounded-xl bg-sage p-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-brand">{formatMad(product.price)}</span>
            {save > 0 ? (
              <>
                <span className="text-sm tabular-nums text-muted line-through">{formatMad(product.compareAt)}</span>
                <span className="rounded-full bg-leaf/30 px-2 py-0.5 text-xs font-bold text-brand">وفّر {save} د.م</span>
              </>
            ) : (
              <span className="text-xs font-bold text-muted">التوصيل مشمول</span>
            )}
          </div>
          <p className="mt-2 text-xs font-bold text-brand">
            عرض {popular.units === 1 ? "الفردي" : `${popular.units} قطع`} بـ {formatMad(popular.price)} · توصيل مجاني
          </p>
        </div>
        <button type="button" className="kd-cta py-3 text-base" onClick={() => add(product, popular)}>
          اطلب الآن — الخلاص عند الاستلام
        </button>
        <Link href={`/products/${product.slug}`} className="mt-3 text-center text-sm font-bold text-brand hover:underline">
          التفاصيل والعروض
        </Link>
      </div>
    </article>
  );
}
