"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, ShoppingBag, X } from "lucide-react";

import { NAV } from "@/data/content";
import { cn, whatsappLink } from "@/lib/utils";
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-dark">
      <div className="kd-container flex h-[68px] items-center justify-between gap-2 sm:gap-3 md:h-[84px]">
        <BrandLogo light />

        <nav className="hidden items-center gap-6 text-sm font-bold text-white/80 lg:flex" aria-label="القائمة الرئيسية">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("relative py-1 transition hover:text-white", active && "text-leaf")}
              >
                {item.label}
                {active ? <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-brand" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink("السلام عليكم، بغيت نأكد طلب أو نسأل على كينيدو")}
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 md:flex"
            aria-label="واتساب كينيدو"
          >
            <Phone className="h-4 w-4" />
            واتساب
          </a>
          <button
            type="button"
            onClick={openCart}
            className="flex items-center gap-2 rounded-full bg-[#F97316] px-3 py-2.5 text-white transition hover:bg-[#EA580C] md:px-4"
            aria-label="فتح السلة"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden font-bold md:inline">سلتي</span>
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
            aria-label={navOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {navOpen ? (
        <nav className="border-t border-white/10 bg-brand-dark lg:hidden" aria-label="قائمة الجوال">
          <div className="kd-container flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNav(false)}
                className={cn(
                  "border-b border-white/5 py-3 text-base font-bold",
                  pathname === item.href ? "text-leaf" : "text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={whatsappLink("السلام عليكم، بغيت نأكد طلب أو نسأل على كينيدو")}
              className="py-3 text-base font-bold text-leaf"
            >
              واتساب كينيدو — من الدار البيضاء
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
