/**
 * كبسولة زجاجية شفافة فائقة الجودة — مطابقة للمرجع الفوتوغرافي
 * غلاف كريستالي شفاف + خط التحام المنتصف + بودرة glitter متحركة بتدرج
 */
import { CAPSULE_TYPES } from "./config.js";

export class CapsulePowder {
  constructor(typeId, seed = Math.random() * 1000) {
    this.typeId = typeId;
    this.seed = seed;
    this.particles = [];
    this.floaters = [];
    this.time = seed;
    this._initParticles();
  }

  _initParticles() {
    const def = CAPSULE_TYPES[this.typeId];
    if (!def) return;
    this.particles = [];
    this.floaters = [];

    // حبيبات كثيفة في الثلثين السفليين (مثل المرجع)
    const dense = 90;
    for (let i = 0; i < dense; i++) {
      const t = Math.pow(Math.random(), 0.55);
      const y = 0.38 + t * 0.54; // من منتصف تقريباً إلى القاع
      this.particles.push({
        x: 0.14 + Math.random() * 0.72,
        y,
        r: 0.014 + Math.random() * 0.028,
        vx: (Math.random() - 0.5) * 0.01,
        vy: (Math.random() - 0.5) * 0.008,
        phase: Math.random() * Math.PI * 2,
        // 0 أبيض لامع · 1 فاتح · 2 وسط · 3 داكن
        band: y < 0.5 ? 1 : y < 0.68 ? 2 : 3,
        sparkle: Math.random() > 0.72,
        twinkleSpeed: 4 + Math.random() * 6,
      });
    }

    // جزيئات بيضاء/فضية عائمة في الفراغ العلوي
    for (let i = 0; i < 18; i++) {
      this.floaters.push({
        x: 0.2 + Math.random() * 0.6,
        y: 0.12 + Math.random() * 0.28,
        r: 0.01 + Math.random() * 0.018,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.015,
        phase: Math.random() * Math.PI * 2,
        sparkle: Math.random() > 0.4,
        twinkleSpeed: 5 + Math.random() * 8,
      });
    }
  }

  setType(typeId) {
    if (this.typeId === typeId) return;
    this.typeId = typeId;
    this._initParticles();
  }

  shake(intensity = 1) {
    for (const p of this.particles) {
      p.vx += (Math.random() - 0.5) * 0.1 * intensity;
      p.vy += (Math.random() - 0.5) * 0.08 * intensity - 0.03 * intensity;
    }
    for (const p of this.floaters) {
      p.vx += (Math.random() - 0.5) * 0.12 * intensity;
      p.vy += (Math.random() - 0.5) * 0.1 * intensity;
    }
  }

  update(dt) {
    this.time += dt;
    this._integrate(this.particles, dt, 0.72);
    this._integrate(this.floaters, dt, 0.22);
  }

  _integrate(list, dt, settleY) {
    const g = 0.55;
    for (const p of list) {
      p.vx += Math.sin(this.time * 2.2 + p.phase) * 0.006 * dt;
      p.vy += g * dt * (list === this.floaters ? 0.035 : 0.1);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.955;
      p.vy *= 0.93;

      // حدود جسم الكبسولة (stadium)
      constrainInPill(p);

      // استقرار نحو مستوى البودرة
      if (list === this.particles && p.y < settleY - 0.05) {
        p.vy += 0.15 * dt;
      }
    }
  }
}

function constrainInPill(p) {
  const cx = 0.5;
  const halfW = 0.38;
  const top = 0.08;
  const bot = 0.93;

  if (p.y < top) {
    p.y = top;
    p.vy = Math.abs(p.vy) * 0.2;
  }
  if (p.y > bot) {
    p.y = bot;
    p.vy *= -0.12;
    p.vx += (Math.random() - 0.5) * 0.015;
  }

  // نصف دوائر الطرفين
  const r = halfW;
  let maxX = halfW;
  if (p.y < top + r) {
    const ly = 1 - (p.y - top) / r;
    maxX = r * Math.sqrt(Math.max(0, 1 - ly * ly));
  } else if (p.y > bot - r) {
    const ly = (p.y - (bot - r)) / r;
    maxX = r * Math.sqrt(Math.max(0, 1 - ly * ly));
  }

  if (p.x < cx - maxX) {
    p.x = cx - maxX;
    p.vx = Math.abs(p.vx) * 0.35;
  }
  if (p.x > cx + maxX) {
    p.x = cx + maxX;
    p.vx = -Math.abs(p.vx) * 0.35;
  }
}

/**
 * رسم كبسولة كريستالية شفافة مطابقة للمرجع
 */
export function drawCapsule(ctx, x, y, w, h, typeId, powder, opts = {}) {
  const def = CAPSULE_TYPES[typeId];
  if (!def) return;

  const {
    selected = false,
    special = null,
    alpha = 1,
    scale = 1,
    highlight = 0,
  } = opts;

  ctx.save();
  ctx.globalAlpha = alpha;

  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);

  // نسب المرجع: كبسولة طولية ضيقة (~1 : 2.35)
  const bw = w * 0.52;
  const bh = h * 0.92;
  const bx = cx - bw / 2;
  const by = cy - bh / 2;

  // ظل أرضي ناعم
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.94, bw * 0.38, h * 0.045, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fill();

  // —— المحتوى الداخلي (بودرة) داخل قصّ الزجاج ——
  ctx.save();
  pillPath(ctx, bx + bw * 0.06, by + bh * 0.035, bw * 0.88, bh * 0.93);
  ctx.clip();

  // خلفية داخلية شفافة فاتحة (فراغ علوي زجاجي)
  const air = ctx.createLinearGradient(bx, by, bx, by + bh);
  air.addColorStop(0, "rgba(255,255,255,0.35)");
  air.addColorStop(0.32, "rgba(240,248,255,0.08)");
  air.addColorStop(0.42, "rgba(0,0,0,0)");
  air.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = air;
  ctx.fillRect(bx, by, bw, bh);

  const powders = def.powder;
  // كتلة بودرة كثيفة بتدرج عمودي (داكن → وسط لامع → فاتح)
  const fillTop = by + bh * 0.36;
  const fillH = bh * 0.58;
  const dens = ctx.createLinearGradient(bx, fillTop, bx, fillTop + fillH);
  dens.addColorStop(0, powders[0] + "00");
  dens.addColorStop(0.08, powders[0] + "88");
  dens.addColorStop(0.28, powders[1]);
  dens.addColorStop(0.55, powders[2]);
  dens.addColorStop(0.82, powders[3]);
  dens.addColorStop(1, powders[4] || powders[3]);
  ctx.fillStyle = dens;
  // شكل قمة البودرة غير مستوٍ قليلاً
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.12, fillTop + fillH);
  ctx.lineTo(bx + bw * 0.12, fillTop + bh * 0.04);
  for (let i = 0; i <= 8; i++) {
    const px = bx + bw * (0.12 + (0.76 * i) / 8);
    const wave = Math.sin(i * 1.7 + (powder?.time || 0) * 1.5) * bh * 0.012;
    ctx.lineTo(px, fillTop + wave);
  }
  ctx.lineTo(bx + bw * 0.88, fillTop + fillH);
  ctx.closePath();
  ctx.fill();

  // حبيبات glitter فردية
  if (powder) {
    drawGrainList(ctx, powder.particles, bx, by, bw, bh, powders, powder.time, alpha, false);
    drawGrainList(ctx, powder.floaters, bx, by, bw, bh, powders, powder.time, alpha, true);
  }

  ctx.restore();

  // —— الغلاف الزجاجي الكريستالي الشفاف (بدون لون غلاف) ——
  // انحناء حافة خفيف جداً بلون أزرق-أبيض
  pillPath(ctx, bx, by, bw, bh);
  const glassTint = ctx.createLinearGradient(bx, by, bx + bw, by);
  glassTint.addColorStop(0, "rgba(180, 210, 230, 0.18)");
  glassTint.addColorStop(0.45, "rgba(255, 255, 255, 0.05)");
  glassTint.addColorStop(1, "rgba(160, 195, 220, 0.16)");
  ctx.fillStyle = glassTint;
  ctx.fill();

  // حد زجاجي خارجي حاد
  pillPath(ctx, bx, by, bw, bh);
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = Math.max(1.6, w * 0.03);
  ctx.stroke();

  // حد داخلي رمادي-أزرق خفيف للعمق
  pillPath(ctx, bx + 1.2, by + 1.2, bw - 2.4, bh - 2.4);
  ctx.strokeStyle = "rgba(120, 150, 175, 0.35)";
  ctx.lineWidth = Math.max(0.8, w * 0.012);
  ctx.stroke();

  // خط التحام المنتصف (seam) — ميزة المرجع الأساسية
  const seamY = cy;
  ctx.save();
  pillPath(ctx, bx, by, bw, bh);
  ctx.clip();
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.08, seamY);
  ctx.lineTo(bx + bw * 0.92, seamY);
  ctx.strokeStyle = "rgba(90, 120, 145, 0.45)";
  ctx.lineWidth = Math.max(1, w * 0.018);
  ctx.stroke();
  // لمعان رفيع فوق الخط
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.12, seamY - 1);
  ctx.lineTo(bx + bw * 0.88, seamY - 1);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();

  // تمييز specular علوي أيسر (مثل المرجع)
  ctx.beginPath();
  ctx.ellipse(
    cx - bw * 0.14,
    by + bh * 0.18,
    bw * 0.13,
    bh * 0.11,
    -0.45,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fill();

  // نقطة لمعان صغيرة أعلى
  ctx.beginPath();
  ctx.ellipse(cx + bw * 0.08, by + bh * 0.1, bw * 0.06, bh * 0.035, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fill();

  // شريط لمعان جانبي طويل
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.18, by + bh * 0.16);
  ctx.quadraticCurveTo(bx + bw * 0.06, cy, bx + bw * 0.2, by + bh * 0.84);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = Math.max(1.4, w * 0.024);
  ctx.lineCap = "round";
  ctx.stroke();

  // انعكاس حافة يمنى رفيع
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.82, by + bh * 0.22);
  ctx.quadraticCurveTo(bx + bw * 0.94, cy, bx + bw * 0.8, by + bh * 0.78);
  ctx.strokeStyle = "rgba(200, 220, 235, 0.35)";
  ctx.lineWidth = Math.max(1, w * 0.014);
  ctx.stroke();

  if (selected || highlight > 0) {
    pillPath(ctx, bx - 3, by - 3, bw + 6, bh + 6);
    ctx.strokeStyle = def.glow;
    ctx.lineWidth = 3.2 + highlight * 2;
    ctx.stroke();
  }

  if (special) {
    drawSpecialBadge(ctx, cx, cy, w * 0.18, special);
  }

  ctx.restore();
}

function drawGrainList(ctx, list, bx, by, bw, bh, powders, time, alpha, isFloater) {
  if (!list) return;
  for (const p of list) {
    const px = bx + p.x * bw;
    const py = by + p.y * bh;
    const pr = Math.max(0.7, p.r * Math.min(bw, bh) * 1.35);

    let col;
    if (isFloater) {
      col = powders[0]; // أبيض/فضي
    } else {
      col = powders[p.band] || powders[2];
    }

    // حبة glitter
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(px - pr * 0.35, py - pr * 0.35, 0, px, py, pr);
    g.addColorStop(0, isFloater ? "#ffffff" : powders[0]);
    g.addColorStop(0.45, col);
    g.addColorStop(1, powders[4] || powders[3]);
    ctx.fillStyle = g;
    ctx.fill();

    // وميض نجمي (starburst) كما في المرجع
    if (p.sparkle) {
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(time * p.twinkleSpeed + p.phase));
      ctx.save();
      ctx.globalAlpha = alpha * tw;
      ctx.translate(px, py);
      ctx.rotate(p.phase);
      const arm = pr * (isFloater ? 2.8 : 2.2);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(0.6, pr * 0.35);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-arm, 0);
      ctx.lineTo(arm, 0);
      ctx.moveTo(0, -arm);
      ctx.lineTo(0, arm);
      ctx.stroke();
      // محور قطري أخف
      ctx.globalAlpha = alpha * tw * 0.55;
      ctx.beginPath();
      ctx.moveTo(-arm * 0.65, -arm * 0.65);
      ctx.lineTo(arm * 0.65, arm * 0.65);
      ctx.moveTo(-arm * 0.65, arm * 0.65);
      ctx.lineTo(arm * 0.65, -arm * 0.65);
      ctx.stroke();
      ctx.restore();
    }
  }
}

/** مسار كبسولة طبية رأسية مثالية */
function pillPath(ctx, x, y, w, h) {
  const r = Math.min(w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0, false);
  ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + r, y + h - r, r, 0, Math.PI, false);
  ctx.closePath();
}

function drawSpecialBadge(ctx, cx, cy, r, special) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(8, 30, 40, 0.5)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  if (special === "row") {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.55, cy);
    ctx.lineTo(cx + r * 0.35, cy);
    ctx.stroke();
    ctx.fillRect(cx + r * 0.3, cy - r * 0.2, r * 0.32, r * 0.4);
  } else if (special === "col") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.55);
    ctx.lineTo(cx, cy + r * 0.35);
    ctx.stroke();
    ctx.fillRect(cx - r * 0.2, cy + r * 0.3, r * 0.4, r * 0.32);
  } else if (special === "bomb") {
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.18, cy - r * 0.22);
    ctx.quadraticCurveTo(cx + r * 0.42, cy - r * 0.5, cx + r * 0.12, cy - r * 0.55);
    ctx.stroke();
  } else if (special === "rainbow") {
    const colors = ["#ff6b5a", "#f4c15d", "#7ef0d8", "#4db8ff", "#a060f0"];
    colors.forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * (0.52 - i * 0.07), Math.PI, 0);
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    });
  }
  ctx.restore();
}

export function drawBoardFrame(ctx, w, h, cell, gap, rows, cols) {
  const gw = cols * cell + (cols - 1) * gap;
  const gh = rows * cell + (rows - 1) * gap;
  const ox = (w - gw) / 2;
  const oy = (h - gh) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ox + c * (cell + gap);
      const y = oy + r * (cell + gap);
      const rr = cell * 0.22;
      ctx.beginPath();
      roundedRect(ctx, x, y, cell, cell, rr);
      ctx.fillStyle = (r + c) % 2 === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.12)";
      ctx.fill();
    }
  }
  return { ox, oy, gw, gh };
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
