import type { Lang } from '../config';

export const ui: Record<Lang, {
  bar: string;
  langLabel: string;
  order: string;
  sticky: string;
  delivery: string;
  exchange: string;
  formTitle: string;
  formLead: string;
  name: string;
  phone: string;
  phoneHint: string;
  city: string;
  cityPlaceholder: string;
  address: string;
  addressHint: string;
  submit: string;
  sending: string;
  offerLegend: string;
  total: string;
  fax: string;
  errName: string;
  errPhone: string;
  errCity: string;
  errAddress: string;
  errMessage: string;
  errFast: string;
  errSend: string;
  errNoWebhook: string;
  savedOnPhone: string;
  videoPlay: string;
  videoMissing: string;
  footerPrivacy: string;
  footerTerms: string;
  footerContact: string;
  footerHome: string;
  rights: string;
  contactTitle: string;
  contactLead: string;
  message: string;
  contactSend: string;
  contactOk: string;
  thanksTitle: string;
  thanksBody: string;
  thanksDirect: string;
  thanksHome: string;
}> = {
  ar: {
    bar: 'التوصيل فابور · تخلّص ملي الكولية فيدك',
    langLabel: 'FR',
    order: 'اطلب الآن – الدفع عند الاستلام',
    sticky: 'اطلب الآن',
    delivery: 'التوصيل فابور',
    exchange: 'تبديل مجاني 14 يوم',
    formTitle: 'طلبك',
    formLead: 'عمّر الخانات. غادي نعيطو ليك باش نأكدو العنوان، ومن بعد نخرجو الكولية.',
    name: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    phoneHint: '06 أو 07، عشرة أرقام',
    city: 'المدينة',
    cityPlaceholder: 'اختار المدينة',
    address: 'العنوان',
    addressHint: 'الحي، الزنقة، وأقرب معلم',
    submit: 'تأكيد الطلب',
    sending: 'كنسيفطو الطلب...',
    offerLegend: 'اختار العرض',
    total: 'المجموع عند الاستلام',
    fax: 'فاكس',
    errName: 'كتب الاسم الكامل.',
    errPhone: 'الرقم خاصو يبدا بـ 06 ولا 07 ويكون فيه 10 أرقام.',
    errCity: 'اختار المدينة.',
    errAddress: 'كتب العنوان باش يوصل الليفرور.',
    errMessage: 'كتب الرسالة.',
    errFast: 'تسنا شوية وعاود صيفط.',
    errSend: 'الإرسال ما نجحش. عاود مرة أخرى.',
    errNoWebhook: 'الطلب ما تصيفطش. رابط الاستقبال مازال ما تحطّش.',
    savedOnPhone: 'نسخة من الطلب بقات فهاد التيليفون.',
    videoPlay: 'شغّل الفيديو',
    videoMissing: 'الفيديو ما تقدرش يتفرج دابا.',
    footerPrivacy: 'الخصوصية',
    footerTerms: 'الشروط',
    footerContact: 'اتصل بنا',
    footerHome: 'كينيدو',
    rights: 'كينيدو',
    contactTitle: 'اتصل بنا',
    contactLead: 'سؤال على القياس، التبديل، ولا الكولية؟ صيفط رسالة، ولا عيّط.',
    message: 'الرسالة',
    contactSend: 'صيفط الرسالة',
    contactOk: 'وصلاتنا الرسالة. غادي نرجعو ليك.',
    thanksTitle: 'تسجّل الطلب',
    thanksBody: 'غادي نعيطو ليك من رقم مغربي باش نأكدو الاسم، العنوان، والثمن. وجد المبلغ نقداً، وخلّص غير ملي الكولية توصل ليدك.',
    thanksDirect: 'إلا كنت طلبتي، غادي نعيطو ليك باش نأكدو العنوان.',
    thanksHome: 'رجوع للرئيسية',
  },
  fr: {
    bar: 'Livraison offerte · vous payez le colis en main',
    langLabel: 'AR',
    order: 'Commander — paiement à la livraison',
    sticky: 'Commander',
    delivery: 'Livraison offerte',
    exchange: 'Échange gratuit 14 jours',
    formTitle: 'Votre commande',
    formLead: 'Remplissez les champs. Nous appelons pour confirmer l’adresse, puis le colis part.',
    name: 'Nom complet',
    phone: 'Téléphone',
    phoneHint: '06 ou 07, 10 chiffres',
    city: 'Ville',
    cityPlaceholder: 'Choisir la ville',
    address: 'Adresse',
    addressHint: 'Quartier, rue, un repère',
    submit: 'Confirmer la commande',
    sending: 'Envoi en cours...',
    offerLegend: 'Choisir l’offre',
    total: 'Total à payer à la livraison',
    fax: 'Fax',
    errName: 'Écrivez le nom complet.',
    errPhone: 'Le numéro doit commencer par 06 ou 07 et compter 10 chiffres.',
    errCity: 'Choisissez la ville.',
    errAddress: 'Écrivez l’adresse pour le livreur.',
    errMessage: 'Écrivez le message.',
    errFast: 'Attendez un instant, puis renvoyez.',
    errSend: 'L’envoi n’a pas abouti. Réessayez.',
    errNoWebhook: 'La commande n’est pas partie. L’adresse de réception n’est pas encore en place.',
    savedOnPhone: 'Une copie de la commande reste sur ce téléphone.',
    videoPlay: 'Lire la vidéo',
    videoMissing: 'La vidéo ne peut pas être lue pour le moment.',
    footerPrivacy: 'Confidentialité',
    footerTerms: 'Conditions',
    footerContact: 'Contact',
    footerHome: 'Kinédoux',
    rights: 'Kinédoux',
    contactTitle: 'Contact',
    contactLead: 'Une question sur la taille, l’échange ou le colis ? Écrivez, ou appelez.',
    message: 'Message',
    contactSend: 'Envoyer',
    contactOk: 'Message reçu. Nous vous répondons.',
    thanksTitle: 'Commande enregistrée',
    thanksBody: 'Nous appelons d’un numéro marocain pour confirmer le nom, l’adresse et le prix. Préparez le montant en espèces, et payez seulement quand le colis est dans votre main.',
    thanksDirect: 'Si vous avez commandé, nous appelons pour confirmer l’adresse.',
    thanksHome: 'Retour à l’accueil',
  },
};
