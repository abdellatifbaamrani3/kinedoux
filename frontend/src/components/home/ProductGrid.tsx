"use client";

import { useMemo, useState } from "react";

import type { Product } from "@/data/products";
import { uiCopy } from "@/i18n/ui";
import { useLocale } from "@/i18n/locale-context";
import { CategoryPills, type CategoryFilterId } from "./CategoryPills";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductGrid({
  products,
  kicker,
  title,
  subtitle,
  showIntro = true,
}: {
  products: Product[];
  kicker?: string;
  title?: string;
  subtitle?: string;
  showIntro?: boolean;
}) {
  const ui = uiCopy(useLocale());
  const [filter, setFilter] = useState<CategoryFilterId>("all");
  const items = useMemo(
    () => (filter === "all" ? products : products.filter((p) => p.slug === filter)),
    [filter, products],
  );

  return (
    <section className={`kd-container ${showIntro ? "py-16" : "pb-12"}`} id="products">
      {showIntro ? (
        <>
          <p className="kd-kicker mb-2">{kicker}</p>
          <h2 className="kd-h2 mb-2">{title}</h2>
          <p className="mb-6 max-w-2xl text-muted">{subtitle ?? ui.productsSubtitle}</p>
        </>
      ) : null}
      <CategoryPills active={filter} onChange={setFilter} />
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
