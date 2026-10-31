import { HOME, REVIEWS } from "@/data/content";
import { RatingRow, Stars } from "@/components/ui/Stars";
import { BrandImage } from "@/components/ui/BrandImage";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ReviewsSection({
  reviews = REVIEWS,
  compact = false,
}: {
  reviews?: typeof REVIEWS;
  compact?: boolean;
}) {
  return (
    <section className="kd-section bg-sage/70" id="reviews">
      <div className="kd-container">
        <SectionHeading
          eyebrow={HOME.reviews.eyebrow}
          title={HOME.reviews.title}
          sub={HOME.reviews.note}
        />
        <div className="mt-6 flex justify-center">
          <RatingRow rating={HOME.reviews.average} count={HOME.reviews.count} />
        </div>
        {!compact ? (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {HOME.ugc.map((u) => (
              <figure key={u.title} className="overflow-hidden rounded-2xl bg-white shadow-card">
                <BrandImage src={u.image} alt={u.title} className="aspect-video rounded-none border-0" />
                <figcaption className="p-4 text-sm font-bold text-brand-dark">{u.title}</figcaption>
              </figure>
            ))}
          </div>
        ) : null}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {reviews.map((r) => (
            <blockquote key={r.name} className="flex flex-col justify-between rounded-2xl bg-white p-5 ring-1 ring-brand/10">
              <div>
                <Stars rating={r.stars} />
                <p className="mt-3 text-sm leading-7 text-muted">«{r.body}»</p>
              </div>
              <footer className="mt-4 border-t border-brand/10 pt-3 text-sm font-bold text-brand-dark">
                {r.name}
                <span className="mt-0.5 block text-xs font-semibold text-muted">{r.city} · {r.product}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
