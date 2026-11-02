import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PRODUCTS, getProduct } from "@/data/products";
import { ProductLandingView } from "@/components/product/ProductLandingView";
import { localeFromParams } from "@/i18n/get-locale";
import { localizeProduct } from "@/i18n/products-copy";

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
  return {
    title: localized.nameAr,
    description: localized.metaDescription,
    openGraph: { title: `${localized.nameAr} | Kinédoux`, description: localized.metaDescription },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  await localeFromParams(params);
  const product = getProduct(slug);
  if (!product) notFound();
  return <ProductLandingView product={product} />;
}
