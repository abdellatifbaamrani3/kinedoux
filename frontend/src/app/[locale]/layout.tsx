import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { FunnelShell } from "@/components/layout/FunnelShell";
import { Header } from "@/components/layout/Header";
import { setRequestLocale } from "@/i18n/get-locale";
import { isLocale, LOCALES } from "@/i18n/locale";
import { LocaleProvider } from "@/i18n/locale-context";
import { uiCopy } from "@/i18n/ui";
import { SITE_URL } from "@/lib/utils";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const ui = uiCopy(raw);
  const title =
    raw === "fr"
      ? "Kinédoux™ — confort du dos et posture au Maroc"
      : raw === "en"
        ? "Kinédoux™ — back comfort and posture in Morocco"
        : "كينيدو | Kinédoux™ — راحة الظهر والوقفة بالمغرب";
  return {
    title,
    description: ui.tagline,
    alternates: {
      canonical: raw === "ar" ? SITE_URL : `${SITE_URL}/${raw}`,
      languages: {
        "ar-MA": SITE_URL,
        fr: `${SITE_URL}/fr`,
        en: `${SITE_URL}/en`,
      },
    },
    openGraph: {
      locale: raw === "fr" ? "fr_MA" : raw === "en" ? "en" : "ar_MA",
      title,
      description: ui.tagline,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <LocaleProvider locale={locale}>
      <div className="sticky top-0 z-40">
        <AnnouncementBar />
        <Header />
      </div>
      <main>{children}</main>
      <Footer />
      <FunnelShell />
    </LocaleProvider>
  );
}
