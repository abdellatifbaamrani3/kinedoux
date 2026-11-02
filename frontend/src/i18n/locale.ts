export const LOCALES = ["ar", "fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "kd-lang";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "ar" || value === "fr" || value === "en";
}

export function htmlLang(locale: Locale): string {
  if (locale === "fr") return "fr";
  if (locale === "en") return "en";
  return "ar-MA";
}

export function htmlDir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function stripLocale(pathname: string): string {
  const bare = pathname.replace(/^\/(fr|en)(?=\/|$)/, "");
  return bare === "" ? "/" : bare;
}

/** Arabic stays on the public path. French and English get a prefix so each language can be cached. */
export function localePath(href: string, locale: Locale): string {
  const hashAt = href.indexOf("#");
  const hash = hashAt >= 0 ? href.slice(hashAt) : "";
  const beforeHash = hashAt >= 0 ? href.slice(0, hashAt) : href;
  const queryAt = beforeHash.indexOf("?");
  const query = queryAt >= 0 ? beforeHash.slice(queryAt) : "";
  const pathname = queryAt >= 0 ? beforeHash.slice(0, queryAt) : beforeHash;
  if (!pathname.startsWith("/")) return href;
  const bare = stripLocale(pathname);
  const localized = locale === "ar" ? bare : bare === "/" ? `/${locale}` : `/${locale}${bare}`;
  return `${localized}${query}${hash}`;
}
