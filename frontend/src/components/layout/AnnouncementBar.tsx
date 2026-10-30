import { ANNOUNCEMENT } from "@/data/content";

export function AnnouncementBar() {
  return (
    <div className="bg-brand-dark py-2 text-center text-[11px] font-medium leading-5 text-alabaster sm:text-xs md:text-sm">
      <p className="kd-container px-3">
        <span className="ml-1 text-leaf">●</span> {ANNOUNCEMENT}
      </p>
    </div>
  );
}
