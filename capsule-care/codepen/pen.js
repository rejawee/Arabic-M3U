(function () {
"use strict";
/* ===== motion.js ===== */
/** دوال حركة مستوحاة من Royal Match */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t) => t * t * t;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function easeOutBack(t, overshoot = 1.70158) {
  const c3 = overshoot + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
}
function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}
function easeOutBounce(t) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

/** سقوط مع ارتداد خفيف في النهاية */
function easeFall(t) {
  if (t < 0.82) return easeOutCubic(t / 0.82) * 1.06;
  const bounce = (t - 0.82) / 0.18;
  return 1.06 - easeOutBounce(bounce) * 0.06;
}

/** squash & stretch: t=0..1, peak at impact */
function squashStretch(t, impactAt = 0.85) {
  if (t < impactAt) {
    const p = t / impactAt;
    return { sx: 1 + p * 0.06, sy: 1 - p * 0.08 };
  }
  const p = (t - impactAt) / (1 - impactAt);
  const bounce = Math.sin(p * Math.PI) * (1 - p);
  return { sx: 1.06 - bounce * 0.12, sy: 0.92 + bounce * 0.16 };
}
function tween(ms, fn, easeFn = easeOutCubic) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      fn(easeFn(t), t);
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

/* ===== config.js ===== */
/** ألوان كبسولات juicy — مشبعة ومتوهجة كأسلوب Royal Match */
const CAPSULE_TYPES = {
  ruby: {
    id: "ruby",
    name: "ياقوتية",
    shell: ["#ffffff", "#ffcdd2"],
    powder: ["#ffebee", "#ff8a80", "#ff1744", "#c62828", "#4a000c"],
    glow: "rgba(255, 23, 68, 0.65)",
  },
  azure: {
    id: "azure",
    name: "سماوية",
    shell: ["#ffffff", "#90caf9"],
    powder: ["#e3f2fd", "#64b5f6", "#1e88ff", "#0d47a1", "#001a40"],
    glow: "rgba(30, 136, 255, 0.75)",
  },
  jade: {
    id: "jade",
    name: "زُمرّدية",
    shell: ["#ffffff", "#c8e6c9"],
    powder: ["#e8f5e9", "#69f0ae", "#00e676", "#2e7d32", "#002910"],
    glow: "rgba(0, 230, 118, 0.65)",
  },
  amber: {
    id: "amber",
    name: "ذهبية",
    shell: ["#ffffff", "#ffe0b2"],
    powder: ["#fff8e1", "#ffd54f", "#ffab00", "#ef6c00", "#3e1f00"],
    glow: "rgba(255, 171, 0, 0.65)",
  },
  violet: {
    id: "violet",
    name: "بنفسجية",
    shell: ["#ffffff", "#ce93d8"],
    powder: ["#f3e5f5", "#ea80fc", "#d500f9", "#6a1b9a", "#1a0033"],
    glow: "rgba(213, 0, 249, 0.7)",
  },
  cyan: {
    id: "cyan",
    name: "فيروزية",
    shell: ["#ffffff", "#80deea"],
    powder: ["#e0f7fa", "#26c6da", "#00bcd4", "#006064", "#002a30"],
    glow: "rgba(0, 188, 212, 0.7)",
  },
};
const TYPE_IDS = Object.keys(CAPSULE_TYPES);

/** sprites كبسولات 3D — Royal Match */
const CAPSULE_SPRITES = {
  ruby: "",
  azure: "",
  jade: "",
  amber: "",
  violet: "",
  cyan: "",
};
const SPECIAL_SPRITES = {
  fire: "",
  ice: "",
  rainbow: "",
};

/** أيقونات UI */
const UI_ICONS = {
  star: "",
  coin: "",
  heart: "",
  treasure: "",
};

/** معززات — default / active / disabled */
const BOOSTER_SPRITES = {
  hammer: {
    default: "",
    active: "",
    disabled: "",
  },
  rocket: {
    default: "",
    active: "",
    disabled: "",
  },
  bomb: {
    default: "",
    active: "",
    disabled: "",
  },
  mix: {
    default: "",
    active: "",
    disabled: "",
  },
};
function capsuleSpritePath(typeId, special = null) {
  if (special === "rainbow") return SPECIAL_SPRITES.rainbow;
  if (special === "bomb") return SPECIAL_SPRITES.fire;
  if (special === "row" || special === "col") return SPECIAL_SPRITES.ice;
  return CAPSULE_SPRITES[typeId] || CAPSULE_SPRITES.ruby;
}
function boosterSpritePath(id, state = "default") {
  return BOOSTER_SPRITES[id]?.[state] || BOOSTER_SPRITES[id]?.default;
}

/** عقبات اللوحة */
const OBSTACLE_TYPES = {
  ice: { id: "ice", name: "جليد", sprite: "" },
  crate: { id: "crate", name: "صندوق", sprite: "" },
  lock: { id: "lock", name: "قفل", sprite: "" },
  slime: { id: "slime", name: "مخاط", sprite: "" },
};
const OBSTACLE_SPRITES = Object.fromEntries(
  Object.entries(OBSTACLE_TYPES).map(([k, v]) => [k, v.sprite])
);

/** ي parse blocked: [r,c] أو [r,c,type] */
function parseBlockedEntry(entry) {
  const [r, c, type = "crate"] = entry;
  return { r, c, type: OBSTACLE_TYPES[type] ? type : "crate" };
}

/** ثيمات العيادات — خلفيات وألوان لكل مرحلة */
const CLINIC_THEMES = {
  neighborhood: {
    id: "neighborhood",
    name: "عيادة الحي",
    icon: "🏥",
    decor: ["🌿", "💊", "🩺", "❤️"],
    colors: {
      appGlow1: "rgba(126, 240, 216, 0.18)",
      appGlow2: "rgba(29, 184, 166, 0.12)",
      stageBg1: "#0a4a52",
      stageBg2: "#062830",
      stageBg3: "#041820",
      accent: "#7ef0d8",
      accentSoft: "#1db8a6",
      hudBorder: "rgba(126, 240, 216, 0.35)",
      frameTop: "rgba(130, 200, 240, 0.95)",
      frameBottom: "rgba(50, 130, 190, 0.96)",
      frameBorder: "rgba(232, 196, 104, 0.9)",
      cellLight: "rgba(215, 242, 255, 0.95)",
      cellDark: "rgba(155, 210, 245, 0.9)",
      health: ["#ff6b5a", "#f4c15d", "#7ef0d8"],
      storyPanel: "linear-gradient(160deg, rgba(18, 96, 90, 0.65), rgba(6, 40, 44, 0.9))",
      canvasGlow: "rgba(30, 110, 100, 0.38)",
    },
  },
  children: {
    id: "children",
    name: "مستوصف الأطفال",
    icon: "🧸",
    decor: ["🧸", "🎈", "⭐", "🌈"],
    colors: {
      appGlow1: "rgba(255, 183, 77, 0.2)",
      appGlow2: "rgba(255, 105, 180, 0.12)",
      stageBg1: "#5a3a72",
      stageBg2: "#3a2450",
      stageBg3: "#241535",
      accent: "#ffd180",
      accentSoft: "#ff80ab",
      hudBorder: "rgba(255, 183, 77, 0.4)",
      frameTop: "rgba(130, 200, 240, 0.95)",
      frameBottom: "rgba(50, 130, 190, 0.96)",
      frameBorder: "rgba(232, 196, 104, 0.9)",
      cellLight: "rgba(215, 242, 255, 0.95)",
      cellDark: "rgba(155, 210, 245, 0.9)",
      health: ["#ff80ab", "#ffd180", "#69f0ae"],
      storyPanel: "linear-gradient(160deg, rgba(120, 70, 140, 0.6), rgba(45, 25, 65, 0.92))",
      canvasGlow: "rgba(180, 100, 200, 0.35)",
    },
  },
  emergency: {
    id: "emergency",
    name: "قسم الطوارئ",
    icon: "🚨",
    decor: ["🚨", "⚡", "🚑", "➕"],
    colors: {
      appGlow1: "rgba(255, 82, 82, 0.22)",
      appGlow2: "rgba(255, 171, 0, 0.14)",
      stageBg1: "#6a1a1a",
      stageBg2: "#3d0f12",
      stageBg3: "#220608",
      accent: "#ff8a80",
      accentSoft: "#ffab00",
      hudBorder: "rgba(255, 138, 128, 0.45)",
      frameTop: "rgba(130, 200, 240, 0.95)",
      frameBottom: "rgba(50, 130, 190, 0.96)",
      frameBorder: "rgba(232, 196, 104, 0.9)",
      cellLight: "rgba(215, 242, 255, 0.95)",
      cellDark: "rgba(155, 210, 245, 0.9)",
      health: ["#ff5252", "#ffab00", "#ff8a80"],
      storyPanel: "linear-gradient(160deg, rgba(120, 30, 30, 0.65), rgba(35, 8, 10, 0.92))",
      canvasGlow: "rgba(180, 40, 40, 0.38)",
    },
  },
  research: {
    id: "research",
    name: "مختبر الأبحاث",
    icon: "🔬",
    decor: ["🔬", "🧪", "⚗️", "🧬"],
    colors: {
      appGlow1: "rgba(124, 77, 255, 0.2)",
      appGlow2: "rgba(0, 229, 255, 0.12)",
      stageBg1: "#1a3a6a",
      stageBg2: "#0f2248",
      stageBg3: "#081530",
      accent: "#82b1ff",
      accentSoft: "#18ffff",
      hudBorder: "rgba(130, 177, 255, 0.42)",
      frameTop: "rgba(130, 200, 240, 0.95)",
      frameBottom: "rgba(50, 130, 190, 0.96)",
      frameBorder: "rgba(232, 196, 104, 0.9)",
      cellLight: "rgba(215, 242, 255, 0.95)",
      cellDark: "rgba(155, 210, 245, 0.9)",
      health: ["#536dfe", "#18ffff", "#b388ff"],
      storyPanel: "linear-gradient(160deg, rgba(30, 60, 120, 0.65), rgba(8, 18, 45, 0.92))",
      canvasGlow: "rgba(60, 100, 220, 0.38)",
    },
  },
};

/** معززات المساعدة — أسلوب Royal Match */
const BOOSTERS = {
  hammer: {
    id: "hammer",
    boardKey: "syringe",
    name: "مطرقة",
    title: "مطرقة العلاج — امسح صفاً كاملاً",
    desc: "تكسر صفاً من الكبسولات",
  },
  rocket: {
    id: "rocket",
    boardKey: "spray",
    name: "صاروخ",
    title: "صاروخ الدواء — امسح عموداً كاملاً",
    desc: "يُطلق موجة تنظيف عمودية",
  },
  bomb: {
    id: "bomb",
    boardKey: "pulse",
    name: "قنبلة",
    title: "جرعة مركّزة — انفجار منطقة 3×3",
    desc: "تفجير منطقة حول النقطة",
  },
  mix: {
    id: "mix",
    boardKey: "shuffle",
    name: "خلط",
    title: "خلط الوصفة — إعادة ترتيب اللوحة",
    desc: "يعيد ترتيب الكبسولات",
  },
};
const BOOSTER_IDS = Object.keys(BOOSTERS);
function getLevelTheme(level) {
  if (level.themeId) return CLINIC_THEMES[level.themeId] || CLINIC_THEMES.neighborhood;
  if (level.clinic.includes("الأطفال")) return CLINIC_THEMES.children;
  if (level.clinic.includes("الطوارئ")) return CLINIC_THEMES.emergency;
  if (level.clinic.includes("المختبر") || level.clinic.includes("الأبحاث")) return CLINIC_THEMES.research;
  return CLINIC_THEMES.neighborhood;
}
const RANKS = [
  { min: 0, title: "طبيب متدرب" },
  { min: 3, title: "طبيب مقيم" },
  { min: 8, title: "أخصائي" },
  { min: 14, title: "استشاري" },
  { min: 20, title: "عميد العيادة" },
];

/**
 * قصة متكاملة: عيادات → مرضى → أهداف مطابقة
 */
const LEVELS = [
  {
    id: 1,
    themeId: "neighborhood",
    clinic: "عيادة الحي",
    clinicIcon: "🏥",
    patient: "سارة",
    emoji: "👩",
    condition: "نزلة برد خفيفة",
    story:
      "سارة جاءت مرتجفة من برد الصباح. حضّر لها كبسولات الياقوت الدافئة لتفتح مجاري التنفس وتعيد الدفء لجسمها.",
    rows: 7,
    cols: 7,
    moves: 22,
    types: ["ruby", "azure", "jade", "amber"],
    goals: [{ type: "ruby", count: 18 }],
    blocked: [],
    sceneProps: ["🌡️", "🧣", "☕", "🍵"],
  },
  {
    id: 2,
    themeId: "neighborhood",
    clinic: "عيادة الحي",
    clinicIcon: "🏥",
    patient: "يوسف",
    emoji: "👦",
    condition: "التهاب حلق",
    story:
      "يوسف يرفض الأكل من ألم الحلق. امزج كبسولات الزمرد المهدّئة مع السماوية المضادة للالتهاب قبل نفاد الحركات.",
    rows: 7,
    cols: 7,
    moves: 20,
    types: ["ruby", "azure", "jade", "amber"],
    goals: [
      { type: "jade", count: 14 },
      { type: "azure", count: 12 },
    ],
    blocked: [
      [2, 3, "ice"],
      [3, 3, "ice"],
      [4, 3, "ice"],
    ],
    sceneProps: ["🍯", "🍋", "💧", "🩹"],
  },
  {
    id: 3,
    themeId: "children",
    clinic: "مستوصف الأطفال",
    clinicIcon: "🧸",
    patient: "ليان",
    emoji: "👧",
    condition: "حمّى متقطعة",
    story:
      "في مستوصف الأطفال، ليان ترتجف من الحمى. الكبسولات الذهبية تخفض الحرارة — اجمعِها بسرعة أيها الطبيب.",
    rows: 8,
    cols: 7,
    moves: 24,
    types: ["ruby", "azure", "jade", "amber", "cyan"],
    goals: [{ type: "amber", count: 22 }],
    blocked: [
      [0, 0, "crate"],
      [0, 6, "crate"],
      [7, 0, "slime"],
      [7, 6, "slime"],
    ],
    sceneProps: ["🧸", "🌡️", "🎈", "💊"],
  },
  {
    id: 4,
    themeId: "children",
    clinic: "مستوصف الأطفال",
    clinicIcon: "🧸",
    patient: "آدم",
    emoji: "🧒",
    condition: "حساسية جلدية",
    story:
      "طفح أحمر يغطي ذراعي آدم. وصفة اليوم: كبسولات فيروزية تهدّئ البشرة، مع حقنة الصف إذا ازدحمت اللوحة.",
    rows: 8,
    cols: 8,
    moves: 22,
    types: ["ruby", "azure", "jade", "amber", "cyan"],
    goals: [{ type: "cyan", count: 20 }],
    blocked: [
      [3, 3, "lock"],
      [3, 4, "lock"],
      [4, 3, "lock"],
      [4, 4, "lock"],
    ],
    sceneProps: ["🧴", "🌈", "🩹", "✨"],
  },
  {
    id: 5,
    themeId: "emergency",
    clinic: "قسم الطوارئ",
    clinicIcon: "🚨",
    patient: "خالد",
    emoji: "👨",
    condition: "ألم حاد — أولوية عالية",
    story:
      "صفّارات الطوارئ تدوي. خالد يحتاج مزيجاً ثلاثياً عاجلاً. كل مطابقة تنقذ دقيقة من الألم — لا تُهدر حركة.",
    rows: 8,
    cols: 8,
    moves: 20,
    types: ["ruby", "azure", "jade", "amber", "violet"],
    goals: [
      { type: "ruby", count: 15 },
      { type: "violet", count: 12 },
      { type: "azure", count: 10 },
    ],
    blocked: [
      [1, 1, "ice"],
      [1, 6, "lock"],
      [6, 1, "crate"],
      [6, 6, "slime"],
      [3, 0, "ice"],
      [4, 7, "lock"],
    ],
    sceneProps: ["🚨", "💉", "⚡", "🚑"],
  },
  {
    id: 6,
    themeId: "emergency",
    clinic: "قسم الطوارئ",
    clinicIcon: "🚨",
    patient: "نورة",
    emoji: "👩‍🦰",
    condition: "صدمة تحسسية خفيفة",
    story:
      "نورة بدأت تضيق أنفاسها. البنفسجي المضاد للهيستامين هو مفتاح الإنقاذ. اصنع توليفات خاصة لفتح مسار العلاج.",
    rows: 8,
    cols: 8,
    moves: 18,
    types: ["ruby", "azure", "jade", "amber", "violet", "cyan"],
    goals: [{ type: "violet", count: 24 }],
    blocked: [
      [2, 2, "ice"],
      [2, 5, "ice"],
      [5, 2, "lock"],
      [5, 5, "lock"],
      [0, 3, "crate"],
      [0, 4, "crate"],
      [7, 3, "slime"],
      [7, 4, "slime"],
    ],
    sceneProps: ["💨", "💊", "🫁", "⚡"],
  },
  {
    id: 7,
    themeId: "research",
    clinic: "مختبر الأبحاث",
    clinicIcon: "🔬",
    patient: "د. هناء (زميلة)",
    emoji: "👩‍⚕️",
    condition: "إرهاق بحثي + صداع نصفي",
    story:
      "زميلتك هناء سهرت على تركيبة نادرة. ساعدها بجمع كبسولات متعددة الألوان لإعادة تركيزها قبل العرض العلمي.",
    rows: 8,
    cols: 8,
    moves: 24,
    types: ["ruby", "azure", "jade", "amber", "violet", "cyan"],
    goals: [
      { type: "jade", count: 12 },
      { type: "cyan", count: 12 },
      { type: "amber", count: 12 },
    ],
    blocked: [
      [3, 1, "crate"],
      [3, 2, "slime"],
      [4, 5, "ice"],
      [4, 6, "lock"],
    ],
    sceneProps: ["🔬", "📋", "☕", "💡"],
  },
  {
    id: 8,
    themeId: "research",
    clinic: "مختبر الأبحاث",
    clinicIcon: "🔬",
    patient: "فريق المختبر",
    emoji: "🧑‍🔬",
    condition: "اختبار التركيبة النهائية",
    story:
      "التركيبة النهائية لـ«شِفاء» جاهزة للتجربة. طابق أكبر عدد ممكن من الكبسولات الفاخرة — أنت عميد العيادة الآن.",
    rows: 8,
    cols: 8,
    moves: 26,
    types: ["ruby", "azure", "jade", "amber", "violet", "cyan"],
    goals: [
      { type: "ruby", count: 16 },
      { type: "azure", count: 16 },
      { type: "jade", count: 16 },
    ],
    blocked: [
      [0, 0, "ice"],
      [0, 7, "lock"],
      [7, 0, "crate"],
      [7, 7, "slime"],
      [3, 3, "lock"],
      [3, 4, "ice"],
      [4, 3, "crate"],
      [4, 4, "slime"],
    ],
    sceneProps: ["🧪", "⚗️", "🧬", "✨"],
  },
];
function getRank(stars) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (stars >= r.min) rank = r;
  }
  return rank;
}
const SAVE_KEY = "shifa-capsule-care-v1";

/* ===== capsule.js ===== */
/**
 * كبسولات Royal Match طبية — أسلوب juicy ثلاثي الأبعاد
 * غلاف زجاجي لامع + بودرة متوهجة متحركة + هالة اختيار + قطع خاصة
 */

/** نسب قطع Royal Match: كبسولة ممتلئة داخل الخلية (أعرض من 2:1 النحيف) */
const CAPSULE_ASPECT = 1.22;
const CAPSULE_FILL = 0.5;
const SPRITE_FILL = 0.97;
/** الرسم الإجرائي يطابق مرجع الزجاج+البودرة أفضل من PNG المتفاوت */
const PREFER_PROCEDURAL = true;

const spriteCache = new Map();
const obstacleCache = new Map();
function preloadCapsuleSprites() {
  const paths = { ...CAPSULE_SPRITES, ...SPECIAL_SPRITES };
  for (const [key, src] of Object.entries(paths)) {
    if (spriteCache.has(key)) continue;
    const img = new Image();
    img.src = src;
    spriteCache.set(key, img);
  }
}
function preloadObstacleSprites() {
  for (const [key, src] of Object.entries(OBSTACLE_SPRITES)) {
    if (obstacleCache.has(key)) continue;
    const img = new Image();
    img.src = src;
    obstacleCache.set(key, img);
  }
}
function preloadAllSprites() {
  preloadCapsuleSprites();
  preloadObstacleSprites();
}

function getSprite(typeId, special) {
  const src = capsuleSpritePath(typeId, special);
  for (const [key, path] of Object.entries({ ...CAPSULE_SPRITES, ...SPECIAL_SPRITES })) {
    if (path === src) return spriteCache.get(key);
  }
  return spriteCache.get(typeId);
}

function spriteReady(img) {
  return img && img.complete && img.naturalWidth > 0;
}

/** يحسب أبعاد الجسم — يفضّل عرضاً ممتلئاً (~88% من الخلية) مثل المرجع */
function capsuleBounds(x, y, w, h) {
  const padX = w * 0.005;
  const padY = h * 0.005;
  const maxW = Math.max(8, w - padX * 2);
  const maxH = Math.max(8, h - padY * 2);

  let bw = maxW * SPRITE_FILL;
  let bh = bw * CAPSULE_ASPECT;
  if (bh > maxH * 0.96) {
    const s = (maxH * 0.96) / bh;
    bh *= s;
    bw *= s;
  }

  return {
    bw,
    bh,
    bx: x + (w - bw) / 2,
    by: y + (h - bh) / 2,
    cx: x + w / 2,
    cy: y + h / 2,
  };
}
class CapsulePowder {
  constructor(typeId, seed = Math.random() * 1000) {
    this.typeId = typeId;
    this.seed = seed;
    this.time = seed * 0.01;
    this.shakeAmp = 0;
    this.grains = [];
    this.sparks = [];
    this._rebuild();
  }

  _rand(i) {
    const x = Math.sin(this.seed * 17.13 + i * 91.7) * 43758.5453;
    return x - Math.floor(x);
  }

  _rebuild() {
    this.grains = [];
    this.sparks = [];
    // حبيبات كثيفة في النصف السفلي فقط (تحت خط التحام 50%)
    for (let i = 0; i < 55; i++) {
      const t = Math.pow(this._rand(i), 0.55);
      this.grains.push({
        x: 0.2 + this._rand(i + 50) * 0.6,
        y: CAPSULE_FILL + 0.02 + t * 0.42,
        r: 0.018 + this._rand(i + 90) * 0.032,
        vx: 0,
        vy: 0,
        phase: this._rand(i + 120) * Math.PI * 2,
        bright: this._rand(i + 140) > 0.65,
      });
    }
    for (let i = 0; i < 10; i++) {
      this.sparks.push({
        x: 0.28 + this._rand(i + 200) * 0.44,
        y: 0.12 + this._rand(i + 220) * (CAPSULE_FILL - 0.16),
        phase: this._rand(i + 240) * Math.PI * 2,
        speed: 3 + this._rand(i + 260) * 6,
        r: 0.01 + this._rand(i + 280) * 0.018,
      });
    }
  }

  setType(typeId) {
    if (this.typeId === typeId) return;
    this.typeId = typeId;
    this._rebuild();
  }

  shake(intensity = 1) {
    this.shakeAmp = Math.min(2.2, this.shakeAmp + intensity);
    for (const g of this.grains) {
      g.vx += (Math.random() - 0.5) * 0.14 * intensity;
      g.vy += (Math.random() - 0.5) * 0.12 * intensity - 0.05 * intensity;
    }
  }

  update(dt) {
    this.time += dt;
    if (this.shakeAmp > 0) this.shakeAmp = Math.max(0, this.shakeAmp - dt * 2.2);
    for (const g of this.grains) {
      g.vx += Math.sin(this.time * 2.5 + g.phase) * 0.006 * dt;
      g.vy += 0.55 * dt * 0.1;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.vx *= 0.95;
      g.vy *= 0.92;
      if (g.x < 0.16) {
        g.x = 0.16;
        g.vx *= -0.4;
      }
      if (g.x > 0.84) {
        g.x = 0.84;
        g.vx *= -0.4;
      }
      if (g.y < CAPSULE_FILL + 0.015) {
        g.y = CAPSULE_FILL + 0.015;
        g.vy = Math.abs(g.vy) * 0.2;
      }
      if (g.y > 0.92) {
        g.y = 0.92;
        g.vy *= -0.15;
      }
    }
  }
}

function pillPath(ctx, x, y, w, h) {
  const r = Math.min(w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0, false);
  ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + r, y + h - r, r, 0, Math.PI, false);
  ctx.closePath();
}

/**
 * رسم كبسولة juicy مطابقة لورقة الأصول
 */
function drawCapsule(ctx, x, y, w, h, typeId, powder, opts = {}) {
  const def = CAPSULE_TYPES[typeId];
  if (!def) return;

  const {
    selected = false,
    special = null,
    alpha = 1,
    scale = 1,
    highlight = 0,
    rotation = 0,
    squashX = 1,
    squashY = 1,
  } = opts;

  ctx.save();
  ctx.globalAlpha = alpha;
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.scale(scale * squashX, scale * squashY);
  ctx.translate(-cx, -cy);

  const { bw, bh, bx, by } = capsuleBounds(x, y, w, h);
  const baseSprite = getSprite(typeId, null);
  const specialSprite = special ? getSprite(typeId, special) : null;

  if (special === "rainbow" && spriteReady(specialSprite) && !PREFER_PROCEDURAL) {
    if (selected || highlight > 0) {
      ctx.shadowColor = def.glow;
      ctx.shadowBlur = selected ? 22 : 12;
    }
    ctx.drawImage(specialSprite, bx, by, bw, bh);
    ctx.shadowBlur = 0;
    ctx.restore();
    return;
  }

  // الرسوم المتجهة تطابق مرجع الزجاج+البودرة؛ الـ PNG اختياري فقط
  if (!PREFER_PROCEDURAL && spriteReady(baseSprite)) {
    ctx.beginPath();
    ctx.ellipse(cx, by + bh + h * 0.012, bw * 0.36, Math.max(2, h * 0.038), 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fill();
    if (selected || highlight > 0) {
      ctx.shadowColor = def.glow;
      ctx.shadowBlur = selected ? 22 : 12;
    }
    ctx.drawImage(baseSprite, bx, by, bw, bh);
    ctx.shadowBlur = 0;
    if (special) {
      drawSpecialOverlay(ctx, cx, cy, bw, bh, special, def, powder?.time || 0);
    }
    ctx.restore();
    return;
  }

  const p = def.powder;
  const shell = def.shell || ["#ffffff", p[1]];
  const t = powder?.time || 0;
  const shake = powder?.shakeAmp || 0;
  const jx = Math.sin(t * 30) * shake * w * 0.018;
  const jy = Math.cos(t * 26) * shake * h * 0.012;

  // ظل أرضي ناعم
  ctx.beginPath();
  ctx.ellipse(cx, by + bh + h * 0.02, bw * 0.42, Math.max(2.5, h * 0.045), 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fill();

  if (selected || highlight > 0 || special) {
    pillPath(ctx, bx - 5 + jx, by - 5 + jy, bw + 10, bh + 10);
    ctx.strokeStyle = def.glow;
    ctx.lineWidth = selected ? 6 : 4;
    ctx.shadowColor = def.glow;
    ctx.shadowBlur = selected ? 20 : 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // غلاف ملون زجاجي (مثل المرجع — ليس أبيض شفاف فقط)
  pillPath(ctx, bx + jx, by + jy, bw, bh);
  const shellGrad = ctx.createLinearGradient(bx, by, bx + bw, by);
  shellGrad.addColorStop(0, p[3]);
  shellGrad.addColorStop(0.2, p[2]);
  shellGrad.addColorStop(0.5, p[1]);
  shellGrad.addColorStop(0.8, p[2]);
  shellGrad.addColorStop(1, p[3]);
  ctx.fillStyle = shellGrad;
  ctx.fill();

  ctx.save();
  pillPath(ctx, bx + bw * 0.05 + jx, by + bh * 0.03 + jy, bw * 0.9, bh * 0.94);
  ctx.clip();

  // نصف علوي: زجاج شفاف ملوّن يظهر العمق
  const air = ctx.createLinearGradient(bx, by, bx, by + bh * CAPSULE_FILL);
  air.addColorStop(0, "rgba(255,255,255,0.75)");
  air.addColorStop(0.25, shell[1] + "99");
  air.addColorStop(0.7, p[2] + "44");
  air.addColorStop(1, p[2] + "22");
  ctx.fillStyle = air;
  ctx.fillRect(bx - 2, by - 2, bw + 4, bh * CAPSULE_FILL + 4);

  // نصف سفلي: بودرة لامعة متوهجة
  const fillY = by + bh * CAPSULE_FILL + Math.sin(t * 2) * bh * 0.005 + jy * 0.2;
  const body = ctx.createLinearGradient(bx, fillY, bx, by + bh);
  body.addColorStop(0, p[0]);
  body.addColorStop(0.12, p[1]);
  body.addColorStop(0.4, p[2]);
  body.addColorStop(0.72, p[3]);
  body.addColorStop(1, p[4] || p[3]);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(bx - 2, by + bh + 2);
  ctx.lineTo(bx - 2, fillY);
  for (let i = 0; i <= 16; i++) {
    const px = bx + (bw * i) / 16;
    const wave = Math.sin(i * 0.7 + t * 2.2) * bh * 0.012;
    ctx.lineTo(px, fillY + wave);
  }
  ctx.lineTo(bx + bw + 2, by + bh + 2);
  ctx.closePath();
  ctx.fill();

  // توهج داخلي
  const ig = ctx.createRadialGradient(cx, by + bh * 0.72, 1, cx, by + bh * 0.74, bw * 0.55);
  ig.addColorStop(0, "#ffffffaa");
  ig.addColorStop(0.35, p[1] + "88");
  ig.addColorStop(1, "transparent");
  ctx.fillStyle = ig;
  ctx.fillRect(bx, fillY, bw, bh);

  // glitter
  if (powder?.grains) {
    for (const g of powder.grains) {
      const gx = bx + g.x * bw + jx;
      const gy = by + g.y * bh + jy;
      const gr = Math.max(1, g.r * Math.min(bw, bh));
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      if (g.bright) {
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = alpha * (0.55 + 0.45 * Math.sin(t * 5 + g.phase));
      } else {
        const gg = ctx.createRadialGradient(gx - gr * 0.3, gy - gr * 0.3, 0, gx, gy, gr);
        gg.addColorStop(0, "#ffffff");
        gg.addColorStop(0.45, p[1]);
        gg.addColorStop(1, p[3]);
        ctx.fillStyle = gg;
        ctx.globalAlpha = alpha;
      }
      ctx.fill();
      ctx.globalAlpha = alpha;
    }
  }
  if (powder?.sparks) {
    for (const s of powder.sparks) {
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * s.speed + s.phase));
      const sx = bx + s.x * bw;
      const sy = by + s.y * bh;
      const sr = s.r * Math.min(bw, bh);
      ctx.globalAlpha = alpha * tw;
      ctx.fillStyle = "#fffde7";
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha;
    }
  }
  ctx.restore();

  // حافة زجاجية بيضاء + rim لوني
  pillPath(ctx, bx + jx, by + jy, bw, bh);
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = Math.max(2, bw * 0.06);
  ctx.stroke();
  pillPath(ctx, bx + jx, by + jy, bw, bh);
  ctx.strokeStyle = p[2] + "cc";
  ctx.lineWidth = Math.max(1, bw * 0.02);
  ctx.stroke();

  // خط التحام المنتصف
  ctx.save();
  pillPath(ctx, bx + jx, by + jy, bw, bh);
  ctx.clip();
  const seamY = by + bh * CAPSULE_FILL + jy;
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.1 + jx, seamY);
  ctx.lineTo(bx + bw * 0.9 + jx, seamY);
  ctx.strokeStyle = "rgba(30,40,60,0.4)";
  ctx.lineWidth = Math.max(1.5, w * 0.025);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.12 + jx, seamY - 1.5);
  ctx.lineTo(bx + bw * 0.88 + jx, seamY - 1.5);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  // speculars
  ctx.beginPath();
  ctx.ellipse(cx - bw * 0.16 + jx, by + bh * 0.16 + jy, bw * 0.16, bh * 0.08, -0.35, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + bw * 0.12 + jx, by + bh * 0.1 + jy, bw * 0.07, bh * 0.03, 0.3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.2 + jx, by + bh * 0.12 + jy);
  ctx.quadraticCurveTo(bx + bw * 0.08 + jx, by + bh * 0.5 + jy, bx + bw * 0.2 + jx, by + bh * 0.88 + jy);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = Math.max(1.5, bw * 0.05);
  ctx.lineCap = "round";
  ctx.stroke();

  if (special) drawSpecialOverlay(ctx, cx + jx, cy + jy, bw, bh, special, def, t);

  ctx.restore();
}

function drawSpecialOverlay(ctx, cx, cy, bw, bh, special, def, t) {
  ctx.save();
  if (special === "row" || special === "col") {
    // صاروخ طبي مصغّر
    const vert = special === "col";
    ctx.translate(cx, cy);
    if (!vert) ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#ff4d4d";
    ctx.beginPath();
    ctx.moveTo(0, -bh * 0.22);
    ctx.lineTo(bw * 0.12, bh * 0.08);
    ctx.lineTo(-bw * 0.12, bh * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(-bw * 0.06, bh * 0.02, bw * 0.12, bh * 0.14);
    ctx.fillStyle = "#ffb020";
    ctx.beginPath();
    ctx.moveTo(-bw * 0.05, bh * 0.16);
    ctx.lineTo(0, bh * 0.28 + Math.sin(t * 12) * 2);
    ctx.lineTo(bw * 0.05, bh * 0.16);
    ctx.fill();
  } else if (special === "bomb") {
    // قنبلة حيوية
    ctx.beginPath();
    ctx.arc(cx, cy, bw * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = "#2a6cff";
    ctx.fill();
    ctx.strokeStyle = "#ffd000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, bw * 0.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ffd000";
    ctx.font = `bold ${Math.max(10, bw * 0.2)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("☢", cx, cy + 1);
  } else if (special === "rainbow") {
    const colors = ["#ff4d6a", "#ffb020", "#3dff9a", "#3db8ff", "#c45cff"];
    colors.forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, bw * (0.28 - i * 0.04), Math.PI * 0.15, Math.PI * 0.85);
      ctx.strokeStyle = c;
      ctx.lineWidth = Math.max(2, bw * 0.04);
      ctx.stroke();
    });
  }
  ctx.restore();
}

/** رسم عقبة اللوحة — sprite 3D أو fallback */
function drawObstacle(ctx, x, y, w, h, typeId = "crate") {
  const img = obstacleCache.get(typeId) || obstacleCache.get("crate");
  const pad = Math.max(1, w * 0.02);
  const sx = x + pad;
  const sy = y + pad;
  const sw = w - pad * 2;
  const sh = h - pad * 2;
  if (spriteReady(img)) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h * 0.92, sw * 0.34, Math.max(2, h * 0.05), 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fill();
    ctx.shadowColor = "rgba(0,0,0,0.42)";
    ctx.shadowBlur = w * 0.1;
    ctx.shadowOffsetY = w * 0.05;
    ctx.drawImage(img, sx, sy, sw, sh);
    ctx.restore();
    return true;
  }
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  roundRectPath(ctx, x + pad, y + pad, w - pad * 2, h - pad * 2, w * 0.18);
  ctx.fill();
  ctx.strokeStyle = "rgba(126,240,216,0.25)";
  ctx.stroke();
  return false;
}
function drawBoardFrame(ctx, w, h, cell, gap, rows, cols, theme = null) {
  const gw = cols * cell + (cols - 1) * gap;
  const gh = rows * cell + (rows - 1) * gap;
  const ox = (w - gw) / 2;
  const oy = (h - gh) / 2;
  const c = theme?.colors || {};

  const pad = cell * 0.14;
  roundRectPath(ctx, ox - pad, oy - pad, gw + pad * 2, gh + pad * 2, cell * 0.32);
  const tray = ctx.createLinearGradient(0, oy - pad, 0, oy + gh + pad);
  tray.addColorStop(0, c.frameTop || "rgba(120, 190, 235, 0.92)");
  tray.addColorStop(1, c.frameBottom || "rgba(55, 130, 190, 0.95)");
  ctx.fillStyle = tray;
  ctx.fill();
  ctx.strokeStyle = c.frameBorder || "rgba(255, 214, 120, 0.85)";
  ctx.lineWidth = Math.max(2, cell * 0.06);
  ctx.stroke();

  for (let r = 0; r < rows; r++) {
    for (let cIdx = 0; cIdx < cols; cIdx++) {
      const x = ox + cIdx * (cell + gap);
      const y = oy + r * (cell + gap);
      const rr = cell * 0.22;
      roundRectPath(ctx, x + 1, y + 2, cell, cell, rr);
      ctx.fillStyle = "rgba(0,40,80,0.18)";
      ctx.fill();
      roundRectPath(ctx, x, y, cell, cell, rr);
      const light = (r + cIdx) % 2 === 0;
      ctx.fillStyle = light
        ? c.cellLight || "rgba(210, 240, 255, 0.92)"
        : c.cellDark || "rgba(150, 205, 240, 0.88)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }
  return { ox, oy, gw, gh };
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** رسم أيقونات المعززات — أسلوب Royal Match */
function drawBoosterIcon(ctx, kind, size) {
  ctx.clearRect(0, 0, size, size);
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const icon = kind === "syringe" ? "hammer" : kind === "spray" ? "rocket" : kind === "pulse" ? "bomb" : kind === "shuffle" ? "mix" : kind;

  if (icon === "hammer" || icon === "row") {
    ctx.save();
    ctx.translate(cx, cy - s * 0.02);
    ctx.rotate(-0.42);
    const hg = ctx.createLinearGradient(-s * 0.3, 0, s * 0.3, 0);
    hg.addColorStop(0, "#ff8a80");
    hg.addColorStop(0.5, "#e53935");
    hg.addColorStop(1, "#b71c1c");
    ctx.fillStyle = hg;
    roundRectPath(ctx, -s * 0.32, -s * 0.24, s * 0.64, s * 0.3, s * 0.07);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = s * 0.025;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${s * 0.2}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+", 0, -s * 0.08);
    const handle = ctx.createLinearGradient(0, s * 0.02, 0, s * 0.38);
    handle.addColorStop(0, "#64b5f6");
    handle.addColorStop(1, "#1565c0");
    ctx.fillStyle = handle;
    roundRectPath(ctx, -s * 0.08, s * 0.04, s * 0.16, s * 0.34, s * 0.05);
    ctx.fill();
    ctx.fillStyle = "#ffd54f";
    roundRectPath(ctx, -s * 0.11, s * 0.34, s * 0.22, s * 0.07, s * 0.03);
    ctx.fill();
    ctx.restore();
  } else if (icon === "rocket" || icon === "col") {
    ctx.save();
    ctx.translate(cx, cy + s * 0.02);
    const body = ctx.createLinearGradient(-s * 0.12, -s * 0.3, s * 0.12, s * 0.2);
    body.addColorStop(0, "#ffffff");
    body.addColorStop(0.4, "#ffcdd2");
    body.addColorStop(1, "#ef5350");
    ctx.fillStyle = "#ef5350";
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.34);
    ctx.lineTo(s * 0.17, s * 0.06);
    ctx.lineTo(-s * 0.17, s * 0.06);
    ctx.closePath();
    ctx.fill();
    roundRectPath(ctx, -s * 0.11, -s * 0.04, s * 0.22, s * 0.24, s * 0.05);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.fillStyle = "#ffd54f";
    ctx.beginPath();
    ctx.arc(0, s * 0.06, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = s * 0.018;
    ctx.beginPath();
    ctx.moveTo(-s * 0.04, -s * 0.12);
    ctx.lineTo(s * 0.04, -s * 0.12);
    ctx.stroke();
    const flame = ctx.createLinearGradient(0, s * 0.18, 0, s * 0.4);
    flame.addColorStop(0, "#ffeb3b");
    flame.addColorStop(1, "#ff5722");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(-s * 0.09, s * 0.2);
    ctx.quadraticCurveTo(0, s * 0.42 + Math.sin(Date.now() / 120) * s * 0.02, s * 0.09, s * 0.2);
    ctx.fill();
    ctx.restore();
  } else if (icon === "bomb" || icon === "pulse") {
    const g = ctx.createRadialGradient(cx - s * 0.12, cy - s * 0.08, 2, cx, cy + s * 0.02, s * 0.3);
    g.addColorStop(0, "#90caf9");
    g.addColorStop(0.55, "#1e88e5");
    g.addColorStop(1, "#0d47a1");
    ctx.beginPath();
    ctx.arc(cx, cy + s * 0.03, s * 0.27, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "#ffd600";
    ctx.lineWidth = s * 0.045;
    ctx.beginPath();
    ctx.arc(cx, cy + s * 0.03, s * 0.13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ffd600";
    ctx.font = `bold ${s * 0.18}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("☢", cx, cy + s * 0.04);
    ctx.strokeStyle = "#ffcc80";
    ctx.lineWidth = s * 0.028;
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.14, cy - s * 0.16);
    ctx.quadraticCurveTo(cx + s * 0.26, cy - s * 0.32, cx + s * 0.12, cy - s * 0.36);
    ctx.stroke();
    ctx.fillStyle = "#ff5722";
    ctx.beginPath();
    ctx.arc(cx + s * 0.12, cy - s * 0.36, s * 0.055, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === "mix") {
    ctx.save();
    ctx.translate(cx, cy);
    const jar = ctx.createLinearGradient(-s * 0.18, -s * 0.2, s * 0.18, s * 0.28);
    jar.addColorStop(0, "#b2ff59");
    jar.addColorStop(0.45, "#00e676");
    jar.addColorStop(1, "#00c853");
    roundRectPath(ctx, -s * 0.18, -s * 0.08, s * 0.36, s * 0.34, s * 0.06);
    ctx.fillStyle = jar;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = s * 0.02;
    ctx.stroke();
    ctx.fillStyle = "#cfd8dc";
    roundRectPath(ctx, -s * 0.2, -s * 0.18, s * 0.4, s * 0.12, s * 0.04);
    ctx.fill();
    ctx.fillStyle = "#78909c";
    ctx.fillRect(-s * 0.04, -s * 0.28, s * 0.08, s * 0.12);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = s * 0.022;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      ctx.beginPath();
      ctx.arc(0, s * 0.1, s * 0.1, a, a + 1.2);
      ctx.stroke();
    }
    ctx.restore();
  } else {
    drawBoosterIcon(ctx, "mix", size);
  }
}

/* ===== board.js ===== */
/**
 * منطق مطابقة ثلاثية بأسلوب Royal Match
 * مع قطع خاصة طبية وشلالات
 */
class Board {
  constructor(level) {
    this.level = level;
    this.rows = level.rows;
    this.cols = level.cols;
    this.types = level.types;
    this.grid = [];
    this.obstacles = new Map();
    this.blocked = new Set();
    for (const entry of level.blocked || []) {
      const { r, c, type } = parseBlockedEntry(entry);
      this.blocked.add(key(r, c));
      this.obstacles.set(key(r, c), type);
    }
    this.collected = Object.fromEntries(level.goals.map((g) => [g.type, 0]));
    this.busy = false;
    this.anim = [];
    this.onCascadeStep = null;
    this.onInvalidSwap = null;
    this.onBigMatch = null;
  }

  init() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        if (this.blocked.has(key(r, c))) {
          row.push(null);
          continue;
        }
        row.push(this._makeTile(r, c, this._randomTypeAvoiding(r, c)));
      }
      this.grid.push(row);
    }
    // تأكد من وجود حركة ممكنة
    if (!this.hasPossibleMove()) this.shuffle(true);
  }

  _makeTile(r, c, type, special = null) {
    return {
      id: `${r}-${c}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      special,
      powder: new CapsulePowder(type, r * 17 + c * 31),
      // مواقع الرسم (نسبية للخلية) للتحريك
      displayR: r,
      displayC: c,
      scale: 1,
      alpha: 1,
      pop: 0,
      tilt: 0,
      squashX: 1,
      squashY: 1,
      glowPulse: 0,
      landPulse: 0,
    };
  }

  _randomType() {
    return this.types[Math.floor(Math.random() * this.types.length)];
  }

  _randomTypeAvoiding(r, c) {
    let tries = 0;
    let t;
    do {
      t = this._randomType();
      tries++;
    } while (tries < 20 && this._wouldMatchAt(r, c, t));
    return t;
  }

  _wouldMatchAt(r, c, type) {
    // أفقي
    if (
      c >= 2 &&
      this.grid[r]?.[c - 1]?.type === type &&
      this.grid[r]?.[c - 2]?.type === type
    )
      return true;
    // عمودي
    if (
      r >= 2 &&
      this.grid[r - 1]?.[c]?.type === type &&
      this.grid[r - 2]?.[c]?.type === type
    )
      return true;
    return false;
  }

  inBounds(r, c) {
    return r >= 0 && c >= 0 && r < this.rows && c < this.cols;
  }

  get(r, c) {
    if (!this.inBounds(r, c)) return null;
    return this.grid[r][c];
  }

  isBlocked(r, c) {
    return this.blocked.has(key(r, c));
  }

  getObstacle(r, c) {
    return this.obstacles.get(key(r, c)) || null;
  }

  /** تبديل متجاور */
  async swap(r1, c1, r2, c2, animate) {
    if (this.busy) return false;
    if (!this._adjacent(r1, c1, r2, c2)) return false;
    const a = this.get(r1, c1);
    const b = this.get(r2, c2);
    if (!a || !b) return false;

    this.busy = true;
    this._swapCells(r1, c1, r2, c2);
    if (animate) await animate.swap(a, b, r1, c1, r2, c2);

    // قوس قزح + أي شيء
    if (a.special === "rainbow" || b.special === "rainbow") {
      await this._resolveRainbow(r1, c1, r2, c2, a, b, animate);
      this.busy = false;
      return true;
    }

    // قطعتان خاصتان معاً
    if (a.special && b.special) {
      await this._comboSpecials(r1, c1, r2, c2, a, b, animate);
      this.busy = false;
      return true;
    }

    const matches = this.findMatches();
    if (matches.size === 0) {
      this._swapCells(r1, c1, r2, c2);
      if (animate?.swapInvalid) {
        await animate.swapInvalid(a, b, r1, c1, r2, c2);
      } else if (animate) {
        await animate.swap(a, b, r2, c2, r1, c1);
      }
      this.onInvalidSwap?.();
      this.busy = false;
      return false;
    }

    await this._cascade(animate);
    this.busy = false;
    return true;
  }

  _adjacent(r1, c1, r2, c2) {
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
  }

  _swapCells(r1, c1, r2, c2) {
    const t = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = t;
    if (this.grid[r1][c1]) {
      this.grid[r1][c1].displayR = r1;
      this.grid[r1][c1].displayC = c1;
    }
    if (this.grid[r2][c2]) {
      this.grid[r2][c2].displayR = r2;
      this.grid[r2][c2].displayC = c2;
    }
  }

  findMatches() {
    const matched = new Set();
    // أفقي
    for (let r = 0; r < this.rows; r++) {
      let run = 1;
      for (let c = 1; c <= this.cols; c++) {
        const cur = this.get(r, c);
        const prev = this.get(r, c - 1);
        if (c < this.cols && cur && prev && cur.type === prev.type) {
          run++;
        } else {
          if (run >= 3 && prev) {
            for (let k = 0; k < run; k++) matched.add(key(r, c - 1 - k));
          }
          run = 1;
        }
      }
    }
    // عمودي
    for (let c = 0; c < this.cols; c++) {
      let run = 1;
      for (let r = 1; r <= this.rows; r++) {
        const cur = this.get(r, c);
        const prev = this.get(r - 1, c);
        if (r < this.rows && cur && prev && cur.type === prev.type) {
          run++;
        } else {
          if (run >= 3 && prev) {
            for (let k = 0; k < run; k++) matched.add(key(r - 1 - k, c));
          }
          run = 1;
        }
      }
    }
    return matched;
  }

  /** تحليل أشكال لإنشاء قطع خاصة */
  _analyzeSpecialCreation(matched) {
    // مجموعات متصلة حسب اللون
    const groups = this._groupMatches(matched);
    const creations = []; // {r,c,special,type}

    for (const group of groups) {
      if (group.length < 4) continue;
      const cells = group.map(parseKey);
      const type = this.get(cells[0].r, cells[0].c)?.type;
      if (!type) continue;

      const rows = {};
      const cols = {};
      for (const { r, c } of cells) {
        rows[r] = (rows[r] || 0) + 1;
        cols[c] = (cols[c] || 0) + 1;
      }
      const maxRow = Math.max(...Object.values(rows));
      const maxCol = Math.max(...Object.values(cols));
      const isLOrT = maxRow >= 3 && maxCol >= 3;
      const len = group.length;

      // موضع الإنشاء: مركز المجموعة تقريباً
      const mid = cells[Math.floor(cells.length / 2)];
      let special = null;
      if (len >= 5 && (maxRow >= 5 || maxCol >= 5)) special = "rainbow";
      else if (isLOrT || len >= 5) special = "bomb";
      else if (maxRow >= 4) special = "row";
      else if (maxCol >= 4) special = "col";
      else if (len === 4 && maxRow === 4) special = "row";
      else if (len === 4 && maxCol === 4) special = "col";

      if (special) creations.push({ r: mid.r, c: mid.c, special, type, keys: group });
    }
    return creations;
  }

  _groupMatches(matched) {
    const set = new Set(matched);
    const groups = [];
    const visited = new Set();

    for (const k of set) {
      if (visited.has(k)) continue;
      const { r: sr, c: sc } = parseKey(k);
      const type = this.get(sr, sc)?.type;
      if (!type) continue;
      const stack = [k];
      const group = [];
      visited.add(k);
      while (stack.length) {
        const cur = stack.pop();
        group.push(cur);
        const { r, c } = parseKey(cur);
        for (const [dr, dc] of [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ]) {
          const nk = key(r + dr, c + dc);
          if (!set.has(nk) || visited.has(nk)) continue;
          const t = this.get(r + dr, c + dc);
          if (t?.type === type) {
            visited.add(nk);
            stack.push(nk);
          }
        }
      }
      groups.push(group);
    }
    return groups;
  }

  async _cascade(animate) {
    let safety = 0;
    while (safety++ < 40) {
      let matched = this.findMatches();

      // فعّل القطع الخاصة ضمن المطابقة
      const toClear = new Set(matched);
      const queue = [...matched];
      while (queue.length) {
        const k = queue.pop();
        const { r, c } = parseKey(k);
        const tile = this.get(r, c);
        if (!tile?.special) continue;
        const extra = this._specialBlast(r, c, tile.special);
        for (const ek of extra) {
          if (!toClear.has(ek)) {
            toClear.add(ek);
            queue.push(ek);
          }
        }
      }

      if (toClear.size === 0) break;

      const creations = this._analyzeSpecialCreation(matched);
      const specialCreated = creations[0]?.special || null;
      this.onCascadeStep?.(toClear.size, specialCreated);
      if (matched.size >= 5) this.onBigMatch?.(matched.size);

      // اجمع الأهداف وحرّك البودرة
      for (const k of toClear) {
        const { r, c } = parseKey(k);
        const tile = this.get(r, c);
        if (!tile) continue;
        if (this.collected[tile.type] !== undefined) {
          this.collected[tile.type]++;
        }
        tile.powder?.shake(1.6);
      }

      if (animate) await animate.pop(toClear, this);

      // احذف
      for (const k of toClear) {
        const { r, c } = parseKey(k);
        // لا تحذف موضع الإنشاء الخاص بعد
        const keep = creations.find((cr) => cr.r === r && cr.c === c);
        if (keep) continue;
        this.grid[r][c] = null;
      }

      // أنشئ القطع الخاصة
      for (const cr of creations) {
        this.grid[cr.r][cr.c] = this._makeTile(cr.r, cr.c, cr.type, cr.special);
        if (animate) await animate.spawnSpecial?.(this.grid[cr.r][cr.c]);
      }

      await this._collapseAndFill(animate);
    }

    if (!this.hasPossibleMove()) {
      this.shuffle(true);
      if (animate) await animate.shuffleFx?.();
    }
  }

  _specialBlast(r, c, special) {
    const out = new Set();
    if (special === "row") {
      for (let cc = 0; cc < this.cols; cc++) if (!this.isBlocked(r, cc)) out.add(key(r, cc));
    } else if (special === "col") {
      for (let rr = 0; rr < this.rows; rr++) if (!this.isBlocked(rr, c)) out.add(key(rr, c));
    } else if (special === "bomb") {
      for (let rr = r - 1; rr <= r + 1; rr++) {
        for (let cc = c - 1; cc <= c + 1; cc++) {
          if (this.inBounds(rr, cc) && !this.isBlocked(rr, cc)) out.add(key(rr, cc));
        }
      }
    } else if (special === "rainbow") {
      // يُعالَج عند السحب
    }
    return out;
  }

  async _resolveRainbow(r1, c1, r2, c2, a, b, animate) {
    const rainbowIsA = a.special === "rainbow";
    const other = rainbowIsA ? b : a;
    const clearType = other.type;
    const toClear = new Set();
    toClear.add(key(r1, c1));
    toClear.add(key(r2, c2));
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const t = this.get(r, c);
        if (t && t.type === clearType) toClear.add(key(r, c));
      }
    }
    for (const k of toClear) {
      const { r, c } = parseKey(k);
      const tile = this.get(r, c);
      if (tile && this.collected[tile.type] !== undefined) this.collected[tile.type]++;
      tile?.powder?.shake(2);
    }
    if (animate) await animate.pop(toClear, this);
    for (const k of toClear) {
      const { r, c } = parseKey(k);
      this.grid[r][c] = null;
    }
    await this._collapseAndFill(animate);
    await this._cascade(animate);
  }

  async _comboSpecials(r1, c1, r2, c2, a, b, animate) {
    const toClear = new Set([key(r1, c1), key(r2, c2)]);
    // صف + عمود = صليب، قنبلة+أي = منطقة أكبر
    const specs = [a.special, b.special];
    if (specs.includes("bomb") || (specs.includes("row") && specs.includes("col"))) {
      for (let rr = Math.min(r1, r2) - 2; rr <= Math.max(r1, r2) + 2; rr++) {
        for (let cc = Math.min(c1, c2) - 2; cc <= Math.max(c1, c2) + 2; cc++) {
          if (this.inBounds(rr, cc) && !this.isBlocked(rr, cc)) toClear.add(key(rr, cc));
        }
      }
    } else {
      for (const [r, c, s] of [
        [r1, c1, a.special],
        [r2, c2, b.special],
      ]) {
        for (const k of this._specialBlast(r, c, s)) toClear.add(k);
      }
    }
    for (const k of toClear) {
      const { r, c } = parseKey(k);
      const tile = this.get(r, c);
      if (tile && this.collected[tile.type] !== undefined) this.collected[tile.type]++;
    }
    if (animate) await animate.pop(toClear, this);
    for (const k of toClear) {
      const { r, c } = parseKey(k);
      this.grid[r][c] = null;
    }
    await this._collapseAndFill(animate);
    await this._cascade(animate);
  }

  async _collapseAndFill(animate) {
    const moves = [];
    for (let c = 0; c < this.cols; c++) {
      let write = this.rows - 1;
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.isBlocked(r, c)) {
          write = r - 1;
          continue;
        }
        const tile = this.grid[r][c];
        if (tile) {
          if (r !== write) {
            this.grid[write][c] = tile;
            this.grid[r][c] = null;
            moves.push({ tile, fromR: r, fromC: c, toR: write, toC: c });
            tile.displayR = write;
            tile.displayC = c;
          }
          write--;
          while (write >= 0 && this.isBlocked(write, c)) write--;
        }
      }
      // ملء من الأعلى
      let spawn = 0;
      for (let r = write; r >= 0; r--) {
        if (this.isBlocked(r, c)) continue;
        const type = this._randomType();
        const tile = this._makeTile(r, c, type);
        tile.displayR = -1 - spawn;
        tile.displayC = c;
        this.grid[r][c] = tile;
        moves.push({ tile, fromR: -1 - spawn, fromC: c, toR: r, toC: c, spawn: true });
        tile.displayR = r;
        spawn++;
      }
    }
    if (animate && moves.length) await animate.fall(moves, this);
    else {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const t = this.grid[r][c];
          if (t) {
            t.displayR = r;
            t.displayC = c;
          }
        }
      }
    }
  }

  hasPossibleMove() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const t = this.get(r, c);
        if (!t) continue;
        if (t.special === "rainbow") return true;
        for (const [dr, dc] of [
          [0, 1],
          [1, 0],
        ]) {
          const r2 = r + dr;
          const c2 = c + dc;
          const u = this.get(r2, c2);
          if (!u) continue;
          this._swapCells(r, c, r2, c2);
          const ok = this.findMatches().size > 0 || t.special || u.special;
          this._swapCells(r, c, r2, c2);
          if (ok) return true;
        }
      }
    }
    return false;
  }

  shuffle(force = false) {
    const tiles = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const t = this.get(r, c);
        if (t) tiles.push(t);
      }
    }
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    let i = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.isBlocked(r, c)) continue;
        const t = tiles[i++];
        t.displayR = r;
        t.displayC = c;
        this.grid[r][c] = t;
      }
    }
    if (!force && this.findMatches().size) {
      // أعد إن وُجدت مطابقة فورية — تبسيط: استبدل الأنواع
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const t = this.get(r, c);
          if (!t || t.special) continue;
          if (this._wouldMatchAt(r, c, t.type)) {
            t.type = this._randomTypeAvoiding(r, c);
            t.powder.setType(t.type);
          }
        }
      }
    }
  }

  goalsDone() {
    return this.level.goals.every((g) => (this.collected[g.type] || 0) >= g.count);
  }

  goalProgress() {
    const done = this.level.goals.reduce(
      (s, g) => s + Math.min(g.count, this.collected[g.type] || 0),
      0
    );
    const total = this.level.goals.reduce((s, g) => s + g.count, 0);
    return { done, total };
  }

  /** معززات الطبيب */
  async useBooster(kind, r, c, animate) {
    if (this.busy) return false;
    this.busy = true;
    const toClear = new Set();
    if (kind === "syringe") {
      for (let cc = 0; cc < this.cols; cc++) if (!this.isBlocked(r, cc)) toClear.add(key(r, cc));
    } else if (kind === "spray") {
      for (let rr = 0; rr < this.rows; rr++) if (!this.isBlocked(rr, c)) toClear.add(key(rr, c));
    } else if (kind === "pulse") {
      for (let rr = r - 1; rr <= r + 1; rr++) {
        for (let cc = c - 1; cc <= c + 1; cc++) {
          if (this.inBounds(rr, cc) && !this.isBlocked(rr, cc)) toClear.add(key(rr, cc));
        }
      }
    } else if (kind === "shuffle") {
      this.shuffle(true);
      if (animate) await animate.shuffleFx?.();
      this.busy = false;
      return true;
    }

    for (const k of toClear) {
      const { r: rr, c: cc } = parseKey(k);
      const tile = this.get(rr, cc);
      if (tile && this.collected[tile.type] !== undefined) this.collected[tile.type]++;
    }
    if (animate) await animate.pop(toClear, this);
    for (const k of toClear) {
      const { r: rr, c: cc } = parseKey(k);
      this.grid[rr][cc] = null;
    }
    await this._collapseAndFill(animate);
    await this._cascade(animate);
    this.busy = false;
    return true;
  }
}
function key(r, c) {
  return `${r},${c}`;
}
function parseKey(k) {
  const [r, c] = k.split(",").map(Number);
  return { r, c };
}

/* ===== fx.js ===== */
/** جزيئات ومؤثرات اللوحة — بودرة، زجاج، حلقات، وميض */
class BoardFx {
  constructor() {
    this.particles = [];
    this.rings = [];
    this.flashes = [];
  }

  clear() {
    this.particles = [];
    this.rings = [];
    this.flashes = [];
  }

  update(dt) {
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.gravity ?? 220) * dt;
      p.vx *= p.drag ?? 0.985;
      if (p.spin) p.angle += p.spin * dt;
      return p.life > 0;
    });

    this.rings = this.rings.filter((r) => {
      r.life -= dt;
      r.radius += r.expand * dt;
      return r.life > 0;
    });

    this.flashes = this.flashes.filter((f) => {
      f.life -= dt;
      return f.life > 0;
    });
  }

  draw(ctx) {
    for (const f of this.flashes) {
      const a = Math.max(0, f.life / f.max) * f.alpha;
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.35, `rgba(255,255,255,${a * 0.35})`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const r of this.rings) {
      const a = Math.max(0, r.life / r.max);
      ctx.globalAlpha = a * 0.85;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = r.width * (1 - (1 - a) * 0.5);
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.max);
      ctx.globalAlpha = a * (p.alpha ?? 1);
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.angle) ctx.rotate(p.angle);
      if (p.kind === "shard") {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r * 0.35, p.r * 2, p.r * 0.7);
      } else if (p.kind === "star") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * Math.PI * 2;
          ctx.lineTo(Math.cos(ang) * p.r, Math.sin(ang) * p.r);
          ctx.lineTo(Math.cos(ang + Math.PI / 4) * p.r * 0.35, Math.sin(ang + Math.PI / 4) * p.r * 0.35);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  /** انفجار مطابقة — بودرة + زجاج + حلقة + وميض */
  burst(x, y, w, h, typeId, intensity = 1) {
    const def = CAPSULE_TYPES[typeId];
    const colors = def?.powder || ["#fff"];
    const cx = x + w / 2;
    const cy = y + h / 2;
    const base = 18 + intensity * 8;

    for (let i = 0; i < base; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 120 + Math.random() * 280 * intensity;
      this.particles.push({
        kind: "dust",
        x: cx,
        y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 40,
        r: 1.5 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.35 + Math.random() * 0.45,
        max: 0.8,
        gravity: 180,
        drag: 0.98,
      });
    }

    for (let i = 0; i < 8 + intensity * 2; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 80 + Math.random() * 200;
      this.particles.push({
        kind: "shard",
        x: cx,
        y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 30,
        r: 1.2 + Math.random() * 2.5,
        angle: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 14,
        color: Math.random() > 0.4 ? "#ffffff" : colors[1] + "cc",
        life: 0.28 + Math.random() * 0.3,
        max: 0.58,
        gravity: 140,
      });
    }

    for (let i = 0; i < 4 + intensity; i++) {
      const ang = Math.random() * Math.PI * 2;
      this.particles.push({
        kind: "star",
        x: cx,
        y: cy,
        vx: Math.cos(ang) * (60 + Math.random() * 120),
        vy: Math.sin(ang) * (60 + Math.random() * 120) - 50,
        r: 2 + Math.random() * 3,
        color: "#ffffff",
        life: 0.25 + Math.random() * 0.35,
        max: 0.6,
        gravity: 60,
        alpha: 0.9,
      });
    }

    this.rings.push({
      x: cx,
      y: cy,
      radius: w * 0.08,
      expand: w * 1.8,
      width: Math.max(2, w * 0.06),
      color: def?.glow || "rgba(255,255,255,0.8)",
      life: 0.32,
      max: 0.32,
    });

    this.flashes.push({
      x: cx,
      y: cy,
      radius: w * 0.55,
      alpha: 0.35 + intensity * 0.08,
      life: 0.14,
      max: 0.14,
    });
  }

  /** موجة ارتداد عند هبوط الكبسولة */
  landRipple(x, y, w, h, typeId) {
    const def = CAPSULE_TYPES[typeId];
    this.rings.push({
      x: x + w / 2,
      y: y + h * 0.85,
      radius: w * 0.12,
      expand: w * 0.9,
      width: Math.max(1.5, w * 0.035),
      color: def?.glow || "rgba(126,240,216,0.5)",
      life: 0.22,
      max: 0.22,
    });
  }

  /** خط سقوط خفيف */
  fallTrail(x, y, w, typeId) {
    const def = CAPSULE_TYPES[typeId];
    const colors = def?.powder || ["#fff"];
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        kind: "dust",
        x: x + w / 2 + (Math.random() - 0.5) * w * 0.3,
        y: y + w * 0.2,
        vx: (Math.random() - 0.5) * 20,
        vy: -30 - Math.random() * 40,
        r: 1 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)] + "aa",
        life: 0.18 + Math.random() * 0.12,
        max: 0.3,
        gravity: 40,
        alpha: 0.6,
      });
    }
  }
}

/* ===== juice.js ===== */
/**
 * محرّك juice — مؤثرات Royal Match: كومبو، اهتزاز، نصوص، وميض
 */
const COMBO_LABELS = [
  { min: 1, text: "جيد!", color: "#7ef0d8", scale: 0.85 },
  { min: 2, text: "رائع!", color: "#ffe082", scale: 1 },
  { min: 3, text: "ممتاز!", color: "#ffab40", scale: 1.1 },
  { min: 4, text: "مذهل!", color: "#ff7043", scale: 1.2 },
  { min: 5, text: "أسطوري!", color: "#ff4081", scale: 1.35 },
  { min: 6, text: "شفاء كامل!", color: "#ffd54f", scale: 1.5 },
];

const SPECIAL_LABELS = {
  row: "جرعة صفّية!",
  col: "جرعة عمودية!",
  bomb: "جرعة مركّزة!",
  rainbow: "قوس قزح!",
};
class JuiceEngine {
  constructor(layerEl, boardWrapEl) {
    this.layer = layerEl;
    this.boardWrap = boardWrapEl;
    this.combo = 0;
    this.comboDecay = null;
    this.shakeAmp = 0;
    this.shakeDecay = 8;
    this.flashAlpha = 0;
    this.running = false;
    this.lastTs = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTs = performance.now();
    const loop = (ts) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
      this.lastTs = ts;
      this._update(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    this.resetCombo();
  }

  resetCombo() {
    this.combo = 0;
    if (this.comboDecay) clearTimeout(this.comboDecay);
    this.comboDecay = null;
  }

  /** خطوة شلال — يزيد الكومبو ويعرض النص */
  onCascadeStep(matchCount, specialCreated = null) {
    this.combo++;
    const label = COMBO_LABELS[Math.min(this.combo - 1, COMBO_LABELS.length - 1)];
    const text = specialCreated ? SPECIAL_LABELS[specialCreated] || label.text : label.text;
    this._spawnComboText(text, label.color, label.scale + Math.min(matchCount, 6) * 0.04);
    this._shake(Math.min(4 + this.combo * 1.8 + matchCount * 0.3, 14));
    this._flash(0.08 + Math.min(this.combo * 0.02, 0.12));

    if (this.comboDecay) clearTimeout(this.comboDecay);
    this.comboDecay = setTimeout(() => this.resetCombo(), 1400);
  }

  onBigMatch(matchCount) {
    if (matchCount >= 5) {
      this._spawnComboText("مطابقة ضخمة!", "#ffd54f", 1.25);
      this._shake(10);
    }
  }

  onInvalidSwap() {
    this.resetCombo();
    this._shake(5);
    if (this.boardWrap) {
      this.boardWrap.classList.remove("board-wobble");
      void this.boardWrap.offsetWidth;
      this.boardWrap.classList.add("board-wobble");
      setTimeout(() => this.boardWrap?.classList.remove("board-wobble"), 420);
    }
  }

  onGoalComplete() {
    this._spawnComboText("هدف مكتمل!", "#7ef0d8", 1.05, true);
    this._flash(0.15);
  }

  onLevelWin() {
    this._spawnComboText("شُفي المريض!", "#ffd54f", 1.4, true);
    this._shake(8);
    this._flash(0.2);
  }

  getShakeOffset() {
    if (this.shakeAmp < 0.3) return { x: 0, y: 0 };
    const a = this.shakeAmp;
    return {
      x: (Math.random() - 0.5) * a * 2,
      y: (Math.random() - 0.5) * a * 2,
    };
  }

  getFlashAlpha() {
    return this.flashAlpha;
  }

  _shake(amp) {
    this.shakeAmp = Math.max(this.shakeAmp, amp);
  }

  _flash(alpha) {
    this.flashAlpha = Math.max(this.flashAlpha, alpha);
  }

  _update(dt) {
    this.shakeAmp = Math.max(0, this.shakeAmp - this.shakeDecay * dt * 60);
    this.flashAlpha = Math.max(0, this.flashAlpha - dt * 2.5);
  }

  _spawnComboText(text, color, scale = 1, center = false) {
    if (!this.layer) return;
    const el = document.createElement("div");
    el.className = "juice-combo" + (center ? " juice-combo--center" : "");
    el.textContent = text;
    el.style.setProperty("--combo-color", color);
    el.style.setProperty("--combo-scale", String(scale));
    if (!center) {
      el.style.left = `${35 + Math.random() * 30}%`;
      el.style.top = `${38 + Math.random() * 12}%`;
    }
    this.layer.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
    setTimeout(() => el.remove(), 1200);
  }
}

/* ===== scenes.js ===== */
/**
 * مشاهد غرف العلاج — خلفيات مرسومة لكل ثيم ومرحلة (أسلوب Royal Match)
 */

const ROOMS = {
  neighborhood: {
    wallTop: "#7ec8e3",
    wallBottom: "#4a8fa8",
    trim: "#d4af6a",
    floor: "#b8884a",
    floorDark: "#8a6230",
    ceiling: "#e8f4f8",
    light: "rgba(255,248,220,0.35)",
    window: true,
    plants: true,
  },
  children: {
    wallTop: "#c48ad4",
    wallBottom: "#9b5fb0",
    trim: "#ffd54f",
    floor: "#f5c882",
    floorDark: "#d4a055",
    ceiling: "#fff3e0",
    light: "rgba(255,200,255,0.3)",
    window: true,
    balloons: true,
  },
  emergency: {
    wallTop: "#8b3030",
    wallBottom: "#5a1818",
    trim: "#ffc107",
    floor: "#6a6a72",
    floorDark: "#454550",
    ceiling: "#eceff1",
    light: "rgba(255,100,80,0.25)",
    cross: true,
    monitors: true,
  },
  research: {
    wallTop: "#3d5a8a",
    wallBottom: "#243d6a",
    trim: "#18ffff",
    floor: "#546e7a",
    floorDark: "#37474f",
    ceiling: "#cfd8dc",
    light: "rgba(100,200,255,0.28)",
    lab: true,
    screens: true,
  },
};

/** رسم مشهد الغرفة الكامل */
function drawClinicScene(ctx, w, h, theme, level) {
  const room = ROOMS[theme.id] || ROOMS.neighborhood;
  const props = level.sceneProps || theme.decor || [];

  ctx.clearRect(0, 0, w, h);

  const floorY = h * 0.68;
  const wallH = floorY;

  // سقف
  const ceil = ctx.createLinearGradient(0, 0, 0, wallH * 0.18);
  ceil.addColorStop(0, room.ceiling);
  ceil.addColorStop(1, room.wallTop);
  ctx.fillStyle = ceil;
  ctx.fillRect(0, 0, w, wallH * 0.12);

  // إضاءة سقف (skylight)
  ctx.fillStyle = room.light;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, wallH * 0.08, w * 0.35, wallH * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // جدار خلفي
  const wall = ctx.createLinearGradient(0, wallH * 0.1, 0, floorY);
  wall.addColorStop(0, room.wallTop);
  wall.addColorStop(1, room.wallBottom);
  ctx.fillStyle = wall;
  ctx.fillRect(0, wallH * 0.1, w, floorY - wallH * 0.1);

  // إطار ذهبي (wainscoting) — مثل Royal Match
  drawWallPanels(ctx, w, wallH, room);

  // نافذة
  if (room.window) {
    drawWindow(ctx, w * 0.12, wallH * 0.22, w * 0.28, wallH * 0.32, theme.id);
  }

  // أرضية خشبية
  drawWoodFloor(ctx, w, h, floorY, room);

  // دعائم الثيم
  if (room.plants) drawPlant(ctx, w * 0.82, floorY - h * 0.08, h * 0.12);
  if (room.balloons) drawBalloons(ctx, w * 0.78, wallH * 0.2, h * 0.08);
  if (room.cross) drawMedicalCross(ctx, w * 0.85, wallH * 0.25, h * 0.1);
  if (room.monitors) drawMonitor(ctx, w * 0.08, wallH * 0.28, w * 0.22, h * 0.08);
  if (room.lab) drawLabShelf(ctx, w * 0.78, wallH * 0.22, w * 0.18, h * 0.25);
  if (room.screens) drawLabScreen(ctx, w * 0.06, wallH * 0.3, w * 0.2, h * 0.1);

  // دعائم القصة لكل مرحلة
  drawStoryProps(ctx, w, h, floorY, props, level);

  // تظليل خفيف أسفل اللوحة
  const vignette = ctx.createRadialGradient(w * 0.5, h * 0.55, w * 0.2, w * 0.5, h * 0.55, w * 0.65);
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function drawWallPanels(ctx, w, wallH, room) {
  const panelY = wallH * 0.38;
  const panelH = wallH * 0.42;

  // شريط ذهبي علوي
  ctx.fillStyle = room.trim;
  ctx.fillRect(0, panelY - 4, w, 5);
  ctx.fillRect(0, panelY + panelH + 2, w, 4);

  // لوحات الجدار
  const cols = 3;
  const gap = w * 0.04;
  const pw = (w - gap * (cols + 1)) / cols;
  for (let i = 0; i < cols; i++) {
    const px = gap + i * (pw + gap);
    const pg = ctx.createLinearGradient(px, panelY, px, panelY + panelH);
    pg.addColorStop(0, "rgba(255,255,255,0.12)");
    pg.addColorStop(1, "rgba(0,0,0,0.08)");
    ctx.fillStyle = pg;
    roundRect(ctx, px, panelY, pw, panelH, 6);
    ctx.fill();
    ctx.strokeStyle = room.trim + "88";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawWindow(ctx, x, y, ww, wh, themeId) {
  ctx.fillStyle = "#5d4037";
  roundRect(ctx, x - 4, y - 4, ww + 8, wh + 8, 4);
  ctx.fill();

  const sky = ctx.createLinearGradient(x, y, x, y + wh);
  if (themeId === "children") {
    sky.addColorStop(0, "#81d4fa");
    sky.addColorStop(1, "#fff9c4");
  } else {
    sky.addColorStop(0, "#87ceeb");
    sky.addColorStop(1, "#b2dfdb");
  }
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, ww, wh);

  // تقسيم النافذة
  ctx.strokeStyle = "#5d4037";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + ww / 2, y);
  ctx.lineTo(x + ww / 2, y + wh);
  ctx.moveTo(x, y + wh / 2);
  ctx.lineTo(x + ww, y + wh / 2);
  ctx.stroke();

  // شمس/سحب
  ctx.fillStyle = "rgba(255,235,59,0.8)";
  ctx.beginPath();
  ctx.arc(x + ww * 0.7, y + wh * 0.25, wh * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function drawWoodFloor(ctx, w, h, floorY, room) {
  const fg = ctx.createLinearGradient(0, floorY, 0, h);
  fg.addColorStop(0, room.floor);
  fg.addColorStop(1, room.floorDark);
  ctx.fillStyle = fg;
  ctx.fillRect(0, floorY, w, h - floorY);

  // خطوط الخشب
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 1;
  const plankW = w / 8;
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(i * plankW, floorY);
    ctx.lineTo(i * plankW, h);
    ctx.stroke();
  }
  // خطوط أفقية
  for (let j = 0; j < 4; j++) {
    const py = floorY + ((h - floorY) / 4) * j;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(w, py);
    ctx.stroke();
  }

  // انعكاس
  const shine = ctx.createLinearGradient(0, floorY, 0, floorY + 30);
  shine.addColorStop(0, "rgba(255,255,255,0.15)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fillRect(0, floorY, w, 30);
}

function drawPlant(ctx, x, y, size) {
  ctx.fillStyle = "#795548";
  ctx.fillRect(x - size * 0.15, y, size * 0.3, size * 0.5);
  ctx.fillStyle = "#2e7d32";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * size * 0.3, y - size * 0.1 + Math.sin(a) * size * 0.2, size * 0.22, size * 0.14, a, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBalloons(ctx, x, y, size) {
  const colors = ["#ff5252", "#ffd54f", "#69f0ae", "#448aff"];
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(x + (i - 1.5) * size * 0.5, y + i * size * 0.15, size * 0.22, size * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function drawMedicalCross(ctx, x, y, size) {
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  roundRect(ctx, x - size * 0.5, y - size * 0.5, size, size, size * 0.1);
  ctx.fill();
  ctx.fillStyle = "#ff5252";
  ctx.fillRect(x - size * 0.35, y - size * 0.1, size * 0.7, size * 0.2);
  ctx.fillRect(x - size * 0.1, y - size * 0.35, size * 0.2, size * 0.7);
}

function drawMonitor(ctx, x, y, ww, wh) {
  ctx.fillStyle = "#37474f";
  roundRect(ctx, x, y, ww, wh, 4);
  ctx.fill();
  ctx.fillStyle = "#1b5e20";
  ctx.fillRect(x + 4, y + 4, ww - 8, wh - 8);
  // خط نبض
  ctx.strokeStyle = "#69f0ae";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + wh * 0.6);
  for (let i = 0; i < 8; i++) {
    const px = x + 6 + (i / 7) * (ww - 12);
    const py = y + wh * 0.6 + (i % 2 === 0 ? -wh * 0.25 : wh * 0.1);
    ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function drawLabShelf(ctx, x, y, ww, wh) {
  ctx.fillStyle = "#78909c";
  ctx.fillRect(x, y, ww, wh * 0.06);
  ctx.fillRect(x, y + wh * 0.45, ww, wh * 0.06);
  const tubeColors = ["#e53935", "#1e88e5", "#43a047", "#fdd835"];
  tubeColors.forEach((c, i) => {
    const tx = x + ww * 0.15 + i * ww * 0.2;
    ctx.fillStyle = c + "cc";
    ctx.fillRect(tx, y + wh * 0.1, ww * 0.1, wh * 0.32);
    ctx.fillStyle = "#cfd8dc";
    ctx.fillRect(tx - 2, y + wh * 0.08, ww * 0.1 + 4, wh * 0.04);
  });
}

function drawLabScreen(ctx, x, y, ww, wh) {
  ctx.fillStyle = "#263238";
  roundRect(ctx, x, y, ww, wh, 4);
  ctx.fill();
  ctx.fillStyle = "#0d47a1";
  ctx.fillRect(x + 3, y + 3, ww - 6, wh - 6);
  ctx.fillStyle = "rgba(24,255,255,0.6)";
  ctx.font = `${wh * 0.35}px monospace`;
  ctx.fillText("DNA", x + ww * 0.25, y + wh * 0.65);
}

function drawStoryProps(ctx, w, h, floorY, props, level) {
  if (!props.length) return;
  const startX = w * 0.38;
  const y = floorY - h * 0.06;
  props.slice(0, 4).forEach((prop, i) => {
    const px = startX + i * w * 0.14;
    ctx.font = `${h * 0.055}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.fillText(prop, px, y);
    ctx.shadowBlur = 0;
  });

  // شريط القصة
  if (level.condition) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    roundRect(ctx, w * 0.15, wallHint(floorY) - h * 0.04, w * 0.7, h * 0.045, h * 0.015);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = `600 ${h * 0.028}px Cairo, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`${level.patient} — ${level.condition}`, w * 0.5, wallHint(floorY) - h * 0.018);
  }
}

function wallHint(floorY) {
  return floorY;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** رسم مشهد شاشة القصة */
function drawStoryScene(ctx, w, h, theme, level) {
  drawClinicScene(ctx, w, h, theme, level);
  const overlay = ctx.createLinearGradient(0, h * 0.3, 0, h);
  overlay.addColorStop(0, "rgba(0,0,0,0.1)");
  overlay.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, w, h);
}

/* ===== view.js ===== */
/**
 * محرّك الرسم والحركة — حركة كبسولات juicy + مؤثرات اللوحة
 */
class BoardView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.board = null;
    this.selected = null;
    this.cell = 80;
    this.gap = 6;
    this.boardFx = new BoardFx();
    this.running = false;
    this.lastTs = 0;
    this.time = 0;
    this.onSwap = null;
    this.onCellTap = null;
    this.boosterMode = null;
    this.theme = null;
    this.juice = null;
    this._bindInput();
    if (typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver(() => this._resize());
    }
  }

  setTheme(theme) {
    this.theme = theme;
  }

  setBoard(board) {
    this.board = board;
    this.selected = null;
    this.boardFx.clear();
    this._initTileMotion();
    this._resize();
    if (this._ro && this.canvas.parentElement) {
      this._ro.disconnect();
      this._ro.observe(this.canvas.parentElement);
    }
  }

  _initTileMotion() {
    if (!this.board) return;
    for (let r = 0; r < this.board.rows; r++) {
      for (let c = 0; c < this.board.cols; c++) {
        const t = this.board.get(r, c);
        if (t) this._resetTileMotion(t);
      }
    }
  }

  _resetTileMotion(tile) {
    tile.tilt = 0;
    tile.squashX = 1;
    tile.squashY = 1;
    tile.glowPulse = 0;
    tile.landPulse = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTs = performance.now();
    const loop = (ts) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
      this.lastTs = ts;
      this.time += dt;
      this._update(dt);
      this._draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }

  _resize() {
    if (!this.board) return;
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    const wrap = this.canvas.parentElement;
    const pad = 8;
    const availW = Math.max(80, (wrap?.clientWidth || 320) - pad);
    const availH = Math.max(80, (wrap?.clientHeight || 320) - pad);
    const size = Math.floor(Math.min(availW, availH, 520));
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.canvas.width = Math.floor(size * dpr);
    this.canvas.height = Math.floor(size * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cssSize = size;
    const maxDim = Math.max(this.board.rows, this.board.cols);
    this.gap = Math.max(2, size * 0.006);
    this.cell = (size - this.gap * (maxDim + 1) - size * 0.012) / maxDim;
  }

  cellAt(r, c) {
    const ox = (this.cssSize - (this.board.cols * this.cell + (this.board.cols - 1) * this.gap)) / 2;
    const oy = (this.cssSize - (this.board.rows * this.cell + (this.board.rows - 1) * this.gap)) / 2;
    return {
      x: ox + c * (this.cell + this.gap),
      y: oy + r * (this.cell + this.gap),
      w: this.cell,
      h: this.cell,
      ox,
      oy,
    };
  }

  _update(dt) {
    if (!this.board) return;
    for (let r = 0; r < this.board.rows; r++) {
      for (let c = 0; c < this.board.cols; c++) {
        const t = this.board.get(r, c);
        if (!t) continue;
        if (t.powder) t.powder.update(dt);
        if (t.pop > 0) t.pop = Math.max(0, t.pop - dt * 5);
        if (t.glowPulse > 0) t.glowPulse = Math.max(0, t.glowPulse - dt * 2.2);
        if (t.landPulse > 0) t.landPulse = Math.max(0, t.landPulse - dt * 3.5);
        // رجوع تدريجي للميل والانضغاط
        t.tilt = (t.tilt || 0) * (1 - dt * 12);
        const sx = t.squashX ?? 1;
        const sy = t.squashY ?? 1;
        t.squashX = sx + (1 - sx) * Math.min(1, dt * 14);
        t.squashY = sy + (1 - sy) * Math.min(1, dt * 14);
      }
    }
    this.boardFx.update(dt);
  }

  _draw() {
    if (!this.board) return;
    const ctx = this.ctx;
    const s = this.cssSize;
    const shake = this.juice?.getShakeOffset() || { x: 0, y: 0 };
    ctx.clearRect(0, 0, s, s);
    ctx.save();
    ctx.translate(shake.x, shake.y);

    const bg = ctx.createRadialGradient(s * 0.5, s * 0.5, s * 0.15, s * 0.5, s * 0.5, s * 0.55);
    bg.addColorStop(0, "rgba(0,0,0,0.08)");
    bg.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    drawBoardFrame(ctx, s, s, this.cell, this.gap, this.board.rows, this.board.cols, this.theme);

    for (let r = 0; r < this.board.rows; r++) {
      for (let c = 0; c < this.board.cols; c++) {
        if (!this.board.isBlocked(r, c)) continue;
        const { x, y, w, h } = this.cellAt(r, c);
        const obsType = this.board.getObstacle(r, c) || "crate";
        drawObstacle(ctx, x, y, w, h, obsType);
      }
    }

    // ترتيب الرسم: صفوف من الأسفل للأعلى (عمق بصري)
    const tiles = [];
    for (let r = 0; r < this.board.rows; r++) {
      for (let c = 0; c < this.board.cols; c++) {
        const tile = this.board.get(r, c);
        if (!tile) continue;
        tiles.push({ tile, r, c });
      }
    }
    tiles.sort((a, b) => {
      const da = a.tile.displayR ?? a.r;
      const db = b.tile.displayR ?? b.r;
      return da - db;
    });

    for (const { tile, r, c } of tiles) {
      const dr = tile.displayR ?? r;
      const dc = tile.displayC ?? c;
      const { x, y, w, h } = this.cellAt(dr, dc);
      const sel = this.selected && this.selected.r === r && this.selected.c === c;
      const bob = sel ? Math.sin(this.time * 7) * w * 0.018 : 0;
      const popBoost = (tile.pop || 0) * 0.18;
      const landBoost = (tile.landPulse || 0) * 0.06;
      const sc = tile.scale * (sel ? 1.08 : 1) * (1 + popBoost + landBoost);
      const highlight = (tile.glowPulse || 0) + (sel ? 0.35 + Math.sin(this.time * 8) * 0.15 : 0);

      drawCapsule(ctx, x, y + bob, w, h, tile.type, tile.powder, {
        selected: sel,
        special: tile.special,
        alpha: tile.alpha ?? 1,
        scale: sc,
        highlight,
        rotation: tile.tilt || 0,
        squashX: tile.squashX ?? 1,
        squashY: tile.squashY ?? 1,
      });
    }

    this.boardFx.draw(ctx);

    const flash = this.juice?.getFlashAlpha() || 0;
    if (flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${flash})`;
      ctx.fillRect(0, 0, s, s);
    }
    ctx.restore();
  }

  burstAt(r, c, type, intensity = 1) {
    const { x, y, w, h } = this.cellAt(r, c);
    this.boardFx.burst(x, y, w, h, type, intensity);
  }

  createAnimator() {
    const view = this;

    return {
      async swap(a, b, r1, c1, r2, c2) {
        const fromA = { r: r1, c: c1 };
        const fromB = { r: r2, c: c2 };
        const dr = r2 - r1;
        const dc = c2 - c1;
        a.powder?.shake(0.35);
        b.powder?.shake(0.35);

        await tween(190, (t) => {
          const e = easeOutBack(t, 1.4);
          a.displayR = fromA.r + dr * e;
          a.displayC = fromA.c + dc * e;
          b.displayR = fromB.r - dr * e;
          b.displayC = fromB.c - dc * e;
          const tilt = (1 - Math.abs(t - 0.5) * 2) * 0.12;
          a.tilt = dc !== 0 ? tilt * Math.sign(dc) : 0;
          b.tilt = dc !== 0 ? -tilt * Math.sign(dc) : dr !== 0 ? -tilt * Math.sign(dr) : 0;
          const sq = 1 + Math.sin(t * Math.PI) * 0.06;
          a.squashX = sq;
          a.squashY = 2 - sq;
          b.squashX = sq;
          b.squashY = 2 - sq;
        }, easeOutCubic);

        a.displayR = r2;
        a.displayC = c2;
        b.displayR = r1;
        b.displayC = c1;
        view._resetTileMotion(a);
        view._resetTileMotion(b);
      },

      async swapInvalid(a, b, r1, c1, r2, c2) {
        const fromA = { r: r1, c: c1 };
        const fromB = { r: r2, c: c2 };
        const dr = r2 - r1;
        const dc = c2 - c1;

        await tween(130, (t) => {
          const e = easeOutCubic(t) * 0.55;
          a.displayR = fromA.r + dr * e;
          a.displayC = fromA.c + dc * e;
          b.displayR = fromB.r - dr * e;
          b.displayC = fromB.c - dc * e;
        });

        await tween(220, (t) => {
          const e = easeOutElastic(t);
          a.displayR = fromA.r + dr * 0.55 * (1 - e);
          a.displayC = fromA.c + dc * 0.55 * (1 - e);
          b.displayR = fromB.r - dr * 0.55 * (1 - e);
          b.displayC = fromB.c - dc * 0.55 * (1 - e);
          const wobble = Math.sin(t * Math.PI * 3) * (1 - t) * 0.08;
          a.tilt = wobble;
          b.tilt = -wobble;
        });

        a.displayR = r1;
        a.displayC = c1;
        b.displayR = r2;
        b.displayC = c2;
        view._resetTileMotion(a);
        view._resetTileMotion(b);
        a.powder?.shake(0.8);
        b.powder?.shake(0.8);
      },

      async pop(keys, board) {
        const list = [...keys];
        const intensity = Math.min(3, 1 + list.length * 0.08);

        for (const k of list) {
          const { r, c } = parseKey(k);
          const tile = board.get(r, c);
          if (!tile) continue;
          tile.pop = 1;
          tile.glowPulse = 1;
          view.burstAt(r, c, tile.type, intensity);
        }

        await tween(240, (t) => {
          const popScale = t < 0.22 ? 1 + (t / 0.22) * 0.14 : 1.14 - ((t - 0.22) / 0.78) * 1.0;
          for (const k of list) {
            const { r, c } = parseKey(k);
            const tile = board.get(r, c);
            if (!tile) continue;
            tile.scale = popScale;
            tile.alpha = 1 - easeInOutCubic(Math.max(0, (t - 0.12) / 0.88));
            tile.glowPulse = Math.max(0, 1 - t * 1.2);
          }
        });
      },

      async fall(moves) {
        if (!moves.length) return;

        const byCol = {};
        for (const m of moves) {
          byCol[m.toC] = byCol[m.toC] || [];
          byCol[m.toC].push(m);
        }
        for (const col of Object.values(byCol)) {
          col.sort((a, b) => b.toR - a.toR);
        }

        for (const m of moves) {
          m.tile.displayR = m.fromR;
          m.tile.displayC = m.fromC;
          m.tile.scale = m.spawn ? 0.65 : 1;
          m.tile.alpha = m.spawn ? 0 : 1;
        }

        const baseMs = 180;
        const perCell = 38;

        await Promise.all(
          moves.map((m) => {
            const dist = Math.abs(m.toR - m.fromR);
            const colMoves = byCol[m.toC] || [];
            const staggerIdx = colMoves.indexOf(m);
            const delay = staggerIdx * 28;
            const duration = baseMs + dist * perCell;

            return new Promise((resolve) => {
              setTimeout(() => {
                let lastT = 0;
                tween(duration, (t) => {
                  const fallT = easeFall(t);
                  m.tile.displayR = m.fromR + (m.toR - m.fromR) * fallT;
                  m.tile.displayC = m.fromC + (m.toC - m.fromC) * t;
                  if (m.spawn) {
                    m.tile.alpha = Math.min(1, t * 1.6);
                    m.tile.scale = 0.65 + t * 0.35;
                  }
                  const { x, y, w } = view.cellAt(m.tile.displayR, m.tile.displayC);
                  if (t > lastT + 0.08) {
                    view.boardFx.fallTrail(x, y, w, m.tile.type);
                    lastT = t;
                  }
                  if (t > 0.75) {
                    const sq = squashStretch(t);
                    m.tile.squashX = sq.sx;
                    m.tile.squashY = sq.sy;
                  }
                }).then(resolve);
              }, delay);
            });
          })
        );

        for (const m of moves) {
          m.tile.displayR = m.toR;
          m.tile.displayC = m.toC;
          m.tile.alpha = 1;
          m.tile.scale = 1;
          m.tile.powder?.shake(0.55);
          const { x, y, w, h } = view.cellAt(m.toR, m.toC);
          view.boardFx.landRipple(x, y, w, h, m.tile.type);
          view._resetTileMotion(m.tile);
          m.tile.landPulse = 1;
        }
      },

      async spawnSpecial(tile) {
        tile.scale = 0.15;
        tile.alpha = 0.5;
        tile.glowPulse = 1;
        await tween(280, (t) => {
          const e = easeOutBack(t, 2);
          tile.scale = 0.15 + 0.85 * e;
          tile.alpha = 0.5 + 0.5 * t;
          tile.glowPulse = 1 - t * 0.5;
        });
        tile.scale = 1;
        tile.alpha = 1;
        tile.glowPulse = 0.4;
      },

      async shuffleFx() {
        await tween(340, (t) => {
          if (!view.board) return;
          const wave = Math.sin(t * Math.PI);
          for (let r = 0; r < view.board.rows; r++) {
            for (let c = 0; c < view.board.cols; c++) {
              const tile = view.board.get(r, c);
              if (!tile) continue;
              tile.scale = 0.82 + wave * 0.18;
              tile.tilt = Math.sin(t * Math.PI * 2 + (r + c) * 0.7) * 0.06 * wave;
            }
          }
        });
        view._initTileMotion();
      },
    };
  }

  _bindInput() {
    const pos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * this.cssSize,
        y: ((clientY - rect.top) / rect.height) * this.cssSize,
      };
    };

    const hit = (p) => {
      if (!this.board) return null;
      for (let r = 0; r < this.board.rows; r++) {
        for (let c = 0; c < this.board.cols; c++) {
          if (this.board.isBlocked(r, c)) continue;
          const cell = this.cellAt(r, c);
          if (p.x >= cell.x && p.x <= cell.x + cell.w && p.y >= cell.y && p.y <= cell.y + cell.h) {
            return { r, c };
          }
        }
      }
      return null;
    };

    let down = null;

    const onDown = (e) => {
      if (this.board?.busy) return;
      e.preventDefault();
      down = hit(pos(e));
      if (!down) return;

      if (this.boosterMode) {
        this.onCellTap?.(down.r, down.c, this.boosterMode);
        return;
      }

      if (this.selected) {
        const s = this.selected;
        if (s.r === down.r && s.c === down.c) {
          this.selected = null;
          return;
        }
        if (Math.abs(s.r - down.r) + Math.abs(s.c - down.c) === 1) {
          this.onSwap?.(s.r, s.c, down.r, down.c);
          this.selected = null;
          return;
        }
      }
      this.selected = down;
      const tile = this.board.get(down.r, down.c);
      tile?.powder?.shake(0.2);
    };

    const onMove = (e) => {
      if (!down || this.boosterMode) return;
      const cur = hit(pos(e));
      if (!cur) return;
      if (Math.abs(cur.r - down.r) + Math.abs(cur.c - down.c) === 1) {
        this.onSwap?.(down.r, down.c, cur.r, cur.c);
        this.selected = null;
        down = null;
      }
    };

    const onUp = () => {
      down = null;
    };

    this.canvas.addEventListener("mousedown", onDown);
    this.canvas.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    this.canvas.addEventListener("touchstart", onDown, { passive: false });
    this.canvas.addEventListener("touchmove", onMove, { passive: false });
    this.canvas.addEventListener("touchend", onUp);
    window.addEventListener("resize", () => this._resize());
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}


/* ===== CodePen asset helpers (no external PNGs) ===== */
function __capsuleIconDataUrl(typeId, w = 72, h = 88) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  try {
    drawCapsule(ctx, 0, 0, w, h, typeId, new CapsulePowder(typeId, 0), { bounce: 0 });
  } catch (_) {
    ctx.fillStyle = (CAPSULE_TYPES[typeId] && CAPSULE_TYPES[typeId].powder[2]) || "#ff1744";
    ctx.beginPath();
    const r = Math.min(w, h) / 2;
    ctx.moveTo(w / 2, r);
    ctx.arcTo(w, r, w, h - r, r);
    ctx.arcTo(w, h, w / 2, h, r);
    ctx.arcTo(0, h, 0, h - r, r);
    ctx.arcTo(0, 0, w / 2, 0, r);
    ctx.closePath();
    ctx.fill();
  }
  return c.toDataURL("image/png");
}

function __starDataUrl(size = 48, on = true) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const cx = size / 2;
  const cy = size / 2;
  const spikes = 5;
  const outer = size * 0.42;
  const inner = size * 0.18;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (Math.PI / spikes) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    const x = cx + Math.cos(ang) * r;
    const y = cy + Math.sin(ang) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  if (on) {
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, "#fff8e1");
    g.addColorStop(0.45, "#ffd54f");
    g.addColorStop(1, "#f9a825");
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.22)";
  }
  ctx.fill();
  ctx.strokeStyle = on ? "#c4922a" : "rgba(255,255,255,0.15)";
  ctx.lineWidth = size * 0.04;
  ctx.stroke();
  return c.toDataURL("image/png");
}

function __boosterDataUrl(id, state = "default", size = 128) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  drawBoosterIcon(ctx, id, size);
  if (state === "disabled") {
    ctx.fillStyle = "rgba(40,40,40,0.45)";
    ctx.fillRect(0, 0, size, size);
  } else if (state === "active") {
    ctx.strokeStyle = "rgba(255, 220, 80, 0.95)";
    ctx.lineWidth = size * 0.06;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.44, 0, Math.PI * 2);
    ctx.stroke();
  }
  return c.toDataURL("image/png");
}

function __installCodepenAssets() {
  const types = Object.keys(CAPSULE_TYPES || {});
  for (const id of types) {
    CAPSULE_SPRITES[id] = __capsuleIconDataUrl(id);
  }
  SPECIAL_SPRITES.fire = __capsuleIconDataUrl("ruby");
  SPECIAL_SPRITES.ice = __capsuleIconDataUrl("azure");
  SPECIAL_SPRITES.rainbow = __capsuleIconDataUrl("violet");
  UI_ICONS.star = __starDataUrl(48, true);
  UI_ICONS.coin = __starDataUrl(48, true);
  UI_ICONS.heart = __starDataUrl(48, true);
  UI_ICONS.treasure = __starDataUrl(48, true);
  for (const id of Object.keys(BOOSTER_SPRITES || {})) {
    BOOSTER_SPRITES[id].default = __boosterDataUrl(id, "default");
    BOOSTER_SPRITES[id].active = __boosterDataUrl(id, "active");
    BOOSTER_SPRITES[id].disabled = __boosterDataUrl(id, "disabled");
  }
  for (const id of Object.keys(OBSTACLE_SPRITES || {})) {
    OBSTACLE_SPRITES[id] = "";
  }
}

const __origPreload = typeof preloadAllSprites === "function" ? preloadAllSprites : null;
preloadAllSprites = function () {
  __installCodepenAssets();
  document.querySelectorAll(".booster").forEach((btn) => {
    const id = btn.dataset.booster;
    const img = btn.querySelector(".booster-icon");
    if (img && id) img.src = boosterSpritePath(id, "default");
  });
  if (__origPreload) {
    try { __origPreload(); } catch (_) {}
  }
};

/* ===== main.js ===== */
const $ = (sel) => document.querySelector(sel);

const state = {
  progress: loadProgress(),
  levelIndex: 0,
  board: null,
  view: null,
  moves: 0,
  boosters: { hammer: 3, rocket: 3, bomb: 2, mix: 2 },
  activeBooster: null,
  animator: null,
  currentLevel: null,
  currentTheme: null,
  juice: null,
  prevGoalDone: {},
};

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    unlocked: 1,
    stars: {},
    totalStars: 0,
  };
}

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state.progress));
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function applyTheme(level) {
  const theme = getLevelTheme(level);
  const c = theme.colors;
  state.currentLevel = level;
  state.currentTheme = theme;

  const root = document.documentElement;
  root.style.setProperty("--theme-glow1", c.appGlow1);
  root.style.setProperty("--theme-glow2", c.appGlow2);
  root.style.setProperty("--theme-bg1", c.stageBg1);
  root.style.setProperty("--theme-bg2", c.stageBg2);
  root.style.setProperty("--theme-bg3", c.stageBg3);
  root.style.setProperty("--theme-accent", c.accent);
  root.style.setProperty("--theme-accent-soft", c.accentSoft);
  root.style.setProperty("--theme-hud-border", c.hudBorder);
  root.style.setProperty("--theme-story-panel", c.storyPanel);
  root.style.setProperty("--theme-health-1", c.health[0]);
  root.style.setProperty("--theme-health-2", c.health[1]);
  root.style.setProperty("--theme-health-3", c.health[2]);

  for (const screenId of ["screen-game", "screen-story"]) {
    const screen = document.getElementById(screenId);
    if (screen) screen.dataset.theme = theme.id;
  }

  paintGameScene(level, theme);
  paintStoryScene(level, theme);

  if (state.view) state.view.setTheme(theme);
  return theme;
}

function resizeSceneCanvas(canvas) {
  if (!canvas) return { w: 0, h: 0, ctx: null };
  const dpr = Math.min(2, devicePixelRatio || 1);
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h, ctx };
}

function paintGameScene(level, theme) {
  const canvas = $("#game-scene");
  if (!canvas) return;
  const { w, h, ctx } = resizeSceneCanvas(canvas);
  if (!ctx || w < 10) return;
  drawClinicScene(ctx, w, h, theme, level);
}

function paintStoryScene(level, theme) {
  const canvas = $("#story-scene");
  if (!canvas) return;
  const { w, h, ctx } = resizeSceneCanvas(canvas);
  if (!ctx || w < 10) return;
  drawStoryScene(ctx, w, h, theme, level);
}

function setupHudPatient(level) {
  const portrait = $("#hud-portrait");
  const name = $("#hud-patient-name");
  const cond = $("#hud-condition");
  const levelNum = $("#hud-level-num");
  if (portrait) portrait.textContent = level.emoji;
  if (name) name.textContent = level.patient;
  if (cond) cond.textContent = level.condition;
  if (levelNum) levelNum.textContent = String(level.id);

  const goalsList = $("#hud-goals-list");
  if (!goalsList) return;
  goalsList.innerHTML = "";
  state.prevGoalDone = {};
  level.goals.forEach((g) => {
    state.prevGoalDone[g.type] = false;
    const def = CAPSULE_TYPES[g.type];
    const chip = document.createElement("span");
    chip.className = "rm-goal-chip";
    chip.dataset.type = g.type;
    chip.innerHTML = `<img class="rm-goal-icon" src="${CAPSULE_SPRITES[g.type]}" alt="" width="36" height="44" /><span class="rm-goal-count">0/${g.count}</span>`;
    goalsList.appendChild(chip);
  });
}

/* —— Hero floating capsules —— */
function initHero() {
  const canvas = $("#hero-capsules");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const types = Object.keys(CAPSULE_TYPES);
  let w = 0;
  let h = 0;
  const pills = [];

  const resize = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < 12; i++) {
    const type = types[i % types.length];
    pills.push({
      type,
      x: Math.random() * Math.max(w, 320),
      y: Math.random() * Math.max(h, 500),
      size: 56 + Math.random() * 64,
      rot: (Math.random() - 0.5) * 0.8,
      vr: (Math.random() - 0.5) * 0.25,
      vy: 18 + Math.random() * 22,
      vx: (Math.random() - 0.5) * 14,
      powder: new CapsulePowder(type, i * 40),
      alpha: 0.4 + Math.random() * 0.4,
    });
  }

  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (w < 10) resize();
    ctx.clearRect(0, 0, w, h);

    // ضوء جوي
    const g = ctx.createRadialGradient(w * 0.5, h * 0.2, 20, w * 0.5, h * 0.35, w * 0.8);
    g.addColorStop(0, "rgba(126,240,216,0.12)");
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (const p of pills) {
      p.powder.update(dt);
      p.y += p.vy * dt;
      p.x += p.vx * dt + Math.sin(now / 900 + p.size) * 8 * dt;
      p.rot += p.vr * dt;
      if (p.y > h + p.size) {
        p.y = -p.size;
        p.x = Math.random() * w;
      }
      if (p.x < -p.size) p.x = w + p.size;
      if (p.x > w + p.size) p.x = -p.size;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      drawCapsule(ctx, -p.size / 2, -p.size * 0.52, p.size, p.size * CAPSULE_ASPECT, p.type, p.powder, {
        alpha: p.alpha,
        scale: 1,
      });
      ctx.restore();
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* —— Map —— */
function renderMap() {
  const path = $("#map-path");
  path.innerHTML = "";
  const rank = getRank(state.progress.totalStars);
  $("#doctor-rank").textContent = rank.title;
  $("#map-stars").innerHTML = `<img class="ui-icon ui-icon--sm" src="${UI_ICONS.star}" alt="" width="18" height="18" /><span id="map-stars-count">${state.progress.totalStars}</span>`;

  LEVELS.forEach((lv, i) => {
    const unlocked = lv.id <= state.progress.unlocked;
    const stars = state.progress.stars[lv.id] || 0;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `clinic-node${stars ? " done" : ""}`;
    btn.disabled = !unlocked;
    btn.dataset.theme = getLevelTheme(lv).id;
    btn.style.animationDelay = `${i * 0.05}s`;
    btn.innerHTML = `
      <div class="clinic-badge">${lv.clinicIcon}</div>
      <div class="clinic-meta">
        <h3>${lv.id}. ${lv.patient}</h3>
        <p>${lv.clinic} — ${lv.condition}</p>
        <div class="clinic-stars">${unlocked ? "★".repeat(stars) + "☆".repeat(3 - stars) : "🔒 مقفل"}</div>
      </div>`;
    btn.addEventListener("click", () => openStory(i));
    path.appendChild(btn);
  });
}

function openStory(index) {
  state.levelIndex = index;
  const lv = LEVELS[index];
  const theme = applyTheme(lv);
  $("#story-clinic").textContent = `${theme.icon} ${lv.clinic}`;
  $("#patient-name").textContent = lv.patient;
  $("#patient-condition").textContent = lv.condition;
  $("#story-text").textContent = lv.story;
  const avatar = $("#patient-avatar");
  avatar.dataset.emoji = lv.emoji;
  avatar.setAttribute("data-emoji", lv.emoji);
  avatar.style.setProperty("--e", `"${lv.emoji}"`);

  const objs = $("#story-objectives");
  objs.innerHTML = "";
  lv.goals.forEach((g) => {
    const def = CAPSULE_TYPES[g.type];
    const chip = document.createElement("div");
    chip.className = "obj-chip";
    chip.innerHTML = `<img class="obj-capsule-icon" src="${CAPSULE_SPRITES[g.type]}" alt="" width="20" height="20" />×${g.count} ${def.name}`;
    objs.appendChild(chip);
  });
  const movesChip = document.createElement("div");
  movesChip.className = "obj-chip";
  movesChip.textContent = `${lv.moves} حركة`;
  objs.appendChild(movesChip);

  showScreen("screen-story");
}

/* —— Gameplay —— */
function startLevel() {
  const lv = LEVELS[state.levelIndex];
  applyTheme(lv);
  state.moves = lv.moves;
  state.activeBooster = null;
  state.board = new Board(lv);
  state.board.init();
  state.board.onCascadeStep = (count, special) => state.juice?.onCascadeStep(count, special);
  state.board.onInvalidSwap = () => state.juice?.onInvalidSwap();
  state.board.onBigMatch = (count) => state.juice?.onBigMatch(count);

  const canvas = $("#board");
  if (!state.view) {
    state.view = new BoardView(canvas);
    state.view.onSwap = handleSwap;
    state.view.onCellTap = handleBoosterTap;
  }
  if (!state.juice) {
    state.juice = new JuiceEngine($("#juice-layer"), $("#board-wrap"));
  }
  state.view.juice = state.juice;
  state.juice.start();
  state.view.setBoard(state.board);
  state.view.boosterMode = null;
  state.view.start();
  state.animator = state.view.createAnimator();

  setupHudPatient(lv);
  updateHud();
  updateBoosterUI();
  showScreen("screen-game");
  requestAnimationFrame(() => {
    if (state.view) state.view._resize();
    paintGameScene(lv, getLevelTheme(lv));
  });
}

function updateHud() {
  const movesEl = $("#hud-moves");
  if (movesEl) {
    movesEl.textContent = String(state.moves);
    movesEl.classList.remove("moves-pulse");
    void movesEl.offsetWidth;
    movesEl.classList.add("moves-pulse");
  }
  if (!state.board) return;
  const progress = state.board.goalProgress();
  const goalsList = $("#hud-goals-list");
  if (goalsList) {
    const lv = LEVELS[state.levelIndex];
    let gi = 0;
    lv.goals.forEach((g) => {
      const chip = goalsList.children[gi];
      if (chip) {
        const done = state.board.collected[g.type] || 0;
        chip.querySelector(".rm-goal-count").textContent = `${done}/${g.count}`;
        const complete = done >= g.count;
        chip.classList.toggle("rm-goal-chip--done", complete);
        chip.style.opacity = complete ? "0.65" : "1";
        if (complete && !state.prevGoalDone[g.type]) {
          state.prevGoalDone[g.type] = true;
          state.juice?.onGoalComplete();
        }
      }
      gi++;
    });
  }
}

function syncBoosterIcon(btn, id) {
  const img = btn?.querySelector(".booster-icon");
  if (!img) return;
  let iconState = "default";
  if (btn.disabled) iconState = "disabled";
  else if (state.activeBooster === id) iconState = "active";
  img.src = boosterSpritePath(id, iconState);
}

function updateBoosterUI() {
  for (const id of BOOSTER_IDS) {
    const el = $(`#boost-${id}`);
    if (el) el.textContent = String(state.boosters[id]);
    const btn = document.querySelector(`.booster[data-booster="${id}"]`);
    if (btn) {
      btn.disabled = state.boosters[id] <= 0;
      btn.classList.toggle("active", state.activeBooster === id && !btn.disabled);
      syncBoosterIcon(btn, id);
    }
  }
}

async function handleSwap(r1, c1, r2, c2) {
  if (state.moves <= 0 || state.board.busy) return;
  const ok = await state.board.swap(r1, c1, r2, c2, state.animator);
  if (!ok) return;
  state.moves--;
  updateHud();
  checkEnd();
}

async function handleBoosterTap(r, c, kind) {
  const booster = BOOSTERS[kind];
  const boardKey = booster?.boardKey || kind;
  if (!kind || state.boosters[kind] <= 0) return;
  if (boardKey !== "shuffle" && state.board.isBlocked(r, c)) return;

  const used = await state.board.useBooster(boardKey, r, c, state.animator);
  if (!used) return;
  state.boosters[kind]--;
  state.activeBooster = null;
  state.view.boosterMode = null;
  updateBoosterUI();
  updateHud();
  checkEnd();
}

function checkEnd() {
  if (state.board.goalsDone()) {
    endLevel(true);
  } else if (state.moves <= 0) {
    endLevel(false);
  }
}

function endLevel(won) {
  const lv = LEVELS[state.levelIndex];
  const title = $("#result-title");
  const msg = $("#result-msg");
  const starsEl = $("#result-stars");
  const btnNext = $("#btn-next");
  const eyebrow = $("#result-eyebrow");

  if (won) {
    state.juice?.onLevelWin();
    let stars = 1;
    if (state.moves >= Math.floor(lv.moves * 0.25)) stars = 2;
    if (state.moves >= Math.floor(lv.moves * 0.45)) stars = 3;
    const prev = state.progress.stars[lv.id] || 0;
    if (stars > prev) {
      state.progress.totalStars += stars - prev;
      state.progress.stars[lv.id] = stars;
    }
    if (state.progress.unlocked < lv.id + 1 && lv.id < LEVELS.length) {
      state.progress.unlocked = lv.id + 1;
    }
    if (lv.id === LEVELS.length) {
      state.progress.unlocked = LEVELS.length;
    }
    saveProgress();

    eyebrow.textContent = "LAB COMPLETE";
    title.textContent = "أتممت مختبر الكبسولة";
    msg.textContent = `${lv.patient} تحسّن. بودرة دقيقة وألوان بارزة تحت إضاءة المختبر — أعد التجربة لتصقل دقتك.`;
    starsEl.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const star = document.createElement("img");
      star.className = "result-star-icon" + (i < stars ? " lit" : "");
      star.src = UI_ICONS.star;
      star.alt = i < stars ? "نجمة" : "فارغ";
      star.width = 36;
      star.height = 36;
      starsEl.appendChild(star);
    }
    btnNext.hidden = lv.id >= LEVELS.length;
    btnNext.textContent = lv.id >= LEVELS.length ? "أنت عميد العيادة" : "العب من جديد — المريض التالي";
    paintResultHero(true);
  } else {
    eyebrow.textContent = "LAB FAILED";
    title.textContent = "لم تكتمل الوصفة";
    msg.textContent = `الحركات نفدت قبل شفاء ${lv.patient}. أعد ترتيب الكبسولات وحاول مجدداً أيها الطبيب.`;
    starsEl.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const star = document.createElement("img");
      star.className = "result-star-icon";
      star.src = UI_ICONS.star;
      star.alt = "فارغ";
      star.width = 36;
      star.height = 36;
      star.style.opacity = "0.28";
      star.style.filter = "grayscale(1)";
      starsEl.appendChild(star);
    }
    btnNext.hidden = true;
    paintResultHero(false);
  }

  $("#btn-continue").hidden = false;
  showScreen("screen-result");
}

function paintResultHero(won) {
  const canvas = $("#result-hero");
  if (!canvas) return;
  const dpr = Math.min(2, devicePixelRatio || 1);
  const cssW = canvas.clientWidth || 360;
  const cssH = canvas.clientHeight || 240;
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cssW, cssH);

  // إضاءة درامية
  const g = ctx.createRadialGradient(cssW * 0.5, cssH * 0.55, 10, cssW * 0.5, cssH * 0.5, cssW * 0.7);
  g.addColorStop(0, won ? "rgba(80,40,20,0.55)" : "rgba(40,20,40,0.4)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cssW, cssH);

  const a = new CapsulePowder("ruby", 11);
  const b = new CapsulePowder(won ? "jade" : "violet", 22);
  for (let i = 0; i < 30; i++) {
    a.update(0.05);
    b.update(0.05);
  }
  const size = Math.min(cssW * 0.38, cssH * 0.88);
  const boxW = size / CAPSULE_ASPECT;
  drawCapsule(ctx, cssW * 0.06, cssH * 0.06, boxW, size, "ruby", a, { scale: 1 });
  drawCapsule(ctx, cssW * 0.52, cssH * 0.04, boxW, size, won ? "jade" : "violet", b, {
    scale: 1,
  });
}

function wireUI() {
  $("#btn-start").addEventListener("click", () => {
    renderMap();
    showScreen("screen-map");
  });
  $("#btn-continue").addEventListener("click", () => {
    renderMap();
    showScreen("screen-map");
  });
  $("#btn-map-home").addEventListener("click", () => showScreen("screen-title"));
  $("#btn-play-level").addEventListener("click", startLevel);
  $("#btn-story-back").addEventListener("click", () => {
    renderMap();
    showScreen("screen-map");
  });
  $("#btn-pause").addEventListener("click", () => {
    $("#overlay-pause").hidden = false;
  });
  $("#btn-resume").addEventListener("click", () => {
    $("#overlay-pause").hidden = true;
  });
  $("#btn-quit-level").addEventListener("click", () => {
    $("#overlay-pause").hidden = true;
    renderMap();
    showScreen("screen-map");
  });
  $("#btn-retry").addEventListener("click", startLevel);
  $("#btn-to-map").addEventListener("click", () => {
    renderMap();
    showScreen("screen-map");
  });
  $("#btn-next").addEventListener("click", () => {
    if (state.levelIndex < LEVELS.length - 1) {
      openStory(state.levelIndex + 1);
    } else {
      renderMap();
      showScreen("screen-map");
    }
  });

  document.querySelectorAll(".booster").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.booster;
      if (state.boosters[kind] <= 0) return;
      if (kind === "mix") {
        handleBoosterTap(0, 0, "mix");
        return;
      }
      if (state.activeBooster === kind) {
        state.activeBooster = null;
        state.view.boosterMode = null;
        updateBoosterUI();
        return;
      }
      state.activeBooster = kind;
      state.view.boosterMode = kind;
      updateBoosterUI();
    });
  });

  // إظهار متابعة إن وُجد تقدم
  if (state.progress.totalStars > 0 || state.progress.unlocked > 1) {
    $("#btn-continue").hidden = false;
  }
}

/* إصلاح عرض إيموجي المريض عبر CSS content */
const styleFix = document.createElement("style");
styleFix.textContent = `.patient-avatar::after { content: attr(data-emoji); }`;
document.head.appendChild(styleFix);

wireUI();
/* preload moved */
initHero();

window.addEventListener("resize", () => {
  if (state.view?.board) state.view._resize();
  if (state.currentLevel && state.currentTheme) {
    paintGameScene(state.currentLevel, state.currentTheme);
    paintStoryScene(state.currentLevel, state.currentTheme);
  }
});

console.info("شفاء — عيادة الكبسولات جاهزة");

/* boot */
try { preloadAllSprites(); } catch (e) { console.warn(e); }

})();
