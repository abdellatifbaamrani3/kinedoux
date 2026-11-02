import type { Locale } from "./locale";

export function money(amount: number, locale: Locale): string {
  const value = amount.toLocaleString("en-US");
  return locale === "ar" ? `${value} د.م` : `${value} DH`;
}
