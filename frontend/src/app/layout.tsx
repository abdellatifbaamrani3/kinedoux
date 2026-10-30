import type { Metadata } from "next";
import { Cairo, Plus_Jakarta_Sans } from "next/font/google";

import { TAGLINE } from "@/data/content";
import { SITE_URL } from "@/lib/utils";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { FunnelShell } from "@/components/layout/FunnelShell";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "كينيدو | Kinédoux™ — راحة الظهر والوقفة بالمغرب",
    template: "%s | كينيدو Kinédoux™",
  },
  description: TAGLINE,
  openGraph: {
    type: "website",
    locale: "ar_MA",
    url: SITE_URL,
    siteName: "كينيدو Kinédoux™",
    title: "كينيدو | Kinédoux™ — راحة الظهر والوقفة بالمغرب",
    description: TAGLINE,
    images: [{ url: "/images/hero-kenidoux-collection.svg", width: 1200, height: 900, alt: "كينيدو" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar-MA" dir="rtl" className={`${cairo.variable} ${jakarta.variable}`}>
      <body className="font-arabic min-h-screen antialiased">
        <div className="sticky top-0 z-40 overflow-x-clip">
          <AnnouncementBar />
          <Header />
        </div>
        <main>{children}</main>
        <Footer />
        <FunnelShell />
      </body>
    </html>
  );
}
