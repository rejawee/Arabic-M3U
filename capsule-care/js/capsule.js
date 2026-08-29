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

    // حبيبات كبيرة وواضحة حتى على حجم بلاط اللوحة
    const dense = 48;
    for (let i = 0; i < dense; i++) {
      const t = Math.pow(Math.random(), 0.5);
      const y = 0.4 + t * 0.52;
      this.particles.push({
        x: 0.16 + Math.random() * 0.68,
        y,
        r: 0.028 + Math.random() * 0.045,
        vx: (Math.random() - 0.5) * 0.012,
        vy: (Math.random() - 0.5) * 0.01,
        phase: Math.random() * Math.PI * 2,
        band: y < 0.52 ? 1 : y < 0.7 ? 2 : 3,
        sparkle: Math.random() > 0.55,
        twinkleSpeed: 3.5 + Math.random() * 7,
      });
    }

    // جزيئات فضية عائمة في الفراغ العلوي الزجاجي
    for (let i = 0; i < 14; i++) {
      this.floaters.push({
        x: 0.22 + Math.random() * 0.56,
        y: 0.1 + Math.random() * 0.26,
        r: 0.016 + Math.random() * 0.028,
        vx: (Math.random() - 0.5) * 0.022,
        vy: (Math.random() - 0.5) * 0.016,
        phase: Math.random() * Math.PI * 2,
        sparkle: true,
        twinkleSpeed: 4 + Math.random() * 9,
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

  // نسب المرجع: كبسولة طولية (~1 : 2.2) بعرض كافٍ لإظهار الحبيبات
  const bw = w * 0.62;
  const bh = h * 0.9;
  const bx = cx - bw / 2;
  const by = cy - bh / 2;

  // ظل أرضي ناعم
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.94, bw * 0.4, h * 0.045, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fill();

  // —— المحتوى الداخلي (بودرة) داخل قصّ الزجاج ——
  ctx.save();
  pillPath(ctx, bx + bw * 0.07, by + bh * 0.04, bw * 0.86, bh * 0.92);
  ctx.clip();

  // فراغ علوي زجاجي شفاف واضح
  const air = ctx.createLinearGradient(bx, by, bx, by + bh * 0.45);
  air.addColorStop(0, "rgba(255,255,255,0.42)");
  air.addColorStop(0.55, "rgba(230,240,250,0.12)");
  air.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = air;
  ctx.fillRect(bx, by, bw, bh * 0.45);

  const powders = def.powder;
  // ضباب خفيف خلف الحبيبات فقط (ليس كتلة صلبة)
  const fillTop = by + bh * 0.38;
  const mist = ctx.createLinearGradient(bx, fillTop, bx, by + bh);
  mist.addColorStop(0, powders[1] + "33");
  mist.addColorStop(0.35, powders[2] + "55");
  mist.addColorStop(0.7, powders[3] + "66");
  mist.addColorStop(1, powders[4] + "88");
  ctx.fillStyle = mist;
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.1, by + bh);
  ctx.lineTo(bx + bw * 0.1, fillTop + bh * 0.03);
  for (let i = 0; i <= 10; i++) {
    const px = bx + bw * (0.1 + (0.8 * i) / 10);
    const wave = Math.sin(i * 1.4 + (powder?.time || 0) * 1.8) * bh * 0.014;
    ctx.lineTo(px, fillTop + wave);
  }
  ctx.lineTo(bx + bw * 0.9, by + bh);
  ctx.closePath();
  ctx.fill();

  // طبقة حبيبات صغيرة إضافية لملمس الرمل اللامع
  if (powder) {
    drawMicroGrit(ctx, bx, by, bw, bh, powders, powder.time || 0, typeId);
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

function drawMicroGrit(ctx, bx, by, bw, bh, powders, time, typeId) {
  // حبيبات رملية ثابتة الشكل (seed من النوع) لملمس المرجع
  let seed = 0;
  for (let i = 0; i < typeId.length; i++) seed = (seed * 31 + typeId.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  const n = 70;
  for (let i = 0; i < n; i++) {
    const y = 0.42 + rand() * 0.5;
    const x = 0.14 + rand() * 0.72;
    const px = bx + x * bw;
    const py = by + y * bh + Math.sin(time * 2 + i) * 0.4;
    const pr = Math.max(0.55, (0.01 + rand() * 0.02) * Math.min(bw, bh));
    const band = y < 0.55 ? 1 : y < 0.72 ? 2 : 3;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = powders[band] || powders[2];
    ctx.globalAlpha = 0.85;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawGrainList(ctx, list, bx, by, bw, bh, powders, time, alpha, isFloater) {
  if (!list) return;
  for (const p of list) {
    const px = bx + p.x * bw;
    const py = by + p.y * bh;
    const pr = Math.max(1.1, p.r * Math.min(bw, bh) * 1.5);

    let col;
    if (isFloater) {
      col = powders[0];
    } else {
      col = powders[p.band] || powders[2];
    }

    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(px - pr * 0.4, py - pr * 0.4, 0, px, py, pr);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.35, isFloater ? "#ffffff" : powders[0]);
    g.addColorStop(0.7, col);
    g.addColorStop(1, powders[4] || powders[3]);
    ctx.fillStyle = g;
    ctx.fill();

    if (p.sparkle) {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(time * p.twinkleSpeed + p.phase));
      ctx.save();
      ctx.globalAlpha = alpha * tw;
      ctx.translate(px, py);
      ctx.rotate(p.phase * 0.5);
      const arm = pr * (isFloater ? 3.2 : 2.6);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(0.7, pr * 0.4);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-arm, 0);
      ctx.lineTo(arm, 0);
      ctx.moveTo(0, -arm);
      ctx.lineTo(0, arm);
      ctx.stroke();
      ctx.globalAlpha = alpha * tw * 0.5;
      ctx.beginPath();
      ctx.moveTo(-arm * 0.7, -arm * 0.7);
      ctx.lineTo(arm * 0.7, arm * 0.7);
      ctx.moveTo(-arm * 0.7, arm * 0.7);
      ctx.lineTo(arm * 0.7, -arm * 0.7);
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
