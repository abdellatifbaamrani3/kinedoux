import Image from "next/image";

import type { Testimonial } from "@/data/products";

/**
 * Renders nothing when the list is empty.
 * Add real reviews on the product in frontend/src/data/products.ts, field `testimonials`.
 * Shape: { firstName, city, product, text, image?, videoUrl? }
 */
export function ProductProof({ title, items }: { title: string; items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <section id="proof" className="px-4 py-6 lg:px-0">
      <h2 className="text-kd-h2 font-bold text-brand-dark">{title}</h2>
      <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <article key={`${item.firstName}-${item.city}-${item.text}`} className="w-[78%] max-w-xs shrink-0 snap-center overflow-hidden rounded-2xl border border-brand/10 bg-white">
            {item.videoUrl ? (
              <video
                src={item.videoUrl}
                controls
                playsInline
                preload="metadata"
                poster={item.image}
                className="aspect-[9/16] w-full bg-sage object-cover"
              />
            ) : item.image ? (
              <Image src={item.image} alt="" width={360} height={640} className="aspect-[9/16] w-full object-cover" />
            ) : null}
            <div className="p-4">
              <p className="text-kd-body text-brand-dark">{item.text}</p>
              <p className="mt-3 text-kd-small font-medium text-muted">
                {item.firstName} · {item.city}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
