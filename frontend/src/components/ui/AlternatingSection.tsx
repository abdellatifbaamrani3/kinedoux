import type { ReactNode } from "react";

import { BrandImage } from "./BrandImage";
import { cn } from "@/lib/utils";

type Props = {
  index: number;
  title: string;
  body: string;
  bullets?: string[];
  image: string;
  imageAlt: string;
  badge?: string;
  children?: ReactNode;
  className?: string;
};

/**
 * Desktop Z-pattern: odd = text right / image left; even = image right / text left.
 * Mobile: image stacked above copy (`flex-col-reverse` with text-then-image in the DOM).
 */
export function AlternatingSection({ index, title, body, bullets, image, imageAlt, badge, children, className }: Props) {
  const odd = index % 2 === 1;
  return (
    <section className={cn(odd ? "bg-alabaster" : "bg-sage/70", className)}>
      <div
        className={cn(
          "kd-container flex flex-col-reverse items-center gap-10 py-16 lg:grid lg:grid-cols-2 lg:gap-14",
        )}
      >
        <div className={cn("w-full", odd ? "" : "lg:order-2")}>
          <h2 className="kd-h2 mb-4">{title}</h2>
          <p className="mb-5 text-base leading-8 text-[#24323A] md:text-lg">{body}</p>
          {bullets && bullets.length > 0 ? (
            <ul className="mb-6 space-y-2.5">
              {bullets.map((b) => (
                <li key={b} className="flex gap-2 text-[15px] font-medium text-brand-dark">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-leaf-deep" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {children}
        </div>
        <div className={cn("w-full", odd ? "" : "lg:order-1")}>
          <BrandImage src={image} alt={imageAlt} className="aspect-[4/3]" badge={badge} />
        </div>
      </div>
    </section>
  );
}
