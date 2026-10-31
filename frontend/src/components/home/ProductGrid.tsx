"use client";

import { useMemo, useState } from "react";

import { PRODUCTS } from "@/data/products";
import { CategoryPills, type CategoryFilterId } from "./CategoryPills";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductGrid({
  kicker = "Trois soins, une marque",
  title = "خط كينيدو المتخصص",
  subtitle = "ثلاثة حلول واضحة: حزام راحة الظهر، مصحح الوقفة، ووسادة/استرخاء للكتاف. كل العروض بالتوصيل المجاني والخلاص عند الاستلام.",
  showIntro = true,
}: {
  kicker?: string;
  title?: string;
  subtitle?: string;
  showIntro?: boolean;
}) {
  const [filter, setFilter] = useState<CategoryFilterId>("all");
  const items = useMemo(
    () => (filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.slug === filter)),
    [filter],
  );

  return (
    <section className={`kd-container ${showIntro ? "py-16" : "pb-12"}`} id="products">
      {showIntro ? (
        <>
          <p className="kd-kicker mb-2">{kicker}</p>
          <h2 className="kd-h2 mb-2">{title}</h2>
          <p className="mb-6 max-w-2xl text-muted">{subtitle}</p>
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
