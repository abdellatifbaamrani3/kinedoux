import { PRODUCTS, type Product, type ProductSlug } from "@/data/products";

import type { Locale } from "./locale";
import { uiCopy } from "./ui";
import { deepMerge } from "./merge";

const free = { fr: "Livraison offerte", en: "Free delivery" };
const popular = { fr: "Le plus demandé", en: "Most popular" };
const family = { fr: "Offre famille", en: "Family offer" };
const kitBadge = { fr: "Pack complet", en: "Full kit" };

function offers(locale: "fr" | "en", rows: Array<{ title: string; subtitle: string; badge: string }>) {
  return rows;
}

const FR = {
  "kenidoux-lumba": {
    nameAr: "Kinédoux Lumba",
    category: "Le plus demandé — confort du bas du dos",
    cardHeading: "Kinédoux Lumba — ceinture du bas du dos",
    cardSubheading: "Soutien léger après la conduite, une longue position assise ou la station debout. Les colonnes d’air se gonflent en quelques pressions, assis ou au volant.",
    scarcityBadge: "Livraison offerte en 24–48 h depuis Casablanca · paiement à la livraison",
    scarcityShort: free.fr,
    crossSellNote: "au lieu de 499 DH",
    offers: offers("fr", [
      { title: "Une ceinture", subtitle: "Lumba + pompe + rallonge + guide + livraison offerte", badge: free.fr },
      { title: "Deux ceintures — pour vous et vos parents", subtitle: "Une pour vous, une pour un parent. La deuxième à 350 DH au lieu de 499, dans le même colis.", badge: popular.fr },
      { title: "Trois ceintures pour la famille", subtitle: "Pour toute la maison, même livraison offerte, sans frais en plus.", badge: family.fr },
    ]),
    bonuses: [
      "Pompe à air manuelle avec valve de sécurité",
      "Rallonge pour les tours de taille de 70 à 130 cm",
      "Guide Kinédoux en darija et en français, routine de 10 minutes",
      "Livraison offerte jusqu’à la porte + paiement à la réception",
    ],
    kitTitle: "Qu’est-ce qui arrive dans votre colis ?",
    kitContents: [
      "Ceinture à air Kinédoux Lumba",
      "Pompe à air manuelle avec valve de sécurité",
      "Rallonge de 70 à 130 cm",
      "Guide illustré en darija et en français",
      "Livraison rapide et offerte jusqu’à la porte",
    ],
    heroHook: {
      title: "Rester assis et conduire pèsent sur le bas du dos. Le soutien peut rester simple.",
      body: "Kinédoux Lumba se ferme à la taille et se gonfle en quelques pressions. Un soutien léger assis, au volant ou au travail — sans électronique.",
    },
    sections: [
      {
        title: "Un peu de légèreté à la maison, au travail et pour la prière",
        body: "Quand le bas du dos est lourd, se lever, s’incliner et même dormir paraît plus dur. Lumba se gonfle verticalement en 5 pressions pour un appui stable, sans bloquer le mouvement.",
        bullets: ["Se gonfle en 5 pressions de pompe", "Confortable debout, en inclinaison et au repos", "Ne gêne pas en voiture ni au bureau"],
      },
      {
        title: "Colonnes d’air verticales : un soutien de l’intérieur, pas une sangle sur le ventre",
        body: "Les ceintures ordinaires appuient sur le ventre. Lumba s’appuie sur des colonnes d’air qui montent quand vous gonflez, pour alléger le bas du dos.",
        bullets: ["Des colonnes verticales pour un étirement léger", "Gonflage progressif : arrêtez au confort, pas à la dureté", "Une rallonge pour la plupart des tours de taille"],
      },
      {
        title: "Des matières choisies pour garder l’air, et le confort",
        body: "Chaque couche a un rôle : tenir le gonflage, laisser la peau respirer, et vider l’air simplement.",
        cards: [
          { title: "Couche TPU dense", body: "Garde l’air sans se dégonfler trop vite." },
          { title: "Doublure maille", body: "Douce sur la peau, adaptée au climat du Maroc, sous les vêtements." },
          { title: "Valve et pompe rapides", body: "Gonflage précis, et l’air sort en une pression." },
        ],
      },
    ],
    steps: [
      { title: "Fermez la ceinture", body: "Passez Lumba autour de la taille, sur ou sous les vêtements, à une taille confortable." },
      { title: "5 pressions de pompe", body: "Gonflez jusqu’à un étirement vertical léger. Arrêtez avant que ce soit dur." },
      { title: "Reposez 10–15 minutes", body: "Commencez court les premiers jours, puis videz l’air avec la valve." },
    ],
    comparisonOriginal: ["Matière qui garde l’air", "Guide en darija et en français", "Échange offert sous 14 jours", "Rallonge de 70 à 130 cm", "Suivi depuis Casablanca"],
    crossSellPitches: {
      "kenidoux-posta": "Ajoutez la ceinture à air pour le bas du dos dans le même colis",
      "kenidoux-calma": "Ajoutez la ceinture la plus demandée pour le bas du dos",
    },
    metaDescription: "Kinédoux Lumba — ceinture à air pour le bas du dos. Livraison offerte au Maroc et paiement après ouverture du colis.",
  },
  "kenidoux-posta": {
    nameAr: "Kinédoux Posta",
    category: "Posture légère et confort de la nuque",
    cardHeading: "Kinédoux Posta — posture et nuque",
    cardSubheading: "Un rappel doux quand vous vous penchez devant l’écran, et un moment de nuque le soir. Léger, sans sangle dure.",
    scarcityBadge: "Livraison offerte en 24–48 h depuis Casablanca · paiement à la livraison",
    scarcityShort: free.fr,
    crossSellNote: "au lieu de 379 DH",
    offers: offers("fr", [
      { title: "Un pack Posta", subtitle: "Rappel + programme 14 jours + livraison offerte", badge: free.fr },
      { title: "Deux packs — pour vous et quelqu’un", subtitle: "Pour le couple, ou pour vous et un enfant qui étudie. Le second à 270 DH au lieu de 379, même colis.", badge: popular.fr },
      { title: "Trois packs pour le bureau ou la famille", subtitle: "Trois ensembles complets, même livraison offerte.", badge: family.fr },
    ]),
    bonuses: [
      "Ceinture légère avec capteur d’angle et vibration discrète",
      "Coussin de nuque",
      "Programme 14 jours en darija et en français",
      "Câble de charge USB-C — une charge tient plusieurs jours",
    ],
    kitTitle: "Qu’est-ce qui arrive dans votre colis ?",
    kitContents: [
      "Ceinture Kinédoux avec capteur d’angle et vibration discrète",
      "Coussin de nuque Kinédoux",
      "Programme 14 jours en darija et en français",
      "Câble de charge USB-C",
      "Livraison rapide et offerte jusqu’à la porte",
    ],
    heroHook: {
      title: "Les heures devant le téléphone et l’ordinateur arrondissent les épaules. La solution n’est pas une sangle dure.",
      body: "Posta est légère : dans la journée une vibration douce vous rappelle de vous redresser.",
    },
    sections: [
      {
        title: "Une posture confortable, discrète sous les vêtements",
        body: "La posture affaissée change le confort devant l’ordinateur. À la place des sangles dures, Posta reste légère et ne coupe pas sous les bras.",
        bullets: ["Légère et discrète sous les vêtements", "Pas de sangles dures sous les bras", "Pour le travail, les études et les photos"],
      },
      {
        title: "Un rappel dans la journée",
        body: "Le capteur repère l’inclinaison et envoie une vibration discrète pour vous redresser. Pas de Bluetooth, pas d’application.",
        bullets: ["Une vibration légère quand vous vous penchez trop", "Un programme de 14 jours, étape par étape", "Une touche, pas une application"],
      },
      {
        title: "Simple au quotidien : pas de Bluetooth, pas d’application",
        body: "Une touche, une batterie qui tient plusieurs jours, et des sangles souples.",
        cards: [
          { title: "Capteur d’angle", body: "Sans Bluetooth et sans ondes. Une touche, et la batterie dure." },
          { title: "Sangles souples", body: "Souples sur les épaules, pour la plupart des tailles." },
          { title: "Réglage simple", body: "Se pose sur les épaules et se règle sans outil." },
        ],
      },
    ],
    steps: [
      { title: "Activez le capteur", body: "Placez la ceinture sur les épaules et allumez d’une touche, sans application." },
      { title: "Un rappel doux", body: "Quand vous vous penchez, une vibration discrète vous rappelle de vous redresser." },
      { title: "Quelques minutes le soir", body: "Relâchez les épaules quelques minutes après la journée d’écran." },
    ],
    comparisonOriginal: ["Capteur sans Bluetooth ni application", "Programme 14 jours en darija et en français", "Échange offert sous 14 jours", "Léger sous les vêtements", "Suivi depuis Casablanca"],
    crossSellPitches: {
      "kenidoux-lumba": "Complétez avec le confort du bas du dos",
      "kenidoux-calma": "Ajoutez Calma pour les épaules après une journée d’écran",
    },
    metaDescription: "Kinédoux Posta — rappel de posture léger. Livraison offerte au Maroc et paiement à la réception.",
  },
  "kenidoux-calma": {
    nameAr: "Kinédoux Calma",
    category: "Rituel du soir",
    cardHeading: "Kinédoux Calma — ventouses chaudes, sans marque",
    cardSubheading: "La version actuelle des ventouses : chaleur confortable et aspiration douce pour les épaules, le dos ou le genou, en 15 minutes, sans feu et sans désordre.",
    scarcityBadge: "Souvent ajouté avec Lumba : même colis, pas de livraison en plus",
    scarcityShort: "Sans marque",
    crossSellNote: "au lieu de 349 DH",
    offers: offers("fr", [
      { title: "Un appareil Calma", subtitle: "Appareil + câble USB-C + livraison offerte", badge: free.fr },
      { title: "Deux appareils — épaules ou cadeau", subtitle: "Un pour vous, un pour vos parents. Le second à 250 DH au lieu de 349, même colis.", badge: popular.fr },
      { title: "Pack complet (Lumba + Posta + Calma)", subtitle: "Dos, posture et détente dans un seul colis — moins cher qu’à l’unité.", badge: kitBadge.fr },
    ]),
    bonuses: [
      "Appareil à ventouse avec chaleur douce",
      "Pochette de rangement",
      "Câble de charge USB-C",
      "Guide Kinédoux en darija et en français + livraison offerte",
    ],
    kitTitle: "Qu’est-ce qui arrive dans votre colis ?",
    kitContents: [
      "Appareil Kinédoux Calma",
      "Pochette de rangement",
      "Câble de charge USB-C",
      "Guide illustré en darija et en français",
      "Livraison rapide et offerte jusqu’à la porte",
    ],
    heroHook: {
      title: "Les épaules et le dos de la journée… 15 minutes de chaleur à la maison.",
      body: "Au Maroc, on connaît le confort des ventouses. Calma en est la version actuelle : sans marque, sans feu et sans désordre. Une chaleur qui détend, et une aspiration douce avant de dormir.",
    },
    sections: [
      {
        title: "15 minutes avant de dormir suffisent à déposer la journée",
        body: "Après le travail, le sport, ou simplement pour offrir une séance chaude à vos parents. Calma s’allume d’une touche, avec une minuterie et un bouton pour relâcher à tout moment.",
        bullets: ["Minuterie automatique (jusqu’à 20 minutes)", "Bouton pour relâcher d’une touche", "Un cadeau clair pour les parents"],
      },
      {
        title: "Chaleur + aspiration douce, dans un seul appareil",
        body: "Au lieu d’une ventouse fixe qui marque la peau, Calma alterne une prise et un relâchement doux, avec des niveaux de force et de chaleur.",
        bullets: ["Plusieurs niveaux de force et de chaleur douce", "Un rythme de prise et de relâchement", "Pour l’épaule, le dos ou le genou"],
      },
      {
        title: "Propre, sûr, et simple pour toute la maison",
        body: "Bords doux, chaleur contrôlée, et relâchement immédiat avant de retirer l’appareil.",
        cards: [
          { title: "Coupelle transparente", body: "Des bords arrondis qui glissent sur les épaules, le dos et les jambes." },
          { title: "Chaleur régulée", body: "Une chaleur stable et confortable, sans excès." },
          { title: "Bouton de relâchement", body: "Une pression arrête l’aspiration avant de retirer la coupelle." },
        ],
      },
    ],
    steps: [
      { title: "Posez et choisissez", body: "Placez la coupelle sur l’épaule, le dos ou le genou, puis choisissez la chaleur et la force." },
      { title: "Une touche, puis le repos", body: "L’aspiration chaude commence et s’arrête toute seule à la fin du temps." },
      { title: "Relâchez d’une touche", body: "Appuyez pour arrêter l’aspiration, puis retirez l’appareil doucement." },
    ],
    comparisonOriginal: ["Coupelle solide à bords doux", "Chaleur douce contrôlée", "Échange offert sous 14 jours", "Bouton de relâchement immédiat", "Suivi depuis Casablanca"],
    crossSellPitches: {
      "kenidoux-lumba": "Ajoutez les ventouses du soir pour les épaules, dans le même colis",
      "kenidoux-posta": "Ajoutez Calma après une journée d’écran",
    },
    metaDescription: "Kinédoux Calma — ventouses chaudes pour le soir, sans marque et sans feu. Livraison offerte et paiement à la réception.",
  },
} as const;

const EN = {
  "kenidoux-lumba": {
    nameAr: "Kinédoux Lumba",
    category: "Most asked for — lower-back comfort",
    cardHeading: "Kinédoux Lumba — lower-back belt",
    cardSubheading: "Light support after driving, long sitting, or standing. The air columns inflate with a few pumps, while you sit or drive.",
    scarcityBadge: "Free delivery in 24–48 h from Casablanca · cash on delivery",
    scarcityShort: free.en,
    crossSellNote: "instead of 499 DH",
    offers: offers("en", [
      { title: "One belt", subtitle: "Lumba + pump + extension + guide + free delivery", badge: free.en },
      { title: "Two belts — for you and your parents", subtitle: "One for you, one for a parent. The second is 350 DH instead of 499, same box.", badge: popular.en },
      { title: "Three belts for the family", subtitle: "For the whole house, same free delivery, no extra fee.", badge: family.en },
    ]),
    bonuses: [
      "Hand air pump with a safety valve",
      "Extension for waists from 70 to 130 cm",
      "Kinédoux picture guide in Darija and French for a 10-minute routine",
      "Free delivery to the door + cash on delivery",
    ],
    kitTitle: "What arrives in your box?",
    kitContents: [
      "Kinédoux Lumba air belt",
      "Hand air pump with a safety valve",
      "Extension from 70 to 130 cm",
      "Picture guide in Darija and French",
      "Fast free delivery to the door",
    ],
    heroHook: {
      title: "Long sitting and driving weigh on the lower back. Support can stay simple.",
      body: "Kinédoux Lumba wraps the waist and inflates with a few pumps. Light support while you sit, drive, or work — no electronics.",
    },
    sections: [
      {
        title: "A little lightness at home, at work, and for prayer",
        body: "When the lower back feels heavy, standing up, bending, and even sleep feel harder. Lumba inflates upward in 5 pumps for a steady hold, without blocking movement.",
        bullets: ["Inflates with 5 simple pumps", "Comfortable standing, bending, and resting", "Does not get in the way in the car or at a desk"],
      },
      {
        title: "Vertical air columns: support from the inside, not a squeeze on the stomach",
        body: "Ordinary belts press the stomach. Lumba uses air columns that rise as you inflate, to ease the load on the lower back.",
        bullets: ["Vertical columns for a light stretch", "Inflate gradually: stop at comfort, not at stiffness", "An extension for most waist sizes"],
      },
      {
        title: "Materials chosen to hold the air, and the comfort",
        body: "Each layer has a job: keep the inflation, let the skin breathe, and release the air easily.",
        cards: [
          { title: "Dense TPU layer", body: "Holds the air so the session stays comfortable." },
          { title: "Mesh lining", body: "Kind to the skin in Moroccan weather, under clothes." },
          { title: "Fast valve and pump", body: "Precise inflation, and the air leaves with one press." },
        ],
      },
    ],
    steps: [
      { title: "Fasten the belt", body: "Wrap Lumba around your waist, over or under clothes, at a comfortable fit." },
      { title: "5 pumps", body: "Inflate until you feel a light upward stretch. Stop before it feels hard." },
      { title: "Rest 10–15 minutes", body: "Start short on the first days, then release the air with the valve." },
    ],
    comparisonOriginal: ["Material that holds the air", "Guide in Darija and French", "Free exchange within 14 days", "Extension from 70 to 130 cm", "Follow-up from Casablanca"],
    crossSellPitches: {
      "kenidoux-posta": "Add the air belt for the lower back in the same box",
      "kenidoux-calma": "Add the most-requested belt for lower-back comfort",
    },
    metaDescription: "Kinédoux Lumba — air belt for lower-back comfort. Free delivery in Morocco and payment after you open the box.",
  },
  "kenidoux-posta": {
    nameAr: "Kinédoux Posta",
    category: "Light posture and neck comfort",
    cardHeading: "Kinédoux Posta — posture",
    cardSubheading: "A soft reminder when you slump in front of a screen. Light, with no hard strap.",
    scarcityBadge: "Free delivery in 24–48 h from Casablanca · cash on delivery",
    scarcityShort: free.en,
    crossSellNote: "instead of 379 DH",
    offers: offers("en", [
      { title: "One Posta set", subtitle: "Reminder + 14-day plan + free delivery", badge: free.en },
      { title: "Two sets — for you and someone else", subtitle: "For a couple, or for you and a student. The second is 270 DH instead of 379, same box.", badge: popular.en },
      { title: "Three sets for the office or family", subtitle: "Three full sets, same free delivery.", badge: family.en },
    ]),
    bonuses: [
      "Light strap with an angle sensor and a quiet vibration",
      "Neck cushion",
      "14-day plan in Darija and French",
      "USB-C cable — a charge lasts for days",
    ],
    kitTitle: "What arrives in your box?",
    kitContents: [
      "Kinédoux strap with angle sensor and quiet vibration",
      "Kinédoux neck cushion",
      "14-day plan in Darija and French",
      "USB-C charging cable",
      "Fast free delivery to the door",
    ],
    heroHook: {
      title: "Hours on a phone or computer round the shoulders. A hard strap is not the answer.",
      body: "Posta is light: through the day a soft vibration reminds you to sit up.",
    },
    sections: [
      {
        title: "A comfortable posture that stays discreet under clothes",
        body: "A slumped posture changes how the desk feels. Instead of hard straps, Posta stays light and does not cut under the arms.",
        bullets: ["Light and discreet under clothes", "No hard straps under the arms", "For work, study, and photos"],
      },
      {
        title: "A reminder through the day",
        body: "The sensor notices the lean and sends a quiet vibration so you sit up. No Bluetooth, no app.",
        bullets: ["A light vibration when you lean too far", "A 14-day plan, step by step", "One button, no app"],
      },
      {
        title: "Simple every day: no Bluetooth, no app",
        body: "One touch, a battery that lasts days, and soft straps.",
        cards: [
          { title: "Angle sensor", body: "No Bluetooth. One touch, and the battery lasts." },
          { title: "Soft straps", body: "Easy on the shoulders, for most builds." },
          { title: "Simple fit", body: "Sits on the shoulders and adjusts without tools." },
        ],
      },
    ],
    steps: [
      { title: "Turn the sensor on", body: "Place the strap on the shoulders and switch it on with one touch. No app." },
      { title: "A soft reminder", body: "When you slump, a quiet vibration reminds you to sit up." },
      { title: "A few minutes in the evening", body: "Ease the shoulders after a day of screens." },
    ],
    comparisonOriginal: ["Sensor with no Bluetooth and no app", "14-day plan in Darija and French", "Free exchange within 14 days", "Light under clothes", "Follow-up from Casablanca"],
    crossSellPitches: {
      "kenidoux-lumba": "Add lower-back comfort in the same box",
      "kenidoux-calma": "Add Calma for the shoulders after a screen day",
    },
    metaDescription: "Kinédoux Posta — a light posture reminder. Free delivery in Morocco and cash on delivery.",
  },
  "kenidoux-calma": {
    nameAr: "Kinédoux Calma",
    category: "Evening ritual",
    cardHeading: "Kinédoux Calma — warm cups, no marks",
    cardSubheading: "Today’s version of cupping: comfortable warmth and gentle suction for shoulders, back, or knee, in 15 minutes, with no fire and no mess.",
    scarcityBadge: "Often added with Lumba: same box, no extra delivery",
    scarcityShort: "No marks",
    crossSellNote: "instead of 349 DH",
    offers: offers("en", [
      { title: "One Calma device", subtitle: "Device + USB-C cable + free delivery", badge: free.en },
      { title: "Two devices — shoulders or a gift", subtitle: "One for you, one for your parents. The second is 250 DH instead of 349, same box.", badge: popular.en },
      { title: "Full kit (Lumba + Posta + Calma)", subtitle: "Back, posture, and ease in one box — less than buying separately.", badge: kitBadge.en },
    ]),
    bonuses: [
      "Cupping device with gentle warmth",
      "Storage pouch",
      "USB-C charging cable",
      "Kinédoux guide in Darija and French + free delivery",
    ],
    kitTitle: "What arrives in your box?",
    kitContents: [
      "Kinédoux Calma device",
      "Storage pouch",
      "USB-C charging cable",
      "Picture guide in Darija and French",
      "Fast free delivery to the door",
    ],
    heroHook: {
      title: "The shoulders and back of the day… 15 warm minutes at home.",
      body: "In Morocco, people know the comfort of cups. Calma is the current version: no marks, no fire, no mess. Warmth that eases, and gentle suction before sleep.",
    },
    sections: [
      {
        title: "15 minutes before sleep is enough to put the day down",
        body: "After work, sport, or simply to give your parents a warm session at home. Calma starts with one button, a timer, and a release you can press at any time.",
        bullets: ["Automatic timer (up to 20 minutes)", "One-touch release", "A clear gift for parents"],
      },
      {
        title: "Warmth and gentle suction, in one device",
        body: "Instead of a fixed cup that marks the skin, Calma alternates a gentle hold and release, with levels for strength and heat.",
        bullets: ["Several levels of strength and gentle heat", "A rhythm of hold and release", "For the shoulder, the back, or the knee"],
      },
      {
        title: "Clean, careful, and simple for the whole house",
        body: "Soft edges, controlled warmth, and an immediate release before you lift the device off.",
        cards: [
          { title: "Clear cup", body: "Rounded edges that sit on shoulders, back, and legs." },
          { title: "Steady warmth", body: "A stable, comfortable heat, without excess." },
          { title: "Release button", body: "One press stops the suction before you remove the cup." },
        ],
      },
    ],
    steps: [
      { title: "Place it and choose", body: "Set the cup on the shoulder, back, or knee, then choose heat and strength." },
      { title: "One button, then rest", body: "The warm suction starts and stops on its own when the time ends." },
      { title: "Release with one touch", body: "Press to stop the suction, then lift the device off slowly." },
    ],
    comparisonOriginal: ["Solid cup with soft edges", "Controlled gentle heat", "Free exchange within 14 days", "Instant release button", "Follow-up from Casablanca"],
    crossSellPitches: {
      "kenidoux-lumba": "Add the evening cups for the shoulders, in the same box",
      "kenidoux-posta": "Add Calma after a day of screens",
    },
    metaDescription: "Kinédoux Calma — warm cups for the evening, no marks and no fire. Free delivery and cash on delivery.",
  },
} as const;

export function localizeProduct(product: Product, locale: Locale): Product {
  if (locale === "ar") return product;
  const patch = (locale === "fr" ? FR : EN)[product.slug as ProductSlug];
  const merged = deepMerge(product, patch);
  const labels = uiCopy(locale).gallery;
  merged.gallery = product.gallery.map((image, index) => ({
    ...image,
    label: labels[index] ?? image.label,
  }));
  return merged;
}

export function localizeProducts(locale: Locale): Product[] {
  return PRODUCTS.map((product) => localizeProduct(product, locale));
}
