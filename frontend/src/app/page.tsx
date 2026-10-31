import { HOME } from "@/data/content";
import { PRODUCTS } from "@/data/products";
import { BundleBanner } from "@/components/home/BundleBanner";
import { ConfirmationSection } from "@/components/home/ConfirmationSection";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { GuaranteeSection } from "@/components/home/GuaranteeSection";
import { Hero } from "@/components/home/Hero";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { TrustBar } from "@/components/home/TrustBar";
import { ProductCard } from "@/components/product/ProductCard";
import { AlternatingSection } from "@/components/ui/AlternatingSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />

      <section className="kd-container py-16" id="products">
        <p className="kd-kicker mb-2">Trois soins, une marque</p>
        <h2 className="kd-h2 mb-2">خط كينيدو المتخصص</h2>
        <p className="mb-8 max-w-2xl text-muted">
          ثلاثة حلول واضحة: دعم أسفل الظهر، وقفة خفيفة مع وسادة رقبة، واسترخاء مسائي. كل العروض بالتوصيل المجاني والخلاص عند الاستلام.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <AlternatingSection
        index={1}
        title={HOME.struggle.title}
        body={HOME.struggle.body}
        bullets={[...HOME.struggle.bullets]}
        image={HOME.struggle.image}
        imageAlt="العياء اليومي ديال الظهر فالخدمة والسياقة"
      />
      <AlternatingSection
        index={2}
        title={HOME.science.title}
        body={HOME.science.body}
        bullets={[...HOME.science.bullets]}
        image={HOME.science.image}
        imageAlt="الفرق بين كينيدو والأحزمة العادية"
        badge="confort quotidien"
      />

      <section className="kd-container py-16">
        <p className="kd-kicker mb-2">Matières & usage</p>
        <h2 className="kd-h2 mb-2">خامات مختارة لراحة يومية</h2>
        <p className="mb-8 text-muted">كل طبقة عندها سبب: ثبات، تهوية، وسهولة استعمال فالدار فالمغرب.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOME.materials.map((m) => (
            <article key={m.title} className="kd-card p-5">
              <h3 className="font-bold text-brand-dark">{m.title}</h3>
              <p className="mt-1 font-sans text-[11px] font-semibold tracking-wide text-leaf-deep">{m.latin}</p>
              <p className="mt-3 text-sm leading-7 text-muted">{m.body}</p>
            </article>
          ))}
        </div>
      </section>

      <BundleBanner />
      <ConfirmationSection />
      <ReviewsSection />
      <FaqAccordion />
      <GuaranteeSection />
    </>
  );
}
