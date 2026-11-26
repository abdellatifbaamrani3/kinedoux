import { IMAGES } from "./images";

export type ProductSlug = "kenidoux-lumba" | "kenidoux-posta" | "kenidoux-calma" | "kenidoux-palma";

export type Offer = {
  id: string;
  title: string;
  subtitle: string;
  units: number;
  price: number;
  compareAt: number;
  badge: string;
  isDefault?: boolean;
  /** The full kit stays stored on Calma. The product page adds it as the third tile and still submits this offer. */
  showInPicker?: boolean;
  /** Set on the Full Kit offer: product slugs physically included. */
  includes?: ProductSlug[];
  /** Optional 64px-class thumbnail shown on the offer card. */
  thumbSrc?: string;
};

export type MaterialCard = { title: string; latin: string; body: string };

/**
 * Real customer proof for one product.
 * Add these on the product in this file. An empty list renders nothing.
 * image: a file that already exists under /public. videoUrl: a real 9:16 clip.
 */
export type Testimonial = {
  firstName: string;
  city: string;
  product: string;
  text: string;
  image?: string;
  videoUrl?: string;
};

export type GallerySlide = {
  src: string;
  label: string;
  alt?: string;
  /** cover fills the frame. blur shows the whole photo on a blurred copy of the same file. */
  fit?: "cover" | "blur";
  /** object-position. Defaults to center. */
  focus?: string;
};

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
  /** Optional image shown beside the how-to steps (e.g. illustrated guide). */
  stepsImage?: string;
  stepsImageAlt?: string;
  comparisonOriginal: string[];
  crossSellPitches: Partial<Record<ProductSlug, string>>;
  gallery: GallerySlide[];
  image: string;
  kitImageAlt?: string;
  scienceImageAlt?: string;
  /** Short description used in <meta> and JSON-LD. */
  metaDescription: string;
  /** One line under the name. */
  outcome: string;
  /** Three short chips under the price. */
  chips: string[];
  /**
   * Real reviews only. Leave [] until a real message exists.
   * The product page does not render "شنو قالو الزبناء" while this is empty.
   * Add: { firstName, city, product, text, image?, videoUrl? }
   * Put a real WhatsApp screenshot on `image` (a file that already exists under /public).
   */
  testimonials: Testimonial[];
  /** Short scene at the top of the problem section. */
  painScene: string;
  /** Three lines for "شكون محتاجو؟". */
  whoFor: string[];
  howTitle: string;
  finalTitle: string;
  compareTitle: string;
  /** Market column. Same length as comparisonOriginal. No invented specs. */
  compareMarket: string[];
  photos: {
    problem: string;
    solution: string;
    how: string;
    result?: string;
    heat?: string;
    heatTitle?: string;
    heatBody?: string;
    box: string;
    final?: string;
  };
};

const ALL: ProductSlug[] = ["kenidoux-lumba", "kenidoux-posta", "kenidoux-calma"];

const COVER_FOCUS: Record<string, string> = {
  "/images/posta/laptop.webp": "30% center",
};

const gallery = (slug: ProductSlug): GallerySlide[] => {
  const img = IMAGES.products[slug];
  return [
    { src: img.main, label: "الصورة الرئيسية", fit: "cover", focus: COVER_FOCUS[img.main] ?? "center" },
    { src: img.mechanism, label: "كيفاش كتخدم", fit: "blur" },
    { src: img.lifestyle, label: "طريقة الاستعمال", fit: "cover", focus: COVER_FOCUS[img.lifestyle] ?? "center" },
    { src: img.kit, label: "محتويات العلبة", fit: "blur" },
  ];
};

const lumba: Product = {
  slug: "kenidoux-lumba",
  nameAr: "كينيدو لومبا",
  nameEn: "Kinédoux Lumba™",
  latinSubtitle: "Kinédoux Lumba™ — Ceinture de soutien lombaire à air",
  category: "راحة أسفل الظهر",
  cardHeading: "كينيدو لومبا — حزام أسفل الظهر",
  cardSubheading:
    "دعم وتمدد خفيف بعد السياقة، الجلسة الطويلة أو الوقوف. تنتفخ الأعمدة الهوائية بضغطات بسيطة، وأنت جالس أو سايق.",
  outcome: "ظهر مرتاح بعد السياقة والجلسة الطويلة",
  chips: ["جالس أو سايق", "5 ضغطات", "70–130 سم"],
  testimonials: [],
  painScene:
    "سوايع فالكرسي ولا فالطوموبيل، وملي كتنوض كتحس بأسفل الظهر تقيل. ماشي غير نتا، هادي حالة بزاف ديال الناس اللي خدامين جالسين.",
  whoFor: ["السائقين والخدامين جالسين", "اللي كيشقاو بالنهار", "الواليدين: ساهل يستعملوه"],
  howTitle: "3 خطوات بسيطة، 10 دقايق فالنهار",
  finalTitle: "ظهرك خدام معاك. عطيه دعم واضح اليوم.",
  compareTitle: "علاش تختار كينيدو عوض حزام السوق العادي؟",
  compareMarket: [
    "خامة رقيقة كترتخا وكضيّع الهواء",
    "بدون دليل بالدارجة وبدون متابعة",
    "بدون ضمان واضح",
    "مقاس واحد ومزعج",
    "إعلان عام بلا مواكبة بعد الطلب",
  ],
  photos: {
    problem: "/images/lumba/drive-2.webp",
    solution: "/images/lumba/columns-closeup.webp",
    how: "/images/lumba/guide-booklet.webp",
    result: "/images/lumba/before-after.webp",
    box: "/images/lumba/kit-mint.webp",
    final: "/images/lumba/woman-salon.webp",
  },
  scarcityBadge: "توصيل مجاني بعد التأكيد · الخلاص نقداً عند الباب",
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
      isDefault: true,
    },
    {
      id: "lumba-2",
      title: "حزامين — ليك وهديّة للوالدين",
      subtitle: "واحد ليك وواحد للواليد أو الواليدة. التاني بـ 350 د.م بدل 499، ونفس الكولية.",
      units: 2,
      price: 849,
      compareAt: 998,
      badge: "هدية للدار",
      thumbSrc: "/images/lumba/woman-salon-thumb.webp",
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
      title: "كتوصل للدار وظهرك عيان؟",
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
      title: "ظهرك مسنود من الداخل، بلا ما تزيّر كرشك",
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
      title: "ما كيرتخاش بعد ساعة بحال حزام السوق",
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
  stepsImage: "/images/lumba/guide-booklet.webp",
  stepsImageAlt: "دليل كينيدو المصور بالدارجة — 3 خطوات",
  scienceImageAlt: "الأعمدة الهوائية العمودية ديال كينيدو لومبا من قريب",
  kitImageAlt: "محتويات العلبة: الحزام، المضخة، وصلة التوسيع، والدليل",
  comparisonOriginal: [
    "خامة متينة تحافظ على الهواء",
    "دليل استعمال بالدارجة والفرنسية",
    "تبديل فابور فـ 14 يوم",
    "وصلة توسيع من 70 إلى 130 سم",
    "مواكبة من الدار البيضاء",
  ],
  crossSellPitches: {
    "kenidoux-posta": "أضف الحزام الهوائي لأسفل الظهر بنفس الكولية",
    "kenidoux-calma": "أضف حزام أسفل الظهر مع نفس الكولية",
    "kenidoux-palma": "أضف حزام أسفل الظهر مع نفس الكولية",
  },
  gallery: [
    {
      src: "/images/lumba/man-shop-square.webp",
      label: "الصورة الرئيسية",
      alt: "مول الحانوت لابس حزام كينيدو لومبا وماسك المضخة",
      fit: "cover",
      focus: "center",
    },
    {
      src: "/images/lumba/before-after.webp",
      label: "قبل وبعد",
      alt: "كينيدو لومبا قبل وبعد النفخ — الأعمدة الهوائية كتطلع للفوق",
      fit: "blur",
    },
    {
      src: "/images/lumba/woman-salon.webp",
      label: "فالصالون",
      alt: "سيدة مغربية لابسة حزام كينيدو لومبا فالصالون",
      fit: "cover",
      focus: "center",
    },
    {
      src: "/images/lumba/drive-2.webp",
      label: "فالطيوموبيل",
      alt: "سائق مغربي لابس حزام كينيدو لومبا فالطوموبيل",
      fit: "cover",
      focus: "center",
    },
    {
      src: "/images/lumba/kit-mint.webp",
      label: "محتويات العلبة",
      alt: "محتويات العلبة: الحزام، المضخة، وصلة التوسيع، والدليل",
      fit: "blur",
    },
    {
      src: "/images/lumba/guide-booklet.webp",
      label: "الدليل",
      alt: "دليل كينيدو المصور بالدارجة — 3 خطوات",
      fit: "blur",
    },
  ],
  image: IMAGES.products["kenidoux-lumba"].main,
  metaDescription:
    "كينيدو لومبا — الحزام الهوائي لراحة أسفل الظهر. توصيل مجاني، تأكيد من الدار البيضاء، والخلاص نقداً عند الباب.",
};

const posta: Product = {
  slug: "kenidoux-posta",
  nameAr: "كينيدو بوسطا",
  nameEn: "Kinédoux Posta™",
  latinSubtitle: "Kinédoux Posta™ — Rappel de posture et coussin de nuque",
  category: "وقفة خفيفة وراحة الرقبة",
  cardHeading: "كينيدو بوسطا — وقفة ووسادة رقبة",
  cardSubheading:
    "منبّه اهتزاز لطيف بالنهار + وسادة تمدد للرقبة بالعشية. وقف بثقة، بلا أحزمة قاصحة تحت الإبط.",
  outcome: "وقفة خفيفة بالنهار، وراحة للرقبة بالعشية",
  chips: ["اهتزاز صامت", "وسادة رقبة", "بلا بلوتوث"],
  testimonials: [],
  painScene: "النهار كامل قدام الشاشة، والرقبة والكتاف كيتقلو بلا ما تحس. فالعشية كيبان التعب.",
  whoFor: ["خدامين قدام البيسي", "الطلبة", "اللي كيبغيو وقفة واثقة بلا حزام قاصح"],
  howTitle: "بالنهار كيفكّرك، بالليل الوسادة كترخّي الرقبة",
  finalTitle: "وقف بوقفة مريحة، أنيقة وما كاتبانش تحت الحوايج",
  compareTitle: "علاش تختار بوسطا عوض حزام قاصح؟",
  compareMarket: [
    "أحزمة قاصحة تحت الإبط",
    "بدون دليل بالدارجة وبدون متابعة",
    "بدون ضمان واضح",
    "بدون متابعة من بعد الطلب",
    "إعلان عام بلا مواكبة بعد الطلب",
  ],
  photos: {
    problem: "/images/posta/laptop.webp",
    solution: "/images/posta/button.webp",
    // button.webp is also the old how photo. how.webp is the other existing file so the two sections are not the same picture.
    how: "/images/posta/how.webp",
    box: "/images/posta/kit.webp",
    final: "/images/posta/office.webp",
  },
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
      isDefault: true,
    },
    {
      id: "posta-2",
      title: "باقتين — ليك ولشريكك",
      subtitle: "للزوجين، أو ليك وولدك مع القراية. التانية بـ 270 د.م بدل 379، فنفس الكولية.",
      units: 2,
      price: 649,
      compareAt: 758,
      badge: "هدية للدار",
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
      title: "كتلقا راسك محني قدام البيسي ولا التيليفون؟",
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
      title: "اهتزاز خفيف كيفكّرك تقاد، بلا تطبيق وبلا بلوتوث",
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
    "kenidoux-palma": "أضف باقة الوقفة ووسادة الرقبة لنفس الكولية",
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
  latinSubtitle: "Kinédoux Calma™ — Coupes chaudes pour les épaules",
  category: "طقس الاسترخاء المسائي",
  cardHeading: "كينيدو كالما — كاسات دافئة بلا جرح",
  cardSubheading:
    "النسخة العصرية ديال الكاسات: دفء مريح وشفط ناعم لكتافك وظهرك فـ 15 دقيقة، بلا نار وبلا فوضى.",
  outcome: "دفء وشفط ناعم للكتاف قبل النعاس",
  chips: ["بلا نار", "15 دقيقة", "زر تحرير"],
  testimonials: [],
  painScene: "الشقا والولاد والخدمة كيخليو الكتاف والظهر مشدودين. والحجامة التقليدية فيها الفوضى والخوف من الجرح.",
  whoFor: ["الأمهات بعد نهار طويل", "اللي كيحبو الحجامة بلا جرح", "قبل النعاس للاسترخاء"],
  howTitle: "15 دقيقة قبل النعاس",
  finalTitle: "بلا جرح، بلا نار وبلا فوضى.",
  compareTitle: "علاش تختار كالما بلا نار وبلا جرح؟",
  compareMarket: [
    "الحجامة التقليدية فيها نار وجرح",
    "بدون دليل بالدارجة وبدون متابعة",
    "بدون ضمان واضح",
    "كأس ثابت بلا زر تحرير",
    "إعلان عام بلا مواكبة بعد الطلب",
  ],
  photos: {
    problem: "/images/calma/knee.webp",
    solution: "/images/calma/studio.webp",
    how: "/images/calma/buttons.webp",
    box: "/images/calma/kit.webp",
  },
  scarcityBadge: "كتزاد مع لومبا فنفس الكولية، بلا توصيل زايد",
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
      isDefault: true,
    },
    {
      id: "calma-2",
      title: "جهازين — للكتفين أو هدية",
      subtitle: "واحد ليك وواحد للوالدين. التاني بـ 250 د.م بدل 349، فنفس الكولية.",
      units: 2,
      price: 599,
      compareAt: 698,
      badge: "هدية للدار",
    },
    {
      id: "calma-3",
      title: "الباقة الكاملة (لومبا + بوسطا + كالما)",
      subtitle: "ظهر، وقفة واسترخاء فكولية واحدة — أوفر من الشراء فرادى.",
      units: 3,
      price: 890,
      compareAt: 1227,
      badge: "الباقة المتكاملة",
      showInPicker: false,
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
      title: "الكتاف مشدودين فالعشية وما كتقدرش ترتاح؟",
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
      title: "الحجامة بنسخة عصرية: دفء وشفط ناعم، بلا نار وبلا جرح",
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
    "kenidoux-palma": "أضف كاسات المساء لراحة الكتاف، فنفس الكولية",
  },
  gallery: gallery("kenidoux-calma"),
  image: IMAGES.products["kenidoux-calma"].main,
  metaDescription:
    "كينيدو كالما — كاسات حرارية ذكية للاسترخاء المسائي، بلا جرح وبلا نار. توصيل مجاني والخلاص عند الاستلام.",
};

const palma: Product = {
  slug: "kenidoux-palma",
  nameAr: "كينيدو بالما",
  nameEn: "Kinédoux Palma™",
  latinSubtitle: "Kinédoux Palma™ — Massage nuque et épaules",
  category: "راحة الرقبة والكتاف",
  cardHeading: "كينيدو بالما — تدليك الرقبة والكتاف",
  cardSubheading:
    "كيتبت بالحزام على الرقبة. يدين كيعجنو الكتاف، ودفء على الوجه الداخلي، وأنت جالس أو راقد.",
  outcome: "تدليك للرقبة والكتاف وأنت جالس أو راقد",
  chips: ["حزام ثابت", "يدين", "دفء"],
  testimonials: [],
  painScene: "الراس محني على التيليفون، والكتاف تقال من الجلسة. كتبغي غير شي يدين يعجنو ليك الرقبة.",
  whoFor: ["خدامين قدام الشاشة", "الواليدين", "اللي كيرتاحو جالسين ولا راقدين"],
  howTitle: "حطّو، شدّ الحزام، وارتاح جالس ولا راقد",
  finalTitle: "جالس أو راقد. الحزام كيثبت الجهاز.",
  compareTitle: "علاش تختار كينيدو بالما؟",
  compareMarket: [
    "بدون دليل بالدارجة وبدون متابعة",
    "بدون ضمان واضح",
    "إعلان عام بلا مواكبة بعد الطلب",
    "بدون متابعة من بعد الطلب",
    "بدون مواكبة من الدار البيضاء",
  ],
  photos: {
    problem: "/images/palma/sofa.webp",
    solution: "/images/palma/cutaway.webp",
    how: "/images/palma/rest.webp",
    heat: "/images/palma/heat.webp",
    heatTitle: "دفء على الوجه اللي كيلمس الكتف",
    heatBody: "الوجه الداخلي فيه دفء باين.",
    box: "/images/palma/nodes.webp",
  },
  scarcityBadge: "توصيل مجاني بعد التأكيد · الخلاص نقداً عند الباب",
  scarcityShort: "توصيل فابور",
  stock: 18,
  viewers: 0,
  price: 299,
  compareAt: 299,
  crossSellPrice: 199,
  crossSellNote: "بدل 299 د.م",
  offers: [
    {
      id: "palma-1",
      title: "جهاز واحد",
      subtitle: "كينيدو بالما + التوصيل المجاني",
      units: 1,
      price: 299,
      compareAt: 299,
      badge: "توصيل مجاني",
      isDefault: true,
    },
    {
      id: "palma-2",
      title: "جهازين — ليك وللدار",
      subtitle: "واحد ليك وواحد للدار. التاني بـ 200 د.م بدل 299، فنفس الكولية.",
      units: 2,
      price: 499,
      compareAt: 598,
      badge: "هدية للدار",
    },
  ],
  bonuses: [
    "يدين كيعجنو الرقبة والكتاف",
    "حزام كيثبت الجهاز وأنت جالس أو راقد",
    "دفء على الوجه اللي كيلمس الكتف",
    "توصيل مجاني حتى لباب الدار",
  ],
  kitTitle: "شنو كيجي فالكولية ديالك؟",
  kitContents: ["جهاز كينيدو بالما", "الحزام", "توصيل مجاني حتى لباب الدار"],
  heroHook: {
    title: "الرقبة والكتاف من بعد النهار كتحتاج دقايق في الدار.",
    body: "كينيدو بالما كيتبت بالحزام. يدين كيعجنو الرقبة والكتاف، وفيها دفء باين على الوجه الداخلي، وأنت جالس أو راقد.",
  },
  sections: [
    {
      kind: "emotional",
      title: "رقبتك مشدودة من بعد نهار طويل؟",
      body: "ثبت الحزام وخلي اليدين يخدموا على الرقبة والكتاف. وقّف ملي ترتاح.",
      bullets: ["حزام كيثبت الجهاز", "يدين كيعجنو الرقبة والكتاف", "جالس في الصالون أو راقد"],
      image: IMAGES.products["kenidoux-palma"].sections[0],
    },
    {
      kind: "science",
      title: "يدين كيعجنو الرقبة والكتاف، ودفء خفيف",
      body: "من الداخل محرك كيحرك اليدين على الرقبة والكتاف. الدفء باين على الوجه اللي كيلمس الكتف.",
      bullets: ["يدين كيعجنو الرقبة والكتاف", "دفء على الوجه الداخلي", "حزام باش يبقى الجهاز ثابت"],
      image: IMAGES.products["kenidoux-palma"].sections[1],
    },
    {
      kind: "materials",
      title: "قماش، يدين، وحزام",
      body: "اللي كتشوفو: غطاء قماش، يدين لينة كيعجنو، وحزام كيثبت الجهاز على الرقبة.",
      bullets: [],
      cards: [
        {
          title: "غطاء قماش",
          latin: "Tissu",
          body: "الجسم اللي كيبان على الكتف.",
        },
        {
          title: "يدين لينة",
          latin: "Mains de massage",
          body: "كيعجنو الرقبة والكتاف.",
        },
        {
          title: "حزام ودفء",
          latin: "Sangle et chaleur",
          body: "الحزام كيثبت الجهاز. الوجه الداخلي فيه دفء باين.",
        },
      ],
      image: IMAGES.products["kenidoux-palma"].sections[2],
    },
  ],
  steps: [
    { title: "ثبت الحزام", body: "حط بالما على الرقبة وشد الحزام باش يبقى ثابت." },
    { title: "خلي اليدين يخدموا", body: "كيعجنو الرقبة والكتاف. الدفء كيكون على الوجه اللي كيلمس الكتف." },
    { title: "وقّف ملي ترتاح", body: "جالس أو راقد. إلا حسيتي بشي حاجة ماشي مريحة، حبس." },
  ],
  stepsImage: "/images/palma/rest.webp",
  stepsImageAlt: "كينيدو بالما مثبت بالحزام على الرقبة، والشخص مرتاح",
  scienceImageAlt: "داخل كينيدو بالما: المحرك كيحرك اليدين على الرقبة والكتاف",
  kitImageAlt: "يدين كينيدو بالما، الغطاء القماش، والحزام",
  comparisonOriginal: [
    "يدين كيعجنو الرقبة والكتاف",
    "حزام كيثبت الجهاز",
    "تبديل فابور فـ 14 يوم",
    "دفء باين على الكتف",
    "مواكبة من الدار البيضاء",
  ],
  crossSellPitches: {
    "kenidoux-lumba": "أضف تدليك الرقبة والكتاف مع نفس الكولية",
    "kenidoux-posta": "أضف تدليك الرقبة والكتاف مع نفس الكولية",
    "kenidoux-calma": "أضف تدليك الرقبة والكتاف مع نفس الكولية",
  },
  gallery: [
    {
      src: "/images/palma/neck.webp",
      label: "على الرقبة",
      alt: "كينيدو بالما مثبت بالحزام على الرقبة والكتف",
      fit: "cover",
      focus: "88% center",
    },
    {
      src: "/images/palma/cutaway.webp",
      label: "كيفاش كيعجن",
      alt: "داخل الجهاز: المحرك كيحرك اليدين على الرقبة والكتاف",
      fit: "blur",
    },
    {
      src: "/images/palma/sofa.webp",
      label: "فالدار",
      alt: "امرأة جالسة وبالما على رقبتها",
      fit: "cover",
      focus: "center",
    },
    {
      src: "/images/palma/rest.webp",
      label: "وأنت مرتاح",
      alt: "كينيدو بالما على الرقبة وهي راقدة",
      fit: "cover",
      focus: "center",
    },
    {
      src: "/images/palma/nodes.webp",
      label: "اليدين",
      alt: "يدين التدليك، الغطاء القماش، والحزام",
      fit: "blur",
    },
    {
      src: "/images/palma/heat.webp",
      label: "الدفء",
      alt: "الوجه الداخلي ديال كينيدو بالما وفيه دفء على الكتف",
      fit: "blur",
    },
  ],
  image: IMAGES.products["kenidoux-palma"].main,
  metaDescription:
    "كينيدو بالما — تدليك الرقبة والكتاف بحزام ويدين ودفء. توصيل مجاني، والخلاص نقداً عند الباب.",
};

export const PRODUCTS: Product[] = [lumba, posta, calma, palma];
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

export function isBundleOffer(offer: Offer): boolean {
  return Boolean(offer.includes && offer.includes.length > 1);
}

/** The line the API already prices. The bundle is always kenidoux-calma / calma-3. */
export function submitLine(page: Product, offer: Offer): { product_slug: ProductSlug; offer_id: string } {
  if (isBundleOffer(offer)) {
    const kit = fullKitOffer();
    return { product_slug: kit.product.slug, offer_id: kit.offer.id };
  }
  return { product_slug: page.slug, offer_id: offer.id };
}

/** Cross-sell candidates for a cart: products not yet included, ordered by the doc-02 matrix. */
export function crossSellOrder(primary: ProductSlug): ProductSlug[] {
  const matrix: Record<ProductSlug, ProductSlug[]> = {
    "kenidoux-lumba": ["kenidoux-calma", "kenidoux-posta"],
    "kenidoux-posta": ["kenidoux-calma", "kenidoux-lumba"],
    "kenidoux-calma": ["kenidoux-lumba", "kenidoux-posta"],
    "kenidoux-palma": ["kenidoux-lumba", "kenidoux-calma"],
  };
  return matrix[primary];
}
