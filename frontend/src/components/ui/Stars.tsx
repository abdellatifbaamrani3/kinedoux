import { cn } from "@/lib/utils";

export function Stars({ rating = 5, className }: { rating?: number; className?: string }) {
  const full = Math.round(rating);
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-argan", className)} aria-label={`${rating} من 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? "text-argan" : "text-sage-deep"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function RatingRow({
  rating,
  count,
  className,
}: {
  rating: number;
  count: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-sm", className)}>
      <Stars rating={rating} />
      <span className="font-bold tabular-nums text-brand-dark">{rating.toFixed(1)}</span>
      <span className="text-muted">({count} تجربة زبون)</span>
    </div>
  );
}
