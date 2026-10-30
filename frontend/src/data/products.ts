import { IMAGES } from "./images";

export type ProductSlug = "kenidoux-lumba" | "kenidoux-posta" | "kenidoux-calma";

export type Offer = {
  id: string;
  title: string;
  subtitle: string;
  units: number;
  price: number;
  compareAt: number;
  badge: string;
  isDefault?: boolean;
  /** Set on the Full Kit offer: product slugs physically included. */
  includes?: ProductSlug[];
};

export type MaterialCard = { title: string; latin: string; body: string };

export type ProductSection = {
  kind: "emotional" | "science" | "materials";
  title: string;
  body: string;
  bullets: string[];
  cards?: MaterialCard[];
  image: string;
};

export type Product = {
  slug: ProductSlug;
  nameAr: string;
  nameEn: string;
  latinSubtitle: string;
  category: string;
  rating: number;
  reviewCount: number;
  cardHeading: string;
  cardSubheading: string;
  scarcityBadge: string;
  scarcityShort: string;
  stock: number;
  viewers: number;
  price: number;
  compareAt: number;
  crossSellPrice: number;
  crossSellNote: string;
  offers: Offer[];
  bonuses: string[];
  kitTitle: string;
  kitContents: string[];
  heroHook: { title: string; body: string };
  sections: ProductSection[];
  steps: Array<{ title: string; body: string }>;
  comparisonOriginal: string[];
  crossSellPitches: Partial<Record<ProductSlug, string>>;
  gallery: Array<{ src: string; label: string }>;
  image: string;
  /** Short description used in <meta> and JSON-LD. */
  metaDescription: string;
};

const ALL: ProductSlug[] = ["kenidoux-lumba", "kenidoux-posta", "kenidoux-calma"];

const gallery = (slug: ProductSlug) => {
  const img = IMAGES.products[slug];
  return [
    { src: img.main, label: "الصورة الرئيسية" },
    { src: img.mechanism, label: "كيفاش كتخدم" },
    { src: img.lifestyle, label: "طريقة الاستعمال" },
    { src: img.kit, label: "محتويات العلبة" },
  ];
};

const lumba: Product = {
  slug: "kenidoux-lumba",
  nameAr: "كينيدو لومبا",
  nameEn: "Kinédoux Lumba™",
  latinSubtitle: "Kinédoux Lumba™ — Ceinture de Décompression Lombaire",
  category: "الأكثر طلباً — راحة أسفل الظهر",
  rating: 4.9,
  reviewCount: 48,
  cardHeading: "كينيدو لومبا — حزام أسفل الظهر",
  cardSubheading:
    "دعم وتمدد خفيف بعد السياقة، الجلسة الطويلة أو الوقوف. تنتفخ الأعمدة الهوائية بضغطات بسيطة، وأنت جالس أو سايق.",
  scarcityBadge: "توصيل مجاني 24–48 ساعة من الدار البيضاء · الخلاص عند الاستلام",
  scarcityShort: "توصيل فابور",
  stock: 24,
  viewers: 0,
  price: 499,
  compareAt: 499,
  crossSellPrice: 379,
  crossSellNote: "بدل 499 د.م",
  offers: [
    {
      id: "lumba-1",
      title: "حزام واحد",
      subtitle: "لومبا + المضخة + وصلة التوسيع + دليل الروتين + التوصيل المجاني",
      units: 1,
      price: 499,
      compareAt: 499,
      badge: "توصيل مجاني",
    },
    {
      id: "lumba-2",
      title: "حزامين — ليك وللوالدين",
      subtitle: "واحد ليك وواحد للواليد أو الواليدة. التاني بـ 350 د.م، فنفس الكولية.",
      units: 2,
      price: 849,
      compareAt: 998,
      badge: "الأكثر طلباً",
      isDefault: true,
    },
    {
      id: "lumba-3",
      title: "ثلاثة أحزمة للعائلة",
      subtitle: "للدار كاملة، بنفس التوصيل المجاني وبدون مصاريف زايدة.",
      units: 3,
      price: 1149,
      compareAt: 1497,
      badge: "عرض العائلة",
    },
  ],
  bonuses: [
    "مضخة هوائية يدوية بصمام أمان",
    "وصلة توسيع للمقاسات من 70 إلى 130 سم",
    "دليل كينيدو المصور بالدارجة والفرنسية لروتين 10 دقائق",
    "توصيل مجاني حتى لباب الدار + الخلاص عند الاستلام",
  ],
  kitTitle: "شنو كيجي فالكولية ديالك؟",
  kitContents: [
    "حزام كينيدو لومبا الهوائي",
    "مضخة هوائية يدوية بصمام أمان",
    "وصلة توسيع للمقاسات من 70 إلى 130 سم",
    "دليل كينيدو المصور بالدارجة والفرنسية",
    "توصيل سريع ومجاني حتى لباب الدار",
  ],
  heroHook: {
    title: "الجلسة الطويلة والسياقة كيثقّلو على أسفل الظهر. الدعم كيكون بسيط.",
    body: "كينيدو لومبا حزام كيلتف على الخصر وينتافخ بضغطات قليلة. كيعطيك دعم وتمدد خفيف وأنت جالس، سايق أو خدام — بلا إلكترونيك وبلا تعقيد.",
  },
  sections: [
    {
      kind: "emotional",
      title: "رجّع لظهرك شوية خفة فالدار، فالخدمة وفالصلاة",
      body: "ملي أسفل الظهر كيكون تقيل، الوقوف من الكرسي، الركوع، وحتى النعاس كيبانو أصعب. لومبا كينتافخ عمودياً بـ 5 ضغطات باش يعطي مساحة مريحة ودعم ثابت، بلا ما يعيق الحركة.",
      bullets: [
        "ينتافخ بـ 5 ضغطات بسيطة بالمضخة",
        "مريح فالوقوف، فالركوع وفالنعاس",
        "ما كيعوّقش الحركة فالسيارة ولا فالمكتب",
      ],
      image: IMAGES.products["kenidoux-lumba"].sections[0],
    },
    {
      kind: "science",
      title: "أعمدة هوائية عمودية: دعم من الداخل، ماشي تزيار الكرش",
      body: "الأحزمة العادية كتضغط على البطن. لومبا كيعتمد على أعمدة هوائية كتمتد للفوق ملي كتنفخ، وكتخفّف الثقل على أسفل الظهر وتعطي إحساس بالدعم وأنت لابسو.",
      bullets: [
        "أعمدة هوائية عمودية كتعطي تمدد لطيف",
        "نفخ تدريجي: وقف ملي تحسين بالراحة، ماشي بالقساوة",
        "وصلة قياس باش يناسب أغلب الخصوات",
      ],
      image: IMAGES.products["kenidoux-lumba"].sections[1],
    },
    {
      kind: "materials",
      title: "خامات مختارة باش يبقى الهواء، وتبقى الراحة",
      body: "كل طبقة عندها سبب: ثبات النفخ، تهوية على البشرة، وتحكم ساهل فالتفريغ.",
      bullets: [],
      cards: [
        {
          title: "طبقة TPU عالية الكثافة",
          latin: "TPU Haute Densité",
          body: "تحافظ على الهواء بدون ارتخاء سريع، باش الجلسة تبقى مريحة للنهاية.",
        },
        {
          title: "بطانة شبكية للتنفس",
          latin: "Mesh Respirant",
          body: "لطيفة على البشرة ومناسبة لجو المغرب، تحت الحوايج بلا عرق زايد.",
        },
        {
          title: "صمام ومضخة سريعة",
          latin: "Valve & Pompe",
          body: "نفخ دقيق، وتفريغ الهواء فثانية بضغطة واحدة.",
        },
      ],
      image: IMAGES.products["kenidoux-lumba"].sections[2],
    },
  ],
  steps: [
    { title: "ثبّت الحزام", body: "لف لومبا حول خصرك (فوق الحوايج أو تحتهم) وثبّتو على مقاس مريح." },
    { title: "5 ضغطات بالمضخة", body: "نفخ الأعمدة حتى تحس بتمدد عمودي لطيف. وقف قبل ما يولي قاصح." },
    { title: "ارتاح 10–15 دقيقة", body: "بدا قصير فالأيام الأولى، ومن بعد فرّغ الهواء بضغطة على الصمام." },
  ],
  comparisonOriginal: [
    "خامة متينة تحافظ على الهواء",
    "دليل استعمال بالدارجة والفرنسية",
    "تبديل فابور فـ 14 يوم",
    "وصلة توسيع من 70 إلى 130 سم",
    "مواكبة من الدار البيضاء",
  ],
  crossSellPitches: {
    "kenidoux-posta": "أضف الحزام الهوائي لأسفل الظهر بنفس الكولية",
    "kenidoux-calma": "أضف الحزام الهوائي الأكثر طلباً لراحة أسفل الظهر",
  },
  gallery: gallery("kenidoux-lumba"),
  image: IMAGES.products["kenidoux-lumba"].main,
  metaDescription:
    "كينيدو لومبا — الحزام الهوائي لراحة أسفل الظهر. توصيل مجاني لجميع مدن المغرب والخلاص عند الاستلام بعد فحص الكولية.",
};

const posta: Product = {
  slug: "kenidoux-posta",
  nameAr: "كينيدو بوسطا",
  nameEn: "Kinédoux Posta™",
  latinSubtitle: "Kinédoux Posta™ — Pack Posture Intelligente & Nuque",
  category: "وقفة خفيفة وراحة الرقبة",
  rating: 4.8,
  reviewCount: 36,
  cardHeading: "كينيدو بوسطا — وقفة ووسادة رقبة",
  cardSubheading:
    "منبّه اهتزاز لطيف بالنهار + وسادة تمدد للرقبة بالعشية. وقف بثقة، بلا أحزمة قاصحة تحت الإبط.",
  scarcityBadge: "الباقة كاملة: المنبّه + وسادة الرقبة + برنامج 14 يوم",
  scarcityShort: "باقة كاملة",
  stock: 24,
  viewers: 0,
  price: 379,
  compareAt: 379,
  crossSellPrice: 249,
  crossSellNote: "بدل 379 د.م",
  offers: [
    {
      id: "posta-1",
      title: "باقة بوسطا واحدة",
      subtitle: "المنبّه الذكي + وسادة الرقبة + برنامج 14 يوم + توصيل مجاني",
      units: 1,
      price: 379,
      compareAt: 379,
      badge: "توصيل مجاني",
    },
    {
      id: "posta-2",
      title: "باقتين — ليك ولشريكك",
      subtitle: "للزوجين، أو ليك وولدك مع القراية. التانية بسعر تفضيلي فنفس الكولية.",
      units: 2,
      price: 649,
      compareAt: 758,
      badge: "الأكثر طلباً",
      isDefault: true,
    },
    {
      id: "posta-3",
      title: "ثلاث باقات للمكتب أو العائلة",
      subtitle: "ثلاثة أطقم كاملة، بنفس التوصيل المجاني.",
      units: 3,
      price: 899,
      compareAt: 1137,
      badge: "عرض العائلة",
    },
  ],
  bonuses: [
    "حزام ذكي بمستشعر زاوية واهتزاز صامت",
    "وسادة منحنية لتمديد واسترخاء الرقبة",
    "برنامج 14 يوماً مطبوع بالدارجة والفرنسية",
    "كابل شحن USB-C — شحنة تدوم أياماً",
  ],
  kitTitle: "شنو كيجي فالكولية ديالك؟",
  kitContents: [
    "حزام كينيدو الذكي بمستشعر الزاوية والاهتزاز الصامت",
    "وسادة كينيدو المنحنية لراحة الرقبة",
    "برنامج 14 يوماً بالدارجة والفرنسية",
    "كابل شحن USB-C",
    "توصيل سريع ومجاني حتى لباب الدار",
  ],
  heroHook: {
    title: "الساعات قدام التيليفون والبيسي كتحني الكتاف. الحل ماشي التزيار.",
    body: "بوسطا خفيفة: بالنهار كتفكّرك باهتزاز لطيف ملي كتحني، وبالليل وسادة الرقبة لـ 10 دقائق بعد نهار طويل قدام الشاشة.",
  },
  sections: [
    {
      kind: "emotional",
      title: "وقف بوقفة مريحة، أنيقة وما كاتبانش تحت الحوايج",
      body: "الوقفة المسرحة كتبدل الراحة قدام البيسي، وحتى الحضور فالدار وفالتصاور. عوض الأحزمة القاصحة، بوسطا خفيفة وما كتجرحش تحت الإبط.",
      bullets: [
        "خفيفة وما كاتبانش تحت الحوايج",
        "بلا أحزمة قاصحة تحت الإبط",
        "مناسبة للخدمة، القراية والتصوير",
      ],
      image: IMAGES.products["kenidoux-posta"].sections[0],
    },
    {
      kind: "science",
      title: "تذكير ذكي بالنهار، تمدد لطيف للرقبة بالليل",
      body: "المستشعر كيرصد الانحناء وكيعطي اهتزاز صامت باش توقف راسك. بالعشية، الوسادة المنحنية كتعطي للرقبة قوس مريح بعد نهار الشاشات.",
      bullets: [
        "اهتزاز خفيف ملي كتحني أكثر من اللازم",
        "برنامج 14 يوم مطبوع، خطوة بخطوة",
        "وسادة منحنية بنقاط ضغط مريحة للرقبة",
      ],
      image: IMAGES.products["kenidoux-posta"].sections[1],
    },
    {
      kind: "materials",
      title: "بساطة وأمان يومي: بلا بلوتوث وبلا تطبيق",
      body: "لمسة زر واحدة، بطارية تدوم أياماً، وأحزمة ناعمة قابلة للتعديل.",
      bullets: [],
      cards: [
        {
          title: "مستشعر زاوية دقيق",
          latin: "Capteur d’Angle",
          body: "بدون بلوتوث وبدون موجات. يشتغل بلمسة زر، والبطارية كتطول.",
        },
        {
          title: "أحزمة ناعمة قابلة للتعديل",
          latin: "Sangles Souples",
          body: "مرنة ولطيفة على الكتفين، تناسب أغلب القامات.",
        },
        {
          title: "فوم مريح لوسادة الرقبة",
          latin: "Mousse Haute Résilience",
          body: "كثافة مدروسة تعطي قوس تمدد لطيف، بلا قساوة.",
        },
      ],
      image: IMAGES.products["kenidoux-posta"].sections[2],
    },
  ],
  steps: [
    { title: "فعّل المستشعر", body: "ركّب الحزام على الكتفين وشغّل المستشعر بلمسة زر (بلا تطبيق)." },
    { title: "تلقى تنبيه لطيف", body: "ملي كتحني، كيجيك اهتزاز صامت كيفكّرك توقف راسك." },
    { title: "10 دقايق عشية", body: "ارتاح على الوسادة المنحنية 10 دقائق باش ترتاح الرقبة والكتاف." },
  ],
  comparisonOriginal: [
    "مستشعر ذكي بلا بلوتوث وبلا تطبيق",
    "برنامج 14 يوماً بالدارجة والفرنسية",
    "تبديل فابور فـ 14 يوم",
    "وسادة رقبة منحنية ضمن الباقة",
    "مواكبة من الدار البيضاء",
  ],
  crossSellPitches: {
    "kenidoux-lumba": "كمّل براحة الرقبة ومصحح الوقفة الخفيف",
    "kenidoux-calma": "أضف باقة الوقفة ووسادة الرقبة لنفس الكولية",
  },
  gallery: gallery("kenidoux-posta"),
  image: IMAGES.products["kenidoux-posta"].main,
  metaDescription:
    "كينيدو بوسطا — منبّه وقفة لطيف + وسادة الرقبة. توصيل مجاني لجميع مدن المغرب والخلاص عند الاستلام.",
};

const calma: Product = {
  slug: "kenidoux-calma",
  nameAr: "كينيدو كالما",
  nameEn: "Kinédoux Calma™",
  latinSubtitle: "Kinédoux Calma™ — Ventouse Thermique Intelligente",
  category: "طقس الاسترخاء المسائي",
  rating: 4.9,
  reviewCount: 41,
  cardHeading: "كينيدو كالما — كاسات دافئة بلا جرح",
  cardSubheading:
    "النسخة العصرية ديال الكاسات: دفء مريح وشفط ناعم لكتافك وظهرك فـ 15 دقيقة، بلا نار وبلا فوضى.",
  scarcityBadge: "إضافة مفضلة مع لومبا: نفس الكولية، بلا توصيل زايد",
  scarcityShort: "بلا جرح",
  stock: 24,
  viewers: 0,
  price: 349,
  compareAt: 349,
  crossSellPrice: 199,
  crossSellNote: "بدل 349 د.م",
  offers: [
    {
      id: "calma-1",
      title: "جهاز كالما واحد",
      subtitle: "الجهاز + حقيبة الحفظ + كابل USB-C + التوصيل المجاني",
      units: 1,
      price: 349,
      compareAt: 349,
      badge: "توصيل مجاني",
    },
    {
      id: "calma-2",
      title: "جهازين — للكتفين أو هدية",
      subtitle: "جهازين للاستعمال فنفس الوقت، أو واحد ليك وواحد للوالدين.",
      units: 2,
      price: 599,
      compareAt: 698,
      badge: "الأكثر طلباً",
      isDefault: true,
    },
    {
      id: "calma-3",
      title: "الباقة الكاملة (لومبا + بوسطا + كالما)",
      subtitle: "ظهر، وقفة واسترخاء فكولية واحدة — أوفر من الشراء فرادى.",
      units: 3,
      price: 890,
      compareAt: 1227,
      badge: "الباقة المتكاملة",
      includes: ALL,
    },
  ],
  bonuses: [
    "جهاز الكاسات الذكي بحرارة مهدئة وحلقة ضوء دافئ",
    "حقيبة حفظ أنيقة للسفر والتخزين",
    "كابل شحن USB-C",
    "دليل كينيدو بالدارجة والفرنسية + توصيل مجاني",
  ],
  kitTitle: "شنو كيجي فالكولية ديالك؟",
  kitContents: [
    "جهاز كينيدو كالما الذكي",
    "حقيبة الحفظ الأنيقة",
    "كابل شحن USB-C",
    "دليل كينيدو المصور بالدارجة والفرنسية",
    "توصيل سريع ومجاني حتى لباب الدار",
  ],
  heroHook: {
    title: "عيا الكتاف والظهر ديال النهار… ذوّبو فـ 15 دقيقة دافئة فالدار.",
    body: "المغاربة كيعرفو راحة الكاسات. كالما هي النسخة العصرية: بلا جرح، بلا نار وبلا فوضى. دفء يرخي العضلات، وشفط إيقاعي ناعم قبل النعاس.",
  },
  sections: [
    {
      kind: "emotional",
      title: "15 دقيقة قبل النعاس تكفي باش تطيح ستريس النهار",
      body: "من بعد الخدمة، الرياضة، أو غير باش تدلّل الوالدين بجلسة دافئة فالدار. كالما كتشغل بضغطة زر، بتوقيت أوتوماتيكي وزر فك الضغط فأي لحظة.",
      bullets: [
        "توقيت أوتوماتيكي (حتى 20 دقيقة)",
        "زر فك الضغط الفوري بلمسة واحدة",
        "هدية راحة واضحة للواليد والواليدة",
      ],
      image: IMAGES.products["kenidoux-calma"].sections[0],
    },
    {
      kind: "science",
      title: "دفء + شفط ناعم + ضوء دافئ، فجهاز واحد",
      body: "عوض كأس ثابت كيحبس الجلد، كالما كتدير شدّ وإرخاء لطيف مع مستويات قوة وحرارة تقدر تضبطهم. الضوء الدافئ كيزيد إحساس الاسترخاء على الكتاف والظهر.",
      bullets: [
        "6 مستويات للقوة و6 للحرارة المهدئة",
        "تنفس إيقاعي: شدّ وإرخاء ناعم",
        "حلقة ضوء دافئ حول الكأس",
      ],
      image: IMAGES.products["kenidoux-calma"].sections[1],
    },
    {
      kind: "materials",
      title: "تصميم نظيف، آمن وسهل على كل أفراد الدار",
      body: "حواف ناعمة، حرارة مضبوطة، وتحرير فوري للضغط قبل ما تشيل الجهاز.",
      bullets: [],
      cards: [
        {
          title: "كأس بولي كربونات شفاف",
          latin: "Coupelle PC",
          body: "حواف منحنية تنزلق بسلاسة على الكتفين، الظهر والساقين.",
        },
        {
          title: "شريحة تحكم حراري",
          latin: "Régulation Thermique",
          body: "تحافظ على دفء ثابت ومريح، بلا حرارة مفرطة.",
        },
        {
          title: "زر تحرير الضغط",
          latin: "Libération Immédiate",
          body: "بضغطة واحدة يتوقف الشفط بنعومة قبل إزالة الكأس.",
        },
      ],
      image: IMAGES.products["kenidoux-calma"].sections[2],
    },
  ],
  steps: [
    { title: "ثبّت وحدّد", body: "حط الكأس على الكتف أو الظهر واختار مستوى الحرارة والقوة اللي مريحك." },
    { title: "ضغطة زر وارتاح", body: "كيبدا الشفط الإيقاعي الدافئ، وكيوقف تلقائياً بعد المدة المحددة." },
    { title: "فك الضغط بلمسة", body: "بضغطة على زر التحرير يوقف الشفط، ومن بعد شيل الجهاز على مهل." },
  ],
  comparisonOriginal: [
    "كأس متين بحواف ناعمة",
    "حرارة مهدئة مضبوطة بشريحة ذكية",
    "تبديل فابور فـ 14 يوم",
    "زر تحرير الضغط الفوري",
    "مواكبة من الدار البيضاء",
  ],
  crossSellPitches: {
    "kenidoux-lumba": "أضف كاسات المساء لراحة الكتاف، فنفس الكولية",
    "kenidoux-posta": "أضف كالما لتدليك الرقبة والكتفين بعد نهار الشاشة",
  },
  gallery: gallery("kenidoux-calma"),
  image: IMAGES.products["kenidoux-calma"].main,
  metaDescription:
    "كينيدو كالما — كاسات حرارية ذكية للاسترخاء المسائي، بلا جرح وبلا نار. توصيل مجاني والخلاص عند الاستلام.",
};

export const PRODUCTS: Product[] = [lumba, posta, calma];
export const PRODUCT_MAP: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return PRODUCT_MAP[slug];
}

export function defaultOffer(product: Product): Offer {
  return product.offers.find((o) => o.isDefault) ?? product.offers[0];
}

export function singleOffer(product: Product): Offer {
  return product.offers[0];
}

export function fullKitOffer(): { product: Product; offer: Offer } {
  const offer = calma.offers.find((o) => o.includes) as Offer;
  return { product: calma, offer };
}

/** Cross-sell candidates for a cart: products not yet included, ordered by the doc-02 matrix. */
export function crossSellOrder(primary: ProductSlug): ProductSlug[] {
  const matrix: Record<ProductSlug, ProductSlug[]> = {
    "kenidoux-lumba": ["kenidoux-calma", "kenidoux-posta"],
    "kenidoux-posta": ["kenidoux-calma", "kenidoux-lumba"],
    "kenidoux-calma": ["kenidoux-lumba", "kenidoux-posta"],
  };
  return matrix[primary];
}
