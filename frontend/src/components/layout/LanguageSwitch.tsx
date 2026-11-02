"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { LOCALES, LOCALE_COOKIE, localePath, stripLocale, type Locale } from "@/i18n/locale";
import { useLocale } from "@/i18n/locale-context";
import { cn } from "@/lib/utils";

const LABELS: Record<Locale, string> = {
  ar: "عربي",
  fr: "FR",
  en: "EN",
};

export function LanguageSwitch({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: Locale) {
    setOpen(false);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    const bare = stripLocale(window.location.pathname);
    const dest = localePath(`${bare}${window.location.search}`, next);
    if (dest === `${window.location.pathname}${window.location.search}`) return;
    router.push(dest);
  }

  return (
    <div ref={root} dir="ltr" className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 rounded-full border border-white/20 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/10 sm:px-3"
      >
        {LABELS[locale]}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="Language"
          className="absolute end-0 top-[calc(100%+6px)] z-50 min-w-[7.5rem] origin-top animate-drop-down overflow-hidden rounded-2xl border border-white/15 bg-brand-dark py-1 shadow-card"
        >
          {LOCALES.map((id) => (
            <li key={id}>
              <button
                type="button"
                role="option"
                aria-selected={locale === id}
                onClick={() => choose(id)}
                className={cn(
                  "block w-full px-3 py-2 text-start text-xs font-bold transition",
                  locale === id ? "bg-white text-brand-dark" : "text-white/90 hover:bg-white/10 hover:text-white",
                )}
              >
                {LABELS[id]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
