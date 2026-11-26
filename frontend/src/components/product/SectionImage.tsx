import Image from "next/image";

import { cn } from "@/lib/utils";

const SIZES = "(min-width: 1024px) 50vw, 100vw";

/**
 * Section photos keep the file's real ratio.
 * A portrait file is capped at 70svh and centered.
 * frame "4/3" is the cross-sell card: the whole photo sits on a blurred copy of the same file.
 */
export function SectionImage({
  src,
  alt,
  width,
  height,
  frame,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  frame?: "4/3";
  className?: string;
}) {
  if (frame === "4/3") {
    return (
      <span className={cn("relative block aspect-[4/3] overflow-hidden bg-sage", className)}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 scale-[1.15] bg-cover bg-center blur-[24px] brightness-[.85]"
          style={{ backgroundImage: `url(${src})` }}
        />
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={SIZES}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-contain"
        />
      </span>
    );
  }

  const portrait = height > width;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={SIZES}
      quality={70}
      loading="lazy"
      unoptimized={src.endsWith(".svg")}
      className={cn(
        "rounded-2xl border border-brand/10 object-contain",
        portrait ? "kd-section-portrait" : "h-auto w-full",
        className,
      )}
      style={
        portrait
          ? { width: "auto", height: "auto", maxWidth: "100%", aspectRatio: `${width} / ${height}` }
          : { width: "100%", height: "auto", aspectRatio: `${width} / ${height}` }
      }
    />
  );
}
