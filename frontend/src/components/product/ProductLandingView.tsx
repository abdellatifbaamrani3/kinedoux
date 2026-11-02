import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";

import { getLocale } from "@/i18n/get-locale";
import { comparisonFake, ctaTrust, faqCopy, homeCopy, reviewCopy } from "@/i18n/home-copy";
import { localePath } from "@/i18n/locale";
import { localizeProduct, localizeProducts } from "@/i18n/products-copy";
import { uiCopy } from "@/i18n/ui";
import type { Product } from "@/data/products";
import { ConfirmationSection } from "@/components/home/ConfirmationSection";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { TrustBar } from "@/components/home/TrustBar";
import { RatingRow, Stars } from "@/components/ui/Stars";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitSection } from "@/components/ui/SplitSection";
import { BrandImage } from "@/components/ui/BrandImage";
import { ProductCard } from "./ProductCard";
import { ProductOfferShell } from "./ProductOfferShell";

const CAUSE_INDEX: Record<string, number> = {
  "kenidoux-lumba": 1,
  "kenidoux-posta": 2,
  "kenidoux-calma": 3,
};

export async function ProductLandingView({ product: source }: { product: Product }) {
  const locale = await getLocale();
  const ui = uiCopy(locale);
  const HOME = homeCopy(locale);
  const product = localizeProduct(source, locale);
  const related = localizeProducts(locale).filter((p) => p.slug !== product.slug);
  const reviews = reviewCopy(locale).filter((r) => r.slug === product.slug);
  const shownReviews = reviews.length ? reviews : reviewCopy(locale).slice(0, 3);
  const emotional = product.sections.find((s) => s.kind === "emotional");
  const science = product.sections.find((s) => s.kind === "science");
  const materials = product.sections.find((s) => s.kind === "materials");
  const causeNumber = CAUSE_INDEX[product.slug] ?? 1;
  const fake = comparisonFake(locale);

  return (
    <>
      <div className="border-b border-brand/10 bg-alabaster">
        <div className="kd-container py-2.5 text-sm text-muted">
          <Link href={localePath("/", locale)} className="hover:text-brand">
            {ui.home}
          </Link>
          <span className="mx-2">/</span>
          <Link href={localePath("/collections", locale)} className="hover:text-brand">
            {ui.productsNav}
          </Link>
          <span className="mx-2">/</span>
          <span className="font-bold text-brand-dark">{product.nameAr}</span>
        </div>
      </div>

      <ProductOfferShell
        product={product}
        guaranteeTitle={HOME.guarantee.title}
        finalTitle={HOME.finalCta.title}
        finalSub={HOME.finalCta.sub}
        finalNote={HOME.finalCta.reassurance}
        trustPills={ctaTrust(locale)}
      >
        <TrustBar />

        <section className="kd-section bg-alabaster">
          <div className="kd-container">
            <SectionHeading
              eyebrow={ui.problem}
              title={product.heroHook.title}
              sub={product.heroHook.body}
            />
            <div className="mx-auto mt-10 grid max-w-5xl items-stretch gap-6 lg:grid-cols-2">
              <div className="flex flex-col justify-between rounded-2xl bg-coral/10 p-6 ring-1 ring-coral/20 lg:p-8">
                <div>
                  <p className="kd-kicker text-coral">{ui.problem}</p>
                  <ul className="mt-5 space-y-4">
                    {(emotional?.bullets ?? []).map((line) => (
                      <li key={line} className="flex gap-3 text-sm text-muted">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-coral" aria-hidden />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-6 text-sm font-bold text-coral">{emotional?.body}</p>
              </div>
              <div className="flex flex-col justify-between rounded-2xl bg-sage p-6 ring-1 ring-brand/10 lg:p-8">
                <div>
                  <p className="kd-kicker">{ui.solution}</p>
                  <h3 className="mt-3 text-lg font-bold text-brand-dark">{science?.title ?? product.nameAr}</h3>
                  <ul className="mt-5 space-y-3">
                    {product.bonuses.map((b) => (
                      <li key={b} className="flex gap-3 text-sm text-muted">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="#offer" className="mt-8 inline-flex items-center gap-2 font-bold text-brand">
                  {ui.chooseOffer}
                </a>
              </div>
            </div>
          </div>
        </section>

        {science ? (
          <SplitSection
            id="mechanism"
            eyebrow={ui.howEyebrow}
            title={science.title}
            imageSrc={science.image}
            imageAlt={science.title}
          >
            <p>{science.body}</p>
            <ol className="space-y-6">
              {science.bullets.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-action font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-base text-muted">{s}</span>
                </li>
              ))}
            </ol>
          </SplitSection>
        ) : null}

        {materials?.cards ? (
          <section id="materials" className="kd-section bg-sage/70">
            <div className="kd-container">
              <SectionHeading eyebrow={ui.materialsEyebrow} title={materials.title} sub={materials.body} />
              <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
                {materials.cards.map((ing) => (
                  <div key={ing.title} className="rounded-2xl bg-white p-6 ring-1 ring-brand/10">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-brand-dark">{ing.title}</p>
                      <span className="rounded-full bg-sage px-3 py-1 font-sans text-xs font-bold text-brand">
                        {ing.latin}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted">{ing.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section id="kit" className="kd-section bg-alabaster">
          <div className="kd-container">
            <SectionHeading title={product.kitTitle} />
            <div className="mt-10 grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <BrandImage
                src={product.gallery[3]?.src ?? product.image}
                alt={product.kitTitle}
                className="aspect-[4/3] max-w-md mx-auto lg:max-w-none"
              />
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {product.kitContents.map((item) => (
                  <li key={item} className="flex gap-3 rounded-xl bg-white p-4 shadow-card">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      ✔
                    </span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="comparison" className="kd-section bg-sage/70">
          <div className="kd-container">
            <SectionHeading eyebrow={ui.compareEyebrow} title={ui.compareTitle} />
            <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl bg-white ring-1 ring-brand/10">
              <div className="grid grid-cols-3 bg-brand-dark text-sm font-bold text-white">
              <div className="p-4">{ui.criterion}</div>
              <div className="p-4 text-center text-leaf">{ui.brand}</div>
              <div className="p-4 text-center">{ui.market}</div>
              </div>
              {product.comparisonOriginal.map((row, i) => (
                <div key={row} className="grid grid-cols-3 border-t border-brand/10 text-sm">
                  <div className="p-3.5 font-bold text-brand-dark">{i + 1}</div>
                  <div className="bg-sage/40 p-3.5 text-center font-bold text-brand">✔ {row}</div>
                  <div className="p-3.5 text-center text-muted">— {fake[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="reviews" className="kd-section bg-alabaster">
          <div className="kd-container">
            <SectionHeading eyebrow={HOME.reviews.eyebrow} title={HOME.reviews.title} sub={HOME.reviews.note} />
            <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_1.4fr]">
              <div className="lg:sticky lg:top-28">
                <BrandImage
                  src={product.gallery[2]?.src ?? product.image}
                  alt={product.nameAr}
                  className="mx-auto aspect-[4/5] max-w-md lg:max-w-none"
                />
                <div className="mt-4 rounded-2xl bg-sage p-4 text-center ring-1 ring-brand/10">
                  <RatingRow rating={product.rating} count={product.reviewCount} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {shownReviews.map((r) => (
                  <article key={r.name} className="flex flex-col justify-between rounded-2xl bg-white p-5 ring-1 ring-brand/10">
                    <div>
                      <Stars rating={r.stars} />
                      <p className="mt-3 text-sm leading-7 text-muted">«{r.body}»</p>
                    </div>
                    <div className="mt-4 border-t border-brand/10 pt-3">
                      <p className="text-sm font-bold text-brand-dark">{r.name}</p>
                      <p className="text-xs text-muted">{r.city} · {r.product}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="timeline" className="kd-section bg-sage">
          <div className="kd-container">
            <SectionHeading eyebrow={ui.stepsEyebrow} title={ui.stepsTitle} />
            <ol className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
              {product.steps.map((t, i) => (
                <li key={t.title} className="rounded-2xl bg-white p-5 ring-1 ring-brand/10">
                  <span className="inline-block rounded-full bg-sage px-3 py-1 text-xs font-bold text-brand">
                    {ui.step(i + 1)}
                  </span>
                  <h3 className="mt-3 font-bold text-brand-dark">{t.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{t.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-center text-sm font-medium text-muted">
            {ui.consistency}{" "}
            <a href="#offer" className="font-bold text-brand underline underline-offset-4">
              {ui.chooseOffer}
            </a>
            </p>
          </div>
        </section>

        <SplitSection
          id="howto"
          reverse
          eyebrow={ui.atHome}
          title={emotional?.title ?? product.nameAr}
          imageSrc={emotional?.image ?? product.image}
          imageAlt={product.nameAr}
        >
          <ol className="space-y-4">
            {product.steps.map((s, i) => (
              <li key={s.title} className="flex gap-3 text-base text-muted">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span>
                  <strong className="text-brand-dark">{s.title}.</strong> {s.body}
                </span>
              </li>
            ))}
          </ol>
        </SplitSection>

        <ConfirmationSection />

        <section id="causes" className="kd-section bg-brand-dark">
          <div className="kd-container">
            <SectionHeading
              eyebrow={HOME.causes.eyebrow}
              title={HOME.causes.title}
              sub={HOME.causes.sub}
              tone="dark"
            />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {HOME.causes.items.map((c, index) => {
                const active = index + 1 === causeNumber;
                return (
                  <Link
                    key={c.n}
                    href={localePath(`/products/${c.slug}`, locale)}
                    className={`rounded-2xl p-6 ${
                      active
                        ? "border-2 border-action bg-white/10"
                        : "border border-leaf/20 bg-white/5 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {active ? (
                      <span className="mb-3 inline-block rounded-full bg-action px-3 py-1 text-xs font-bold text-white">
                        {ui.thisProduct}
                      </span>
                    ) : null}
                    <p className="font-sans text-3xl font-bold text-action">{c.n}</p>
                    <h3 className="mt-3 text-lg font-bold text-white">{c.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-leaf/80">{c.body}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="system" className="kd-section bg-sage">
          <div className="kd-container">
            <SectionHeading eyebrow={ui.lineEyebrow} title={ui.lineTitle} />
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>

        <HonestyBox />

        <SplitSection
          id="guarantee"
          eyebrow={ui.guaranteeEyebrow}
          title={HOME.guarantee.title}
          imageSrc={HOME.guarantee.image}
          imageAlt={HOME.guarantee.title}
          className="bg-sage/70"
        >
          <p>{HOME.guarantee.body}</p>
          <ul className="mt-4 space-y-3">
            {HOME.guarantee.points.map((p) => (
              <li key={p} className="flex gap-3 text-base text-muted">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-action" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </SplitSection>

        <FaqAccordion items={faqCopy(locale)} title={ui.faqTitle} subtitle={ui.faqSub} />
      </ProductOfferShell>
    </>
  );
}

export async function HonestyBox() {
  const locale = await getLocale();
  const ui = uiCopy(locale);
  return (
    <section id="safety" className="kd-section bg-alabaster">
      <div className="kd-container">
        <div className="mx-auto max-w-2xl rounded-2xl bg-sage p-8 ring-1 ring-brand/10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-brand" aria-hidden />
            <h2 className="text-lg font-bold text-brand-dark">{ui.honestyTitle}</h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted">{ui.honestyBody}</p>
          <Link href={localePath("/contact", locale)} className="mt-3 inline-block font-bold text-brand">
            {ui.honestyLink}
          </Link>
        </div>
      </div>
    </section>
  );
}
