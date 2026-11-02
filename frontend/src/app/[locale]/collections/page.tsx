import type { Metadata } from "next";

import { BundleBanner } from "@/components/home/BundleBanner";
import { ProductGrid } from "@/components/home/ProductGrid";
import { localeFromParams } from "@/i18n/get-locale";
import { comparisonFake } from "@/i18n/home-copy";
import { localizeProducts } from "@/i18n/products-copy";
import { uiCopy } from "@/i18n/ui";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const ui = uiCopy(await localeFromParams(params));
  return {
    title: ui.nav[1].label,
    description: ui.collectionsBody,
  };
}

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await localeFromParams(params);
  const ui = uiCopy(locale);
  const rows = localizeProducts(locale)[0].comparisonOriginal;
  const fake = comparisonFake(locale);
  return (
    <>
      <header className="kd-container py-12">
        <p className="kd-kicker">{ui.collectionsKicker}</p>
        <h1 className="kd-h1 mt-2">{ui.collectionsTitle}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{ui.collectionsBody}</p>
      </header>
      <ProductGrid products={localizeProducts(locale)} showIntro={false} />
      <BundleBanner />
      <section className="kd-container pb-16">
        <h2 className="kd-h2 mb-6">{ui.compareTitle}</h2>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[640px] text-start text-sm">
            <thead className="bg-brand text-white">
              <tr>
                <th className="p-4">{ui.criterion}</th>
                <th className="p-4">{ui.brand}</th>
                <th className="p-4">{ui.market}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row} className="border-t border-brand/10">
                  <td className="p-4 font-bold">{i + 1}</td>
                  <td className="p-4 font-semibold text-brand">✔ {row}</td>
                  <td className="p-4 text-muted">— {fake[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
