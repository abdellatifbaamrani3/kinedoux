import { isBundleOffer, type Offer, type Product, type ProductSlug } from "@/data/products";
import type { Locale } from "@/i18n/locale";

export type OfferCardView = {
  name: string;
  detail: string;
  button: string;
  qty: number;
  price: number;
  oldPrice: number | null;
  saveLabel: string | null;
  math: string | null;
  ribbon: boolean;
};

type PairSpec = {
  name: string;
  button: string;
  detail?: string | ((perUnit: string) => string);
  math: (second: string, was: string) => string;
};

type ProductSpec = {
  single: { name: string; detail: string; button: string };
  pair: PairSpec;
};

type BlockCopy = {
  header: string;
  ship: string;
  door: string;
  chosen: string;
  ribbon: string;
  note: string;
  currency: string;
  save: (amount: string) => string;
  order: (name: string, price: string) => string;
  bundleName: string;
  bundleDetail: string;
  bundleButton: string;
  bundleMath: (price: string, was: string) => string;
  products: Record<ProductSlug, ProductSpec>;
};

const ar: BlockCopy = {
  header: "اختار شحال بغيتي",
  ship: "التوصيل فابور",
  door: "الخلاص عند الباب",
  chosen: "هادا اللي اخترتي",
  ribbon: "أحسن قيمة",
  note: "ما كتخلّص والو دابا. كنعيطو ليك من كازا باش نأكدو.",
  currency: "درهم",
  save: (amount) => `كتربح ${amount} درهم`,
  order: (name, price) => `اطلب ${name} — ${price} درهم`,
  bundleName: "الباقة الكاملة",
  bundleDetail: "لومبا + بوسطا + كالما",
  bundleButton: "الباقة الكاملة",
  bundleMath: (price, was) => `الثلاثة بـ ${price} بلاصة ${was}`,
  products: {
    "kenidoux-palma": {
      single: { name: "جهاز واحد", detail: "ليك نتا · الجهاز + الحزام", button: "جهاز واحد" },
      pair: {
        name: "جوج — ليك وللواليدين",
        button: "جوج أجهزة",
        detail: (perUnit) => `${perUnit} درهم للجهاز · فنفس الكولية`,
        math: (second, was) => `الجهاز التاني بـ ${second} بلاصة ${was}`,
      },
    },
    "kenidoux-lumba": {
      single: { name: "حزام واحد", detail: "ليك نتا · حزام + مضخة + وصلة + دليل", button: "حزام واحد" },
      pair: {
        name: "جوج — ليك وللواليدين",
        button: "جوج أحزمة",
        math: (second, was) => `الحزام التاني بـ ${second} بلاصة ${was}`,
      },
    },
    "kenidoux-posta": {
      single: { name: "بوسطا وحدة", detail: "منبّه + وسادة رقبة + برنامج 14 يوم", button: "بوسطا وحدة" },
      pair: {
        name: "جوج — ليك ولشي حد عزيز",
        button: "جوج بوسطا",
        math: (second, was) => `التانية بـ ${second} بلاصة ${was}`,
      },
    },
    "kenidoux-calma": {
      single: { name: "جهاز كالما واحد", detail: "الجهاز + حقيبة + كابل USB-C", button: "جهاز كالما واحد" },
      pair: {
        name: "جوج — ليك ولشي حد عزيز",
        button: "جوج أجهزة",
        math: (second, was) => `التاني بـ ${second} بلاصة ${was}`,
      },
    },
  },
};

const fr: BlockCopy = {
  header: "Choisissez la quantité",
  ship: "Livraison offerte",
  door: "Paiement à la porte",
  chosen: "C’est celui-ci",
  ribbon: "Meilleur prix",
  note: "Vous ne payez rien maintenant. On vous appelle de Casablanca pour confirmer.",
  currency: "DH",
  save: (amount) => `Vous gagnez ${amount} DH`,
  order: (name, price) => `Commander ${name} — ${price} DH`,
  bundleName: "Pack complet",
  bundleDetail: "Lumba + Posta + Calma",
  bundleButton: "le pack complet",
  bundleMath: (price, was) => `Les trois à ${price} au lieu de ${was}`,
  products: {
    "kenidoux-palma": {
      single: { name: "Un appareil", detail: "Pour vous · appareil + sangle", button: "un appareil" },
      pair: {
        name: "Deux — pour vous et vos parents",
        button: "deux appareils",
        detail: (perUnit) => `${perUnit} DH l’appareil · même colis`,
        math: (second, was) => `Le 2e appareil à ${second} au lieu de ${was}`,
      },
    },
    "kenidoux-lumba": {
      single: { name: "Une ceinture", detail: "Pour vous · ceinture + pompe + rallonge + guide", button: "une ceinture" },
      pair: {
        name: "Deux — pour vous et vos parents",
        button: "deux ceintures",
        math: (second, was) => `La 2e ceinture à ${second} au lieu de ${was}`,
      },
    },
    "kenidoux-posta": {
      single: { name: "Une Posta", detail: "Rappel + coussin + programme 14 jours", button: "une Posta" },
      pair: {
        name: "Deux — pour vous et quelqu’un",
        button: "deux Posta",
        math: (second, was) => `La 2e à ${second} au lieu de ${was}`,
      },
    },
    "kenidoux-calma": {
      single: { name: "Un Calma", detail: "Appareil + trousse + câble USB-C", button: "un Calma" },
      pair: {
        name: "Deux — pour vous et quelqu’un",
        button: "deux appareils",
        math: (second, was) => `Le 2e à ${second} au lieu de ${was}`,
      },
    },
  },
};

const en: BlockCopy = {
  header: "Choose how many",
  ship: "Free delivery",
  door: "Pay at the door",
  chosen: "This is the one",
  ribbon: "Best value",
  note: "You pay nothing now. We call from Casablanca to confirm.",
  currency: "DH",
  save: (amount) => `You save ${amount} DH`,
  order: (name, price) => `Order ${name} — ${price} DH`,
  bundleName: "Full kit",
  bundleDetail: "Lumba + Posta + Calma",
  bundleButton: "the full kit",
  bundleMath: (price, was) => `All three for ${price} instead of ${was}`,
  products: {
    "kenidoux-palma": {
      single: { name: "One device", detail: "For you · device + strap", button: "one device" },
      pair: {
        name: "Two — for you and your parents",
        button: "two devices",
        detail: (perUnit) => `${perUnit} DH each · same parcel`,
        math: (second, was) => `The 2nd device is ${second} instead of ${was}`,
      },
    },
    "kenidoux-lumba": {
      single: { name: "One belt", detail: "For you · belt + pump + extender + guide", button: "one belt" },
      pair: {
        name: "Two — for you and your parents",
        button: "two belts",
        math: (second, was) => `The 2nd belt is ${second} instead of ${was}`,
      },
    },
    "kenidoux-posta": {
      single: { name: "One Posta", detail: "Reminder + neck cushion + 14-day plan", button: "one Posta" },
      pair: {
        name: "Two — for you and someone close",
        button: "two Posta",
        math: (second, was) => `The 2nd is ${second} instead of ${was}`,
      },
    },
    "kenidoux-calma": {
      single: { name: "One Calma", detail: "Device + case + USB-C cable", button: "one Calma" },
      pair: {
        name: "Two — for you and someone close",
        button: "two devices",
        math: (second, was) => `The 2nd is ${second} instead of ${was}`,
      },
    },
  },
};

const COPY: Record<Locale, BlockCopy> = { ar, fr, en };

export function formatOfferAmount(amount: number): string {
  if (Number.isInteger(amount)) return amount.toLocaleString("en-US");
  return amount.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function offerBlockCopy(locale: Locale) {
  const copy = COPY[locale];
  return {
    header: copy.header,
    ship: copy.ship,
    door: copy.door,
    chosen: copy.chosen,
    ribbon: copy.ribbon,
    note: copy.note,
  };
}

function singleOffer(product: Product): Offer {
  return product.offers.find((item) => item.units === 1 && !isBundleOffer(item)) ?? product.offers[0];
}

export function offerCardView(product: Product, offer: Offer, locale: Locale): OfferCardView {
  const copy = COPY[locale];
  const spec = copy.products[product.slug];
  const single = singleOffer(product);
  const save = offer.compareAt - offer.price;
  const bundle = isBundleOffer(offer);
  const pair = !bundle && offer.units > 1;
  const amount = formatOfferAmount(offer.price);
  let name = offer.title;
  let detail = "";
  let button = offer.title;

  if (bundle) {
    name = copy.bundleName;
    detail = copy.bundleDetail;
    button = copy.bundleButton;
  } else if (pair && spec) {
    name = spec.pair.name;
    button = spec.pair.button;
    const perUnit = formatOfferAmount(offer.price / offer.units);
    detail = typeof spec.pair.detail === "function" ? spec.pair.detail(perUnit) : spec.pair.detail ?? "";
  } else if (spec) {
    name = spec.single.name;
    detail = spec.single.detail;
    button = spec.single.button;
  }

  const second = offer.price - single.price;
  const math = bundle
    ? copy.bundleMath(amount, formatOfferAmount(offer.compareAt))
    : pair && spec
      ? spec.pair.math(formatOfferAmount(second), formatOfferAmount(single.price))
      : null;

  return {
    name,
    detail,
    button,
    qty: offer.units,
    price: offer.price,
    oldPrice: save > 0 ? offer.compareAt : null,
    saveLabel: save > 0 ? copy.save(formatOfferAmount(save)) : null,
    math: save > 0 ? math : null,
    ribbon: pair,
  };
}

export function offerOrderText(product: Product, offer: Offer, locale: Locale): string {
  const copy = COPY[locale];
  const card = offerCardView(product, offer, locale);
  return copy.order(card.button, formatOfferAmount(card.price));
}

export function offerPriceLabel(offer: Offer, locale: Locale): string {
  return `${formatOfferAmount(offer.price)} ${COPY[locale].currency}`;
}
