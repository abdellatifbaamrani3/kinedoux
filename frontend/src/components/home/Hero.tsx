import Link from "next/link";
import { Check } from "lucide-react";

import { HOME } from "@/data/content";
import { IMAGES } from "@/data/images";
import { BrandImage } from "@/components/ui/BrandImage";

export function Hero() {
  return (
    <section className="overflow-hidden bg-alabaster">
      <div className="kd-container grid items-center gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="order-2 lg:order-1">
          <p className="kd-kicker">{HOME.hero.pill}</p>
          <h1 className="kd-h1 mt-3 text-balance">{HOME.hero.title}</h1>
          <p className="mt-5 max-w-[38rem] text-base leading-8 text-muted md:text-lg">{HOME.hero.subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products/kenidoux-lumba" className="kd-cta sm:w-auto">
              {HOME.hero.cta}
            </Link>
            <Link href="/collections" className="kd-cta-secondary">
              {HOME.hero.secondaryCta}
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
            {HOME.hero.proofChips.map((chip) => (
              <li key={chip} className="flex items-center gap-1.5 text-sm text-muted">
                <Check className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                {chip}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-muted">{HOME.hero.imageBadge}</p>
        </div>
        <div className="order-1 lg:order-2">
          <BrandImage
            src={IMAGES.hero}
            alt="مجموعة كينيدو: لومبا، بوسطا وكالما"
            className="mx-auto aspect-square max-w-md lg:max-w-none"
            badge={HOME.hero.imageBadge}
            priority
          />
        </div>
      </div>
    </section>
  );
}
