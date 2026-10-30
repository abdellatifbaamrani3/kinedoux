import Link from "next/link";

export function BrandLogo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2 group sm:gap-3" aria-label="كينيدو Kinédoux — الصفحة الرئيسية">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 shadow-sm transition-transform group-hover:scale-105 md:h-12 md:w-12 ${
          light ? "border-leaf bg-brand" : "border-leaf bg-brand"
        }`}
      >
        <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
          <path d="M16.1 7.1C19.2 8.8 18.8 13.1 16.6 16.3 15.2 18.4 16 21.2 15.8 25.1" fill="none" stroke="#F4F7F8" strokeWidth="2.28" strokeLinecap="round" />
          <path d="M18.1 18.6C15.1 20.5 12.8 21 13.1 23.5" fill="none" stroke="#C5DFF0" strokeWidth="1.52" strokeLinecap="round" />
          <path d="M17.1 18.4C18.2 14.1 20.1 11.7 22.3 12.3 23.2 15.8 20.8 19.4 17.8 20.3 16.7 19.6 16.4 18.8 17.1 18.4Z" fill="#C5DFF0" />
        </svg>
      </div>
      <div className="flex flex-col items-start justify-center leading-none">
        <span
          className={`font-bold tracking-tight ${light ? "text-alabaster" : "text-brand-dark"} ${compact ? "text-lg" : "text-lg sm:text-xl md:text-2xl"}`}
        >
          كينيدو
        </span>
        <span
          className={`mt-0.5 hidden font-sans text-[10px] font-semibold tracking-[0.22em] sm:block md:mt-1 md:text-[11px] ${light ? "text-leaf" : "text-brand"}`}
        >
          KINÉDOUX
        </span>
        {!compact ? (
          <span className={`mt-0.5 hidden font-sans text-[9px] tracking-[0.14em] lg:block ${light ? "text-alabaster/55" : "text-muted"}`}>
            Confort Dorsal & Posture
          </span>
        ) : null}
      </div>
    </Link>
  );
}
