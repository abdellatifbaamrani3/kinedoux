/**
 * Kinédoux Lumba — the only product page.
 * Copy this file, change the slug and the text, then add one import in index.ts.
 * Prices: 499 for one, 849 for two. Crossed prices only if you really sold at that price.
 * Say comfort, support, and a light stretch. Do not add a medical claim.
 */
import type { Img } from '../../lib/img';
import type { Lang } from '../../config';

import hero400a from '../../assets/lumba/hero-400.avif';
import hero800a from '../../assets/lumba/hero-800.avif';
import hero1200a from '../../assets/lumba/hero-1200.avif';
import hero400w from '../../assets/lumba/hero-400.webp';
import hero800w from '../../assets/lumba/hero-800.webp';
import hero1200w from '../../assets/lumba/hero-1200.webp';

import columns400a from '../../assets/lumba/columns-400.avif';
import columns800a from '../../assets/lumba/columns-800.avif';
import columns400w from '../../assets/lumba/columns-400.webp';
import columns800w from '../../assets/lumba/columns-800.webp';

import kit400a from '../../assets/lumba/kit-400.avif';
import kit800a from '../../assets/lumba/kit-800.avif';
import kit1200a from '../../assets/lumba/kit-1200.avif';
import kit400w from '../../assets/lumba/kit-400.webp';
import kit800w from '../../assets/lumba/kit-800.webp';
import kit1200w from '../../assets/lumba/kit-1200.webp';

import how400a from '../../assets/lumba/how-400.avif';
import how800a from '../../assets/lumba/how-800.avif';
import how1200a from '../../assets/lumba/how-1200.avif';
import how400w from '../../assets/lumba/how-400.webp';
import how800w from '../../assets/lumba/how-800.webp';
import how1200w from '../../assets/lumba/how-1200.webp';

export interface Frame {
  avif: Img[];
  webp: Img[];
  alt: Record<Lang, string>;
}

export interface OfferCopy {
  title: string;
  detail: string;
}

export interface PageCopy {
  metaTitle: string;
  metaDescription: string;
  headline: string;
  sub: string;
  problemTitle: string;
  problemBody: string;
  points: string[];
  benefitsTitle: string;
  benefits: { title: string; text: string }[];
  videoTitle: string;
  videoText: string;
  stepsTitle: string;
  steps: { title: string; text: string }[];
  reviewsTitle: string;
  reviewsNote: string;
  reviewPhoto: string;
  reviews: { name: string; city: string; text: string }[];
  offerTitle: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
}

const ar: PageCopy = {
  metaTitle: 'كينيدو لومبا — حزام الدعم الهوائي | 499 درهم',
  metaDescription:
    'حزام كينيدو لومبا مع المضخة والأعمدة الهوائية. دعم وراحة وتمدد خفيف ملي كتجلس ولا كتسوق. 499 درهم للقطعة، وجوج بـ 849. التوصيل فابور، والخلاص ملي الكولية فيدك.',
  headline: 'دعم خفيف للظهر ملي كتجلس بزاف',
  sub: 'حزام كينيدو لومبا كتتلفو على الخصر. خمسة ضغطات بالمضخة، والأعمدة الهوائية كتطلع وتعطيك تمدد خفيف وانت جالس ولا سايق.',
  problemTitle: 'نهار طويل على الكرسي ولا فالطيوموبيل',
  problemBody:
    'اللي كيبقى جالس فالخدمة، ولا سايق من الصباح للعشية، كيبقى ساعات على وضع واحد. كينيدو لومبا حزام دعم كيلبسو وهو جالس، بتمدد خفيف على قد ما بغى، ويكمل نهارو.',
  points: [
    'كتجلس بزاف فالمكتب ولا فالطيوموبيل',
    'بغيتي دعم على الخصر وانت خدام',
    'بغيتي تمدد خفيف، وتفك الحزام ملي تبغي',
  ],
  benefitsTitle: 'شنو كاين مع الحزام',
  benefits: [
    { title: 'أعمدة هوائية', text: 'كتشوفها كتطلع مع كل ضغطة على المضخة.' },
    { title: 'مضخة فيدك', text: 'خمسة ضغطات بشوية. نتا اللي كتحكم فالقوة.' },
    { title: 'دعم وانت جالس', text: 'تلبس الحزام فالكرسي ولا فالطيوموبيل وتكمل خدمتك.' },
    { title: 'وصلة القياس', text: 'الحزام مع الوصلة كيناسب محيط الخصر من 70 حتى 130 سم.' },
  ],
  videoTitle: 'شوف الأعمدة كيف كتطلع',
  videoText: 'الفيديو قصير، وما كيتحمّل حتى تضغط عليه.',
  stepsTitle: 'كيفاش تستعملو',
  steps: [
    { title: 'لفّو', text: 'حط الحزام على الخصر، فوق الحوايج ولا تحتهم، كيف ما راك مرتاح.' },
    { title: 'انفخ بشوية', text: 'خمسة ضغطات بالمضخة. وقف ملي تحس بالدعم والتمدد الخفيف.' },
    { title: 'كمل نهارك', text: 'بقى جالس ولا سايق. فك الحزام ملي تبغي.' },
  ],
  reviewsTitle: 'آراء الزبناء',
  reviewsNote: 'هاد الخانات مثال. بدّل الاسم والمدينة والكلام، وحط صورة زبون حقيقي قبل النشر.',
  reviewPhoto: 'حط صورة الزبون هنا',
  reviews: [
    { name: '[اسم الزبون]', city: 'الدار البيضاء', text: 'مثال: كنسوق بزاف، وكنلبس الحزام فالطيوموبيل. الدعم كيبان من الضغطات الأولى.' },
    { name: '[اسم الزبون]', city: 'الرباط', text: 'مثال: خديت جوج، واحدة ليا وواحدة للواليد. الاستعمال: تلف وتضغط.' },
    { name: '[اسم الزبون]', city: 'مراكش', text: 'مثال: وصلني لباب الدار، شفت الحزام والمضخة، ومن بعد خلّصت.' },
  ],
  offerTitle: 'اختار العرض',
  faqTitle: 'أسئلة',
  faq: [
    { q: 'شحال كياخد التوصيل؟', a: 'التوصيل فابور فكل المغرب. المدن الكبيرة غالبا بين 24 و48 ساعة، وباقي المدن حتى 3 أيام، على حساب شركة التوصيل.' },
    { q: 'فوقاش نخلّص؟', a: 'كتخلّص نقداً ملي الكولية توصل ليدك. تقدر تشوف الحزام والمضخة قبل الخلاص.' },
    { q: 'واش نقدر نبدّل؟', a: 'عندك 14 يوم تبديل مجاني. صيفط لينا رسالة من صفحة الاتصال، ونرتبو التبديل.' },
    { q: 'شنو القياس؟', a: 'حزام واحد مع وصلة. كيناسب محيط الخصر من 70 سم حتى 130 سم.' },
    { q: 'واش هاد الحزام دواء؟', a: 'لا. كينيدو لومبا للراحة والدعم والتمدد الخفيف. ما كيعالج حتى مرض، وما كيعوّضش الطبيب.' },
  ],
};

const fr: PageCopy = {
  metaTitle: 'Kinédoux Lumba — ceinture de soutien gonflable | 499 DH',
  metaDescription:
    'Ceinture Kinédoux Lumba avec pompe et colonnes d’air. Soutien, confort et léger étirement assis ou au volant. 499 DH l’unité, deux pour 849. Livraison offerte, paiement quand le colis est en main.',
  headline: 'Un soutien léger quand vous restez assis longtemps',
  sub: 'La ceinture Kinédoux Lumba se pose sur la taille. Cinq pressions sur la pompe, les colonnes d’air montent et donnent un léger étirement, assis ou au volant.',
  problemTitle: 'Une longue journée au siège ou au volant',
  problemBody:
    'Rester assis au travail, ou conduire du matin au soir, garde le corps dans la même position pendant des heures. Kinédoux Lumba est une ceinture de soutien à porter assis, avec un léger étirement, le temps que vous choisissez.',
  points: [
    'Vous restez longtemps assis au bureau ou en voiture',
    'Vous voulez un appui à la taille pendant le travail',
    'Vous voulez un léger étirement, et vous l’enlevez quand vous voulez',
  ],
  benefitsTitle: 'Ce qui arrive avec la ceinture',
  benefits: [
    { title: 'Colonnes d’air', text: 'Vous les voyez monter à chaque pression sur la pompe.' },
    { title: 'Pompe à la main', text: 'Cinq pressions, doucement. Vous réglez la force.' },
    { title: 'Du soutien assis', text: 'Vous la portez au fauteuil ou au volant et vous continuez.' },
    { title: 'Rallonge', text: 'Avec la rallonge, le tour de taille va de 70 à 130 cm.' },
  ],
  videoTitle: 'Voir les colonnes monter',
  videoText: 'La vidéo est courte, et elle ne se charge que lorsque vous appuyez.',
  stepsTitle: 'Comment l’utiliser',
  steps: [
    { title: 'L’enrouler', text: 'Posez la ceinture sur la taille, sur les vêtements ou dessous, comme vous êtes à l’aise.' },
    { title: 'Gonfler doucement', text: 'Cinq pressions. Arrêtez quand le soutien et le léger étirement sont là.' },
    { title: 'Continuer la journée', text: 'Restez assis ou au volant. Retirez la ceinture quand vous voulez.' },
  ],
  reviewsTitle: 'Avis clients',
  reviewsNote: 'Ces blocs sont des exemples. Remplacez le nom, la ville, le texte, et ajoutez une vraie photo avant de publier.',
  reviewPhoto: 'Mettre la photo du client ici',
  reviews: [
    { name: '[Nom du client]', city: 'Casablanca', text: 'Exemple : je conduis beaucoup, et je mets la ceinture en voiture. Le soutien se sent dès les premières pressions.' },
    { name: '[Nom du client]', city: 'Rabat', text: 'Exemple : j’en ai pris deux, une pour moi et une pour mon père. On enroule, on pompe.' },
    { name: '[Nom du client]', city: 'Marrakech', text: 'Exemple : le colis est arrivé, j’ai vu la ceinture et la pompe, puis j’ai payé.' },
  ],
  offerTitle: 'Choisir l’offre',
  faqTitle: 'Questions',
  faq: [
    { q: 'Combien de temps pour la livraison ?', a: 'La livraison est offerte partout au Maroc. Les grandes villes arrivent souvent en 24 à 48 heures, les autres villes jusqu’à 3 jours, selon le transporteur.' },
    { q: 'Quand est-ce que je paie ?', a: 'Vous payez en espèces quand le colis est dans votre main. Vous pouvez voir la ceinture et la pompe avant de payer.' },
    { q: 'Je peux échanger ?', a: 'Vous avez 14 jours pour un échange gratuit. Écrivez-nous depuis la page contact, et on organise l’échange.' },
    { q: 'Quelle taille ?', a: 'Une ceinture avec rallonge. Elle convient à un tour de taille de 70 à 130 cm.' },
    { q: 'C’est un médicament ?', a: 'Non. Kinédoux Lumba est fait pour le confort, le soutien et un léger étirement. Il ne soigne aucune maladie et ne remplace pas un médecin.' },
  ],
};

export const lumba = {
  slug: 'lumba',
  id: 'kinedoux-lumba',
  featured: true,
  sheetName: 'كينيدو لومبا',
  video: '/video/lumba.mp4',
  hero: {
    avif: [hero400a, hero800a, hero1200a] as Img[],
    webp: [hero400w, hero800w, hero1200w] as Img[],
    alt: {
      ar: 'راجل جالس لابس حزام كينيدو لومبا وماسك المضخة',
      fr: 'Homme assis portant la ceinture Kinédoux Lumba et tenant la pompe',
    } as Record<Lang, string>,
  },
  gallery: [
    {
      avif: [hero400a, hero800a, hero1200a],
      webp: [hero400w, hero800w, hero1200w],
      alt: {
        ar: 'حزام كينيدو لومبا وهو متلبس، مع المضخة في اليد',
        fr: 'Ceinture Kinédoux Lumba portée, pompe en main',
      },
    },
    {
      avif: [columns400a, columns800a],
      webp: [columns400w, columns800w],
      alt: {
        ar: 'الأعمدة الهوائية ديال الحزام عن قرب، والمضخة في اليد',
        fr: 'Colonnes d’air de la ceinture en gros plan, pompe en main',
      },
    },
    {
      avif: [kit400a, kit800a, kit1200a],
      webp: [kit400w, kit800w, kit1200w],
      alt: {
        ar: 'الحزام، المضخة، وصلة القياس، والدليل',
        fr: 'La ceinture, la pompe, la rallonge et le guide',
      },
    },
    {
      avif: [how400a, how800a, how1200a],
      webp: [how400w, how800w, how1200w],
      alt: {
        ar: 'ضغطات على المضخة والحزام على الخصر',
        fr: 'Pressions sur la pompe, ceinture à la taille',
      },
    },
  ] as Frame[],
  poster: {
    avif: [columns400a, columns800a] as Img[],
    webp: [columns400w, columns800w] as Img[],
  },
  offers: [
    {
      id: 'one',
      qty: 1,
      price: 499,
      compareAt: 699,
      sheetLabel: 'قطعة واحدة',
      ar: { title: 'قطعة واحدة', detail: 'حزام + مضخة + وصلة القياس' } as OfferCopy,
      fr: { title: 'Une pièce', detail: 'Ceinture + pompe + rallonge' } as OfferCopy,
    },
    {
      id: 'two',
      qty: 2,
      price: 849,
      compareAt: 998,
      sheetLabel: 'جوج قطع',
      ar: { title: 'جوج قطع', detail: 'واحدة ليك وواحدة للواليد ولا الواليدة' } as OfferCopy,
      fr: { title: 'Deux pièces', detail: 'Une pour vous, une pour un parent' } as OfferCopy,
    },
  ],
  ar,
  fr,
};

export type Product = typeof lumba;
