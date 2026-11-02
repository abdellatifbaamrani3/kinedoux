import type { Metadata } from "next";
import Link from "next/link";

import { localeFromParams } from "@/i18n/get-locale";
import { localePath } from "@/i18n/locale";
import { aboutCopy } from "@/i18n/home-copy";
import { localizeProducts } from "@/i18n/products-copy";
import { money } from "@/i18n/money";
import { uiCopy } from "@/i18n/ui";
import { ProductCard } from "@/components/product/ProductCard";
import { AlternatingSection } from "@/components/ui/AlternatingSection";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const about = aboutCopy(await localeFromParams(params));
  return { title: about.heroTitle, description: about.heroSubtitle };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await localeFromParams(params);
  const ABOUT = aboutCopy(locale);
  const products = localizeProducts(locale);
  const ui = uiCopy(locale);
  return (
    <>
      <header className="kd-container py-12">
        <p className="kd-kicker mb-3">Kinédoux · Casablanca</p>
        <h1 className="kd-h1">{ABOUT.heroTitle}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{ABOUT.heroSubtitle}</p>
        <Link href={localePath("/products/kenidoux-lumba", locale)} className="kd-cta mt-8 max-w-sm">
          {ui.addCta(money(499, locale))}
        </Link>
      </header>
      {ABOUT.sections.map((s, i) => (
        <AlternatingSection
          key={s.title}
          index={i + 1}
          title={s.title}
          body={s.body}
          bullets={[...s.bullets]}
          image={s.image}
          imageAlt={s.title}
        />
      ))}
      <section className="kd-container py-16">
        <h2 className="kd-h2 mb-6">{ui.lineTitle}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
