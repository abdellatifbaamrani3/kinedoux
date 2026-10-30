/**
 * KINÉDOUX™ — clinical-branded SVG sample image generator.
 *
 * Run with `npm run images`. Writes every placeholder to `public/images/`.
 * Every file is a normal SVG, so you can swap any of them for a real photo later
 * by editing a single path in `src/data/images.ts` (no component changes needed).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
const W = 1200;
const H = 900;
const FONT = `Cairo, 'Segoe UI', Tahoma, 'Noto Sans Arabic', Arial, sans-serif`;
const LATIN = `'Plus Jakarta Sans', 'Segoe UI', Helvetica, Arial, sans-serif`;

const C = {
  brand: "#1E4D3B",
  hover: "#163A2C",
  dark: "#11221A",
  alabaster: "#F8F7F4",
  sage: "#E8EFE9",
  sageDeep: "#C5D4C8",
  gold: "#A3B899",
  goldDeep: "#7D9574",
  coral: "#7D9574",
  muted: "#5A6B60",
  skin: "#E9C9A6",
  red: "#E5483A",
};

// ------------------------------------------------------------------ primitives
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const DEFS = `<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F8F7F4"/><stop offset="1" stop-color="#E4EDE7"/></linearGradient>
<linearGradient id="bgDark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1E4D3B"/><stop offset="1" stop-color="#11221A"/></linearGradient>
<linearGradient id="green" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F7357"/><stop offset=".55" stop-color="#1E4D3B"/><stop offset="1" stop-color="#163A2C"/></linearGradient>
<linearGradient id="greenLight" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2A6B52"/><stop offset=".45" stop-color="#58A586"/><stop offset="1" stop-color="#2A6B52"/></linearGradient>
<linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D4E0CC"/><stop offset=".5" stop-color="#A3B899"/><stop offset="1" stop-color="#7D9574"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".85"/><stop offset="1" stop-color="#cfe3d7" stop-opacity=".35"/></linearGradient>
<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16302A"/><stop offset="1" stop-color="#274B3F"/></linearGradient>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE5DA"/><stop offset="1" stop-color="#F3EEDD"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e8efe9" stop-opacity=".95"/><stop offset="1" stop-color="#e8efe9" stop-opacity="0"/></radialGradient>
<radialGradient id="redglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff6a58" stop-opacity=".75"/><stop offset="1" stop-color="#ff6a58" stop-opacity="0"/></radialGradient>
<filter id="shadow" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#11221A" flood-opacity=".22"/></filter>
<filter id="soft" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#11221A" flood-opacity=".16"/></filter>
<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#1E4D3B" stroke-opacity=".07" stroke-width="1.5"/></pattern>
<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2" fill="#1E4D3B" fill-opacity=".13"/></pattern>
<pattern id="mesh" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0H22M0 0V22" stroke="#ffffff" stroke-opacity=".55" stroke-width="2.5" fill="none"/></pattern>
</defs>`;

function svg(inner, { w = W, h = H, bg = "bg", title = "KINÉDOUX" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>${DEFS}<rect width="${w}" height="${h}" fill="url(#${bg})"/>${inner}</svg>`;
}

const t = (x, y, s, o = {}) => {
  const { size = 30, weight = 700, fill = C.dark, anchor: physical = "middle", latin = false, ls = 0, op = 1 } = o;
  // `anchor` is PHYSICAL here ("end" = text sits left of x, "start" = text sits right of x for RTL).
  // In an RTL <text>, SVG flips start/end, so swap them for Arabic strings.
  const anchor = latin || physical === "middle" ? physical : physical === "end" ? "start" : "end";
  return `<text x="${x}" y="${y}" font-family="${latin ? LATIN : FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${
    latin ? "" : ' direction="rtl"'
  }${ls ? ` letter-spacing="${ls}"` : ""}${op < 1 ? ` opacity="${op}"` : ""}>${esc(s)}</text>`;
};

const pill = (cx, cy, s, o = {}) => {
  const { size = 28, bg = C.brand, fg = "#fff", px = 28, latin = false, stroke = "", shadow = true } = o;
  const w = Math.max(70, s.length * size * (latin ? 0.64 : 0.5) + px * 2);
  const h = size + 28;
  return `<g${shadow ? ' filter="url(#soft)"' : ""}><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}" ${stroke}/>${t(
    cx,
    cy + size * 0.35,
    s,
    { size, fill: fg, latin },
  )}</g>`;
};

const kd = (cx, cy, r = 40) =>
  `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#green)" stroke="${C.gold}" stroke-width="${Math.max(3, r / 12)}"/>${t(
    cx,
    cy + r * 0.3,
    "KD",
    { size: r * 0.85, fill: C.alabaster, latin: true, weight: 800, ls: 1 },
  )}</g>`;

const card = (x, y, w, h, o = {}) => {
  const { fill = "#fff", r = 28, stroke = "none", shadow = true } = o;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"${shadow ? ' filter="url(#soft)"' : ""}/>`;
};

const g = (x, y, s, inner, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${inner}</g>`;

function decor() {
  return `<rect width="${W}" height="${H}" fill="url(#grid)"/>
<circle cx="1050" cy="120" r="260" fill="${C.sage}" opacity=".7"/>
<circle cx="130" cy="800" r="220" fill="${C.sageDeep}" opacity=".45"/>
<rect x="40" y="620" width="260" height="240" fill="url(#dots)" opacity=".8"/>`;
}

function bez(p0, p1, p2, p3, t_) {
  const u = 1 - t_;
  const f = (a, b, c, d) => u * u * u * a + 3 * u * u * t_ * b + 3 * u * t_ * t_ * c + t_ * t_ * t_ * d;
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
}

function bezAngle(p0, p1, p2, p3, t_) {
  const e = 0.001;
  const a = bez(p0, p1, p2, p3, Math.max(0, t_ - e));
  const b = bez(p0, p1, p2, p3, Math.min(1, t_ + e));
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
}

// ------------------------------------------------------------------ product drawings (local coords, centred on 0,0)
function lumbaProduct(inflated = true) {
  const bh = inflated ? 260 : 190;
  const top = -bh / 2;
  let cols = "";
  for (let i = 0; i < 13; i++) {
    const x = -242 + i * 38;
    cols += `<rect x="${x}" y="${top + 18}" width="28" height="${bh - 36}" rx="14" fill="url(#greenLight)"/><rect x="${x + 6}" y="${top + 30}" width="6" height="${bh - 60}" rx="3" fill="#fff" opacity=".35"/>`;
  }
  const strap = (sx) => `<g><rect x="${sx}" y="-62" width="170" height="124" rx="26" fill="url(#green)"/>
<path d="M${sx + 18} -30H${sx + 152}M${sx + 18} 0H${sx + 152}M${sx + 18} 30H${sx + 152}" stroke="#fff" stroke-opacity=".28" stroke-width="3" stroke-dasharray="9 8"/></g>`;
  return `<g filter="url(#shadow)">
${strap(-420)}${strap(250)}
<rect x="-262" y="${top}" width="524" height="${bh}" rx="46" fill="url(#green)"/>
${cols}
<rect x="-262" y="${top}" width="524" height="${bh}" rx="46" fill="none" stroke="${C.gold}" stroke-width="5" opacity=".9"/>
<circle cx="214" cy="${top - 4}" r="22" fill="url(#goldG)"/><circle cx="214" cy="${top - 4}" r="9" fill="${C.hover}"/>
<path d="M214 ${top - 26}C214 ${top - 70} 280 ${top - 80} 300 ${top - 40}" stroke="${C.goldDeep}" stroke-width="9" fill="none" stroke-linecap="round"/>
</g>${kd(0, inflated ? bh / 2 - 6 : bh / 2 - 4, 30)}`;
}

function postaProduct() {
  return `<g filter="url(#shadow)">
<path d="M-150 -150L150 170" stroke="url(#green)" stroke-width="58" stroke-linecap="round"/>
<path d="M150 -150L-150 170" stroke="url(#green)" stroke-width="58" stroke-linecap="round"/>
<path d="M-150 -150L150 170M150 -150L-150 170" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-dasharray="10 9"/>
<rect x="-70" y="-62" width="140" height="140" rx="34" fill="${C.dark}" stroke="url(#goldG)" stroke-width="7"/>
<circle cx="0" cy="-6" r="30" fill="${C.brand}" stroke="${C.gold}" stroke-width="4"/>
<circle cx="0" cy="-6" r="10" fill="#7BE0AE"/><circle cx="0" cy="-6" r="22" fill="none" stroke="#7BE0AE" stroke-opacity=".45" stroke-width="3"/>
${t(0, 56, "KD", { size: 26, fill: C.gold, latin: true, weight: 800, ls: 2 })}
</g>`;
}

function pillowProduct() {
  return `<g filter="url(#shadow)">
<path d="M-210 20C-210 -110 210 -110 210 20C210 90 140 100 105 56C60 6 -60 6 -105 56C-140 100 -210 90 -210 20Z" fill="${C.sage}" stroke="${C.brand}" stroke-width="6"/>
<path d="M-170 10C-150 -60 150 -60 170 10" fill="none" stroke="${C.brand}" stroke-opacity=".35" stroke-width="4" stroke-dasharray="10 9"/>
${[-110, -55, 0, 55, 110, 0].map((x, i) => (i < 5 ? `<circle cx="${x}" cy="${-22 + Math.abs(x) * 0.05}" r="9" fill="${C.gold}"/>` : "")).join("")}
</g>`;
}

function calmaProduct(on = true) {
  const waves = on
    ? [-60, 0, 60]
        .map(
          (x) =>
            `<path d="M${x} -150C${x - 22} -178 ${x + 22} -200 ${x} -232" fill="none" stroke="${C.coral}" stroke-width="9" stroke-linecap="round" opacity=".75"/>`,
        )
        .join("")
    : "";
  return `<g filter="url(#shadow)">
<ellipse cx="0" cy="70" rx="150" ry="26" fill="${C.dark}" opacity=".18"/>
<path d="M-128 52C-128 -118 128 -118 128 52Z" fill="url(#glass)" stroke="${C.brand}" stroke-width="6"/>
<path d="M-92 20C-92 -70 -40 -92 -10 -92" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".85"/>
${on ? `<circle cx="0" cy="-8" r="70" fill="url(#redglow)"/><circle cx="0" cy="-8" r="56" fill="none" stroke="${C.red}" stroke-width="7" stroke-dasharray="4 12" stroke-linecap="round"/>` : ""}
<rect x="-150" y="46" width="300" height="64" rx="30" fill="url(#green)" stroke="${C.gold}" stroke-width="5"/>
<circle cx="-84" cy="78" r="17" fill="url(#goldG)"/>
${t(30, 94, "42°C", { size: 36, fill: "#BFF3D6", latin: true, weight: 800, ls: 1 })}
<circle cx="112" cy="78" r="9" fill="${on ? "#7BE0AE" : "#6b8077"}"/>
</g>${waves}`;
}

function boxItem(w, h, name, sub) {
  return `<g filter="url(#shadow)">
<path d="M${w / 2} ${-h / 2 + 10}L${w / 2 + 46} ${-h / 2 - 20}V${h / 2 - 40}L${w / 2} ${h / 2}Z" fill="${C.sageDeep}"/>
<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="14" fill="${C.alabaster}" stroke="${C.sageDeep}" stroke-width="3"/>
<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h * 0.2}" rx="14" fill="url(#green)"/>
<rect x="${-w / 2}" y="${-h / 2 + h * 0.12}" width="${w}" height="${h * 0.08}" fill="url(#green)"/>
<rect x="${-w / 2}" y="${-h / 2 + h * 0.2}" width="${w}" height="4" fill="${C.gold}"/>
${t(w / 2 - 28, -h / 2 + h * 0.13, "KINÉDOUX™", { size: 22, fill: C.alabaster, latin: true, weight: 800, anchor: "end", ls: 3 })}
${kd(-w / 2 + 52, -h / 2 + h * 0.1, 26)}
${t(0, h * 0.08, name, { size: 46, fill: C.dark, weight: 800 })}
${t(0, h * 0.08 + 38, sub, { size: 21, fill: C.muted, latin: true, weight: 600 })}
<circle cx="${w / 2 - 44}" cy="${h / 2 - 42}" r="26" fill="none" stroke="${C.gold}" stroke-width="3"/>
${t(w / 2 - 44, h / 2 - 34, "CE", { size: 22, fill: C.goldDeep, latin: true, weight: 800 })}
</g>`;
}

const PRODUCTS = {
  lumba: {
    slug: "lumba",
    name: "كينيدو لومبا",
    sub: "Décompression Lombaire",
    draw: (s = 0.55, inflated = true) => g(0, 0, s, lumbaProduct(inflated)),
    hero: "الحزام الهوائي لتمديد وراحة أسفل الظهر",
    badge: "الأكثر مبيعاً في المغرب",
    callouts: ["29 عمود هوائي", "13 → 20 سم", "رفع الضغط عن L1–L5"],
    mechanism: ["تمدد هوائي عمودي", "H2O-Air · 26°"],
    materials: [
      ["TPU طبي عالي الكثافة", "Medical-Grade TPU"],
      ["بطانة Aero-Mesh مضادة للتعرق", "Breathable Aero-Mesh"],
      ["صمام نحاسي سريع", "Quick-Lock Brass Valve"],
    ],
    kit: [
      ["حزام كينيدو لومبا", "القطعة الأساسية", "strap"],
      ["مضخة يدوية بصمام أمان", "قيمة 90 د.م — مجاناً", "pump"],
      ["وصلة توسيع 70 → 130 سم", "قيمة 70 د.م — مجاناً", "strap"],
      ["دليل مصور بالدارجة والفرنسية", "روتين 10 دقائق — مجاناً", "book"],
    ],
    before: "ثقل وعيا آخر النهار",
    after: "خفة وراحة من أول 10 دقائق",
    scene: "car",
    lifeCaption: "السياقة طول النهار؟ 15 دقيقة كفاية",
  },
  posta: {
    slug: "posta",
    name: "كينيدو بوسطا",
    sub: "Posture & Nuque",
    draw: (s = 0.62) => g(-120, 0, s, postaProduct()) + g(150, 150, s * 0.62, pillowProduct()),
    hero: "الباقة الذكية لاستقامة الوقفة وتمديد الرقبة",
    badge: "ثنائي الوقفة المستقيمة وراحة الرقبة",
    callouts: ["مستشعر زاوية 25°", "اهتزاز صامت لطيف", "وسادة C-Curve"],
    mechanism: ["ذاكرة عضلية ذكية", "Bio-Feedback · 14 يوم"],
    materials: [
      ["مستشعر جيروسكوب دقيق", "Smart Gyro-Sensor"],
      ["أحزمة ناعمة قابلة للتعديل", "Soft-Touch Elastic Straps"],
      ["فوم طبي لوسادة الرقبة", "High-Resilience Ortho-Foam"],
    ],
    kit: [
      ["جهاز وحزام كينيدو الذكي", "مستشعر + اهتزاز صامت", "device"],
      ["وسادة التمدد العنقي C-Curve", "6 نقاط ضغط مريحة", "pillow"],
      ["برنامج 14 يوماً مطبوع", "بالدارجة والفرنسية", "book"],
      ["كابل USB-C سريع", "شحنة تدوم 15 يوماً", "cable"],
    ],
    before: "كتاف محنية ورقبة ثقيلة",
    after: "وقفة مستقيمة وواثقة",
    scene: "desk",
    lifeCaption: "قدام البيسي؟ وقف براسك مرفوع",
  },
  calma: {
    slug: "calma",
    name: "كينيدو كالما",
    sub: "Ventouse Thermique",
    draw: (s = 0.6) => g(0, 40, s, calmaProduct(true)),
    hero: "جهاز الكاسات الحرارية الذكية والأشعة الحمراء",
    badge: "طقس الاسترخاء المسائي",
    callouts: ["حرارة مهدئة 42°C", "ضوء أحمر 650nm", "6 مستويات للقوة"],
    mechanism: ["حرارة + شفط + ضوء أحمر", "3 تقنيات في جهاز واحد"],
    materials: [
      ["كأس بولي كربونات طبي", "Medical PC Cup"],
      ["شريحة تحكم حراري ذكي", "NTC Thermal Chip"],
      ["زر تحرير الضغط الفوري", "One-Click Pressure Release"],
    ],
    kit: [
      ["جهاز كينيدو كالما الذكي", "كأس + ضوء أحمر", "device"],
      ["حقيبة الحفظ الأنيقة", "للسفر والتخزين", "bag"],
      ["كابل USB-C", "شحن سريع", "cable"],
      ["دليل الاستعمال بالدارجة", "جلسة 15 دقيقة", "book"],
    ],
    before: "تشنج وعيا فالكتاف",
    after: "استرخاء دافئ قبل النعاس",
    scene: "home",
    lifeCaption: "15 دقيقة قبل النعاس تنسيك عيا النهار",
  },
};

// ------------------------------------------------------------------ small icons (local coords, ~120px box)
function icon(kind) {
  const stroke = `stroke="${C.brand}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`;
  const base = `${stroke} fill="none"`;
  switch (kind) {
    case "pump":
      return `<rect x="-14" y="-52" width="28" height="70" rx="10" fill="${C.sage}" ${stroke}/><path d="M-30 -52H30M0 -52V-72M-18 -72H18" ${base}/><path d="M14 8C50 8 56 40 28 52" ${base}/><circle cx="26" cy="54" r="9" fill="url(#goldG)"/>`;
    case "strap":
      return `<rect x="-58" y="-30" width="116" height="60" rx="18" fill="${C.sage}" ${stroke}/><path d="M-36 -8H36M-36 10H36" ${base} stroke-dasharray="6 7" stroke-opacity=".6"/>`;
    case "book":
      return `<path d="M-50 -46H-4C8 -46 12 -38 12 -30V46C12 38 8 34 -4 34H-50Z" fill="${C.sage}" ${stroke}/><path d="M50 -46H4C-8 -46 -12 -38 -12 -30V46C-12 38 -8 34 4 34H50Z" fill="#fff" ${stroke} transform="translate(24 0)"/>`;
    case "cable":
      return `<path d="M-52 36C-52 -40 0 40 0 -10C0 -50 52 -30 52 -50" ${base}/><rect x="-66" y="30" width="28" height="20" rx="6" fill="${C.gold}" stroke="${C.goldDeep}" stroke-width="3"/><rect x="40" y="-62" width="28" height="20" rx="6" fill="${C.gold}" stroke="${C.goldDeep}" stroke-width="3"/>`;
    case "bag":
      return `<rect x="-50" y="-22" width="100" height="70" rx="18" fill="${C.sage}" ${stroke}/><path d="M-22 -22V-36C-22 -50 22 -50 22 -36V-22" ${base}/><circle cx="0" cy="12" r="9" fill="url(#goldG)"/>`;
    case "pillow":
      return `<path d="M-56 4C-56 -34 56 -34 56 4C56 26 36 28 26 14C14 0 -14 0 -26 14C-36 28 -56 26 -56 4Z" fill="${C.sage}" ${stroke}/>`;
    case "device":
      return `<rect x="-30" y="-36" width="60" height="72" rx="18" fill="${C.dark}" stroke="${C.gold}" stroke-width="4"/><circle cx="0" cy="-4" r="12" fill="#7BE0AE"/><path d="M-12 20H12" stroke="${C.gold}" stroke-width="4" stroke-linecap="round"/>`;
    default:
      return "";
  }
}

// ------------------------------------------------------------------ people (abstract, stylised)
function standing({ x, y, s = 1, slouch = false, color = C.brand, head = C.skin }) {
  const spine = slouch ? "M0 0C8 -90 70 -160 96 -214" : "M0 0C0 -80 0 -150 0 -214";
  const hx = slouch ? 118 : 4;
  const hy = slouch ? -246 : -252;
  return g(
    x,
    y,
    s,
    `<path d="M-26 0L-34 190M26 0L36 190" stroke="${C.dark}" stroke-width="30" stroke-linecap="round" opacity=".85"/>
<path d="${spine}" stroke="${color}" stroke-width="86" stroke-linecap="round" fill="none"/>
<circle cx="${hx}" cy="${hy}" r="42" fill="${head}"/>
<path d="M${slouch ? 40 : -20} -150${slouch ? "L110 -80" : "L-48 -60"}" stroke="${color}" stroke-width="26" stroke-linecap="round" opacity=".9"/>`,
  );
}

function sitting({ x, y, s = 1, slouch = false, color = C.brand }) {
  const spine = slouch ? "M0 0C-20 -80 -70 -140 -110 -170" : "M0 0C0 -80 0 -150 0 -200";
  const hx = slouch ? -140 : 0;
  const hy = slouch ? -200 : -244;
  return g(
    x,
    y,
    s,
    `<path d="M0 0H-160M-160 0V150" stroke="${C.dark}" stroke-width="34" stroke-linecap="round" opacity=".85" fill="none"/>
<path d="${spine}" stroke="${color}" stroke-width="88" stroke-linecap="round" fill="none"/>
<circle cx="${hx}" cy="${hy}" r="42" fill="${C.skin}"/>
<path d="M${slouch ? -70 : 0} -150L-190 -90" stroke="${color}" stroke-width="26" stroke-linecap="round" opacity=".9"/>`,
  );
}

// ------------------------------------------------------------------ shared overlays
const ceBadge = (cx, cy, r = 52) =>
  `<g filter="url(#soft)"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="url(#goldG)" stroke-width="6"/><circle cx="${cx}" cy="${cy}" r="${r - 10}" fill="none" stroke="${C.gold}" stroke-width="1.5" stroke-dasharray="3 5"/>${t(
    cx,
    cy + 4,
    "KD",
    { size: r * 0.62, fill: C.brand, latin: true, weight: 800 },
  )}${t(cx, cy + r * 0.52, "14 JOURS", { size: r * 0.2, fill: C.goldDeep, latin: true, weight: 700 })}</g>`;

const labelTag = (cx, cy, s) => pill(cx, cy, s, { size: 26, bg: "#fff", fg: C.brand, stroke: `stroke="${C.gold}" stroke-width="2.5"` });

function leader(x1, y1, x2, y2) {
  return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${C.gold}" stroke-width="3" stroke-dasharray="7 7"/><circle cx="${x1}" cy="${y1}" r="8" fill="${C.gold}"/>`;
}

// ------------------------------------------------------------------ gallery scenes
function mainShot(p) {
  const prod = PRODUCTS[p];
  const productNode =
    p === "lumba"
      ? g(520, 440, 0.62, lumbaProduct(true))
      : p === "posta"
        ? g(430, 400, 0.78, postaProduct()) + g(660, 590, 0.55, pillowProduct())
        : g(520, 450, 0.95, calmaProduct(true));
  return svg(
    `${decor()}
<ellipse cx="560" cy="700" rx="430" ry="70" fill="${C.sageDeep}"/><ellipse cx="560" cy="690" rx="380" ry="52" fill="#fff" opacity=".8"/>
${productNode}
<g transform="translate(905 520) rotate(-5)">${boxItem(250, 330, prod.name, prod.sub)}</g>
${pill(300, 110, prod.badge, { size: 26, bg: C.gold, fg: C.dark })}
${ceBadge(1060, 130)}
${pill(285, 800, "Laboratoire de Confort · Casablanca", { size: 22, bg: "#fff", fg: C.brand, latin: true })}
${pill(930, 800, "توصيل مجاني · الدفع عند الاستلام", { size: 24, bg: C.brand })}`,
    { title: `${prod.name} — ${prod.sub}` },
  );
}

function spineDiagram(x, y, count, gap, tint) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const yy = y + i * gap;
    const w = 70 + i * 6;
    out += `<rect x="${x - w / 2}" y="${yy}" width="${w}" height="46" rx="16" fill="${i >= count - 5 ? tint : C.sageDeep}" stroke="${C.brand}" stroke-width="3"/>`;
    if (i < count - 1) out += `<rect x="${x - w / 2 + 12}" y="${yy + 46}" width="${w - 24}" height="${Math.max(gap - 46, 2)}" rx="4" fill="${C.gold}" opacity=".55"/>`;
  }
  return out;
}

function mechanism(p) {
  const prod = PRODUCTS[p];
  let scene = "";
  if (p === "lumba") {
    let cols = "";
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const x = 600 + side * (150 + i * 44);
        cols += `<rect x="${x - 17}" y="${470 - (3 - i) * 8}" width="34" height="${300 + (3 - i) * 16}" rx="17" fill="url(#greenLight)" opacity="${1 - i * 0.18}"/>`;
      }
    }
    scene = `${cols}${spineDiagram(600, 235, 8, 62, C.coral)}
<path d="M470 610V430M470 430l-24 34M470 430l24 34M730 610V430M730 430l-24 34M730 430l24 34" stroke="${C.brand}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
${leader(640, 510, 900, 330)}${labelTag(960, 330, prod.callouts[2])}
${leader(790, 640, 900, 500)}${labelTag(960, 500, prod.callouts[0])}
${leader(430, 700, 300, 620)}${labelTag(250, 620, prod.callouts[1])}
${labelTag(260, 250, "الانحناءة الطبيعية 26°")}`;
  } else if (p === "posta") {
    scene = `${standing({ x: 330, y: 560, s: 1.15, slouch: true, color: C.muted })}
${standing({ x: 800, y: 560, s: 1.15, slouch: false, color: C.brand })}
<path d="M800 560V300" stroke="${C.gold}" stroke-width="3" stroke-dasharray="8 8"/>
<path d="M520 360C500 330 470 316 430 316" fill="none" stroke="${C.coral}" stroke-width="5"/><path d="M800 420C830 420 860 400 876 372" fill="none" stroke="${C.brand}" stroke-width="4" opacity=".5"/>
${pill(330, 110, "قبل: انحناء > 25°", { size: 28, bg: C.coral })}${pill(800, 110, "بعد: وقفة مستقيمة", { size: 28, bg: C.brand })}
<g stroke="${C.gold}" stroke-width="5" fill="none" stroke-linecap="round"><path d="M880 470q22 18 0 36M902 456q36 32 0 64"/></g>
${leader(800, 470, 1000, 420)}${labelTag(1040, 400, prod.callouts[1])}
${leader(330, 440, 150, 300)}${labelTag(150, 260, prod.callouts[0])}
${pill(565, 800, "ذاكرة عضلية تتكوّن خلال 14 يوم", { size: 28, bg: "#fff", fg: C.brand, stroke: `stroke="${C.gold}" stroke-width="2.5"` })}`;
  } else {
    scene = `<rect x="140" y="470" width="920" height="110" rx="26" fill="#F1D9C0"/><rect x="140" y="580" width="920" height="110" rx="26" fill="#D98C7C" opacity=".75"/><rect x="140" y="690" width="920" height="80" rx="26" fill="#8E3D3D" opacity=".55"/>
${g(600, 410, 0.95, calmaProduct(true))}
${[260, 360, 840, 940].map((x) => `<path d="M${x} 560V500M${x} 500l-14 18M${x} 500l14 18" stroke="${C.brand}" stroke-width="6" fill="none" stroke-linecap="round"/>`).join("")}
${[430, 520, 680, 770].map((x) => `<path d="M${x} 480V620" stroke="${C.red}" stroke-width="5" stroke-linecap="round" opacity=".7" stroke-dasharray="2 12"/>`).join("")}
${leader(900, 560, 1000, 270)}${labelTag(980, 240, prod.callouts[0])}
${leader(300, 640, 200, 330)}${labelTag(220, 300, "شفط إيقاعي لطيف")}
${leader(560, 700, 600, 840)}${labelTag(600, 850, prod.callouts[1])}`;
  }
  return svg(
    `${decor()}${scene}${p === "posta" ? "" : pill(600, 90, `${prod.mechanism[0]}`, { size: 32, bg: C.brand })}${
      p === "posta" ? "" : t(600, 150, prod.mechanism[1], { size: 24, fill: C.muted, latin: true, weight: 600 })
    }`,
    { title: `${prod.name} — ${prod.mechanism[0]}` },
  );
}

function lifestyleScene(p) {
  const prod = PRODUCTS[p];
  let scene = "";
  if (prod.scene === "car") {
    scene = `<rect width="${W}" height="520" fill="url(#sky)"/>
<g fill="${C.sageDeep}"><rect x="60" y="300" width="110" height="220"/><rect x="190" y="230" width="90" height="290"/><rect x="300" y="330" width="130" height="190"/><rect x="760" y="260" width="100" height="260"/><rect x="880" y="330" width="140" height="190"/><rect x="1040" y="240" width="110" height="280"/></g>
<rect y="500" width="${W}" height="400" fill="${C.dark}" opacity=".92"/>
<path d="M0 560H1200" stroke="${C.gold}" stroke-width="5" stroke-dasharray="40 30" opacity=".55"/>
<path d="M0 0H1200V120C1000 150 200 150 0 120Z" fill="${C.dark}"/>
<circle cx="800" cy="630" r="150" fill="none" stroke="#1b1f1d" stroke-width="30"/><circle cx="800" cy="630" r="22" fill="#1b1f1d"/><path d="M650 630H950M800 630V780" stroke="#1b1f1d" stroke-width="24"/>
<path d="M360 900V620C360 560 420 540 470 540H520C560 540 580 580 580 620V900Z" fill="#2B3B34"/>
${sitting({ x: 520, y: 760, s: 0.92, color: C.brand })}
<rect x="440" y="640" width="150" height="46" rx="20" fill="url(#goldG)" opacity=".95"/><rect x="448" y="648" width="134" height="30" rx="14" fill="url(#greenLight)"/>`;
  } else if (prod.scene === "desk") {
    scene = `<rect width="${W}" height="620" fill="url(#sky)"/>
<rect x="60" y="110" width="300" height="360" rx="20" fill="#fff" opacity=".7"/><path d="M60 290H360M210 110V470" stroke="${C.sageDeep}" stroke-width="8"/>
<rect x="0" y="640" width="${W}" height="260" fill="#DCE7DF"/>
<rect x="560" y="560" width="520" height="30" rx="14" fill="${C.dark}"/><rect x="600" y="590" width="26" height="260" fill="${C.dark}"/><rect x="1010" y="590" width="26" height="260" fill="${C.dark}"/>
<path d="M700 560L720 410H950L970 560Z" fill="${C.dark}"/><rect x="722" y="418" width="226" height="130" rx="6" fill="url(#night)"/><circle cx="835" cy="482" r="26" fill="${C.gold}"/>
<rect x="380" y="560" width="26" height="290" fill="${C.sageDeep}"/>
${sitting({ x: 330, y: 700, s: 0.95, color: C.brand })}
<path d="M240 530L120 470" stroke="${C.gold}" stroke-width="4" stroke-dasharray="6 7"/>
<rect x="470" y="470" width="14" height="46" rx="6" fill="${C.dark}" transform="rotate(15 470 470)"/>`;
  } else {
    scene = `<rect width="${W}" height="${H}" fill="url(#night)"/>
<circle cx="970" cy="170" r="70" fill="#F4E7BF"/><circle cx="1000" cy="150" r="64" fill="#274B3F"/>
${[[120, 90], [280, 160], [430, 70], [700, 130], [840, 60], [1100, 300]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#F4E7BF"/>`).join("")}
<rect x="80" y="520" width="760" height="190" rx="60" fill="#3A6B59"/><rect x="60" y="400" width="130" height="320" rx="50" fill="#2F5A49"/><rect x="750" y="440" width="130" height="280" rx="50" fill="#2F5A49"/>
<rect x="1010" y="520" width="14" height="260" fill="${C.gold}"/><ellipse cx="1017" cy="500" rx="76" ry="52" fill="#F4E7BF"/><circle cx="1017" cy="520" r="230" fill="url(#glow)" opacity=".7"/>
<rect x="0" y="780" width="${W}" height="120" fill="#12251E"/>
${sitting({ x: 520, y: 560, s: 0.88, color: "#CFE3D7" })}
<g transform="translate(405 405) scale(.2)">${calmaProduct(true)}</g>`;
  }
  return svg(`${scene}${pill(600, 810, prod.lifeCaption, { size: 32, bg: C.brand })}${kd(1090, 90, 44)}`, {
    title: `${prod.name} — الاستعمال اليومي`,
  });
}

function kitContents(p) {
  const prod = PRODUCTS[p];
  const cells = prod.kit
    .map(([title, sub, ic], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 90 + col * 530;
      const y = 200 + row * 290;
      const free = sub.includes("مجاناً");
      return `${card(x, y, 480, 250)}
<circle cx="${x + 370}" cy="${y + 125}" r="82" fill="${C.sage}"/>${g(x + 370, y + 125, 1, icon(ic))}
${t(x + 276, y + 108, title, { size: 26, anchor: "end", weight: 800 })}
${t(x + 276, y + 152, sub, { size: 21, anchor: "end", fill: free ? C.goldDeep : C.muted, weight: 700 })}
${free ? pill(x + 110, y + 42, "مجاناً", { size: 20, bg: C.gold, fg: C.dark, px: 18, shadow: false }) : `<g>${t(x + 60, y + 52, `0${i + 1}`, { size: 26, fill: C.sageDeep, latin: true, weight: 800 })}</g>`}`;
    })
    .join("");
  return svg(`${decor()}${t(600, 105, "شنو كيجي فالكولية ديالك؟", { size: 54, fill: C.brand, weight: 800 })}${t(600, 150, `${prod.name} · What's inside the box`, { size: 24, fill: C.muted, weight: 600 })}${cells}${pill(600, 830, "+ توصيل مجاني حتى لباب الدار والدفع عند الاستلام", { size: 26, bg: C.brand })}`, {
    title: `${prod.name} — محتويات العلبة`,
  });
}

// ------------------------------------------------------------------ alternating section images
function sectionEmotional(p) {
  const prod = PRODUCTS[p];
  return svg(
    `${decor()}
${card(70, 150, 500, 610, { fill: "#EDEBE6" })}${card(630, 150, 500, 610, { fill: C.sage })}
<circle cx="880" cy="440" r="210" fill="url(#glow)" opacity=".8"/>
${standing({ x: 320, y: 500, s: 0.92, slouch: true, color: C.muted })}
${standing({ x: 880, y: 500, s: 0.92, slouch: false, color: C.brand })}
<g stroke="${C.coral}" stroke-width="7" stroke-linecap="round" fill="none" opacity=".85"><path d="M262 396l-26 -26M262 440l-40 0M262 484l-26 26"/></g>
<g fill="${C.gold}"><path d="M1010 270l8 22 22 8-22 8-8 22-8-22-22-8 22-8z"/><path d="M760 320l5 14 14 5-14 5-5 14-5-14-14-5 14-5z"/></g>
${pill(320, 195, "قبل", { size: 30, bg: C.coral })}${pill(880, 195, "بعد", { size: 30, bg: C.brand })}
${t(320, 700, prod.before, { size: 30, fill: C.muted })}${t(880, 700, prod.after, { size: 30, fill: C.brand })}
${kd(600, 450, 48)}
${pill(600, 820, `${prod.name} — Kinédoux™`, { size: 28, bg: C.gold, fg: C.dark })}`,
    { title: `${prod.name} — قبل وبعد` },
  );
}

function sectionScience(p) {
  const prod = PRODUCTS[p];
  const productNode =
    p === "lumba" ? g(600, 470, 0.9, lumbaProduct(true)) : p === "posta" ? g(520, 450, 0.95, postaProduct()) + g(860, 620, 0.5, pillowProduct()) : g(600, 500, 1.35, calmaProduct(true));
  return svg(
    `<rect width="${W}" height="${H}" fill="url(#bgDark)"/><rect width="${W}" height="${H}" fill="url(#grid)" opacity=".5"/>
<circle cx="600" cy="470" r="330" fill="none" stroke="${C.gold}" stroke-opacity=".5" stroke-width="2" stroke-dasharray="6 10"/>
<circle cx="600" cy="470" r="250" fill="#ffffff" opacity=".06"/>
${productNode}
${leader(380, 330, 190, 200)}${pill(200, 170, prod.callouts[0], { size: 28, bg: "#fff", fg: C.brand })}
${leader(830, 360, 1010, 250)}${pill(1000, 220, prod.callouts[1], { size: 28, bg: "#fff", fg: C.brand })}
${leader(600, 700, 600, 780)}${pill(600, 810, prod.callouts[2], { size: 28, bg: C.gold, fg: C.dark })}
${t(600, 90, prod.mechanism[0], { size: 46, fill: "#fff", weight: 800 })}${t(600, 135, prod.mechanism[1], { size: 24, fill: C.gold, latin: true, weight: 700, ls: 1 })}`,
    { title: `${prod.name} — التقنية العلمية` },
  );
}

function sectionMaterials(p) {
  const prod = PRODUCTS[p];
  const fills = [`url(#green)`, `url(#greenLight)`, `url(#goldG)`];
  const swatches = prod.materials
    .map(([ar, en], i) => {
      const cx = 220 + i * 380;
      return `<g filter="url(#shadow)"><circle cx="${cx}" cy="400" r="150" fill="${fills[i]}"/><circle cx="${cx}" cy="400" r="150" fill="url(#mesh)" opacity="${i === 1 ? 0.9 : 0.25}"/><circle cx="${cx}" cy="400" r="150" fill="none" stroke="#fff" stroke-width="8"/></g>
${i === 0 ? `<path d="M${cx - 90} 380C${cx - 40} 300 ${cx + 40} 300 ${cx + 90} 380" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".6"/>` : ""}
${i === 2 ? `<circle cx="${cx}" cy="400" r="54" fill="#fff" opacity=".45"/><circle cx="${cx}" cy="400" r="20" fill="${C.hover}"/>` : ""}
${i === 0 ? `<circle cx="${cx}" cy="430" r="40" fill="#fff" opacity=".18"/>` : ""}
${pill(cx, 625, ar, { size: 25, bg: "#fff", fg: C.brand, stroke: `stroke="${C.gold}" stroke-width="2.5"` })}
${t(cx, 700, en, { size: 22, fill: C.muted, latin: true, weight: 600 })}`;
    })
    .join("");
  return svg(`${decor()}${t(600, 100, "تشريح الخامات والمكونات", { size: 52, fill: C.brand, weight: 800 })}${t(600, 150, "Medical-grade materials · Parapharmacie standards", { size: 24, fill: C.muted, latin: true, weight: 600 })}${swatches}${ceBadge(1090, 800, 52)}${kd(110, 800, 40)}`, {
    title: `${prod.name} — الخامات والمكونات`,
  });
}

// ------------------------------------------------------------------ home / about / extras
function hero() {
  return svg(
    `${decor()}
<ellipse cx="600" cy="740" rx="520" ry="76" fill="${C.sageDeep}"/><ellipse cx="600" cy="728" rx="470" ry="56" fill="#fff" opacity=".85"/>
${g(250, 540, 0.48, lumbaProduct(true))}
${g(600, 520, 0.62, postaProduct())}${g(660, 650, 0.3, pillowProduct())}
${g(960, 560, 0.62, calmaProduct(true))}
${pill(250, 255, "29 عمود هوائي", { size: 26, bg: "#fff", fg: C.brand, stroke: `stroke="${C.gold}" stroke-width="2.5"` })}
${pill(600, 200, "مستشعر زاوية 25°", { size: 26, bg: "#fff", fg: C.brand, stroke: `stroke="${C.gold}" stroke-width="2.5"` })}
${pill(960, 255, "حرارة مهدئة 42°C", { size: 26, bg: "#fff", fg: C.brand, stroke: `stroke="${C.gold}" stroke-width="2.5"` })}
${leader(250, 400, 250, 285)}${leader(600, 330, 600, 230)}${leader(960, 420, 960, 285)}
${kd(130, 110, 52)}${t(205, 105, "KINÉDOUX™", { size: 34, fill: C.brand, latin: true, weight: 800, anchor: "start", ls: 3 })}${t(205, 140, "kenidoux.com", { size: 22, fill: C.muted, latin: true, weight: 600, anchor: "start" })}
${ceBadge(1070, 110, 56)}
${pill(600, 830, "المختبر المتخصص في راحة الظهر، الوقفة واسترخاء العضلات", { size: 26, bg: C.brand })}`,
    { title: "KINÉDOUX — لومبا · بوسطا · كالما" },
  );
}

function homeStruggle() {
  const panel = (x, label, inner) => `${card(x, 170, 330, 520, { fill: "#fff" })}<rect x="${x}" y="170" width="330" height="330" rx="28" fill="${C.sage}"/>${inner}${pill(x + 165, 590, label, { size: 28, bg: C.brand })}`;
  return svg(
    `${decor()}${t(600, 100, "كل نهار نفس الثقل... نفس العيا", { size: 50, fill: C.brand, weight: 800 })}
${panel(60, "8 سوايع فالطوموبيل", `<circle cx="225" cy="340" r="105" fill="none" stroke="${C.dark}" stroke-width="26"/><path d="M120 340H330M225 340V440" stroke="${C.dark}" stroke-width="20"/><circle cx="225" cy="340" r="16" fill="${C.dark}"/>`)}
${panel(435, "قدام البيسي والتيليفون", `<rect x="500" y="260" width="200" height="130" rx="10" fill="${C.dark}"/><rect x="510" y="270" width="180" height="108" rx="6" fill="url(#night)"/><path d="M470 400H730L710 430H490Z" fill="${C.sageDeep}"/><circle cx="600" cy="324" r="20" fill="${C.gold}"/>`)}
${panel(810, "الوقوف والشقا فالدار", `<path d="M870 470H1110M900 470L920 300H1060L1080 470" fill="none" stroke="${C.dark}" stroke-width="20" stroke-linejoin="round"/><ellipse cx="990" cy="300" rx="90" ry="24" fill="${C.sageDeep}" stroke="${C.dark}" stroke-width="14"/><path d="M960 250q16-30 0-50M1010 250q16-30 0-50" stroke="${C.gold}" stroke-width="8" fill="none" stroke-linecap="round"/>`)}
${pill(600, 790, "ظهر مضغوط، كتاف متشنجة، رقبة ثقيلة", { size: 30, bg: C.coral })}`,
    { title: "الثقل اليومي المغربي" },
  );
}

function homeCompare() {
  const rows = [
    ["خامات طبية CE", "بلاستيك رديء كيتنفس"],
    ["دليل بالدارجة والفرنسية", "بدون دليل واضح"],
    ["ضمان استبدال 14 يوماً", "بدون ضمان"],
    ["مراقبة جودة بالدار البيضاء", "مجهول المصدر"],
  ];
  const body = rows
    .map(
      ([a, b], i) => `<g>${card(70, 250 + i * 120, 500, 96, { fill: "#fff" })}<circle cx="520" cy="${298 + i * 120}" r="26" fill="${C.brand}"/><path d="M507 ${298 + i * 120}l9 10 18-20" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${t(470, 308 + i * 120, a, { size: 28, anchor: "end" })}
${card(630, 250 + i * 120, 500, 96, { fill: "#EDEBE6" })}<circle cx="1080" cy="${298 + i * 120}" r="26" fill="${C.coral}"/><path d="M1068 ${286 + i * 120}l24 24M1092 ${286 + i * 120}l-24 24" stroke="#fff" stroke-width="6" stroke-linecap="round"/>${t(1030, 308 + i * 120, b, { size: 28, anchor: "end", fill: C.muted })}</g>`,
    )
    .join("");
  return svg(
    `${decor()}${t(600, 100, "علاش كينيدو ماشي بحال السوق؟", { size: 50, fill: C.brand, weight: 800 })}
${pill(320, 190, "كينيدو الأصلي Kinédoux™", { size: 28, bg: C.brand })}${pill(880, 190, "المنتجات المقلدة الرخيصة", { size: 28, bg: C.coral })}
${body}${ceBadge(600, 790, 54)}`,
    { title: "كينيدو الأصلي مقابل المقلد" },
  );
}

function aboutHub() {
  return svg(
    `<rect width="${W}" height="620" fill="url(#sky)"/>
<circle cx="900" cy="170" r="90" fill="#F6E7BE" opacity=".9"/>
<g fill="${C.sageDeep}"><rect x="60" y="330" width="90" height="290"/><rect x="170" y="250" width="110" height="370"/><rect x="900" y="300" width="120" height="320"/><rect x="1040" y="360" width="100" height="260"/></g>
<rect x="300" y="300" width="600" height="320" rx="14" fill="#fff" filter="url(#soft)"/><rect x="300" y="300" width="600" height="70" rx="14" fill="url(#green)"/>
${t(600, 348, "Casablanca Logistics & Quality Hub", { size: 30, fill: C.alabaster, latin: true, weight: 800 })}
${[0, 1, 2, 3].map((i) => `<rect x="${340 + i * 140}" y="450" width="110" height="170" rx="8" fill="${C.sage}" stroke="${C.brand}" stroke-width="4"/><path d="M${340 + i * 140} 490H${450 + i * 140}M${340 + i * 140} 530H${450 + i * 140}M${340 + i * 140} 570H${450 + i * 140}" stroke="${C.brand}" stroke-width="3" opacity=".5"/>`).join("")}
<rect y="620" width="${W}" height="280" fill="#DCE7DF"/><path d="M0 760H1200" stroke="${C.gold}" stroke-width="5" stroke-dasharray="40 30" opacity=".6"/>
${kd(600, 215, 56)}
${pill(600, 800, "مراقبة الجودة والتوزيع — الدار البيضاء", { size: 30, bg: C.brand })}${ceBadge(1080, 110, 56)}`,
    { title: "مركز التوزيع ومراقبة الجودة — الدار البيضاء" },
  );
}

function aboutPillars() {
  const nodes = [
    ["lumba", 200, "التمدد اللطيف", "كينيدو لومبا"],
    ["posta", 600, "الوقفة الواثقة", "كينيدو بوسطا"],
    ["calma", 1000, "الاسترخاء الدافئ", "كينيدو كالما"],
  ]
    .map(([k, cx, title, name]) => {
      const draw = k === "lumba" ? g(cx, 410, 0.26, lumbaProduct(true)) : k === "posta" ? g(cx, 410, 0.36, postaProduct()) : g(cx, 430, 0.42, calmaProduct(true));
      return `${card(cx - 180, 190, 360, 520, { fill: "#fff" })}<circle cx="${cx}" cy="410" r="130" fill="${C.sage}"/>${draw}${pill(cx, 600, title, { size: 28, bg: C.brand })}${t(cx, 668, name, { size: 26, fill: C.muted })}`;
    })
    .join("");
  return svg(`${decor()}${t(600, 110, "فلسفتنا في 3 ركائز", { size: 56, fill: C.brand, weight: 800 })}${nodes}${kd(600, 800, 42)}`, { title: "ركائز كينيدو الثلاث" });
}

function aboutTrust() {
  const stats = [
    ["+18,500", "زبون مغربي مرتاح"],
    ["98.2%", "نسبة الرضا"],
    ["+65", "مدينة مغربية"],
    ["14", "يوماً ضمان استبدال"],
  ];
  const body = stats
    .map(([n, l], i) => {
      const x = 80 + (i % 2) * 540;
      const y = 180 + Math.floor(i / 2) * 290;
      return `${card(x, y, 500, 250)}<rect x="${x}" y="${y}" width="14" height="250" rx="7" fill="${C.gold}"/>${t(x + 250, y + 140, n, { size: 104, fill: C.brand, latin: true, weight: 800 })}${t(x + 250, y + 205, l, { size: 32, fill: C.muted })}`;
    })
    .join("");
  return svg(`${decor()}${t(600, 105, "أرقامنا تفتخر بثقتكم", { size: 54, fill: C.brand, weight: 800 })}${body}${ceBadge(1090, 800, 54)}${kd(110, 800, 42)}`, { title: "أرقام كينيدو" });
}

function bundleKit() {
  return svg(
    `${decor()}
<ellipse cx="600" cy="720" rx="520" ry="70" fill="${C.sageDeep}"/>
${g(270, 520, 0.5, lumbaProduct(true))}${g(600, 500, 0.6, postaProduct())}${g(660, 640, 0.3, pillowProduct())}${g(940, 540, 0.62, calmaProduct(true))}
${pill(600, 130, "باقة كينيدو الشاملة", { size: 52, bg: C.brand, px: 50 })}
<g filter="url(#shadow)"><circle cx="1040" cy="200" r="100" fill="url(#goldG)"/>${t(1040, 195, "890", { size: 62, fill: C.dark, latin: true, weight: 800 })}${t(1040, 240, "د.م", { size: 30, fill: C.dark, weight: 800 })}</g>
${t(1040, 330, "بدل 1,427 د.م", { size: 26, fill: C.coral, weight: 700 })}
${pill(600, 830, "لومبا + بوسطا + كالما — توصيل مجاني", { size: 30, bg: C.gold, fg: C.dark })}`,
    { title: "باقة كينيدو الشاملة — 890 د.م" },
  );
}

function ugc(base, caption, name) {
  return svg(
    `${base}<rect width="${W}" height="${H}" fill="#11221A" opacity=".28"/>
<g filter="url(#shadow)"><circle cx="600" cy="400" r="96" fill="#fff" opacity=".95"/><path d="M572 350L660 400L572 450Z" fill="${C.brand}"/></g>
${pill(600, 600, caption, { size: 34, bg: C.brand, px: 40 })}${t(600, 680, name, { size: 28, fill: "#fff", weight: 600 })}`,
    { title: caption },
  );
}

/** Reuse a finished scene as the backdrop of another SVG (strip its <svg> wrapper and <defs>). */
const sceneBody = (full) => full.replace(/^<svg[^>]*>[\s\S]*?<\/defs>/, "").replace(/<\/svg>\s*$/, "");

function badgeCE() {
  return svg(
    `<circle cx="150" cy="150" r="130" fill="#fff" stroke="url(#goldG)" stroke-width="10"/><circle cx="150" cy="150" r="108" fill="none" stroke="${C.gold}" stroke-width="2" stroke-dasharray="4 7"/>${t(150, 168, "14", { size: 92, fill: C.brand, latin: true, weight: 800 })}${t(150, 218, "JOURS", { size: 26, fill: C.goldDeep, latin: true, weight: 700 })}`,
    { w: 300, h: 300, bg: "bg", title: "14 JOURS" },
  ).replace(`<rect width="300" height="300" fill="url(#bg)"/>`, "");
}

function badgeGuarantee() {
  return svg(
    `<path d="M150 20L262 62V150C262 218 210 266 150 288C90 266 38 218 38 150V62Z" fill="url(#green)" stroke="url(#goldG)" stroke-width="10"/>${t(150, 170, "14", { size: 110, fill: C.alabaster, latin: true, weight: 800 })}${t(150, 215, "يوماً ضمان", { size: 30, fill: C.gold, weight: 800 })}`,
    { w: 300, h: 300, bg: "bg", title: "ضمان استبدال 14 يوماً" },
  ).replace(`<rect width="300" height="300" fill="url(#bg)"/>`, "");
}

function brandMark() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#1E4D3B" stroke="#A3B899" stroke-width="3"/><path d="M32 16c0 0-1.2 6-1.2 16S32 48 32 48" fill="none" stroke="#F8F7F4" stroke-width="2.4" stroke-linecap="round"/><path d="M32 22c-6 3-9 8-9 13 4-1 7-4 9-8 2 4 5 7 9 8 0-5-3-10-9-13z" fill="#A3B899"/></svg>`;
}

// ------------------------------------------------------------------ write everything
const files = {};
files["hero-kenidoux-collection.svg"] = hero();
files["bundle-kit.svg"] = bundleKit();
files["home-section-1.svg"] = homeStruggle();
files["home-section-2.svg"] = homeCompare();
files["about-hub.svg"] = aboutHub();
files["about-pillars.svg"] = aboutPillars();
files["about-trust.svg"] = aboutTrust();
files["badges/ce-iso.svg"] = badgeCE();
files["badges/guarantee-14d.svg"] = badgeGuarantee();
files["ugc-1.svg"] = ugc(sceneBody(lifestyleScene("lumba")), "تجربة سي عبد الإله — الدار البيضاء", "سائق وممثل تجاري");
files["ugc-2.svg"] = ugc(sceneBody(lifestyleScene("posta")), "تجربة سناء — موظفة بالرباط", "قدام البيسي 8 سوايع");
files["ugc-3.svg"] = ugc(sceneBody(lifestyleScene("calma")), "أحسن هدية للواليد — مراكش", "جلسة استرخاء مسائية");

for (const key of Object.keys(PRODUCTS)) {
  files[`${key}/main.svg`] = mainShot(key);
  files[`${key}/mechanism.svg`] = mechanism(key);
  files[`${key}/lifestyle.svg`] = lifestyleScene(key);
  files[`${key}/kit-contents.svg`] = kitContents(key);
  files[`${key}/section-1.svg`] = sectionEmotional(key);
  files[`${key}/section-2.svg`] = sectionScience(key);
  files[`${key}/section-3.svg`] = sectionMaterials(key);
}

for (const [rel, content] of Object.entries(files)) {
  const target = join(OUT, rel);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}
const iconPath = join(OUT, "..", "..", "src", "app", "icon.svg");
mkdirSync(dirname(iconPath), { recursive: true });
writeFileSync(iconPath, brandMark(), "utf8");
console.log(`Generated ${Object.keys(files).length} SVG images in ${OUT}`);

