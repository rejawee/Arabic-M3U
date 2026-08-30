/** ألوان كبسولات juicy — مشبعة ومتوهجة كأسلوب Royal Match */
export const CAPSULE_TYPES = {
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
    shell: ["#ffffff", "#bbdefb"],
    powder: ["#e3f2fd", "#82b1ff", "#2979ff", "#1565c0", "#0a1f4a"],
    glow: "rgba(41, 121, 255, 0.65)",
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
    shell: ["#ffffff", "#e1bee7"],
    powder: ["#f3e5f5", "#e040fb", "#aa00ff", "#6a1b9a", "#1a0033"],
    glow: "rgba(170, 0, 255, 0.55)",
  },
  cyan: {
    id: "cyan",
    name: "فيروزية",
    shell: ["#ffffff", "#b2ebf2"],
    powder: ["#e0f7fa", "#18ffff", "#00e5ff", "#00838f", "#00333a"],
    glow: "rgba(0, 229, 255, 0.65)",
  },
};

export const TYPE_IDS = Object.keys(CAPSULE_TYPES);

/** ثيمات العيادات — خلفيات وألوان لكل مرحلة */
export const CLINIC_THEMES = {
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
      frameTop: "rgba(24, 88, 82, 0.9)",
      frameBottom: "rgba(6, 32, 36, 0.94)",
      frameBorder: "rgba(126, 240, 216, 0.42)",
      cellLight: "rgba(255,255,255,0.09)",
      cellDark: "rgba(0,0,0,0.22)",
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
      frameTop: "rgba(120, 70, 140, 0.88)",
      frameBottom: "rgba(45, 25, 65, 0.94)",
      frameBorder: "rgba(255, 183, 77, 0.45)",
      cellLight: "rgba(255,255,255,0.11)",
      cellDark: "rgba(0,0,0,0.2)",
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
      frameTop: "rgba(120, 30, 30, 0.9)",
      frameBottom: "rgba(35, 8, 10, 0.95)",
      frameBorder: "rgba(255, 171, 0, 0.5)",
      cellLight: "rgba(255,255,255,0.08)",
      cellDark: "rgba(0,0,0,0.28)",
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
      frameTop: "rgba(30, 60, 120, 0.9)",
      frameBottom: "rgba(8, 18, 45, 0.95)",
      frameBorder: "rgba(24, 255, 255, 0.4)",
      cellLight: "rgba(255,255,255,0.09)",
      cellDark: "rgba(0,0,0,0.25)",
      health: ["#536dfe", "#18ffff", "#b388ff"],
      storyPanel: "linear-gradient(160deg, rgba(30, 60, 120, 0.65), rgba(8, 18, 45, 0.92))",
      canvasGlow: "rgba(60, 100, 220, 0.38)",
    },
  },
};

/** معززات المساعدة — أسلوب Royal Match */
export const BOOSTERS = {
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

export const BOOSTER_IDS = Object.keys(BOOSTERS);

export function getLevelTheme(level) {
  if (level.themeId) return CLINIC_THEMES[level.themeId] || CLINIC_THEMES.neighborhood;
  if (level.clinic.includes("الأطفال")) return CLINIC_THEMES.children;
  if (level.clinic.includes("الطوارئ")) return CLINIC_THEMES.emergency;
  if (level.clinic.includes("المختبر") || level.clinic.includes("الأبحاث")) return CLINIC_THEMES.research;
  return CLINIC_THEMES.neighborhood;
}

export const RANKS = [
  { min: 0, title: "طبيب متدرب" },
  { min: 3, title: "طبيب مقيم" },
  { min: 8, title: "أخصائي" },
  { min: 14, title: "استشاري" },
  { min: 20, title: "عميد العيادة" },
];

/**
 * قصة متكاملة: عيادات → مرضى → أهداف مطابقة
 */
export const LEVELS = [
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
      [2, 3],
      [3, 3],
      [4, 3],
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
      [0, 0],
      [0, 6],
      [7, 0],
      [7, 6],
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
      [3, 3],
      [3, 4],
      [4, 3],
      [4, 4],
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
      [1, 1],
      [1, 6],
      [6, 1],
      [6, 6],
      [3, 0],
      [4, 7],
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
      [2, 2],
      [2, 5],
      [5, 2],
      [5, 5],
      [0, 3],
      [0, 4],
      [7, 3],
      [7, 4],
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
      [3, 1],
      [3, 2],
      [4, 5],
      [4, 6],
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
      [0, 0],
      [0, 7],
      [7, 0],
      [7, 7],
      [3, 3],
      [3, 4],
      [4, 3],
      [4, 4],
    ],
    sceneProps: ["🧪", "⚗️", "🧬", "✨"],
  },
];

export function getRank(stars) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (stars >= r.min) rank = r;
  }
  return rank;
}

export const SAVE_KEY = "shifa-capsule-care-v1";
