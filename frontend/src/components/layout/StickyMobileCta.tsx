"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function StickyMobileCta({
  href,
  label,
  note,
  showAfter = 600,
}: {
  href: string;
  label: string;
  note?: string;
  showAfter?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isPast = window.scrollY > showAfter;
          setVisible((prev) => (prev !== isPast ? isPast : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-brand/10 bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <Link href={href} className="kd-cta" tabIndex={visible ? undefined : -1}>
        {label}
      </Link>
      {note ? <p className="mt-2 text-center text-xs font-bold text-muted">{note}</p> : null}
    </div>
  );
}
