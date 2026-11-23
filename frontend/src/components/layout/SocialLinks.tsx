import { Facebook, Instagram } from "lucide-react";

import type { Locale } from "@/i18n/locale";
import { uiCopy } from "@/i18n/ui";
import { cn } from "@/lib/utils";

export const SOCIAL = {
  facebook: "https://www.facebook.com/kinedoux",
  instagram: "https://www.instagram.com/kinedoux",
} as const;

export function SocialLinks({ locale, onDark = false }: { locale: Locale; onDark?: boolean }) {
  const ui = uiCopy(locale);
  const items = [
    { href: SOCIAL.facebook, label: ui.facebook, Icon: Facebook },
    { href: SOCIAL.instagram, label: ui.instagram, Icon: Instagram },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ href, label, Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold",
            onDark
              ? "border border-white/15 text-white hover:bg-white/10"
              : "border border-brand/15 bg-white text-brand-dark hover:bg-sage",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </a>
      ))}
    </div>
  );
}
