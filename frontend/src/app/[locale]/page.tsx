import Link from "next/link";
import { Check } from "lucide-react";

import { localeFromParams } from "@/i18n/get-locale";
import { faqCopy, homeCopy } from "@/i18n/home-copy";
import { localizeProducts } from "@/i18n/products-copy";
import { singleOffer } from "@/data/products";
import { localePath } from "@/i18n/locale";
import { uiCopy } from "@/i18n/ui";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ProductGrid } from "@/components/home/ProductGrid";
import { QuickDiagnosis } from "@/components/home/QuickDiagnosis";
import { HomeComparison } from "@/components/home/HomeComparison";
import { TrustLedger } from "@/components/home/TrustLedger";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitSection } from "@/components/ui/SplitSection";
import { StickyMobileCta } from "@/components/layout/StickyMobileCta";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await localeFromParams(params);
  const HOME = homeCopy(locale);
  const ui = uiCopy(locale);
  return (
    <>
      <Hero />
      <TrustBar />

      <SplitSection
        eyebrow={ui.struggleEyebrow}
        title={HOME.struggle.title}
        imageSrc={HOME.struggle.image}
        imageAlt={ui.struggleAlt}
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

      <QuickDiagnosis
        quiz={HOME.quiz}
        fromLabel={locale === "fr" ? "dès" : locale === "en" ? "from" : "من"}
        picks={Object.fromEntries(
          localizeProducts(locale).map((product) => [
            product.slug,
            {
              slug: product.slug,
              nameAr: product.nameAr,
              cardSubheading: product.cardSubheading,
              price: singleOffer(product).price,
            },
          ]),
        )}
      />

      <section className="bg-alabaster">
        <ProductGrid
          products={localizeProducts(locale)}
          kicker={HOME.products.eyebrow}
          title={HOME.products.title}
          subtitle={ui.productsSubtitle}
        />
        <div className="kd-container pb-16">
          <div className="rounded-2xl bg-sage p-6 text-center ring-1 ring-brand/15 md:p-8">
            <h3 className="text-xl font-bold text-brand-dark">{HOME.bundle.title}</h3>
            <p className="mt-2 text-muted">{HOME.bundle.subtitle}</p>
            <Link href={localePath("/collections", locale)} className="kd-cta mx-auto mt-5 sm:w-auto">
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
      <TrustLedger />

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
        eyebrow={ui.guaranteeEyebrow}
        title={HOME.guarantee.title}
        imageSrc={HOME.guarantee.image}
        imageAlt={ui.guaranteeAlt}
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
        <Link href={localePath("/about", locale)} className="font-bold text-brand hover:underline">
          {HOME.founder.cta} ←
        </Link>
      </SplitSection>

      <FaqAccordion items={faqCopy(locale)} title={ui.faqTitle} subtitle={ui.faqSub} />

      <section className="bg-brand-dark py-20 lg:py-28">
        <div className="kd-container text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">{HOME.finalCta.title}</h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-leaf/80">{HOME.finalCta.sub}</p>
          <Link href={localePath("/collections", locale)} className="kd-cta mx-auto mt-8 sm:w-auto">
            {HOME.finalCta.cta}
          </Link>
          <p className="mt-5 text-sm text-leaf/70">{HOME.finalCta.reassurance}</p>
        </div>
      </section>

      <StickyMobileCta href="#quiz" label={HOME.quiz.title} note={HOME.quiz.resultNote} />
    </>
  );
}
