import Link from "next/link";
import { ShieldCheck, Truck, BadgeCheck, Phone } from "lucide-react";

import { getLocale } from "@/i18n/get-locale";
import { localePath } from "@/i18n/locale";
import { uiCopy } from "@/i18n/ui";
import { localizeProducts } from "@/i18n/products-copy";
import { whatsappLink } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";

export async function Footer() {
  const locale = await getLocale();
  const ui = uiCopy(locale);
  const products = localizeProducts(locale);
  return (
    <footer className="mt-8 bg-brand-dark text-alabaster">
      <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
        {ui.trust.map((p) => (
          <div key={p.title} className="bg-brand-dark px-4 py-5 text-center">
            <p className="text-sm font-bold text-leaf">{p.title}</p>
            <p className="mt-1 text-xs text-alabaster/70">{p.body}</p>
          </div>
        ))}
      </div>
      <div className="kd-container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <BrandLogo light />
          <p className="mt-4 text-sm leading-7 text-alabaster/75">{ui.tagline}</p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-leaf">{ui.footerBrowse}</h3>
          <ul className="space-y-2 text-sm">
            {ui.nav.map((n) => (
              <li key={n.href}>
                <Link href={localePath(n.href, locale)} className="hover:text-leaf">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-leaf">{ui.footerProducts}</h3>
          <ul className="space-y-2 text-sm">
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={localePath(`/products/${p.slug}`, locale)} className="hover:text-leaf">
                  {p.nameAr}
                </Link>
              </li>
            ))}
            <li>
              <Link href={localePath("/collections", locale)} className="hover:text-leaf">
                {ui.footerBundle}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-leaf">{ui.footerSupport}</h3>
          <p className="text-sm leading-7 text-alabaster/75">{ui.footerHours}</p>
          <p className="mt-2 text-sm">contact@kinedoux.com</p>
          <a
            href={whatsappLink(ui.footerWhatsappMessage)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-wa px-4 py-2 text-sm font-bold text-brand-dark"
          >
            <Phone className="h-4 w-4" /> {ui.footerWhatsapp}
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="kd-container flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-alabaster/60">
          <p>© {new Date().getFullYear()} KINÉDOUX™. {ui.rights}</p>
          <p className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-leaf" /> {ui.footerCity}
            </span>
            <span className="inline-flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5 text-leaf" /> {ui.footerExchange}
            </span>
            <span className="inline-flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-leaf" /> {ui.footerShipping}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
