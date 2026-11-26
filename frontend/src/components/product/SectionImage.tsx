import { GALLERY_BLUR } from "@/data/gallery-blur";
import { cn } from "@/lib/utils";

const SIZES = "(min-width: 1024px) 50vw, 100vw";

/**
 * Full-width section photo at the file's real ratio.
 * The frame clips only when the photo would be taller than 80svh.
 * row: side-by-side cards share a 4:3 crop from 640px up.
 */
export function SectionImage({
  src,
  alt,
  width,
  height,
  row = false,
  bleed = false,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  row?: boolean;
  bleed?: boolean;
  className?: string;
}) {
  const blur = GALLERY_BLUR[src];
  return (
    <div
      className={cn(
        "kd-section-frame w-full overflow-hidden bg-sage",
        bleed ? "-mx-4 w-[calc(100%+2rem)]" : "rounded-2xl border border-brand/10",
        row && "kd-section-frame-row rounded-none border-0",
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={SIZES}
        loading="lazy"
        decoding="async"
        className={cn("kd-section-photo bg-sage", row && "kd-section-photo-row")}
        style={{
          backgroundImage: blur ? `url("${blur}")` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
}
