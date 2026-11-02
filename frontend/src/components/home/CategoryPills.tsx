"use client";

import type { ProductSlug } from "@/data/products";
import { useLocale } from "@/i18n/locale-context";
import { uiCopy } from "@/i18n/ui";
import { cn } from "@/lib/utils";

export type CategoryFilterId = "all" | ProductSlug;

export function CategoryPills({
  active,
  onChange,
}: {
  active: CategoryFilterId;
  onChange: (id: CategoryFilterId) => void;
}) {
  const locale = useLocale();
  const ui = uiCopy(locale);
  const names =
    locale === "ar"
      ? { lumba: "لومبا", posta: "بوسطا", calma: "كالما" }
      : { lumba: "Lumba", posta: "Posta", calma: "Calma" };
  const tabs: { id: CategoryFilterId; label: string }[] = [
    { id: "all", label: ui.catAll },
    { id: "kenidoux-lumba", label: names.lumba },
    { id: "kenidoux-posta", label: names.posta },
    { id: "kenidoux-calma", label: names.calma },
  ];

  return (
    <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label={ui.catAria}>
      {tabs.map((tab) => {
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
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
