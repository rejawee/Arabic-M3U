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
  },
  {
    id: 2,
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
  },
  {
    id: 3,
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
  },
  {
    id: 4,
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
  },
  {
    id: 5,
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
  },
  {
    id: 6,
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
  },
  {
    id: 7,
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
  },
  {
    id: 8,
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
