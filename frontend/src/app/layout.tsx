import type { Metadata } from "next";
import { Cairo, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";

import { SITE_URL } from "@/lib/utils";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-cairo",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-jakarta",
  display: "swap",
  preload: false,
});

const DIR_SCRIPT = `(function(){var p=location.pathname;var fr=p==="/fr"||p.indexOf("/fr/")===0;var en=p==="/en"||p.indexOf("/en/")===0;document.documentElement.lang=fr?"fr":en?"en":"ar-MA";document.documentElement.dir=fr||en?"ltr":"rtl";})();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "كينيدو | Kinédoux™ — راحة الظهر والوقفة بالمغرب", template: "%s | Kinédoux™" },
  description: "الماركة المتخصصة فراحة الظهر والوقفة فالمغرب.",
  openGraph: {
    type: "website",
    siteName: "Kinédoux™",
    images: [{ url: "/images/hero-kenidoux-collection.svg", width: 1200, height: 900, alt: "Kinédoux" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar-MA" dir="rtl" className={`${cairo.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="font-arabic min-h-screen antialiased">
        <Script id="kd-dir" strategy="beforeInteractive">
          {DIR_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
