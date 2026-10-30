"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { FAQS } from "@/data/content";
import { cn } from "@/lib/utils";

export function FaqAccordion({ items = FAQS }: { items?: typeof FAQS }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="kd-container py-16" id="faq">
      <p className="kd-kicker mb-2">FAQ</p>
      <h2 className="kd-h2 mb-2">أسئلة شائعة، بجواب واضح</h2>
      <p className="mb-8 text-muted">التوصيل، الخلاص، القياس، ومن خاصو يشاور الطبيب قبل الاستعمال.</p>
      <div className="space-y-3">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="overflow-hidden rounded-2xl border border-brand/10 bg-white">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 p-5 text-right font-extrabold"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <ChevronDown className={cn("h-5 w-5 shrink-0 transition", isOpen && "rotate-180")} />
              </button>
              {isOpen ? <p className="border-t border-brand/5 px-5 pb-5 pt-3 leading-8 text-[#24323A]">{item.a}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
