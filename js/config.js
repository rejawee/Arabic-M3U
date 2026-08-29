/** ألوان الكبسولات — تدرج بودرة glitter فاخر (أبيض → لون → داكن) مثل المرجع */
export const CAPSULE_TYPES = {
  ruby: {
    id: "ruby",
    name: "ياقوتية",
    shell: ["#ffffff", "#e8eef2"],
    // [أبيض لامع، وردي فاتح، أحمر، قرمزي، كحلي داكن]
    powder: ["#fff5f2", "#ff8a7a", "#e83545", "#8a1020", "#2a0610"],
    glow: "rgba(255, 90, 78, 0.5)",
  },
  azure: {
    id: "azure",
    name: "سماوية",
    shell: ["#ffffff", "#e8eef2"],
    powder: ["#f2f9ff", "#5ec8ff", "#1a7fd4", "#0a3a78", "#041828"],
    glow: "rgba(77, 184, 255, 0.5)",
  },
  jade: {
    id: "jade",
    name: "زُمرّدية",
    shell: ["#ffffff", "#e8eef2"],
    powder: ["#f0fff6", "#5ef0b0", "#12a868", "#065838", "#022018"],
    glow: "rgba(61, 214, 140, 0.5)",
  },
  amber: {
    id: "amber",
    name: "ذهبية",
    shell: ["#ffffff", "#e8eef2"],
    powder: ["#fffaf0", "#ffd060", "#e89810", "#8a5008", "#2a1804"],
    glow: "rgba(240, 180, 48, 0.5)",
  },
  violet: {
    id: "violet",
    name: "بنفسجية",
    shell: ["#ffffff", "#e8eef2"],
    powder: ["#faf2ff", "#c48aff", "#7a35d4", "#3a1078", "#140428"],
    glow: "rgba(160, 96, 240, 0.45)",
  },
  cyan: {
    id: "cyan",
    name: "فيروزية",
    shell: ["#ffffff", "#e8eef2"],
    // مطابق تقريباً لمرجع الصورة: فضي → فيروزي → كحلي
    powder: ["#f5fffe", "#40e8e0", "#10a8b8", "#0a4868", "#041828"],
    glow: "rgba(64, 224, 216, 0.5)",
  },
};

export const TYPE_IDS = Object.keys(CAPSULE_TYPES);

/** رتب الطبيب حسب النجوم */
export const RANKS = [
  { min: 0, title: "طبيب متدرب" },
  { min: 3, title: "طبيب مقيم" },
  { min: 8, title: "أخصائي" },
  { min: 14, title: "استشاري" },
  { min: 20, title: "عميد العيادة" },
];

/**
 * قصة متكاملة: عيادات → مرضى → أهداف مطابقة
 * كل مستوى = مريض يحتاج وصفة كبسولات
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
    blocked: [[2, 3], [3, 3], [4, 3]],
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
    blocked: [[0, 0], [0, 6], [7, 0], [7, 6]],
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
    blocked: [[3, 3], [3, 4], [4, 3], [4, 4]],
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
    blocked: [[1, 1], [1, 6], [6, 1], [6, 6], [3, 0], [4, 7]],
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
      [2, 2], [2, 5], [5, 2], [5, 5],
      [0, 3], [0, 4], [7, 3], [7, 4],
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
    blocked: [[3, 1], [3, 2], [4, 5], [4, 6]],
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
    blocked: [[0, 0], [0, 7], [7, 0], [7, 7], [3, 3], [3, 4], [4, 3], [4, 4]],
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
