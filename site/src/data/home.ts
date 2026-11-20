import type { Lang } from '../config';

export const homeCopy: Record<Lang, {
  metaTitle: string;
  metaDescription: string;
  headline: string;
  sub: string;
  points: string[];
}> = {
  ar: {
    metaTitle: 'كينيدو — دعم وراحة للظهر',
    metaDescription:
      'كينيدو علامة مغربية لحزام الدعم الهوائي لومبا. 499 درهم، التوصيل فابور، والخلاص ملي الكولية فيدك.',
    headline: 'كينيدو',
    sub: 'دعم وراحة للناس اللي كيجلسو ويسايقو بزاف. المنتج ديال الدابا: حزام كينيدو لومبا.',
    points: ['توصيل فابور فكل المغرب', 'تخلّص ملي الكولية فيدك', 'تبديل مجاني 14 يوم'],
  },
  fr: {
    metaTitle: 'Kinédoux — soutien et confort du dos',
    metaDescription:
      'Kinédoux, marque marocaine de la ceinture de soutien gonflable Lumba. 499 DH, livraison offerte, paiement quand le colis est en main.',
    headline: 'Kinédoux',
    sub: 'Du soutien et du confort pour les gens qui restent assis ou qui conduisent longtemps. Le produit du moment : la ceinture Kinédoux Lumba.',
    points: ['Livraison offerte partout au Maroc', 'Vous payez le colis en main', 'Échange gratuit 14 jours'],
  },
};
