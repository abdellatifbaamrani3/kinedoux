import type { Metadata } from "next";
import Link from "next/link";

import { ABOUT } from "@/data/content";
import { PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { AlternatingSection } from "@/components/ui/AlternatingSection";

export const metadata: Metadata = {
  title: "قصتنا ومعايير كينيدو",
  description: ABOUT.heroSubtitle,
};

export default function AboutPage() {
  return (
    <>
      <header className="kd-container py-12">
        <p className="kd-kicker mb-3">Kinédoux · Casablanca</p>
        <h1 className="kd-h1">{ABOUT.heroTitle}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{ABOUT.heroSubtitle}</p>
        <Link href="/collections" className="kd-cta mt-8 max-w-sm">
          اكتشف خط كينيدو
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
        <h2 className="kd-h2 mb-6">الخط الكامل</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
