/**
 * كبسولة زجاجية شفافة — مطابقة دقيقة للمرجع:
 * غلاف كريستالي + خط منتصف + بودرة glitter كثيفة (ثلثان سفليان) + فراغ علوي لامع
 */
import { CAPSULE_TYPES } from "./config.js";

export class CapsulePowder {
  constructor(typeId, seed = Math.random() * 1000) {
    this.typeId = typeId;
    this.seed = seed;
    this.particles = [];
    this.floaters = [];
    this.time = seed * 0.01;
    this._initParticles();
  }

  _rand(i) {
    const x = Math.sin(this.seed * 12.9898 + i * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  _initParticles() {
    this.particles = [];
    this.floaters = [];

    // تعبئة كثيفة جداً للثلثين السفليين — حبيبات glitter متراكمة
    const dense = 110;
    for (let i = 0; i < dense; i++) {
      const r1 = this._rand(i);
      const r2 = this._rand(i + 200);
      const r3 = this._rand(i + 400);
      // توزيع يتكاثف نحو القاع
      const y = 0.36 + Math.pow(r1, 0.42) * 0.56;
      const maxHalf = pillHalfWidth(y);
      const x = 0.5 + (r2 - 0.5) * 2 * maxHalf * 0.92;
      this.particles.push({
        x,
        y,
        r: 0.022 + r3 * 0.038,
        vx: (this._rand(i + 600) - 0.5) * 0.008,
        vy: (this._rand(i + 800) - 0.5) * 0.006,
        phase: r1 * Math.PI * 2,
        band: y < 0.5 ? 1 : y < 0.66 ? 2 : y < 0.8 ? 3 : 4,
        sparkle: r3 > 0.62,
        twinkleSpeed: 3 + r2 * 6,
      });
    }

    // غبار فضي خفيف في الفراغ العلوي فقط
    for (let i = 0; i < 16; i++) {
      const r1 = this._rand(i + 1000);
      const r2 = this._rand(i + 1200);
      const y = 0.1 + r1 * 0.24;
      const maxHalf = pillHalfWidth(y);
      this.floaters.push({
        x: 0.5 + (r2 - 0.5) * 2 * maxHalf * 0.75,
        y,
        r: 0.012 + this._rand(i + 1400) * 0.022,
        vx: (r1 - 0.5) * 0.018,
        vy: (r2 - 0.5) * 0.012,
        phase: r1 * Math.PI * 2,
        sparkle: true,
        twinkleSpeed: 4 + r2 * 8,
      });
    }
  }

  setType(typeId) {
    if (this.typeId === typeId) return;
    this.typeId = typeId;
    this.seed = Math.random() * 1000;
    this._initParticles();
  }

  shake(intensity = 1) {
    for (const p of this.particles) {
      p.vx += (Math.random() - 0.5) * 0.12 * intensity;
      p.vy += (Math.random() - 0.5) * 0.1 * intensity - 0.04 * intensity;
    }
    for (const p of this.floaters) {
      p.vx += (Math.random() - 0.5) * 0.14 * intensity;
      p.vy += (Math.random() - 0.5) * 0.12 * intensity;
    }
  }

  update(dt) {
    this.time += dt;
    for (const p of this.particles) this._step(p, dt, true);
    for (const p of this.floaters) this._step(p, dt, false);
  }

  _step(p, dt, heavy) {
    p.vx += Math.sin(this.time * 2.3 + p.phase) * (heavy ? 0.004 : 0.008) * dt;
    p.vy += (heavy ? 0.7 : 0.18) * dt * 0.08;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.96;
    p.vy *= 0.935;
    constrainInPill(p);
  }
}

/** نصف عرض الكبسولة عند ارتفاع نسبي y ∈ [0,1] */
function pillHalfWidth(y) {
  const top = 0.07;
  const bot = 0.94;
  const r = 0.39;
  if (y <= top) return 0;
  if (y >= bot) return 0;
  if (y < top + r) {
    const ly = 1 - (y - top) / r;
    return r * Math.sqrt(Math.max(0, 1 - ly * ly));
  }
  if (y > bot - r) {
    const ly = (y - (bot - r)) / r;
    return r * Math.sqrt(Math.max(0, 1 - ly * ly));
  }
  return r;
}

function constrainInPill(p) {
  const top = 0.07;
  const bot = 0.94;
  if (p.y < top) {
    p.y = top + 0.002;
    p.vy = Math.abs(p.vy) * 0.15;
  }
  if (p.y > bot) {
    p.y = bot;
    p.vy *= -0.1;
    p.vx += (Math.random() - 0.5) * 0.01;
  }
  const maxX = pillHalfWidth(p.y) * 0.95;
  if (p.x < 0.5 - maxX) {
    p.x = 0.5 - maxX;
    p.vx = Math.abs(p.vx) * 0.3;
  }
  if (p.x > 0.5 + maxX) {
    p.x = 0.5 + maxX;
    p.vx = -Math.abs(p.vx) * 0.3;
  }
}

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

  // نسب قريبة من المرجع الفوتوغرافي
  const bw = w * 0.58;
  const bh = h * 0.92;
  const bx = cx - bw / 2;
  const by = cy - bh / 2;
  const powders = def.powder;

  // ظل
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.945, bw * 0.36, h * 0.04, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fill();

  // —— داخل الكبسولة ——
  ctx.save();
  pillPath(ctx, bx + bw * 0.065, by + bh * 0.035, bw * 0.87, bh * 0.93);
  ctx.clip();

  // هواء زجاجي في الأعلى
  const air = ctx.createLinearGradient(bx, by, bx, by + bh * 0.4);
  air.addColorStop(0, "rgba(255,255,255,0.5)");
  air.addColorStop(0.7, "rgba(220,235,245,0.1)");
  air.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = air;
  ctx.fillRect(bx, by, bw, bh * 0.4);

  // ضباب لوني خفيف خلف الحبيبات فقط
  const mist = ctx.createLinearGradient(bx, by + bh * 0.35, bx, by + bh);
  mist.addColorStop(0, powders[1] + "22");
  mist.addColorStop(0.3, powders[2] + "44");
  mist.addColorStop(0.65, powders[3] + "55");
  mist.addColorStop(1, powders[4] + "77");
  ctx.fillStyle = mist;
  ctx.fillRect(bx, by + bh * 0.35, bw, bh * 0.65);

  if (powder) {
    // حبيبات صغيرة جداً لملء الفراغ بين الحبات الكبيرة
    drawPackedGrit(ctx, bx, by, bw, bh, powders, powder.seed || 1, powder.time || 0);
    drawGrains(ctx, powder.particles, bx, by, bw, bh, powders, powder.time, alpha, false);
    drawGrains(ctx, powder.floaters, bx, by, bw, bh, powders, powder.time, alpha, true);
  }

  ctx.restore();

  // —— غلاف زجاجي شفاف تماماً ——
  pillPath(ctx, bx, by, bw, bh);
  const glass = ctx.createLinearGradient(bx, by, bx + bw, by);
  glass.addColorStop(0, "rgba(170, 200, 225, 0.2)");
  glass.addColorStop(0.5, "rgba(255, 255, 255, 0.04)");
  glass.addColorStop(1, "rgba(150, 185, 215, 0.18)");
  ctx.fillStyle = glass;
  ctx.fill();

  // إطار خارجي أبيض حاد
  pillPath(ctx, bx, by, bw, bh);
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = Math.max(1.8, w * 0.032);
  ctx.stroke();

  // إطار داخلي رمادي-أزرق
  pillPath(ctx, bx + 1.5, by + 1.5, bw - 3, bh - 3);
  ctx.strokeStyle = "rgba(100, 135, 165, 0.4)";
  ctx.lineWidth = Math.max(0.7, w * 0.01);
  ctx.stroke();

  // خط التحام المنتصف
  ctx.save();
  pillPath(ctx, bx, by, bw, bh);
  ctx.clip();
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.07, cy);
  ctx.lineTo(bx + bw * 0.93, cy);
  ctx.strokeStyle = "rgba(70, 105, 135, 0.5)";
  ctx.lineWidth = Math.max(1.1, w * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.1, cy - 1.1);
  ctx.lineTo(bx + bw * 0.9, cy - 1.1);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.restore();

  // specular رئيسي
  ctx.beginPath();
  ctx.ellipse(cx - bw * 0.15, by + bh * 0.17, bw * 0.14, bh * 0.1, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx + bw * 0.1, by + bh * 0.09, bw * 0.055, bh * 0.03, 0.25, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fill();

  // شريط لمعان أيسر
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.17, by + bh * 0.15);
  ctx.quadraticCurveTo(bx + bw * 0.05, cy, bx + bw * 0.19, by + bh * 0.85);
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = Math.max(1.5, w * 0.026);
  ctx.lineCap = "round";
  ctx.stroke();

  // انعكاس يمين خفيف
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.84, by + bh * 0.2);
  ctx.quadraticCurveTo(bx + bw * 0.96, cy, bx + bw * 0.82, by + bh * 0.8);
  ctx.strokeStyle = "rgba(190, 215, 235, 0.35)";
  ctx.lineWidth = Math.max(1, w * 0.014);
  ctx.stroke();

  if (selected || highlight > 0) {
    pillPath(ctx, bx - 3, by - 3, bw + 6, bh + 6);
    ctx.strokeStyle = def.glow;
    ctx.lineWidth = 3 + highlight * 2;
    ctx.stroke();
  }

  if (special) drawSpecialBadge(ctx, cx, cy, w * 0.17, special);

  ctx.restore();
}

function drawPackedGrit(ctx, bx, by, bw, bh, powders, seed, time) {
  let s = (seed * 1000) | 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  for (let i = 0; i < 95; i++) {
    const y = 0.38 + rnd() * 0.55;
    const maxHalf = pillHalfWidth(y);
    const x = 0.5 + (rnd() - 0.5) * 2 * maxHalf * 0.9;
    const px = bx + x * bw;
    const py = by + y * bh + Math.sin(time * 1.8 + i) * 0.35;
    const pr = Math.max(0.6, (0.012 + rnd() * 0.02) * Math.min(bw, bh));
    const band = y < 0.5 ? 1 : y < 0.68 ? 2 : y < 0.82 ? 3 : 4;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = powders[band] || powders[3];
    ctx.fill();
    // نقطة لمعان صغيرة على بعض الحبات
    if (rnd() > 0.7) {
      ctx.beginPath();
      ctx.arc(px - pr * 0.25, py - pr * 0.25, pr * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fill();
    }
  }
}

function drawGrains(ctx, list, bx, by, bw, bh, powders, time, alpha, isFloater) {
  if (!list) return;
  for (const p of list) {
    const px = bx + p.x * bw;
    const py = by + p.y * bh;
    const pr = Math.max(1.0, p.r * Math.min(bw, bh) * 1.45);
    const col = isFloater ? powders[0] : powders[p.band] || powders[2];

    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(px - pr * 0.4, py - pr * 0.4, 0, px, py, pr);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.3, isFloater ? "#f0f8ff" : powders[0]);
    g.addColorStop(0.65, col);
    g.addColorStop(1, powders[4] || powders[3]);
    ctx.fillStyle = g;
    ctx.fill();

    if (p.sparkle) {
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(time * p.twinkleSpeed + p.phase));
      ctx.save();
      ctx.globalAlpha = alpha * tw;
      ctx.translate(px, py);
      const arm = pr * (isFloater ? 2.4 : 1.9);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(0.6, pr * 0.32);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-arm, 0);
      ctx.lineTo(arm, 0);
      ctx.moveTo(0, -arm * 0.85);
      ctx.lineTo(0, arm * 0.85);
      ctx.stroke();
      ctx.restore();
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

function drawSpecialBadge(ctx, cx, cy, r, special) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(8, 30, 40, 0.48)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  if (special === "row") {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.5, cy);
    ctx.lineTo(cx + r * 0.3, cy);
    ctx.stroke();
    ctx.fillRect(cx + r * 0.28, cy - r * 0.18, r * 0.3, r * 0.36);
  } else if (special === "col") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.5);
    ctx.lineTo(cx, cy + r * 0.3);
    ctx.stroke();
    ctx.fillRect(cx - r * 0.18, cy + r * 0.28, r * 0.36, r * 0.3);
  } else if (special === "bomb") {
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (special === "rainbow") {
    ["#ff6b5a", "#f4c15d", "#7ef0d8", "#4db8ff"].forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * (0.5 - i * 0.08), Math.PI, 0);
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.6;
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
