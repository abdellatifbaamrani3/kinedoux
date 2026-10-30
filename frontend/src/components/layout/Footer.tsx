import Link from "next/link";
import { ShieldCheck, Truck, BadgeCheck, Phone } from "lucide-react";

import { NAV, TAGLINE, TRUST_PILLS } from "@/data/content";
import { PRODUCTS } from "@/data/products";
import { whatsappLink } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  return (
    <footer className="mt-8 bg-brand-dark text-alabaster">
      <div className="grid grid-cols-2 gap-px bg-brand sm:grid-cols-4">
        {TRUST_PILLS.map((p) => (
          <div key={p.title} className="bg-brand-dark px-4 py-5 text-center">
            <p className="text-sm font-bold text-leaf">{p.title}</p>
            <p className="mt-1 text-xs text-alabaster/70">{p.body}</p>
          </div>
        ))}
      </div>
      <div className="kd-container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <BrandLogo light />
          <p className="mt-4 text-sm leading-7 text-alabaster/75">{TAGLINE}</p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-leaf">تصفح كينيدو</h3>
          <ul className="space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-leaf">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-leaf">المنتجات</h3>
          <ul className="space-y-2 text-sm">
            {PRODUCTS.map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}`} className="hover:text-leaf">
                  {p.nameAr}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/collections" className="hover:text-leaf">
                الباقة الكاملة 890 د.م
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-leaf">مواكبة الزبناء</h3>
          <p className="text-sm leading-7 text-alabaster/75">الدار البيضاء · الإثنين–الأحد 09:00–21:00</p>
          <p className="mt-2 text-sm">contact@kenidoux.com</p>
          <a
            href={whatsappLink("السلام عليكم، بغيت معلومات على منتجات كينيدو")}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-wa px-4 py-2 text-sm font-bold text-brand-dark"
          >
            <Phone className="h-4 w-4" /> واتساب كينيدو
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="kd-container flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-alabaster/60">
          <p>© {new Date().getFullYear()} KINÉDOUX™ — كينيدو. جميع الحقوق محفوظة.</p>
          <p className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-leaf" /> الدار البيضاء
            </span>
            <span className="inline-flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5 text-leaf" /> تبديل 14 يوماً
            </span>
            <span className="inline-flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-leaf" /> توصيل مجاني
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
