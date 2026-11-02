import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandImage({
  src,
  alt,
  className,
  badge,
  priority = false,
  sizes = "(max-width: 768px) 92vw, (max-width: 1200px) 46vw, 540px",
}: {
  src: string;
  alt: string;
  className?: string;
  badge?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-brand/10 bg-sage shadow-card", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={70}
        priority={priority}
        unoptimized={src.endsWith(".svg")}
        className="object-cover"
      />
      {badge ? (
        <span className="absolute top-4 right-4 z-[1] rounded-full border border-leaf bg-white/95 px-3 py-1 text-xs font-bold text-brand shadow-sm">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
