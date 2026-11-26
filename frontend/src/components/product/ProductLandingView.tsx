import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

import { getLocale } from "@/i18n/get-locale";
import { comparisonFake, faqCopy, homeCopy } from "@/i18n/home-copy";
import { localePath } from "@/i18n/locale";
import { localizeProduct, localizeProducts } from "@/i18n/products-copy";
import { uiCopy } from "@/i18n/ui";
import { fullKitOffer, type Product } from "@/data/products";
import { IMAGES } from "@/data/images";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { whatsappLink } from "@/lib/utils";
import { ProductOfferShell } from "./ProductOfferShell";
import { ProductCrossSell } from "./ProductCrossSell";
import { ProductProof } from "./ProductProof";

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
        bundleOffer={bundleOffer}
        finalTitle={HOME.finalCta.title}
        finalSub={HOME.finalCta.sub}
        finalNote={HOME.finalCta.reassurance}
      >
        <section className="px-4 py-6 lg:px-0">
          <div className="grid gap-3">
            <article className="rounded-2xl border border-brand/10 bg-white p-4">
              <p className="text-xs font-bold text-coral">{ui.problem}</p>
              <p className="mt-2 text-sm leading-6 text-brand-dark">{emotional?.title ?? product.heroHook.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{product.heroHook.body}</p>
            </article>
            <article className="rounded-2xl border border-brand/10 bg-white p-4">
              <p className="text-xs font-bold text-brand">{ui.solution}</p>
              <h2 className="mt-2 text-base font-bold text-brand-dark">{science?.title ?? product.nameAr}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{science?.body}</p>
            </article>
          </div>
        </section>

        <section id="how" className="px-4 py-6 lg:px-0">
          <h2 className="text-lg font-bold text-brand-dark">{ui.howEyebrow}</h2>
          {howImage ? (
            <div className="relative mt-3 h-40 overflow-hidden rounded-2xl border border-brand/10">
              <Image src={howImage} alt={howAlt} fill sizes="(max-width: 1024px) 92vw, 40vw" quality={70} unoptimized={howImage.endsWith(".svg")} className="object-cover" />
            </div>
          ) : null}
          <ol className="mt-3 grid gap-3">
            {product.steps.map((step, index) => (
              <li key={step.title} className="flex gap-3 rounded-2xl border border-brand/10 bg-white p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage text-sm font-bold text-brand">{index + 1}</span>
                <span>
                  <span className="block font-bold text-brand-dark">{step.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-muted">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section id="kit" className="px-4 py-6 lg:px-0">
          <div className="rounded-2xl border border-brand/10 bg-white p-4">
            <h2 className="text-lg font-bold text-brand-dark">{materials?.title ?? ui.materialsEyebrow}</h2>
            {materials?.body ? <p className="mt-2 text-sm leading-6 text-muted">{materials.body}</p> : null}
            {materials?.cards ? (
              <ul className="mt-4 grid gap-3">
                {materials.cards.map((card) => (
                  <li key={card.title}>
                    <p className="font-bold text-brand-dark">{card.title}</p>
                    <p className="text-xs font-bold text-brand">{card.latin}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{card.body}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            <h3 className="mt-5 text-base font-bold text-brand-dark">{product.kitTitle}</h3>
            <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl border border-brand/10">
              <Image
                src={kitSrc}
                alt={product.kitImageAlt ?? product.kitTitle}
                fill
                sizes="(max-width: 1024px) 92vw, 40vw"
                quality={70}
                unoptimized={kitSrc.endsWith(".svg")}
                className="object-cover"
              />
            </div>
            <ul className="mt-3 grid gap-2">
              {product.kitContents.map((item) => (
                <li key={item} className="text-sm leading-6 text-brand-dark">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="comparison" className="px-4 py-6 lg:px-0">
          <h2 className="text-lg font-bold text-brand-dark">{ui.compareTitle}</h2>
          <ul className="mt-3 grid gap-3">
            {product.comparisonOriginal.map((row, index) => (
              <li key={row} className="rounded-2xl border border-brand/10 bg-white p-4">
                <p className="text-xs font-bold text-brand">{ui.brand}</p>
                <p className="mt-1 text-sm font-bold leading-6 text-brand-dark">{row}</p>
                <p className="mt-3 text-xs font-bold text-muted">{ui.market}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{fake[index] ?? ""}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="delivery" className="px-4 py-6 lg:px-0">
          <h2 className="text-lg font-bold text-brand-dark">{ui.confirmTitle}</h2>
          <ol className="mt-3 grid gap-3">
            {ui.confirmSteps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-brand/10 bg-white p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sage text-sm font-bold text-brand">{index + 1}</span>
                <h3 className="mt-2 font-bold text-brand-dark">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <ProductProof title={ui.proofTitle} items={product.testimonials} />

        <FaqAccordion className="!py-8 lg:!py-10" items={faqCopy(locale)} title={ui.faqTitle} subtitle={ui.faqSub} />
        <p className="bg-alabaster px-4 pb-8 text-center lg:px-0">
          <a href={whatsappLink(ui.whatsappMessage)} className="text-sm font-bold text-brand">
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
          <h2 className="text-base font-bold text-brand-dark">{ui.honestyTitle}</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">{ui.honestyBody}</p>
      </div>
    </section>
  );
}
