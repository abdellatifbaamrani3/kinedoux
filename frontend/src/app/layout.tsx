import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import { META_PIXEL_ID, metaPixelBootScript } from "@/lib/meta-pixel";
import { SITE_URL } from "@/lib/utils";
import "./globals.css";

const META_BOOT = metaPixelBootScript(META_PIXEL_ID);

const plexArabic = localFont({
  src: [
    { path: "../fonts/ibm-plex-sans-arabic-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-sans-arabic-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ibm-plex-sans-arabic-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-plex",
  adjustFontFallback: false,
  fallback: ["Segoe UI", "Tahoma", "Arial", "sans-serif"],
});

const DIR_SCRIPT = `(function(){var p=location.pathname;var fr=p==="/fr"||p.indexOf("/fr/")===0;var en=p==="/en"||p.indexOf("/en/")===0||p==="/admin"||p.indexOf("/admin/")===0;document.documentElement.lang=fr?"fr":en?"en":"ar-MA";document.documentElement.dir=fr||en?"ltr":"rtl";})();`;

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
    <html lang="ar-MA" dir="rtl" suppressHydrationWarning>
      <head>
        {META_BOOT ? (
          // A real inline script. next/script beforeInteractive only pushes onto
          // self.__next_s and runs after the Next.js runtime, which held PageView back.
          <script id="kd-meta-pixel" dangerouslySetInnerHTML={{ __html: META_BOOT }} />
        ) : null}
      </head>
      <body className={`${plexArabic.variable} min-h-screen antialiased`}>
        <Script id="kd-dir" strategy="beforeInteractive">
          {DIR_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
