import Link from "next/link";
import { BadgeCheck, Shield, Truck, Wallet } from "lucide-react";

import { HOME } from "@/data/content";
import { IMAGES } from "@/data/images";
import { BrandImage } from "@/components/ui/BrandImage";

const MICROS = [
  { icon: Wallet, label: "الخلاص عند الاستلام" },
  { icon: Truck, label: "توصيل مجاني 24–48س" },
  { icon: Shield, label: "تبديل فابور 14 يوم" },
  { icon: BadgeCheck, label: "فحص الكولية قبل الخلاص" },
];

export function Hero() {
  return (
    <section className="relative bg-alabaster">
      <div className="pointer-events-none absolute inset-0 overflow-clip bg-[radial-gradient(circle_at_12%_20%,#CCFBF1_0%,transparent_42%),radial-gradient(circle_at_100%_100%,#99F6E4_0%,transparent_28%)]" />
      <div className="kd-container relative flex flex-col-reverse items-center gap-10 py-12 lg:grid lg:grid-cols-2 lg:gap-12 lg:py-16">
        <div>
          <p className="mb-3 inline-block max-w-full rounded-full bg-sage px-3 py-1.5 text-xs font-bold text-brand sm:px-4 sm:text-sm">
            {HOME.hero.pill}
          </p>
          <p dir="ltr" className="mb-3 font-sans text-xs font-extrabold tracking-[0.18em] text-brand uppercase sm:text-sm">
            Experience relief. Support your back.
          </p>
          <h1 className="kd-h1">{HOME.hero.title}</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted md:text-lg">{HOME.hero.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-sage px-3 py-1 text-[11px] font-bold text-brand">Daily back support</span>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-brand-dark shadow-card">
              Casablanca · COD
            </span>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/products/kenidoux-lumba" className="kd-cta sm:w-auto">
              {HOME.hero.cta}
            </Link>
            <Link href="/collections" className="kd-cta-secondary">
              شوف الخط الكامل
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MICROS.map((m) => (
              <li key={m.label} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-brand-dark shadow-card">
                <m.icon className="h-4 w-4 text-brand" />
                {m.label}
              </li>
            ))}
          </ul>
        </div>
        <BrandImage
          src={IMAGES.hero}
          alt="مجموعة كينيدو: لومبا، بوسطا وكالما"
          className="aspect-[4/3] w-full"
          badge={HOME.hero.imageBadge}
          priority
        />
      </div>
    </section>
  );
}
