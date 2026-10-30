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
    <section className="bg-sage/60 py-16" id="reviews">
      <div className="kd-container">
        <p className="kd-kicker mb-2">Avis clients</p>
        <h2 className="kd-h2 mb-2">تجارب من مدن المغرب</h2>
        <p className="mb-8 text-muted">دار البيضاء، الرباط، طنجة، مراكش، فاس وأكادير — بنفس الثمن ونفس التوصيل.</p>
        {!compact ? (
          <div className="mb-10 grid gap-4 md:grid-cols-3">
            {HOME.ugc.map((u) => (
              <figure key={u.title} className="overflow-hidden rounded-2xl bg-white shadow-card">
                <BrandImage src={u.image} alt={u.title} className="aspect-video rounded-none border-0" />
                <figcaption className="p-4 text-sm font-bold">{u.title}</figcaption>
              </figure>
            ))}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <blockquote key={r.name} className="kd-card p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <Stars />
                <span className="rounded-full bg-sage px-2 py-0.5 text-[11px] font-bold text-brand">{r.product}</span>
              </div>
              <p className="text-sm leading-7 text-[#24323A]">«{r.body}»</p>
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
