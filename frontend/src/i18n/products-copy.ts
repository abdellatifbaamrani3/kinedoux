import { PRODUCTS, type Product, type ProductSlug } from "@/data/products";

import type { Locale } from "./locale";
import { uiCopy } from "./ui";
import { deepMerge } from "./merge";

const free = { fr: "Livraison offerte", en: "Free delivery" };
const popular = { fr: "Cadeau", en: "Gift" };
const kitBadge = { fr: "Pack complet", en: "Full kit" };

function offers(locale: "fr" | "en", rows: Array<{ title: string; subtitle: string; badge: string }>) {
  return rows;
}

const FR = {
  "kenidoux-lumba": {
    nameAr: "Kinédoux Lumba",
    category: "Confort du bas du dos",
    cardHeading: "Kinédoux Lumba — ceinture du bas du dos",
    cardSubheading: "Soutien léger après la conduite, une longue position assise ou la station debout. Les colonnes d’air se gonflent en quelques pressions, assis ou au volant.",
    outcome: "Le bas du dos plus léger après la conduite et les longues heures assises",
    chips: ["Assis ou au volant", "5 pressions", "70–130 cm"],
    scarcityBadge: "Livraison offerte après confirmation · paiement à la porte",
    scarcityShort: free.fr,
    crossSellNote: "au lieu de 499 DH",
    offers: offers("fr", [
      { title: "Une ceinture", subtitle: "Lumba + pompe + rallonge + guide + livraison offerte", badge: free.fr },
      { title: "Deux ceintures — pour vous et vos parents", subtitle: "Une pour vous, une pour un parent. La deuxième à 350 DH au lieu de 499, dans le même colis.", badge: popular.fr },
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
      "kenidoux-calma": "Ajoutez la ceinture du bas du dos dans le même colis",
      "kenidoux-palma": "Ajoutez la ceinture du bas du dos dans le même colis",
    },
    metaDescription: "Kinédoux Lumba — ceinture à air pour le bas du dos. Livraison offerte, confirmation depuis Casablanca, paiement à la porte.",
  },
  "kenidoux-posta": {
    nameAr: "Kinédoux Posta",
    category: "Posture légère et confort de la nuque",
    cardHeading: "Kinédoux Posta — posture et nuque",
    cardSubheading: "Un rappel doux quand vous vous penchez devant l’écran, et un moment de nuque le soir. Léger, sans sangle dure.",
    outcome: "Un rappel léger le jour, et du confort pour la nuque le soir",
    chips: ["Vibration discrète", "Coussin nuque", "Sans Bluetooth"],
    scarcityBadge: "Livraison offerte après confirmation · paiement à la porte",
    scarcityShort: free.fr,
    crossSellNote: "au lieu de 379 DH",
    offers: offers("fr", [
      { title: "Un pack Posta", subtitle: "Rappel + programme 14 jours + livraison offerte", badge: free.fr },
      { title: "Deux packs — pour vous et quelqu’un", subtitle: "Pour le couple, ou pour vous et un enfant qui étudie. Le second à 270 DH au lieu de 379, même colis.", badge: popular.fr },
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
      "kenidoux-palma": "Ajoutez le pack posture et le coussin de nuque dans le même colis",
    },
    metaDescription: "Kinédoux Posta — rappel de posture léger. Livraison offerte au Maroc et paiement à la réception.",
  },
  "kenidoux-calma": {
    nameAr: "Kinédoux Calma",
    category: "Rituel du soir",
    cardHeading: "Kinédoux Calma — ventouses chaudes, sans marque",
    cardSubheading: "La version actuelle des ventouses : chaleur confortable et aspiration douce pour les épaules, le dos ou le genou, en 15 minutes, sans feu et sans désordre.",
    outcome: "Chaleur et aspiration douce pour les épaules avant de dormir",
    chips: ["Sans feu", "15 minutes", "Bouton relâche"],
    scarcityBadge: "S’ajoute avec Lumba : même colis, sans livraison en plus",
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
      "kenidoux-palma": "Ajoutez les ventouses du soir pour les épaules, dans le même colis",
    },
    metaDescription: "Kinédoux Calma — ventouses chaudes pour le soir, sans marque et sans feu. Livraison offerte et paiement à la réception.",
  },
  "kenidoux-palma": {
    nameAr: "Kinédoux Palma",
    category: "Confort de la nuque",
    cardHeading: "Kinédoux Palma — nuque et épaules",
    cardSubheading:
      "Il se fixe à la nuque avec la sangle. Les mains pétrissent les épaules, avec de la chaleur sur la face interne, assis ou allongé.",
    outcome: "Un massage de la nuque et des épaules, assis ou allongé",
    chips: ["Sangle", "Mains", "Chaleur"],
    scarcityBadge: "Livraison offerte après confirmation · paiement à la porte",
    scarcityShort: free.fr,
    crossSellNote: "au lieu de 287 DH",
    offers: offers("fr", [
      { title: "Un appareil", subtitle: "Kinédoux Palma + sangle + livraison offerte", badge: free.fr },
      { title: "Deux appareils — pour vous et la maison", subtitle: "Un pour vous, un pour la maison. Le deuxième à 212 DH au lieu de 287, dans le même colis.", badge: popular.fr },
    ]),
    bonuses: [
      "Mains qui pétrissent la nuque et les épaules",
      "Sangle pour le garder en place, assis ou allongé",
      "Chaleur sur la face qui touche l’épaule",
      "Livraison offerte jusqu’à la porte",
    ],
    kitTitle: "Qu’est-ce qui arrive dans votre colis ?",
    kitContents: ["Appareil Kinédoux Palma", "La sangle", "Livraison offerte jusqu’à la porte"],
    heroHook: {
      title: "La nuque et les épaules, après la journée, ont besoin de quelques minutes à la maison.",
      body: "Kinédoux Palma se fixe avec la sangle. Les mains pétrissent la nuque et les épaules, avec une chaleur visible sur la face interne, assis ou allongé.",
    },
    sections: [
      {
        title: "Quelques minutes pour la nuque, assis ou allongé",
        body: "Fermez la sangle et laissez les mains travailler sur la nuque et les épaules. Arrêtez quand vous êtes reposé.",
        bullets: ["La sangle tient l’appareil", "Les mains pétrissent la nuque et les épaules", "Assis au salon ou allongé"],
      },
      {
        title: "Des mains qui pétrissent, et de la chaleur sur l’épaule",
        body: "À l’intérieur, un moteur fait bouger les mains sur la nuque et les épaules. La chaleur se voit sur la face qui touche l’épaule.",
        bullets: ["Mains sur la nuque et les épaules", "Chaleur sur la face interne", "Une sangle pour qu’il reste en place"],
      },
      {
        title: "Tissu, mains et sangle",
        body: "Ce que vous voyez : un revêtement en tissu, des mains souples qui pétrissent, et une sangle sur la nuque.",
        bullets: [],
        cards: [
          { title: "Tissu", body: "Le corps qui se pose sur l’épaule." },
          { title: "Mains souples", body: "Elles pétrissent la nuque et les épaules." },
          { title: "Sangle et chaleur", body: "La sangle le tient. La face interne a une chaleur visible." },
        ],
      },
    ],
    steps: [
      { title: "Fermez la sangle", body: "Posez Palma sur la nuque et serrez la sangle pour qu’il tienne." },
      { title: "Laissez les mains travailler", body: "Elles pétrissent la nuque et les épaules. La chaleur est sur la face qui touche l’épaule." },
      { title: "Arrêtez quand vous êtes reposé", body: "Assis ou allongé. Si quelque chose ne va pas, arrêtez." },
    ],
    stepsImageAlt: "Kinédoux Palma fixé à la nuque, au repos",
    scienceImageAlt: "À l’intérieur : le moteur fait bouger les mains sur la nuque et les épaules",
    kitImageAlt: "Les mains de Kinédoux Palma, le tissu et la sangle",
    comparisonOriginal: [
      "Mains qui pétrissent la nuque et les épaules",
      "Sangle qui tient l’appareil",
      "Échange offert sous 14 jours",
      "Chaleur visible sur l’épaule",
      "Suivi depuis Casablanca",
    ],
    crossSellPitches: {
      "kenidoux-lumba": "Ajoutez le massage nuque et épaules dans le même colis",
      "kenidoux-posta": "Ajoutez le massage nuque et épaules dans le même colis",
      "kenidoux-calma": "Ajoutez le massage nuque et épaules dans le même colis",
    },
    gallery: [
      { label: "Sur la nuque", alt: "Kinédoux Palma fixé à la nuque et à l’épaule" },
      { label: "Comment il pétrit", alt: "Le moteur fait bouger les mains sur la nuque et les épaules" },
      { label: "À la maison", alt: "Une femme assise avec Palma sur la nuque" },
      { label: "Au repos", alt: "Kinédoux Palma sur la nuque, allongée" },
      { label: "Les mains", alt: "Les mains de massage, le tissu et la sangle" },
      { label: "La chaleur", alt: "La face interne de Palma, avec de la chaleur sur l’épaule" },
    ],
    metaDescription:
      "Kinédoux Palma — massage de la nuque et des épaules, avec sangle, mains et chaleur. Livraison offerte, paiement à la porte.",
  },
} as const;

const EN = {
  "kenidoux-lumba": {
    nameAr: "Kinédoux Lumba",
    category: "Lower-back comfort",
    cardHeading: "Kinédoux Lumba — lower-back belt",
    cardSubheading: "Light support after driving, long sitting, or standing. The air columns inflate with a few pumps, while you sit or drive.",
    outcome: "A lighter lower back after driving and long hours sitting",
    chips: ["Sitting or driving", "5 pumps", "70–130 cm"],
    scarcityBadge: "Free delivery after confirmation · pay at the door",
    scarcityShort: free.en,
    crossSellNote: "instead of 499 DH",
    offers: offers("en", [
      { title: "One belt", subtitle: "Lumba + pump + extension + guide + free delivery", badge: free.en },
      { title: "Two belts — for you and your parents", subtitle: "One for you, one for a parent. The second is 350 DH instead of 499, same box.", badge: popular.en },
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
      "kenidoux-calma": "Add the lower-back belt in the same box",
      "kenidoux-palma": "Add the lower-back belt in the same box",
    },
    metaDescription: "Kinédoux Lumba — air belt for lower-back comfort. Free delivery, confirmation from Casablanca, pay at the door.",
  },
  "kenidoux-posta": {
    nameAr: "Kinédoux Posta",
    category: "Light posture and neck comfort",
    cardHeading: "Kinédoux Posta — posture",
    cardSubheading: "A soft reminder when you slump in front of a screen. Light, with no hard strap.",
    outcome: "A light reminder by day, and neck comfort in the evening",
    chips: ["Quiet vibration", "Neck cushion", "No Bluetooth"],
    scarcityBadge: "Free delivery after confirmation · pay at the door",
    scarcityShort: free.en,
    crossSellNote: "instead of 379 DH",
    offers: offers("en", [
      { title: "One Posta set", subtitle: "Reminder + 14-day plan + free delivery", badge: free.en },
      { title: "Two sets — for you and someone else", subtitle: "For a couple, or for you and a student. The second is 270 DH instead of 379, same box.", badge: popular.en },
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
      "kenidoux-palma": "Add the posture pack and neck cushion in the same box",
    },
    metaDescription: "Kinédoux Posta — a light posture reminder. Free delivery in Morocco and cash on delivery.",
  },
  "kenidoux-calma": {
    nameAr: "Kinédoux Calma",
    category: "Evening ritual",
    cardHeading: "Kinédoux Calma — warm cups, no marks",
    cardSubheading: "Today’s version of cupping: comfortable warmth and gentle suction for shoulders, back, or knee, in 15 minutes, with no fire and no mess.",
    outcome: "Warmth and gentle suction for the shoulders before sleep",
    chips: ["No fire", "15 minutes", "Release button"],
    scarcityBadge: "Add it with Lumba: same box, no extra delivery",
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
      "kenidoux-palma": "Add the evening cups for the shoulders, in the same box",
    },
    metaDescription: "Kinédoux Calma — warm cups for the evening, no marks and no fire. Free delivery and cash on delivery.",
  },
  "kenidoux-palma": {
    nameAr: "Kinédoux Palma",
    category: "Neck comfort",
    cardHeading: "Kinédoux Palma — neck and shoulders",
    cardSubheading:
      "It straps onto the neck. The hands knead the shoulders, with warmth on the inner side, while you sit or lie down.",
    outcome: "A neck and shoulder massage while you sit or lie down",
    chips: ["Strap", "Hands", "Warmth"],
    scarcityBadge: "Free delivery after confirmation · pay at the door",
    scarcityShort: free.en,
    crossSellNote: "instead of 287 DH",
    offers: offers("en", [
      { title: "One device", subtitle: "Kinédoux Palma + strap + free delivery", badge: free.en },
      { title: "Two devices — for you and home", subtitle: "One for you, one for the house. The second is 212 DH instead of 287, same box.", badge: popular.en },
    ]),
    bonuses: [
      "Hands that knead the neck and shoulders",
      "A strap so it stays on while you sit or lie down",
      "Warmth on the side that touches the shoulder",
      "Free delivery to the door",
    ],
    kitTitle: "What arrives in your box?",
    kitContents: ["Kinédoux Palma device", "The strap", "Free delivery to the door"],
    heroHook: {
      title: "After the day, the neck and shoulders need a few minutes at home.",
      body: "Kinédoux Palma straps on. The hands knead the neck and shoulders, with visible warmth on the inner side, while you sit or lie down.",
    },
    sections: [
      {
        title: "A few minutes for the neck, sitting or lying down",
        body: "Fasten the strap and let the hands work on the neck and shoulders. Stop when you feel rested.",
        bullets: ["The strap holds it", "Hands knead the neck and shoulders", "Sitting in the living room or lying down"],
      },
      {
        title: "Kneading hands, and warmth on the shoulder",
        body: "Inside, a motor moves the hands over the neck and shoulders. The warmth shows on the side that touches the shoulder.",
        bullets: ["Hands on the neck and shoulders", "Warmth on the inner side", "A strap so it stays put"],
      },
      {
        title: "Fabric, hands, and a strap",
        body: "What you see: a fabric cover, soft hands that knead, and a strap on the neck.",
        bullets: [],
        cards: [
          { title: "Fabric", body: "The body that sits on the shoulder." },
          { title: "Soft hands", body: "They knead the neck and shoulders." },
          { title: "Strap and warmth", body: "The strap holds it. The inner side has visible warmth." },
        ],
      },
    ],
    steps: [
      { title: "Fasten the strap", body: "Set Palma on the neck and tighten the strap so it stays." },
      { title: "Let the hands work", body: "They knead the neck and shoulders. The warmth is on the side that touches the shoulder." },
      { title: "Stop when you feel rested", body: "Sitting or lying down. If something feels wrong, stop." },
    ],
    stepsImageAlt: "Kinédoux Palma strapped on the neck, at rest",
    scienceImageAlt: "Inside: the motor moves the hands over the neck and shoulders",
    kitImageAlt: "The Palma massage hands, fabric cover, and strap",
    comparisonOriginal: [
      "Hands that knead the neck and shoulders",
      "A strap that holds it",
      "Free exchange within 14 days",
      "Visible warmth on the shoulder",
      "Follow-up from Casablanca",
    ],
    crossSellPitches: {
      "kenidoux-lumba": "Add the neck and shoulder massage in the same box",
      "kenidoux-posta": "Add the neck and shoulder massage in the same box",
      "kenidoux-calma": "Add the neck and shoulder massage in the same box",
    },
    gallery: [
      { label: "On the neck", alt: "Kinédoux Palma strapped on the neck and shoulder" },
      { label: "How it kneads", alt: "The motor moves the hands over the neck and shoulders" },
      { label: "At home", alt: "A woman sitting with Palma on her neck" },
      { label: "At rest", alt: "Kinédoux Palma on the neck while lying down" },
      { label: "The hands", alt: "The massage hands, fabric, and strap" },
      { label: "The warmth", alt: "The inner side of Palma, with warmth on the shoulder" },
    ],
    metaDescription:
      "Kinédoux Palma — neck and shoulder massage with a strap, hands, and warmth. Free delivery, pay at the door.",
  },
} as const;

export function localizeProduct(product: Product, locale: Locale): Product {
  if (locale === "ar") return product;
  const patch = (locale === "fr" ? FR : EN)[product.slug as ProductSlug];
  const merged = deepMerge(product, patch);
  const labels = uiCopy(locale).gallery;
  // Only remap shared 4-slot gallery labels. Custom longer galleries keep their own labels.
  merged.gallery =
    product.gallery.length === labels.length
      ? product.gallery.map((image, index) => ({
          ...image,
          label: labels[index] ?? image.label,
        }))
      : merged.gallery;
  return merged;
}

export function localizeProducts(locale: Locale): Product[] {
  return PRODUCTS.map((product) => localizeProduct(product, locale));
}
