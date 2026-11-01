/**
 * Single source of truth for every image on the site.
 * All files are clinical-branded SVG samples in /public/images — to use real photos, upload them to
 * /public/images (any format: .webp/.jpg/.png) and change the path below. No component changes needed.
 */
export type ProductImageSet = {
  main: string;
  mechanism: string;
  lifestyle: string;
  kit: string;
  sections: [string, string, string];
};

const set = (key: "lumba" | "posta" | "calma"): ProductImageSet => ({
  main: `/images/${key}/main.webp`,
  mechanism: `/images/${key}/mechanism.svg`,
  lifestyle: `/images/${key}/lifestyle.svg`,
  kit: `/images/${key}/kit-contents.svg`,
  sections: [`/images/${key}/section-1.svg`, `/images/${key}/section-2.svg`, `/images/${key}/section-3.svg`],
});

export const IMAGES = {
  hero: "/images/hero-kenidoux-collection.webp",
  bundle: "/images/bundle-kit.svg",
  home: {
    struggle: "/images/home-section-1.webp",
    compare: "/images/home-section-2.svg",
    unboxing: "/images/about-unbox.webp",
  },
  about: {
    hub: "/images/about-hub.svg",
    pillars: "/images/about-pillars.webp",
    trust: "/images/about-trust.svg",
  },
  ugc: ["/images/ugc-1.svg", "/images/ugc-2.svg", "/images/ugc-3.svg"],
  badges: {
    ceIso: "/images/badges/ce-iso.svg",
    guarantee: "/images/badges/guarantee-14d.svg",
  },
  products: {
    "kenidoux-lumba": {
      ...set("lumba"),
      mechanism: "/images/lumba/how.webp",
      lifestyle: "/images/lumba/drive.webp",
      kit: "/images/lumba/kit.webp",
      sections: ["/images/lumba/salon.webp", "/images/lumba/how.webp", "/images/lumba/kit.webp"],
    },
    "kenidoux-posta": { ...set("posta"), main: "/images/posta/office.webp" },
    "kenidoux-calma": { ...set("calma"), main: "/images/calma/studio.webp" },
  } as Record<string, ProductImageSet>,
};

export const GALLERY_LABELS = ["الصورة الرئيسية", "التقنية العلمية", "طريقة الاستعمال", "محتويات العلبة"] as const;
