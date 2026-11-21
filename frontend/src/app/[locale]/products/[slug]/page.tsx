import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PRODUCTS, getProduct } from "@/data/products";
import { ProductLandingView } from "@/components/product/ProductLandingView";
import { localeFromParams } from "@/i18n/get-locale";
import { localePath, type Locale } from "@/i18n/locale";
import { localizeProduct } from "@/i18n/products-copy";
import { SITE_URL } from "@/lib/utils";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await localeFromParams(params);
  const product = getProduct(slug);
  if (!product) return { title: "Kinédoux" };
  const localized = localizeProduct(product, locale);
  const path = localePath(`/products/${slug}`, locale as Locale);
  return {
    title: localized.nameAr,
    description: localized.metaDescription,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        "ar-MA": `${SITE_URL}/products/${slug}`,
        fr: `${SITE_URL}/fr/products/${slug}`,
        en: `${SITE_URL}/en/products/${slug}`,
      },
    },
    openGraph: { title: `${localized.nameAr} | Kinédoux`, description: localized.metaDescription, url: `${SITE_URL}${path}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  await localeFromParams(params);
  const product = getProduct(slug);
  if (!product) notFound();
  return <ProductLandingView product={product} />;
}
