import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PRODUCTS, getProduct } from "@/data/products";
import { HonestyBox, ProductLandingView } from "@/components/product/ProductLandingView";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "المنتج غير موجود" };
  return {
    title: product.nameAr,
    description: product.metaDescription,
    openGraph: { title: `${product.nameAr} | كينيدو`, description: product.metaDescription },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return (
    <>
      <ProductLandingView product={product} />
      <HonestyBox />
    </>
  );
}
