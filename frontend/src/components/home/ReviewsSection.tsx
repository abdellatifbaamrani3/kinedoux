import { HOME, REVIEWS } from "@/data/content";
import { Stars } from "@/components/ui/Stars";
import { BrandImage } from "@/components/ui/BrandImage";

export function ReviewsSection({
  reviews = REVIEWS,
  compact = false,
}: {
  reviews?: typeof REVIEWS;
  compact?: boolean;
}) {
  return (
    <section className="bg-alabaster py-16" id="reviews">
      <div className="kd-container">
        <p className="kd-kicker mb-2">Avis clients</p>
        <h2 className="kd-h2 mb-2">آراء مكتوبة من مدن المغرب</h2>
        <p className="mb-8 text-muted">
          كازا، الرباط، طنجة، مراكش، فاس وأكادير. نفس الثمن، نفس التوصيل، ونفس التأكيد من الدار البيضاء.
        </p>
        {!compact ? (
          <div className="mb-10 grid gap-4 md:grid-cols-3">
            {HOME.ugc.map((u) => (
              <figure key={u.title} className="overflow-hidden rounded-2xl bg-white shadow-card">
                <BrandImage src={u.image} alt={u.title} className="aspect-video rounded-none border-0" />
                <figcaption className="p-4 text-sm font-bold text-brand-dark">{u.title}</figcaption>
              </figure>
            ))}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <blockquote key={r.name} className="rounded-2xl bg-white p-5 shadow-card">
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage font-sans text-sm font-extrabold text-brand">
                  {r.name.slice(0, 1)}
                </span>
                <Stars />
              </div>
              <span className="mb-3 inline-block rounded-full bg-sage px-2 py-0.5 text-[11px] font-bold text-brand">
                {r.product}
              </span>
              <p className="text-sm leading-7 text-brand-dark">«{r.body}»</p>
              <footer className="mt-4 text-sm font-bold text-brand-dark">
                {r.name}
                <span className="mt-0.5 block text-xs font-semibold text-muted">{r.city}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
