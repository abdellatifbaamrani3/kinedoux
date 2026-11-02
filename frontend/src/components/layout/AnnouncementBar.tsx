import { getLocale } from "@/i18n/get-locale";
import { uiCopy } from "@/i18n/ui";

export async function AnnouncementBar() {
  const ui = uiCopy(await getLocale());
  return (
    <div className="bg-brand-dark py-2 text-center text-[11px] font-medium leading-5 text-alabaster sm:text-xs md:text-sm">
      <p className="kd-container px-3">
        <span className="ml-1 text-leaf">●</span> {ui.announcement}
      </p>
    </div>
  );
}
