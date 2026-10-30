import { cn } from "@/lib/utils";

export function BrandImage({
  src,
  alt,
  className,
  badge,
}: {
  src: string;
  alt: string;
  className?: string;
  badge?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-brand/10 bg-sage shadow-card", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      {badge ? (
        <span className="absolute top-4 right-4 rounded-full border border-leaf bg-white/95 px-3 py-1 text-xs font-bold text-brand shadow-sm">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
