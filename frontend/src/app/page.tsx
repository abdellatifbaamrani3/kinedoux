import Link from "next/link";
import { Check } from "lucide-react";

import { HOME } from "@/data/content";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ProductGrid } from "@/components/home/ProductGrid";
import { QuickDiagnosis } from "@/components/home/QuickDiagnosis";
import { HomeComparison } from "@/components/home/HomeComparison";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitSection } from "@/components/ui/SplitSection";
import { StickyMobileCta } from "@/components/layout/StickyMobileCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />

      <SplitSection
        eyebrow="اللي كيبان كل نهار"
        title={HOME.struggle.title}
        imageSrc={HOME.struggle.image}
        imageAlt="العياء اليومي ديال الظهر فالخدمة والسياقة"
        className="bg-alabaster"
      >
        <p>{HOME.struggle.body}</p>
        <ul className="space-y-2">
          {HOME.struggle.bullets.map((b) => (
            <li key={b} className="flex gap-2 text-[15px] font-medium text-brand-dark">
              <Check className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      </SplitSection>

      <QuickDiagnosis />

      <section className="bg-alabaster">
        <ProductGrid kicker={HOME.products.eyebrow} title={HOME.products.title} />
        <div className="kd-container pb-16">
          <div className="rounded-2xl bg-sage p-6 text-center ring-1 ring-brand/15 md:p-8">
            <h3 className="text-xl font-bold text-brand-dark">{HOME.bundle.title}</h3>
            <p className="mt-2 text-muted">{HOME.bundle.subtitle}</p>
            <Link href="/collections" className="kd-cta mx-auto mt-5 sm:w-auto">
              {HOME.bundle.cta}
            </Link>
          </div>
        </div>
      </section>

      <section className="kd-section bg-sage/70">
        <div className="kd-container">
          <SectionHeading eyebrow={HOME.failed.eyebrow} title={HOME.failed.title} />
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
            {HOME.failed.rows.map((row) => (
              <div key={row.tried} className="rounded-2xl bg-white p-5 ring-1 ring-brand/10">
                <p className="font-bold text-brand-dark">{row.tried}</p>
                <p className="mt-1 text-sm leading-7 text-muted">{row.why}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SplitSection
        id="how"
        reverse
        eyebrow={HOME.system.eyebrow}
        title={HOME.system.title}
        imageSrc={HOME.system.image}
        imageAlt={HOME.system.title}
      >
        <ol className="space-y-5">
          {HOME.system.steps.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-action text-sm font-bold text-white">
                {s.n}
              </span>
              <span>
                <span className="block font-bold text-brand-dark">{s.title}</span>
                <span className="mt-1 block text-sm text-muted">{s.body}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="rounded-xl bg-sage p-4 text-sm text-muted">{HOME.system.note}</p>
      </SplitSection>

      <HomeComparison />
      <ReviewsSection />

      <section className="kd-section bg-alabaster">
        <div className="kd-container">
          <SectionHeading eyebrow={HOME.expectations.eyebrow} title={HOME.expectations.title} />
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-sage p-6 ring-1 ring-brand/10">
              <h3 className="text-lg font-bold text-brand-dark">{HOME.expectations.yesTitle}</h3>
              <ul className="mt-4 space-y-3">
                {HOME.expectations.yes.map((x) => (
                  <li key={x} className="flex gap-2 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-6 ring-1 ring-brand/10">
              <h3 className="text-lg font-bold text-brand-dark">{HOME.expectations.noTitle}</h3>
              <ul className="mt-4 space-y-3">
                {HOME.expectations.no.map((x) => (
                  <li key={x} className="flex gap-2 text-sm text-muted">
                    <span aria-hidden>—</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <SplitSection
        id="guarantee"
        reverse
        eyebrow="14 jours · échange gratuit"
        title={HOME.guarantee.title}
        imageSrc={HOME.guarantee.image}
        imageAlt="كتفتح الكولية قدام الليفرور قبل الخلاص"
        className="bg-sage/70"
      >
        <p>{HOME.guarantee.body}</p>
        <ul className="space-y-3">
          {HOME.guarantee.points.map((p) => (
            <li key={p} className="flex gap-3 text-base text-muted">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-action" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
        <Link href="/about" className="font-bold text-brand hover:underline">
          {HOME.founder.cta} ←
        </Link>
      </SplitSection>

      <FaqAccordion />

      <section className="bg-brand-dark py-20 lg:py-28">
        <div className="kd-container text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">{HOME.finalCta.title}</h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-leaf/80">{HOME.finalCta.sub}</p>
          <Link href="/collections" className="kd-cta mx-auto mt-8 sm:w-auto">
            {HOME.finalCta.cta}
          </Link>
          <p className="mt-5 text-sm text-leaf/70">{HOME.finalCta.reassurance}</p>
        </div>
      </section>

      <StickyMobileCta href="#quiz" label="جاوب سؤالين واختار المنتوج" note="ترشيح واضح · بلا وعود طبية" />
    </>
  );
}
