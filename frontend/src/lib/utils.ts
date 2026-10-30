export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** 1149 -> "1,149 د.م" (Western numerals, as is standard in Morocco). */
export function formatMad(amount: number): string {
  return `${amount.toLocaleString("en-US")} د.م`;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://kenidoux.com").replace(/\/$/, "");
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212600000000";
export const UPSELL_SECONDS = Math.max(
  5,
  Number.parseInt(process.env.NEXT_PUBLIC_UPSELL_TIMER_SECONDS || "15", 10) || 15,
);

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
