import Link from "next/link";
import { Check } from "lucide-react";

import { HOME } from "@/data/content";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { CredentialsStrip } from "@/components/home/CredentialsStrip";
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
      <CredentialsStrip />

      <section className="kd-section bg-alabaster">
        <div className="kd-container">
          <SectionHeading title={HOME.recognition.title} />
          <ul className="mx-auto mt-8 max-w-[38rem] space-y-4">
            {HOME.recognition.lines.map((line) => (
              <li key={line} className="flex gap-3 text-base leading-8 text-muted md:text-lg">
                <Check className="mt-1 h-5 w-5 shrink-0 text-action" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-8 max-w-[38rem] text-center text-base leading-8 text-muted md:text-lg">
            {HOME.recognition.close}
          </p>
        </div>
      </section>

      <SplitSection
        eyebrow="اللي كيبان كل نهار"
        title={HOME.struggle.title}
        imageSrc={HOME.struggle.image}
        imageAlt="العياء اليومي ديال الظهر فالخدمة والسياقة"
        className="bg-sage/70"
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

      <section id="causes" className="kd-section bg-brand-dark">
        <div className="kd-container">
          <SectionHeading
            eyebrow={HOME.causes.eyebrow}
            title={HOME.causes.title}
            sub={HOME.causes.sub}
            tone="dark"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {HOME.causes.items.map((c) => (
              <Link
                key={c.n}
                href={`/products/${c.slug}`}
                className="rounded-2xl border border-leaf/25 bg-brand-dark p-6 ring-1 ring-white/10 transition hover:-translate-y-0.5"
              >
                <p className="font-sans text-3xl font-bold text-action">{c.n}</p>
                <h3 className="mt-3 text-lg font-bold text-white">{c.title}</h3>
                <p className="mt-2 text-sm leading-7 text-leaf/80">{c.body}</p>
                <p className="mt-5 text-sm font-bold text-leaf">{c.link} ←</p>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-leaf/80">{HOME.causes.footer}</p>
        </div>
      </section>

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

      <SplitSection
        eyebrow={HOME.failed.eyebrow}
        title={HOME.failed.title}
        imageSrc={HOME.failed.image}
        imageAlt={HOME.science.title}
        className="bg-sage/70"
      >
        <div className="space-y-4">
          {HOME.failed.rows.map((row) => (
            <div key={row.tried} className="rounded-xl bg-white p-4 ring-1 ring-brand/10">
              <p className="font-bold text-brand-dark">{row.tried}</p>
              <p className="mt-1 text-sm text-muted">{row.why}</p>
            </div>
          ))}
        </div>
      </SplitSection>

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
                <span className="mt-1 block text-base text-muted">{s.body}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="rounded-xl bg-sage p-4 text-sm text-muted">{HOME.system.note}</p>
        <Link href="/collections" className="kd-cta-secondary mt-2">
          {HOME.system.cta}
        </Link>
      </SplitSection>

      <section id="materials" className="kd-section bg-brand-dark">
        <div className="kd-container">
          <SectionHeading
            eyebrow="Matières & usage"
            title="خامات مختارة لراحة يومية"
            sub="كل طبقة عندها سبب: ثبات، تهوية، وسهولة استعمال فالدار فالمغرب."
            tone="dark"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOME.materials.map((m) => (
              <article key={m.title} className="rounded-2xl border border-leaf/20 bg-white/5 p-6">
                <p className="font-sans text-sm font-bold tracking-wide text-action">{m.latin}</p>
                <h3 className="mt-2 text-lg font-bold text-white">{m.title}</h3>
                <p className="mt-2 text-sm leading-7 text-leaf/80">{m.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <HomeComparison />

      <SplitSection
        eyebrow={HOME.insight.eyebrow}
        title={HOME.insight.title}
        imageSrc={HOME.insight.image}
        imageAlt={HOME.insight.title}
        dark
      >
        <p>{HOME.insight.body}</p>
      </SplitSection>

      <section id="proof" className="kd-section bg-sage/70">
        <div className="kd-container">
          <SectionHeading eyebrow={HOME.proof.eyebrow} title={HOME.proof.title} />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {HOME.proof.cards.map((card) => (
              <article key={card.claim} className="rounded-2xl bg-white p-6 ring-1 ring-brand/10">
                <p className="font-sans text-3xl font-bold text-action">{card.number}</p>
                <p className="mt-3 font-bold text-brand-dark">{card.claim}</p>
                <p className="mt-2 text-sm text-muted">{card.source}</p>
                <p className="mt-4 rounded-xl border border-brand/10 bg-alabaster p-3 text-sm text-muted">
                  {card.limit}
                </p>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-[38rem] text-center text-sm text-muted">{HOME.proof.footer}</p>
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-action/30 bg-sage p-6 text-center">
            <p className="text-xl font-bold text-brand-dark">{HOME.proof.calloutTitle}</p>
            <p className="mt-2 text-muted">{HOME.proof.calloutBody}</p>
          </div>
        </div>
      </section>

      <section className="kd-section bg-alabaster">
        <div className="kd-container">
          <SectionHeading eyebrow={HOME.authority.eyebrow} title={HOME.authority.title} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOME.authority.points.map((p) => (
              <article key={p.title} className="rounded-2xl bg-sage p-6 ring-1 ring-brand/10">
                <h3 className="text-lg font-bold text-brand-dark">{p.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />

      <SplitSection
        eyebrow={HOME.founder.eyebrow}
        title={HOME.founder.title}
        imageSrc={HOME.founder.image}
        imageAlt={HOME.founder.title}
      >
        {HOME.founder.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <Link href="/about" className="font-bold text-brand hover:underline">
          {HOME.founder.cta} ←
        </Link>
      </SplitSection>

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
          <ol className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:justify-between">
            {HOME.expectations.timeline.map((t) => (
              <li key={t.when} className="flex-1 rounded-xl bg-sage px-4 py-3 text-center">
                <p className="kd-kicker">{t.when}</p>
                <p className="mt-1 text-sm text-muted">{t.what}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <SplitSection
        id="guarantee"
        reverse
        eyebrow="14 jours · échange gratuit"
        title={HOME.guarantee.title}
        imageSrc={HOME.guarantee.image}
        imageAlt={HOME.guarantee.title}
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
