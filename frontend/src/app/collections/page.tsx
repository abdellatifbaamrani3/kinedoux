import type { Metadata } from "next";

import { COMPARISON_FAKE } from "@/data/content";
import { PRODUCTS } from "@/data/products";
import { BundleBanner } from "@/components/home/BundleBanner";
import { ProductGrid } from "@/components/home/ProductGrid";

export const metadata: Metadata = {
  title: "منتجاتنا",
  description: "كينيدو لومبا، بوسطا وكالما — خط الراحة المتكامل للظهر والوقفة بالمغرب.",
};

export default function CollectionsPage() {
  const rows = PRODUCTS[0].comparisonOriginal;
  return (
    <>
      <header className="kd-container py-12">
        <p className="kd-kicker">Confort Dorsal & Posture</p>
        <h1 className="kd-h1 mt-2">منتجات كينيدو الثلاثة</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          خط متخصص: حزام هوائي لأسفل الظهر، وقفة خفيفة مع وسادة رقبة، وكاسات دافئة مسائية. كل العروض بالتوصيل المجاني، التأكيد من الدار البيضاء، والخلاص بعد فتح الكولية.
        </p>
      </header>
      <ProductGrid showIntro={false} />
      <BundleBanner />
      <section className="kd-container pb-16">
        <h2 className="kd-h2 mb-6">مقارنة سريعة مع السوق</h2>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="bg-brand text-white">
              <tr>
                <th className="p-4">المعيار</th>
                <th className="p-4">كينيدو</th>
                <th className="p-4">المنتوج العام فالسوق</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row} className="border-t border-brand/10">
                  <td className="p-4 font-bold">{i + 1}</td>
                  <td className="p-4 font-semibold text-brand">✔ {row}</td>
                  <td className="p-4 text-muted">— {COMPARISON_FAKE[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
