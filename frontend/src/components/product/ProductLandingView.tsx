import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { getLocale } from "@/i18n/get-locale";
import { comparisonFake, faqCopy, homeCopy } from "@/i18n/home-copy";
import { localePath } from "@/i18n/locale";
import { localizeProduct, localizeProducts } from "@/i18n/products-copy";
import { uiCopy } from "@/i18n/ui";
import { fullKitOffer, type Product } from "@/data/products";
import { IMAGES } from "@/data/images";
import { sectionImageSize } from "@/data/section-image-size";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { whatsappLink } from "@/lib/utils";
import { ProductOfferShell } from "./ProductOfferShell";
import { ProductCrossSell } from "./ProductCrossSell";
import { ProductProof } from "./ProductProof";
import { SectionImage } from "./SectionImage";

export async function ProductLandingView({ product: source }: { product: Product }) {
  const locale = await getLocale();
  const ui = uiCopy(locale);
  const HOME = homeCopy(locale);
  const product = localizeProduct(source, locale);
  const related = localizeProducts(locale).filter((item) => item.slug !== product.slug);
  const emotional = product.sections.find((section) => section.kind === "emotional");
  const science = product.sections.find((section) => section.kind === "science");
  const materials = product.sections.find((section) => section.kind === "materials");
  const fake = comparisonFake(locale);
  const kit = localizeProduct(fullKitOffer().product, locale);
  const bundleOffer = kit.offers.find((item) => item.id === fullKitOffer().offer.id) ?? fullKitOffer().offer;
  const howImage = product.stepsImage ?? science?.image;
  const howAlt = product.stepsImage ? product.stepsImageAlt ?? ui.howEyebrow : product.scienceImageAlt ?? science?.title ?? product.nameAr;
  const kitSrc = IMAGES.products[product.slug]?.kit ?? product.image;

  return (
    <>
    <div className="kd-product">
      <div className="border-b border-brand/10 bg-alabaster">
        <div className="kd-container py-2.5 text-kd-small font-medium text-muted">
          <Link href={localePath("/", locale)} className="hover:text-brand">
            {ui.home}
          </Link>
          <span className="mx-2">/</span>
          <Link href={localePath("/collections", locale)} className="hover:text-brand">
            {ui.productsNav}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-kd-small font-medium text-brand-dark">{product.nameAr}</span>
        </div>
      </div>

      <ProductOfferShell
        product={product}
        bundleOffer={bundleOffer}
        finalTitle={HOME.finalCta.title}
        finalSub={HOME.finalCta.sub}
        finalNote={HOME.finalCta.reassurance}
      >
        <section className="px-4 py-4 lg:px-0">
          <div className="grid gap-3">
            <article className="rounded-2xl border border-brand/10 bg-white p-4">
              <p className="text-kd-small font-medium text-coral">{ui.problem}</p>
              <p className="kd-copy mt-3 text-kd-body text-brand-dark">{emotional?.title ?? product.heroHook.title}</p>
              <p className="kd-copy mt-3 text-kd-secondary text-muted">{product.heroHook.body}</p>
            </article>
            <article className="rounded-2xl border border-brand/10 bg-white p-4">
              <p className="text-kd-small font-medium text-brand">{ui.solution}</p>
              <h2 className="mt-3 text-kd-h2 font-bold text-brand-dark">{science?.title ?? product.nameAr}</h2>
              <p className="kd-copy mt-3 text-kd-secondary text-muted">{science?.body}</p>
            </article>
          </div>
        </section>

        <section id="how" className="px-4 py-4 lg:px-0">
          <h2 className="text-kd-h2 font-bold text-brand-dark">{ui.howEyebrow}</h2>
          {howImage ? (
            <SectionImage {...sectionImageSize(howImage)} src={howImage} alt={howAlt} className="mt-3" />
          ) : null}
          <ol className="mt-3 grid gap-3">
            {product.steps.map((step, index) => (
              <li key={step.title} className="flex gap-3 rounded-2xl border border-brand/10 bg-white p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage text-kd-small font-bold text-brand">{index + 1}</span>
                <span>
                  <span className="block text-kd-h3 font-bold text-brand-dark">{step.title}</span>
                  <span className="kd-copy mt-3 block text-kd-secondary text-muted">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section id="kit" className="px-4 py-4 lg:px-0">
          <div className="overflow-hidden rounded-2xl border border-brand/10 bg-white p-4">
            <h2 className="text-kd-h2 font-bold text-brand-dark">{materials?.title ?? ui.materialsEyebrow}</h2>
            {materials?.body ? <p className="kd-copy mt-3 text-kd-secondary text-muted">{materials.body}</p> : null}
            {materials?.cards ? (
              <ul className="mt-4 grid gap-3">
                {materials.cards.map((card) => (
                  <li key={card.title}>
                    <p className="text-kd-h3 font-bold text-brand-dark">{card.title}</p>
                    <p className="font-sans text-kd-small font-medium text-brand">{card.latin}</p>
                    <p className="kd-copy mt-3 text-kd-secondary text-muted">{card.body}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            <h3 className="mt-5 text-kd-h3 font-bold text-brand-dark">{product.kitTitle}</h3>
            <SectionImage
              {...sectionImageSize(kitSrc)}
              src={kitSrc}
              alt={product.kitImageAlt ?? product.kitTitle}
              bleed
              className="mt-3 mb-3"
            />
            <ul className="grid gap-3">
              {product.kitContents.map((item) => (
                <li key={item} className="text-kd-body text-brand-dark">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="comparison" className="px-4 py-4 lg:px-0">
          <h2 className="text-kd-h2 font-bold text-brand-dark">{ui.compareTitle}</h2>
          <ul className="mt-3 grid gap-3">
            {product.comparisonOriginal.map((row, index) => (
              <li key={row} className="rounded-2xl border border-brand/10 bg-white p-4">
                <p className="text-kd-small font-medium text-brand">{ui.brand}</p>
                <p className="kd-copy mt-3 text-kd-body font-bold text-brand-dark">{row}</p>
                <p className="mt-3 text-kd-small font-medium text-muted">{ui.market}</p>
                <p className="kd-copy mt-3 text-kd-secondary text-muted">{fake[index] ?? ""}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="delivery" className="px-4 py-4 lg:px-0">
          <h2 className="text-kd-h2 font-bold text-brand-dark">{ui.confirmTitle}</h2>
          <ol className="mt-3 grid gap-3">
            {ui.confirmSteps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-brand/10 bg-white p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sage text-kd-small font-bold text-brand">{index + 1}</span>
                <h3 className="mt-3 text-kd-h3 font-bold text-brand-dark">{step.title}</h3>
                <p className="kd-copy mt-3 text-kd-secondary text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <ProductProof title={ui.proofTitle} items={product.testimonials} />

        <FaqAccordion className="!py-8 lg:!py-10" items={faqCopy(locale)} title={ui.faqTitle} subtitle={ui.faqSub} />
        <p className="bg-alabaster px-4 pb-8 text-center lg:px-0">
          <a href={whatsappLink(ui.whatsappMessage)} className="text-kd-secondary font-bold text-brand">
            {ui.faqWhatsapp}
          </a>
        </p>

        <ProductCrossSell
          products={related}
          heading={HOME.causes.title}
          sub={HOME.causes.sub}
          bundle={{
            title: HOME.bundle.title,
            subtitle: HOME.bundle.subtitle,
            price: bundleOffer.price,
            save: bundleOffer.compareAt - bundleOffer.price,
          }}
        />
      </ProductOfferShell>

      <HonestyBox />
    </div>
    </>
  );
}

export async function HonestyBox() {
  const locale = await getLocale();
  const ui = uiCopy(locale);
  return (
    <section id="safety" className="px-4 pb-28 pt-2 lg:px-8 lg:pb-16">
      <div className="mx-auto max-w-6xl rounded-2xl border border-brand/10 bg-white p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-brand" aria-hidden />
          <h2 className="text-kd-h2 font-bold text-brand-dark">{ui.honestyTitle}</h2>
        </div>
        <p className="kd-copy mt-3 text-kd-secondary text-muted">{ui.honestyBody}</p>
      </div>
    </section>
  );
}
