"use client";

import type { ProductSlug } from "@/data/products";
import { cn } from "@/lib/utils";

export const CATEGORY_FILTERS = [
  { id: "all", label: "الكل", en: "All kits" },
  { id: "kenidoux-lumba", label: "لومبا", en: "Relief Belts" },
  { id: "kenidoux-posta", label: "بوسطا", en: "Posture Support" },
  { id: "kenidoux-calma", label: "كالما", en: "Support Cushions" },
] as const;

export type CategoryFilterId = "all" | ProductSlug;

export function CategoryPills({
  active,
  onChange,
}: {
  active: CategoryFilterId;
  onChange: (id: CategoryFilterId) => void;
}) {
  return (
    <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="تصنيف المنتجات">
      {CATEGORY_FILTERS.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold transition",
              selected ? "bg-brand text-white shadow-card" : "bg-sage text-brand hover:bg-sage-deep",
            )}
          >
            <span className="block leading-5">{tab.label}</span>
            <span dir="ltr" className="block font-sans text-[10px] font-semibold tracking-wide opacity-80">
              {tab.en}
            </span>
          </button>
        );
      })}
    </div>
  );
}
