import type { Metadata } from "next";
import Script from "next/script";

import { META_PIXEL_ID, metaPixelBootScript } from "@/lib/meta-pixel";
import { SITE_URL } from "@/lib/utils";
import "./globals.css";

const META_BOOT = metaPixelBootScript(META_PIXEL_ID);

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
    <html lang="ar-MA" dir="rtl" suppressHydrationWarning>
      <body className="font-arabic min-h-screen antialiased">
        <Script id="kd-dir" strategy="beforeInteractive">
          {DIR_SCRIPT}
        </Script>
        {META_BOOT ? (
          <Script id="kd-meta-pixel" strategy="beforeInteractive">
            {META_BOOT}
          </Script>
        ) : null}
        {children}
        {META_BOOT ? (
          <noscript>
            {/* Meta's noscript pixel is a 1px image. next/image cannot render inside noscript. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height={1}
              width={1}
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        ) : null}
      </body>
    </html>
  );
}
