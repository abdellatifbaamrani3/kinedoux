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
  hero: "/images/hero-kenidoux-collection-2.webp",
  bundle: "/images/bundle-kit.svg",
  home: {
    struggle: "/images/home-section-1.webp",
    compare: "/images/home-section-2.svg",
    unboxing: "/images/about-unbox-2.webp",
  },
  about: {
    hub: "/images/about-hub-2.webp",
    pillars: "/images/about-pillars-2.webp",
    trust: "/images/about-trust-2.webp",
  },
  ugc: ["/images/ugc-1.svg", "/images/ugc-2.svg", "/images/ugc-3.svg"],
  badges: {
    ceIso: "/images/badges/ce-iso.svg",
    guarantee: "/images/badges/guarantee-14d.svg",
  },
  products: {
    "kenidoux-lumba": {
      ...set("lumba"),
      main: "/images/lumba/main-2.webp",
      mechanism: "/images/lumba/how-2.webp",
      lifestyle: "/images/lumba/drive-2.webp",
      kit: "/images/lumba/kit-2.webp",
      sections: ["/images/lumba/salon-2.webp", "/images/lumba/how-2.webp", "/images/lumba/kit-2.webp"],
    },
    "kenidoux-posta": {
      ...set("posta"),
      main: "/images/posta/office.webp",
      mechanism: "/images/posta/button.webp",
      lifestyle: "/images/posta/laptop.webp",
      kit: "/images/posta/kit.webp",
      sections: ["/images/posta/clip.webp", "/images/posta/button.webp", "/images/posta/laptop.webp"],
    },
    "kenidoux-calma": {
      ...set("calma"),
      main: "/images/calma/studio.webp",
      mechanism: "/images/calma/buttons.webp",
      lifestyle: "/images/calma/knee.webp",
      kit: "/images/calma/kit.webp",
      sections: ["/images/calma/apply.webp", "/images/calma/buttons.webp", "/images/calma/knee.webp"],
    },
  } as Record<string, ProductImageSet>,
};

export const GALLERY_LABELS = ["الصورة الرئيسية", "التقنية العلمية", "طريقة الاستعمال", "محتويات العلبة"] as const;
