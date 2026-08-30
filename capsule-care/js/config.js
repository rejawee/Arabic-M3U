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

export const TYPE_IDS = Object.keys(CAPSULE_TYPES);

/** sprites كبسولات 3D — Royal Match */
export const CAPSULE_SPRITES = {
  ruby: "assets/capsules/ruby.png",
  azure: "assets/capsules/azure.png",
  jade: "assets/capsules/jade.png",
  amber: "assets/capsules/amber.png",
  violet: "assets/capsules/violet.png",
  cyan: "assets/capsules/cyan.png",
};

export const SPECIAL_SPRITES = {
  fire: "assets/capsules/fire.png",
  ice: "assets/capsules/ice.png",
  rainbow: "assets/capsules/rainbow.png",
};

/** أيقونات UI */
export const UI_ICONS = {
  star: "assets/ui/star.png",
  coin: "assets/ui/coin.png",
  heart: "assets/ui/heart.png",
  treasure: "assets/ui/treasure.png",
};

/** معززات — default / active / disabled */
export const BOOSTER_SPRITES = {
  hammer: {
    default: "assets/boosters/hammer.png",
    active: "assets/boosters/states/hammer-active.png",
    disabled: "assets/boosters/states/hammer-disabled.png",
  },
  rocket: {
    default: "assets/boosters/rocket.png",
    active: "assets/boosters/states/rocket-active.png",
    disabled: "assets/boosters/states/rocket-disabled.png",
  },
  bomb: {
    default: "assets/boosters/bomb.png",
    active: "assets/boosters/states/bomb-active.png",
    disabled: "assets/boosters/states/bomb-disabled.png",
  },
  mix: {
    default: "assets/boosters/mix.png",
    active: "assets/boosters/states/mix-active.png",
    disabled: "assets/boosters/states/mix-disabled.png",
  },
};

export function capsuleSpritePath(typeId, special = null) {
  if (special === "rainbow") return SPECIAL_SPRITES.rainbow;
  if (special === "bomb") return SPECIAL_SPRITES.fire;
  if (special === "row" || special === "col") return SPECIAL_SPRITES.ice;
  return CAPSULE_SPRITES[typeId] || CAPSULE_SPRITES.ruby;
}

export function boosterSpritePath(id, state = "default") {
  return BOOSTER_SPRITES[id]?.[state] || BOOSTER_SPRITES[id]?.default;
}

/** عقبات اللوحة */
export const OBSTACLE_TYPES = {
  ice: { id: "ice", name: "جليد", sprite: "assets/obstacles/ice.png" },
  crate: { id: "crate", name: "صندوق", sprite: "assets/obstacles/crate.png" },
  lock: { id: "lock", name: "قفل", sprite: "assets/obstacles/lock.png" },
  slime: { id: "slime", name: "مخاط", sprite: "assets/obstacles/slime.png" },
};

export const OBSTACLE_SPRITES = Object.fromEntries(
  Object.entries(OBSTACLE_TYPES).map(([k, v]) => [k, v.sprite])
);

/** ي parse blocked: [r,c] أو [r,c,type] */
export function parseBlockedEntry(entry) {
  const [r, c, type = "crate"] = entry;
  return { r, c, type: OBSTACLE_TYPES[type] ? type : "crate" };
}

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

export function getRank(stars) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (stars >= r.min) rank = r;
  }
  return rank;
}

export const SAVE_KEY = "shifa-capsule-care-v1";
