"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export function FaqAccordion({
  items,
  title,
  subtitle,
}: {
  items: readonly { q: string; a: string }[];
  title: string;
  subtitle: string;
}) {
  const list = items;
  const [open, setOpen] = useState(0);
  return (
    <section className="kd-section bg-alabaster" id="faq">
      <div className="kd-container">
      <p className="kd-kicker mb-2 text-center">FAQ</p>
      <h2 className="kd-h2 mb-2 text-center">{title}</h2>
      <p className="mx-auto mb-8 max-w-2xl text-center text-muted">{subtitle}</p>
      <div className="mx-auto max-w-2xl space-y-3">
        {list.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="overflow-hidden rounded-2xl border border-brand/10 bg-white">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 p-5 text-start font-extrabold"
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
      </div>
    </section>
  );
}
