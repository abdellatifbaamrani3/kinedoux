import { cn } from "@/lib/utils";

export function BrandImage({
  src,
  alt,
  className,
  badge,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  badge?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-brand/10 bg-sage shadow-card", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={800}
        height={600}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="h-full w-full object-cover"
      />
      {badge ? (
        <span className="absolute top-4 right-4 rounded-full border border-leaf bg-white/95 px-3 py-1 text-xs font-bold text-brand shadow-sm">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
