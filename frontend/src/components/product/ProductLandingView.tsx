import Link from "next/link";
import { Armchair, Monitor, Moon, ShieldCheck, Users } from "lucide-react";

import { getLocale } from "@/i18n/get-locale";
import { faqCopy, homeCopy } from "@/i18n/home-copy";
import { localePath } from "@/i18n/locale";
import { localizeProduct, localizeProducts } from "@/i18n/products-copy";
import { uiCopy } from "@/i18n/ui";
import { fullKitOffer, type Product } from "@/data/products";
import { CONFIRMATION_PHONE } from "@/data/order-upgrade";
import { IMAGES } from "@/data/images";
import { sectionImageSize } from "@/data/section-image-size";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { ProductOfferShell } from "./ProductOfferShell";
import { ProductCrossSell } from "./ProductCrossSell";
import { ProductProof } from "./ProductProof";
import { SectionImage } from "./SectionImage";
import { MidOrderCta } from "./MidOrderCta";
import { WhatsAppAskLink } from "./WhatsAppFloat";

const WHO_ICONS = [Armchair, Monitor, Users] as const;

export async function ProductLandingView({ product: source }: { product: Product }) {
  const locale = await getLocale();
  const ui = uiCopy(locale);
  const HOME = homeCopy(locale);
  const product = localizeProduct(source, locale);
  const related = localizeProducts(locale).filter((item) => item.slug !== product.slug);
  const emotional = product.sections.find((section) => section.kind === "emotional");
  const science = product.sections.find((section) => section.kind === "science");
  const materials = product.sections.find((section) => section.kind === "materials");
  const kit = localizeProduct(fullKitOffer().product, locale);
  const bundleOffer = kit.offers.find((item) => item.id === fullKitOffer().offer.id) ?? fullKitOffer().offer;
  const photos = product.photos;
  const faqs = faqCopy(locale).filter((item) => {
    if (product.slug === "kenidoux-lumba") return true;
    return !/لومبا|Lumba/i.test(`${item.q} ${item.a}`);
  });

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
          finalTitle={product.finalTitle}
          finalSub={HOME.finalCta.sub}
          finalNote={HOME.finalCta.reassurance}
          finalImage={photos.final}
        >
          <section className="px-4 py-4 lg:px-0">
            <article className="overflow-hidden rounded-2xl border border-brand/10 bg-white">
              <SectionImage {...sectionImageSize(photos.problem)} src={photos.problem} alt={emotional?.title ?? product.nameAr} className="rounded-none" />
              <div className="p-4">
                <p className="text-kd-small font-medium text-coral">{ui.problem}</p>
                <h2 className="mt-3 text-kd-h2 font-bold text-brand-dark">{emotional?.title}</h2>
                <p className="kd-copy mt-3 text-kd-body text-brand-dark">{product.painScene}</p>
                {emotional?.body ? <p className="kd-copy mt-3 text-kd-secondary text-muted">{emotional.body}</p> : null}
                {product.heroHook.body ? <p className="kd-copy mt-3 text-kd-secondary text-muted">{product.heroHook.body}</p> : null}
              </div>
            </article>
          </section>

          <section className="px-4 py-2 lg:px-0">
            <h2 className="text-kd-h2 font-bold text-brand-dark">{ui.whoTitle}</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {product.whoFor.map((line, index) => {
                const Icon = WHO_ICONS[index] ?? Moon;
                return (
                  <li key={line} className="flex items-center gap-3 rounded-2xl border border-brand/10 bg-white p-4">
                    <Icon className="h-5 w-5 shrink-0 text-brand" aria-hidden />
                    <span className="text-kd-secondary font-bold text-brand-dark">{line}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="px-4 py-4 lg:px-0">
            <article className="overflow-hidden rounded-2xl border border-brand/10 bg-white">
              <SectionImage {...sectionImageSize(photos.solution)} src={photos.solution} alt={science?.title ?? product.nameAr} className="rounded-none" />
              <div className="p-4">
                <p className="text-kd-small font-medium text-brand">{ui.solution}</p>
                <h2 className="mt-3 text-kd-h2 font-bold text-brand-dark">{science?.title}</h2>
                {science?.body ? <p className="kd-copy mt-3 text-kd-secondary text-muted">{science.body}</p> : null}
              </div>
            </article>
          </section>

          <section id="how" className="px-4 py-4 lg:px-0">
            <h2 className="text-kd-h2 font-bold text-brand-dark">{product.howTitle}</h2>
            <SectionImage
              {...sectionImageSize(photos.how)}
              src={photos.how}
              alt={product.stepsImageAlt ?? product.howTitle}
              className="mt-3"
            />
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
            {photos.result ? (
              <SectionImage {...sectionImageSize(photos.result)} src={photos.result} alt={product.nameAr} className="mt-3" />
            ) : null}
          </section>

          <MidOrderCta />

          {photos.heat && photos.heatTitle ? (
            <section className="px-4 py-4 lg:px-0">
              <article className="overflow-hidden rounded-2xl border border-brand/10 bg-white">
                <SectionImage {...sectionImageSize(photos.heat)} src={photos.heat} alt={photos.heatTitle} className="rounded-none" />
                <div className="p-4">
                  <h2 className="text-kd-h2 font-bold text-brand-dark">{photos.heatTitle}</h2>
                  {photos.heatBody ? <p className="kd-copy mt-3 text-kd-secondary text-muted">{photos.heatBody}</p> : null}
                </div>
              </article>
            </section>
          ) : null}

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
                {...sectionImageSize(photos.box)}
                src={photos.box}
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
            <h2 className="text-kd-h2 font-bold text-brand-dark">{product.compareTitle}</h2>
            <ul className="mt-3 grid gap-3">
              {product.comparisonOriginal.map((row, index) => (
                <li key={row} className="rounded-2xl border border-brand/10 bg-white p-4">
                  <p className="text-kd-small font-medium text-brand">{ui.brand}</p>
                  <p className="kd-copy mt-3 text-kd-body font-bold text-brand-dark">{row}</p>
                  {product.compareMarket[index] ? (
                    <>
                      <p className="mt-3 text-kd-small font-medium text-muted">{ui.market}</p>
                      <p className="kd-copy mt-3 text-kd-secondary text-muted">{product.compareMarket[index]}</p>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <MidOrderCta />

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

          <section className="px-4 py-4 lg:px-0">
            <article className="overflow-hidden rounded-2xl border border-brand/10 bg-white">
              <SectionImage
                {...sectionImageSize(IMAGES.home.unboxing)}
                src={IMAGES.home.unboxing}
                alt={ui.whoWeTitle}
                className="rounded-none"
              />
              <div className="p-4">
                <h2 className="text-kd-h2 font-bold text-brand-dark">{ui.whoWeTitle}</h2>
                <p className="kd-copy mt-3 text-kd-secondary text-muted">{ui.whoWeBody}</p>
                {CONFIRMATION_PHONE ? (
                  <p className="mt-3 text-kd-secondary font-bold text-brand-dark">{ui.whoWePhone(CONFIRMATION_PHONE)}</p>
                ) : null}
              </div>
            </article>
          </section>

          <FaqAccordion className="!py-8 lg:!py-10" items={faqs} title={ui.faqTitle} subtitle={ui.faqSub} />
          <p className="bg-alabaster px-4 pb-8 text-center lg:px-0">
            <WhatsAppAskLink product={product} className="text-kd-secondary font-bold text-brand">
              {ui.faqWhatsapp}
            </WhatsAppAskLink>
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
