"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";

import { NAV } from "@/data/content";
import { cn } from "@/lib/utils";
import { selectCount, useCartStore } from "@/store/useCartStore";
import { BrandLogo } from "./BrandLogo";

export function Header() {
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const navOpen = useCartStore((s) => s.isMobileNavOpen);
  const setMobileNav = useCartStore((s) => s.setMobileNav);
  const count = selectCount(items);

  return (
    <header className="sticky top-0 z-40 border-b border-brand/10 bg-alabaster">
      <div className="kd-container flex h-[68px] items-center justify-between gap-2 sm:gap-3 md:h-[84px]">
        <BrandLogo />

        <nav className="hidden items-center gap-6 text-sm font-bold text-brand-dark lg:flex" aria-label="القائمة الرئيسية">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("relative py-1 transition hover:text-brand", active && "text-brand")}
              >
                {item.label}
                {active ? <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-leaf-deep" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCart}
            className="flex items-center gap-2 rounded-full bg-brand px-3 py-2.5 text-white transition hover:bg-brand-hover md:px-4"
            aria-label="فتح السلة"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden font-bold md:inline">سلتي</span>
            {count > 0 ? (
              <span className="rounded-full bg-leaf px-2 py-0.5 text-xs font-extrabold text-brand-dark tabular-nums">
                {count}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-brand/15 bg-white lg:hidden"
            onClick={() => setMobileNav(!navOpen)}
            aria-label={navOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {navOpen ? (
        <nav className="border-t border-brand/10 bg-alabaster lg:hidden" aria-label="قائمة الجوال">
          <div className="kd-container flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNav(false)}
                className={cn(
                  "border-b border-brand/5 py-3 text-base font-bold",
                  pathname === item.href ? "text-brand" : "text-brand-dark",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
