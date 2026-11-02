import { cache } from "react";
import { notFound } from "next/navigation";

import { isLocale, type Locale } from "./locale";

const requestLocale = cache(() => ({ locale: "ar" as Locale }));

export function setRequestLocale(locale: string) {
  if (!isLocale(locale)) notFound();
  requestLocale().locale = locale;
}

export async function getLocale(): Promise<Locale> {
  return requestLocale().locale;
}

export async function localeFromParams(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  setRequestLocale(locale);
  return requestLocale().locale;
}
