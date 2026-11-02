import {
  ABOUT,
  COMPARISON_FAKE,
  CONTACT,
  CTA_TRUST,
  FAQS,
  HOME,
  REVIEWS,
} from "@/data/content";

import type { Locale } from "./locale";
import { deepMerge } from "./merge";

const HOME_FR = {
  hero: {
    pill: "Kinédoux · Casablanca · marque spécialisée",
    title: "Votre dos travaille avec vous toute la journée. Donnez-lui un soutien clair, depuis chez vous.",
    subtitle:
      "Kinédoux Lumba : ceinture à air pour le bas du dos, avec un guide de 10 minutes. Livraison offerte, confirmation depuis Casa, et vous payez quand vous ouvrez le colis.",
    cta: "Commander Lumba — 499 DH, livraison incluse",
    secondaryCta: "Voir toute la ligne",
    proofChips: [
      "Vous ouvrez le colis avant de payer",
      "Livraison offerte en 24–48 h",
      "Échange offert sous 14 jours",
      "Confirmation depuis Casablanca",
    ],
  },
  struggle: {
    title: "Vous passez la journée assis, au volant ou debout… et le soir, le dos est lourd",
    body: "La chaise, la voiture, le travail et les enfants pèsent sur le dos et les épaules. Kinédoux ne promet pas un miracle : un soutien léger, et un rituel que vous pouvez faire à la maison, en voiture ou au bureau.",
    bullets: [
      "Chauffeurs et employés après des heures assis ou au volant",
      "Mères et journée chargée : épaules, nuque et bas du dos",
      "Un cadeau clair pour les parents : simple, livré à la porte",
    ],
  },
  quiz: {
    eyebrow: "Test rapide",
    title: "Deux questions, et on vous dit par où commencer",
    sub: "On ne vous vend pas les trois produits si vous n’en avez pas besoin.",
    q1: {
      label: "Qu’est-ce qui pèse le plus ?",
      options: [
        { id: "back", label: "Le bas du dos après la conduite ou une longue position assise" },
        { id: "posture", label: "Les épaules et la nuque devant l’ordinateur ou le téléphone" },
        { id: "shoulders", label: "La fatigue des épaules et du dos le soir" },
      ],
    },
    q2: {
      label: "Où le sentez-vous le plus ?",
      options: [
        { id: "drive", label: "En voiture ou sur la chaise du travail" },
        { id: "screen", label: "Devant l’écran ou en utilisant le téléphone" },
        { id: "evening", label: "À la maison, après une longue journée" },
      ],
    },
    resultTitle: "On vous conseille de commencer par",
    resultNote: "C’est une suggestion selon vos réponses, pas un diagnostic. Si la douleur est forte ou soudaine, voyez un médecin d’abord.",
    cta: "Voir le produit",
    restart: "Recommencer",
    bundleLabel: "Ou couvrir les trois dans un seul pack",
  },
  products: {
    eyebrow: "Les produits",
    title: "Trois solutions. Choisissez celle qui vous ressemble.",
  },
  bundle: {
    title: "Le pack complet — dos, posture et détente",
    subtitle: "Lumba + Posta + Calma dans un seul colis. 337 DH de moins qu’à l’unité, même livraison offerte.",
    cta: "Ajouter le pack complet — 890 DH",
  },
  failed: {
    eyebrow: "Pourquoi ce que vous avez essayé n’a pas tenu",
    title: "Ce n’était pas votre faute. C’était le produit.",
    rows: [
      { tried: "Ceinture bon marché", why: "Matière fine qui se dégonfle après quelques minutes." },
      { tried: "Appareils à plusieurs milliers de dirhams", why: "Trop chers pour une famille, et compliqués sans guide clair." },
      { tried: "Sangles dures sous les bras", why: "Ça se voit sous les vêtements et ça irrite." },
      { tried: "Ventouses au feu ou à la lame", why: "Désordre, douleur et risque pour la peau. Il existe une version sans coupure et sans feu." },
    ],
  },
  system: {
    eyebrow: "Comment la ligne fonctionne",
    title: "Trois piliers, trois produits",
    note: "Chaque produit fait une chose bien, et complète les autres. Vous pouvez commencer par un seul.",
    cta: "Voir toute la ligne",
    steps: [
      { n: "1", title: "Soutien léger — Lumba", body: "Air pour le bas du dos, assis ou au volant." },
      { n: "2", title: "Posture légère — Posta", body: "Un rappel par vibration, et un coussin de nuque le soir." },
      { n: "3", title: "Détente chaude — Calma", body: "Ventouses intelligentes, sans marque, pour les épaules le soir." },
    ],
  },
  comparison: {
    eyebrow: "Comparaison claire",
    title: "Pourquoi Kinédoux n’est pas une ceinture du marché",
    sub: "La différence est dans le quotidien : guide, taille, et échange clair.",
    columns: ["Kinédoux", "Produit courant du marché"],
    rows: [
      { label: "Matière et soutien", values: ["Matière qui garde l’air", "Matière fine qui se dégonfle"] },
      { label: "Guide", values: ["Guide en darija et en français", "Pas de guide, pas de suivi"] },
      { label: "Garantie", values: ["Échange offert sous 14 jours", "Pas de garantie claire"] },
      { label: "Taille", values: ["Rallonge de 70 à 130 cm", "Une seule taille, inconfortable"] },
      { label: "Suivi", values: ["Suivi depuis Casablanca", "Une pub, puis plus rien"] },
    ],
    honestNote: "Kinédoux vend du confort quotidien et un soutien mécanique. Ce n’est pas un traitement et ça ne remplace pas un médecin.",
  },
  expectations: {
    eyebrow: "Attentes claires",
    title: "Ce que vous pouvez attendre… et ce qu’on ne promet pas",
    yesTitle: "Ce que Kinédoux vous donne",
    noTitle: "Ce qu’on ne promet pas",
    yes: [
      "Un soutien léger à la maison ou en voiture",
      "Un guide en darija et en français",
      "Vous ouvrez le colis avant de payer",
      "Échange offert sous 14 jours si la taille ne va pas",
    ],
    no: [
      "Ce n’est pas un traitement et ça ne remplace pas un médecin",
      "Pas de promesse miracle ou de résultat médical",
      "On ne vend pas un médicament ni un dispositif médical enregistré",
    ],
    timeline: [
      { when: "Le jour de la commande", what: "Confirmation depuis Casablanca avant l’envoi" },
      { when: "24–48 heures", what: "Le colis arrive, vous l’ouvrez avant de payer" },
      { when: "14 jours", what: "Temps d’essai. Si ça ne va pas, on échange" },
    ],
  },
  guarantee: {
    title: "Essayez Kinédoux 14 jours. Si ça ne va pas, on échange.",
    body: "On appelle depuis Casablanca avant la livraison. Vous ouvrez le colis devant le livreur et vous payez en espèces. Si la taille ne convient pas, l’échange est offert sous 14 jours sur WhatsApp.",
    points: [
      "Vous ouvrez le colis devant le livreur avant de payer",
      "Confirmation depuis Casablanca avant l’envoi",
      "Échange offert sous 14 jours sur WhatsApp",
    ],
  },
  causes: {
    eyebrow: "Trois solutions, une chose bien faite",
    title: "Chaque produit fait une chose, et complète les autres",
    sub: "Bas du dos dans la journée, posture légère devant l’écran, détente chaude avant de dormir.",
    items: [
      { n: "1", title: "Bas du dos après la conduite", body: "Soutien à air, assis ou au volant. Les colonnes se gonflent en quelques pressions.", link: "Voir Kinédoux Lumba" },
      { n: "2", title: "La posture devant l’écran", body: "Un rappel par vibration quand vous vous penchez. Pas de sangles dures.", link: "Voir Kinédoux Posta" },
      { n: "3", title: "Épaules et fatigue du soir", body: "Ventouses chaudes, sans marque et sans feu. 15 minutes avant de dormir.", link: "Voir Kinédoux Calma" },
    ],
    footer: "Chaque produit fait une chose bien. Le pack complet couvre les trois.",
  },
  reviews: {
    eyebrow: "Avis clients",
    title: "Avis écrits depuis les villes du Maroc",
    note: "Casa, Rabat, Tanger, Marrakech, Fès et Agadir. Même prix, même livraison, même confirmation depuis Casablanca.",
  },
  finalCta: {
    title: "Votre dos travaille avec vous. Donnez-lui un soutien clair aujourd’hui.",
    sub: "Livraison offerte, confirmation depuis Casablanca, et vous payez quand vous ouvrez le colis.",
    cta: "Voir les produits Kinédoux",
    reassurance: "Échange offert sous 14 jours · vous ouvrez avant de payer",
  },
};

const HOME_EN = {
  hero: {
    pill: "Kinédoux · Casablanca · a specialist brand",
    title: "Your back works with you all day. Give it clear support, from home.",
    subtitle:
      "Kinédoux Lumba: an air belt for the lower back, with a 10-minute guide. Free delivery, a call from Casablanca, and you pay when you open the box.",
    cta: "Order Lumba — 499 DH, delivery included",
    secondaryCta: "See the full line",
    proofChips: [
      "Open the box before you pay",
      "Free delivery in 24–48 hours",
      "Free exchange within 14 days",
      "Confirmed from Casablanca",
    ],
  },
  struggle: {
    title: "You spend the day sitting, driving, or on your feet… and by evening your back is tired",
    body: "The chair, the car, work, and children add weight to the back and shoulders. Kinédoux does not promise a miracle: light support, and a daily routine you can do at home, in the car, or at a desk.",
    bullets: [
      "Drivers and office workers after hours in a seat",
      "Mothers and a full day: shoulders, neck, and lower back",
      "A clear gift for parents: simple, delivered to the door",
    ],
  },
  quiz: {
    eyebrow: "Quick quiz",
    title: "Answer two questions and we’ll tell you where to start",
    sub: "We won’t sell you all three unless you need them.",
    q1: {
      label: "What feels heaviest?",
      options: [
        { id: "back", label: "Lower back after driving or sitting for a long time" },
        { id: "posture", label: "Shoulders and neck in front of a computer or phone" },
        { id: "shoulders", label: "Shoulder and back fatigue in the evening" },
      ],
    },
    q2: {
      label: "Where do you feel it most?",
      options: [
        { id: "drive", label: "In the car or in a work chair" },
        { id: "screen", label: "In front of a screen or on the phone" },
        { id: "evening", label: "At home, after a long day" },
      ],
    },
    resultTitle: "We suggest you start with",
    resultNote: "This is a suggestion from your answers, not a diagnosis. If pain is strong or sudden, see a doctor first.",
    cta: "See the product",
    restart: "Start again",
    bundleLabel: "Or cover all three in one kit",
  },
  products: {
    eyebrow: "Products",
    title: "Three solutions. Pick the one that fits.",
  },
  bundle: {
    title: "The full kit — back, posture, and evening ease",
    subtitle: "Lumba + Posta + Calma in one box. 337 DH less than buying them separately, same free delivery.",
    cta: "Add the full kit — 890 DH",
  },
  failed: {
    eyebrow: "Why the last thing didn’t last",
    title: "It wasn’t you. It was the product.",
    rows: [
      { tried: "A cheap market belt", why: "Thin material that goes soft after a few minutes." },
      { tried: "Devices that cost thousands of dirhams", why: "Too expensive for a family, and hard to use without a clear guide." },
      { tried: "Hard straps under the arms", why: "They show under clothes and they rub." },
      { tried: "Fire cups or blade cupping", why: "Mess, pain, and risk to the skin. There is a version with no cut and no fire." },
    ],
  },
  system: {
    eyebrow: "How the line works",
    title: "Three pillars, three products",
    note: "Each product does one job well and completes the others. Start with one.",
    cta: "See the full line",
    steps: [
      { n: "1", title: "Light support — Lumba", body: "Air support for the lower back, sitting or driving." },
      { n: "2", title: "Light posture — Posta", body: "A soft vibration reminder, plus a neck cushion in the evening." },
      { n: "3", title: "Warm ease — Calma", body: "Smart cups, no marks, for the shoulders at night." },
    ],
  },
  comparison: {
    eyebrow: "A straight comparison",
    title: "Why Kinédoux is not an ordinary market belt",
    sub: "The difference is daily use: a guide, a fit, and a clear exchange.",
    columns: ["Kinédoux", "Typical market product"],
    rows: [
      { label: "Material and support", values: ["Material that holds the air", "Thin material that goes flat"] },
      { label: "Guide", values: ["Guide in Darija and French", "No guide and no follow-up"] },
      { label: "Guarantee", values: ["Free exchange within 14 days", "No clear guarantee"] },
      { label: "Fit", values: ["Extension from 70 to 130 cm", "One awkward size"] },
      { label: "Follow-up", values: ["Follow-up from Casablanca", "An ad, then silence"] },
    ],
    honestNote: "Kinédoux sells daily comfort and mechanical support. It is not a treatment and it does not replace a doctor.",
  },
  expectations: {
    eyebrow: "Clear expectations",
    title: "What you can expect… and what we do not promise",
    yesTitle: "What Kinédoux gives you",
    noTitle: "What we do not promise",
    yes: [
      "Light support you can use at home or in the car",
      "A guide in Darija and French",
      "You open the box before you pay",
      "Free exchange within 14 days if the size is wrong",
    ],
    no: [
      "It does not treat and it does not replace a doctor",
      "No miracle promise and no medical result",
      "We do not sell a medicine or a registered medical device",
    ],
    timeline: [
      { when: "Order day", what: "A confirmation call from Casablanca before shipping" },
      { when: "24–48 hours", what: "The box arrives and you open it before you pay" },
      { when: "14 days", what: "Trial time. If it doesn’t fit, we exchange it" },
    ],
  },
  guarantee: {
    title: "Try Kinédoux for 14 days. If it doesn’t fit, we exchange it.",
    body: "We call from Casablanca before delivery. You open the box in front of the courier and pay cash. If the size is wrong, the exchange is free within 14 days on WhatsApp.",
    points: [
      "Open the box in front of the courier before you pay",
      "Confirmation from Casablanca before it ships",
      "Free exchange within 14 days on WhatsApp",
    ],
  },
  causes: {
    eyebrow: "Three solutions, one job done well",
    title: "Each product does one thing, and completes the others",
    sub: "Lower back through the day, light posture at a screen, warm ease before sleep.",
    items: [
      { n: "1", title: "Lower back after driving", body: "Air support while you sit or drive. The columns inflate with a few pumps.", link: "See Kinédoux Lumba" },
      { n: "2", title: "Posture in front of a screen", body: "A soft vibration when you slump. No hard straps.", link: "See Kinédoux Posta" },
      { n: "3", title: "Shoulders and evening fatigue", body: "Warm cups, no marks and no fire. 15 minutes before sleep is enough.", link: "See Kinédoux Calma" },
    ],
    footer: "Each product does one job well. The full kit covers all three.",
  },
  reviews: {
    eyebrow: "Customer notes",
    title: "Written notes from cities across Morocco",
    note: "Casablanca, Rabat, Tangier, Marrakech, Fes, and Agadir. Same price, same delivery, same confirmation from Casablanca.",
  },
  finalCta: {
    title: "Your back works with you. Give it clear support today.",
    sub: "Free delivery, a call from Casablanca, and you pay when you open the box.",
    cta: "See Kinédoux products",
    reassurance: "Free 14-day exchange · open the box before you pay",
  },
};

const FAQ_FR = [
  { q: "Puis-je ouvrir le colis avant de payer ?", a: "Oui. Le livreur attend que vous ouvriez le colis et voyiez le produit et le guide. Le paiement en espèces vient après, pas avant." },
  { q: "Qui m’appelle, et pourquoi ?", a: "L’équipe Kinédoux à Casablanca appelle pour confirmer le nom, la ville, l’adresse et l’horaire. La commande ne part pas tant que vous n’avez pas répondu." },
  { q: "Combien de temps pour la livraison, et combien ça coûte ?", a: "La livraison est offerte sur toutes les offres. 24 h pour les grandes villes, 24 à 48 h pour le reste du Maroc." },
  { q: "Si la taille ne va pas, comment échanger ?", a: "Chaque ceinture Lumba arrive avec une rallonge d’environ 70 à 130 cm. En plus, échange offert pendant 14 jours sur WhatsApp." },
  { q: "Est-ce un médicament ou un appareil médical ?", a: "Non. Kinédoux vend du confort quotidien et un soutien mécanique. Ce n’est pas un traitement et ça ne remplace pas un médecin." },
  { q: "Qui doit demander un avis médical avant ?", a: "Demandez un médecin en cas de grossesse, de fracture récente, d’opération récente de la colonne, ou d’un problème de peau à l’endroit d’utilisation." },
];

const FAQ_EN = [
  { q: "Can I open the box before I pay?", a: "Yes. The courier waits while you open the box and see the product and the guide. You pay cash after that, not before." },
  { q: "Who calls me, and why?", a: "The Kinédoux team in Casablanca calls to confirm your name, city, address, and delivery time. The order does not ship until you answer." },
  { q: "How long is delivery, and what does it cost?", a: "Delivery is free on every offer. 24 hours for major cities, 24 to 48 hours for the rest of Morocco." },
  { q: "If the size is wrong, how do I exchange it?", a: "Every Lumba belt comes with an extension for about 70 to 130 cm. On top of that, exchange is free for 14 days on WhatsApp." },
  { q: "Is this a medicine or a medical device?", a: "No. Kinédoux sells daily comfort and mechanical support. It does not treat and it does not replace a doctor." },
  { q: "Who should ask a doctor first?", a: "Ask a doctor if you are pregnant, have a recent fracture, had recent spine surgery, or have a skin problem where you would use it." },
];

const REVIEW_FR = [
  { city: "Casablanca (Maârif)", product: "Kinédoux Lumba", body: "Je passe 7 à 8 heures par jour en voiture pour le travail. Le soir, le bas du dos était lourd. Depuis Lumba, je le mets un moment en rentrant et le repos est plus simple. J’ai pris l’offre de deux et donné le second à mon père." },
  { city: "Rabat (Agdal)", product: "Kinédoux Posta", body: "Je travaille toute la journée devant l’ordinateur et je finissais penchée. Posta n’est pas une sangle dure : une petite vibration me rappelle de me redresser. La livraison est arrivée le lendemain à Rabat." },
  { city: "Tanger", product: "Kinédoux Calma + Lumba", body: "Le colis est propre, ça ne ressemble pas à un produit du marché. J’ai ajouté Calma, je l’utilise sur les épaules après le travail. En 10 minutes les épaules se relâchent." },
  { city: "Marrakech", product: "Offre deux ceintures Lumba", body: "Je l’ai pris pour mes parents. Ce qui leur a plu, c’est la simplicité : quelques pressions de la pompe, et la rallonge de taille est dans la boîte." },
  { city: "Fès", product: "Kinédoux Calma", body: "J’ai peur des ventouses à la lame. Calma donne le confort des ventouses avec une chaleur douce, sans coupure et sans douleur. Je le conseille à toute femme fatiguée par le travail et la station debout." },
  { city: "Agadir", product: "Pack complet", body: "Le livreur m’a laissé voir le colis, avec le guide en darija et en français. Lumba m’accompagne sur les longs trajets entre Agadir et Casa." },
];

const REVIEW_EN = [
  { city: "Casablanca (Maarif)", product: "Kinédoux Lumba", body: "I spend 7 to 8 hours a day in the car for work. By evening my lower back felt heavy. Since Lumba, I use it for a short while when I get home. I took the two-belt offer and gave the second one to my father." },
  { city: "Rabat (Agdal)", product: "Kinédoux Posta", body: "I work all day at a computer and I had started to slump. Posta is not a hard strap: a small vibration reminds me to sit up. It arrived in Rabat the next day." },
  { city: "Tangier", product: "Kinédoux Calma + Lumba", body: "The parcel looks tidy, not like a market product. I added Calma and use it on my shoulders after work. In about 10 minutes the shoulders ease." },
  { city: "Marrakech", product: "Two Lumba belts", body: "I bought it for my parents. What they liked is how simple it is: a few pumps, and the size extension is in the box." },
  { city: "Fes", product: "Kinédoux Calma", body: "I am afraid of blade cupping. Calma gives the comfort of cups with gentle warmth, no cut and no pain. I recommend it to any woman tired from work and standing." },
  { city: "Agadir", product: "Full kit", body: "The courier let me see the box, with the guide in Darija and French. Lumba now comes with me on the long drives between Agadir and Casablanca." },
];

const CTA_FR = [
  "✔ Vous ouvrez le colis avant de payer",
  "✔ Livraison offerte en 24–48 h",
  "✔ Échange offert sous 14 jours",
  "✔ Confirmation depuis Casablanca",
];
const CTA_EN = [
  "✔ Open the box before you pay",
  "✔ Free delivery in 24–48 hours",
  "✔ Free exchange within 14 days",
  "✔ Confirmed from Casablanca",
];
const FAKE_FR = [
  "Matière fine qui se dégonfle",
  "Pas de guide et pas de suivi",
  "Pas de garantie claire",
  "Une seule taille, inconfortable",
  "Une pub, puis plus rien",
];
const FAKE_EN = [
  "Thin material that goes flat",
  "No guide and no follow-up",
  "No clear guarantee",
  "One awkward size",
  "An ad, then silence",
];

const ABOUT_FR = {
  heroTitle: "Kinédoux — le confort du dos ne devrait pas être un luxe",
  heroSubtitle: "Une marque marocaine pour le dos et la posture : des solutions simples, un guide clair, et un prix pensé pour la famille. De Casablanca jusqu’à votre porte.",
  sections: [
    {
      title: "Pourquoi Kinédoux existe",
      body: "Beaucoup de Marocains — chauffeurs, employés, mères et parents âgés — sentent le poids du dos et des épaules chaque jour. Au marché, ils trouvent soit une ceinture bon marché qui se dégonfle, soit des appareils à plusieurs milliers de dirhams. Kinédoux est au milieu : une qualité soignée, un usage simple, un prix clair et la livraison offerte.",
      bullets: ["Un centre à Casablanca", "Un guide en darija et en français avec chaque commande", "Un prix pensé pour la famille, sans promesses médicales"],
    },
    {
      title: "Trois piliers, trois produits",
      body: "Chaque produit fait une chose bien et complète les autres : soutien du bas du dos dans la journée, posture légère devant l’écran, détente chaude avant de dormir.",
      bullets: [
        "Soutien léger (Lumba) : air pour le bas du dos, assis ou au volant.",
        "Posture (Posta) : rappel par vibration, plus un coussin de nuque le soir.",
        "Détente chaude (Calma) : ventouses sans marque pour les épaules le soir.",
      ],
    },
    {
      title: "Comment on gagne la confiance",
      body: "Kinédoux n’est pas une boutique de pubs bon marché. On s’appuie sur un prix clair, l’ouverture du colis avant le paiement, et un vrai guide.",
      bullets: ["Suivi depuis Casablanca sur WhatsApp", "Livraison dans les villes du Maroc en 24–48 h", "Échange offert sous 14 jours", "Vous ouvrez avant de payer"],
    },
  ],
};

const ABOUT_EN = {
  heroTitle: "Kinédoux — back comfort should not be a luxury",
  heroSubtitle: "A Moroccan brand for the back and posture: simple tools, a clear guide, and a family price. From Casablanca to your door.",
  sections: [
    {
      title: "Why Kinédoux exists",
      body: "Many people in Morocco — drivers, employees, mothers, and older parents — feel the weight of the back and shoulders every day. The market offers either a cheap belt that goes flat, or devices that cost thousands of dirhams. Kinédoux sits in the middle: careful quality, simple use, a clear price, and free delivery.",
      bullets: ["A hub in Casablanca", "A Darija and French guide with every order", "A family price, with no medical promises"],
    },
    {
      title: "Three pillars, three products",
      body: "Each product does one job well and completes the others: lower-back support through the day, light posture at a screen, and warm ease before sleep.",
      bullets: [
        "Light support (Lumba): air for the lower back, sitting or driving.",
        "Posture (Posta): a vibration reminder, plus a neck cushion in the evening.",
        "Warm ease (Calma): mark-free cups for the shoulders at night.",
      ],
    },
    {
      title: "How we earn trust",
      body: "Kinédoux is not a cheap-ad shop. We rely on a clear price, opening the box before payment, and a real guide.",
      bullets: ["Follow-up from Casablanca on WhatsApp", "Delivery across Morocco in 24–48 hours", "Free exchange within 14 days", "You open the box before you pay"],
    },
  ],
};

const CONTACT_FR = {
  heroTitle: "L’équipe Kinédoux est là, tous les jours",
  heroSubtitle: "Une question de taille, d’utilisation ou de suivi ? On répond depuis Casablanca, en darija ou en français.",
  cards: [
    { title: "WhatsApp et téléphone", body: "Du lundi au dimanche, de 09:00 à 21:00." },
    { title: "Expédition et suivi", body: "Casablanca, Maroc." },
    { title: "E-mail", body: "contact@kinedoux.com" },
  ],
  subjects: ["Suivi de commande", "Question sur un produit", "Demande d’échange"],
};

const CONTACT_EN = {
  heroTitle: "The Kinédoux team is here, every day",
  heroSubtitle: "A question about size, how to use it, or where your order is? We answer from Casablanca.",
  cards: [
    { title: "WhatsApp and phone", body: "Monday to Sunday, 09:00 to 21:00." },
    { title: "Shipping and follow-up", body: "Casablanca, Morocco." },
    { title: "Email", body: "contact@kinedoux.com" },
  ],
  subjects: ["Track an order", "Ask about a product", "Request an exchange"],
};

export function homeCopy(locale: Locale) {
  if (locale === "ar") return HOME;
  return deepMerge(HOME, locale === "fr" ? HOME_FR : HOME_EN);
}

export function faqCopy(locale: Locale) {
  if (locale === "ar") return FAQS;
  return deepMerge(FAQS, locale === "fr" ? FAQ_FR : FAQ_EN);
}

export function reviewCopy(locale: Locale) {
  if (locale === "ar") return REVIEWS;
  return deepMerge(REVIEWS, locale === "fr" ? REVIEW_FR : REVIEW_EN);
}

export function comparisonFake(locale: Locale) {
  if (locale === "ar") return COMPARISON_FAKE;
  return locale === "fr" ? FAKE_FR : FAKE_EN;
}

export function ctaTrust(locale: Locale) {
  if (locale === "ar") return CTA_TRUST;
  return locale === "fr" ? CTA_FR : CTA_EN;
}

export function aboutCopy(locale: Locale) {
  if (locale === "ar") return ABOUT;
  return deepMerge(ABOUT, locale === "fr" ? ABOUT_FR : ABOUT_EN);
}

export function contactCopy(locale: Locale) {
  if (locale === "ar") return CONTACT;
  return deepMerge(CONTACT, locale === "fr" ? CONTACT_FR : CONTACT_EN);
}
