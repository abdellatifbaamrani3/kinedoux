"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, ShoppingBag, X } from "lucide-react";

import { useLocale } from "@/i18n/locale-context";
import { localePath, stripLocale } from "@/i18n/locale";
import { uiCopy } from "@/i18n/ui";
import { cn, whatsappLink } from "@/lib/utils";
import { selectCount, useCartStore } from "@/store/useCartStore";
import { BrandLogo } from "./BrandLogo";
import { LanguageSwitch } from "./LanguageSwitch";

export function Header() {
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const navOpen = useCartStore((s) => s.isMobileNavOpen);
  const setMobileNav = useCartStore((s) => s.setMobileNav);
  const count = selectCount(items);
  const locale = useLocale();
  const ui = uiCopy(locale);
  const barePath = stripLocale(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-dark">
      <div className="kd-container flex h-[68px] items-center justify-between gap-2 sm:gap-3 md:h-[84px]">
        <BrandLogo light />

        <nav className="hidden items-center gap-6 text-sm font-bold text-white/80 lg:flex" aria-label={ui.mainNav}>
          {ui.nav.map((item) => {
            const active = barePath === item.href;
            return (
              <Link
                key={item.href}
                href={localePath(item.href, locale)}
                className={cn("relative py-1 transition hover:text-white", active && "text-leaf")}
              >
                {item.label}
                {active ? <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-brand" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden text-end text-[11px] font-bold leading-4 text-leaf xl:block">{ui.deskChip}</span>
          <LanguageSwitch />
          <a
            href={whatsappLink(ui.whatsappMessage)}
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 lg:flex"
            aria-label={ui.whatsapp}
          >
            <Phone className="h-4 w-4" />
            {ui.whatsapp}
          </a>
          <button
            type="button"
            onClick={openCart}
            className="flex items-center gap-2 rounded-full bg-[#F97316] px-3 py-2.5 text-white transition hover:bg-[#EA580C] md:px-4"
            aria-label={ui.openCart}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden font-bold md:inline">{ui.cart}</span>
            {count > 0 ? (
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-extrabold text-[#F97316] tabular-nums">
                {count}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white lg:hidden"
            onClick={() => setMobileNav(!navOpen)}
            aria-label={navOpen ? ui.closeMenu : ui.openMenu}
          >
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {navOpen ? (
        <nav className="border-t border-white/10 bg-brand-dark lg:hidden" aria-label={ui.mobileNav}>
          <div className="kd-container flex flex-col py-3">
            {ui.nav.map((item) => (
              <Link
                key={item.href}
                href={localePath(item.href, locale)}
                onClick={() => setMobileNav(false)}
                className={cn(
                  "border-b border-white/5 py-3 text-base font-bold",
                  barePath === item.href ? "text-leaf" : "text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
            <a href={whatsappLink(ui.whatsappMessage)} className="py-3 text-base font-bold text-leaf">
              {ui.whatsappLong}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
