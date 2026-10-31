"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { CTA_TRUST, COMPARISON_FAKE, FAQS, REVIEWS } from "@/data/content";
import { PRODUCTS, defaultOffer, type Product } from "@/data/products";
import { formatMad } from "@/lib/utils";
import { trackEvent } from "@/lib/tracking";
import { AlternatingSection } from "@/components/ui/AlternatingSection";
import { RatingRow } from "@/components/ui/Stars";
import { ConfirmationSection } from "@/components/home/ConfirmationSection";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { ProductCard } from "./ProductCard";
import { ProductGallery } from "./ProductGallery";
import { OfferTierSelector } from "./OfferTierSelector";
import { useCartStore } from "@/store/useCartStore";

export function ProductLandingView({ product }: { product: Product }) {
  const add = useCartStore((s) => s.addOfferAndOpenCart);
  const [offer, setOffer] = useState(() => defaultOffer(product));

  useEffect(() => {
    setOffer(defaultOffer(product));
    trackEvent("ViewContent", {
      value: product.price,
      contents: [{ id: product.slug, quantity: 1, item_price: product.price, name: product.nameAr }],
    });
  }, [product]);

  const related = useMemo(() => PRODUCTS.filter((p) => p.slug !== product.slug), [product.slug]);
  const productFaqs = FAQS;
  const reviews = REVIEWS.filter((r) => r.slug === product.slug);
  const shownReviews = reviews.length ? reviews : REVIEWS.slice(0, 3);

  const addSelected = () => add(product, offer);

  return (
    <>
      <section className="kd-container grid gap-10 py-10 lg:grid-cols-2 lg:items-start">
        <div className="lg:sticky lg:top-28">
          <span className="mb-3 inline-block rounded-full bg-sage px-3 py-1 text-xs font-bold text-brand">
            {product.category}
          </span>
          <RatingRow rating={product.rating} count={product.reviewCount} className="mb-3" />
          <h1 className="text-3xl font-bold text-brand-dark md:text-4xl">{product.nameAr}</h1>
          <p className="mt-1 font-sans text-sm font-semibold tracking-wide text-muted">{product.latinSubtitle}</p>
          <p className="mt-4 text-base leading-8 text-[#24323A]">{product.cardSubheading}</p>
          <div className="mt-4 rounded-xl border border-brand/10 bg-sage/80 p-3 text-sm font-bold text-brand">
            {product.scarcityBadge}
          </div>

          <div className="mt-6">
            <OfferTierSelector offers={product.offers} selectedId={offer.id} onSelect={setOffer} />
          </div>

          <ul className="mt-5 space-y-2 text-sm">
            {product.bonuses.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-leaf-deep">✔</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {offer.units > 1 && offer.compareAt > offer.price ? (
            <p className="mt-4 rounded-xl bg-white p-3 text-sm font-bold text-brand shadow-card">
              هدية أوفر: كتوفر {(offer.compareAt - offer.price).toLocaleString("en-US")} د.م، والكولية وحدة.
            </p>
          ) : null}

          <button type="button" className="kd-cta mt-6" onClick={addSelected}>
            أضف للسلة — {formatMad(offer.price)} · الخلاص عند الاستلام
          </button>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-muted">
            {CTA_TRUST.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-6 text-muted">
            كنعيطو من الدار البيضاء قبل التوصيل. كتفتح الكولية قدام الليفرور. منتوجات كينيدو للراحة اليومية، ما كتعوّضش الطبيب.
          </p>
        </div>

        <div className="-order-1 lg:order-none">
          <ProductGallery product={product} />
        </div>
      </section>

      <div className="kd-container mb-4 rounded-2xl bg-sage p-5 md:p-8">
        <h2 className="mb-2 text-xl font-bold">{product.heroHook.title}</h2>
        <p className="leading-8 text-[#24323A]">{product.heroHook.body}</p>
      </div>

      {product.sections.map((section, i) => (
        <AlternatingSection
          key={section.title}
          index={i + 1}
          title={section.title}
          body={section.body}
          bullets={section.kind === "materials" ? undefined : section.bullets}
          image={section.image}
          imageAlt={section.title}
          badge={section.kind === "science" ? "كيف كتخدم" : undefined}
        >
          {section.cards ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {section.cards.map((c) => (
                <div key={c.title} className="rounded-xl bg-white p-4 shadow-card">
                  <p className="font-bold text-brand-dark">{c.title}</p>
                  <p className="mt-1 font-sans text-[11px] font-semibold tracking-wide text-leaf-deep">{c.latin}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{c.body}</p>
                </div>
              ))}
            </div>
          ) : null}
        </AlternatingSection>
      ))}

      <section className="kd-container py-16">
        <h2 className="kd-h2 mb-6">{product.kitTitle}</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {product.kitContents.map((item) => (
            <li key={item} className="flex gap-3 rounded-xl bg-white p-4 shadow-card">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                ✔
              </span>
              <span className="font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-sage/60 py-16">
        <div className="kd-container">
          <h2 className="kd-h2 mb-6">علاش تختار كينيدو عوض حزام السوق العادي؟</h2>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead className="bg-brand text-white">
                <tr>
                  <th className="p-4">المعيار</th>
                  <th className="p-4">كينيدو (Kinédoux™)</th>
                  <th className="p-4">المنتوج العام فالسوق</th>
                </tr>
              </thead>
              <tbody>
                {product.comparisonOriginal.map((row, i) => (
                  <tr key={row} className="border-t border-brand/10">
                    <td className="p-4 font-bold">{i + 1}</td>
                    <td className="p-4 font-semibold text-brand">✔ {row}</td>
                    <td className="p-4 text-muted">— {COMPARISON_FAKE[i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="kd-container py-16">
        <h2 className="kd-h2 mb-8">طريقة الاستعمال في 3 خطوات</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {product.steps.map((step, i) => (
            <li key={step.title} className="kd-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf font-bold text-brand-dark">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <ReviewsSection reviews={shownReviews} compact />
      <ConfirmationSection />
      <FaqAccordion items={productFaqs} />

      <section className="kd-container py-16">
        <h2 className="kd-h2 mb-6">كمّل راحة جسمك مع باقي خط كينيدو</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-brand/10 bg-white/95 p-3 shadow-lift backdrop-blur md:hidden">
        <button type="button" className="kd-cta py-3 text-base" onClick={addSelected}>
          اطلب الآن — {formatMad(offer.price)}
        </button>
      </div>
      <div className="h-20 md:hidden" />
    </>
  );
}

export function HonestyBox() {
  return (
    <aside className="kd-container mb-10 rounded-2xl border border-brand/15 bg-white p-5 text-sm leading-7">
      <p className="font-bold text-brand">شفافية كينيدو</p>
      <p className="mt-2 text-muted">
        كينيدو كتبيع حلول راحة ودعم ميكانيكي، ما كتعالجش وما كتعوّضش الطبيب. شاور طبيبك قبل الاستعمال فحالة الحمل، كسر
        حديث، أو عملية حديثة على العمود الفقري.
      </p>
      <Link href="/contact" className="mt-2 inline-block font-bold text-brand">
        تواصل مع فريق كينيدو
      </Link>
    </aside>
  );
}
