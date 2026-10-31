import type { ReactNode } from "react";

import { BrandImage } from "./BrandImage";
import { cn } from "@/lib/utils";

export function SplitSection({
  reverse = false,
  eyebrow,
  title,
  children,
  imageSrc,
  imageAlt,
  dark = false,
  id,
  className = "",
}: {
  reverse?: boolean;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  imageSrc: string;
  imageAlt: string;
  dark?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("kd-section", className || (dark ? "bg-brand-dark" : "bg-alabaster"))}
    >
      <div className="kd-container">
        <div
          className={cn(
            "grid items-center gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16",
            reverse && "lg:[&>*:first-child]:order-2",
          )}
        >
          <div className="order-1 lg:order-none">
            <BrandImage
              src={imageSrc}
              alt={imageAlt}
              className={cn("aspect-[4/5] max-w-md mx-auto lg:max-w-none lg:h-full lg:min-h-[28rem]", dark && "border-white/10")}
            />
          </div>
          <div className="order-2 lg:order-none lg:flex lg:flex-col lg:justify-center">
            {eyebrow ? (
              <p className={cn("kd-kicker mb-3", dark ? "text-leaf" : "text-brand")}>{eyebrow}</p>
            ) : null}
            <h2 className={cn("kd-h2 text-balance", dark ? "text-white" : "text-brand-dark")}>{title}</h2>
            <div className={cn("mt-6 space-y-4 text-base leading-8 md:text-lg", dark ? "text-leaf/85" : "text-muted")}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
