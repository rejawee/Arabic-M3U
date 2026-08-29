import { CAPSULE_TYPES } from "./config.js";

/**
 * نظام بودرة فاخر داخل الكبسولة الزجاجية
 * جسيمات دقيقة تتحرك وتتساقط بحركة فيزيائية خفيفة
 */
export class CapsulePowder {
  constructor(typeId, seed = Math.random() * 1000) {
    this.typeId = typeId;
    this.seed = seed;
    this.particles = [];
    this.time = seed;
    this._initParticles();
  }

  _initParticles() {
    const def = CAPSULE_TYPES[this.typeId];
    if (!def) return;
    const n = 42;
    this.particles = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      // كثافة أعلى في الأسفل كتدرج البودرة الفاخرة
      const yBias = 0.35 + Math.pow(Math.random(), 0.55) * 0.58;
      this.particles.push({
        x: 0.22 + Math.random() * 0.56,
        y: yBias,
        r: 0.018 + Math.random() * 0.028 + (t < 0.3 ? 0.012 : 0),
        vx: (Math.random() - 0.5) * 0.012,
        vy: (Math.random() - 0.5) * 0.008,
        phase: Math.random() * Math.PI * 2,
        colorIdx: Math.min(3, Math.floor(yBias * 4.2)),
        sparkle: Math.random() > 0.82,
      });
    }
  }

  setType(typeId) {
    if (this.typeId === typeId) return;
    this.typeId = typeId;
    this._initParticles();
  }

  /** اهتزاز عند المطابقة / السقوط */
  shake(intensity = 1) {
    for (const p of this.particles) {
      p.vx += (Math.random() - 0.5) * 0.08 * intensity;
      p.vy += (Math.random() - 0.5) * 0.06 * intensity - 0.02 * intensity;
    }
  }

  update(dt) {
    this.time += dt;
    const g = 0.55;
    for (const p of this.particles) {
      // حركة بودرة ناعمة + جاذبية خفيفة
      p.vx += Math.sin(this.time * 2.1 + p.phase) * 0.004 * dt;
      p.vy += g * dt * 0.08;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // احتكاك
      p.vx *= 0.965;
      p.vy *= 0.94;

      // حدود شكل الكبسولة (بيضاوي)
      const cx = 0.5;
      const cy = 0.52;
      const rx = 0.34;
      const ry = 0.4;
      let nx = (p.x - cx) / rx;
      let ny = (p.y - cy) / ry;
      const d = nx * nx + ny * ny;
      if (d > 0.92) {
        const len = Math.sqrt(d) || 1;
        nx /= len;
        ny /= len;
        p.x = cx + nx * rx * 0.9;
        p.y = cy + ny * ry * 0.9;
        // ارتداد ناعم
        const dot = p.vx * nx + p.vy * ny;
        p.vx -= 1.4 * dot * nx;
        p.vy -= 1.4 * dot * ny;
        p.vx *= 0.7;
        p.vy *= 0.55;
      }

      // قاع ممتلئ — لا تخرج البودرة من الأعلى كثيراً
      if (p.y < 0.22) {
        p.y = 0.22 + Math.random() * 0.02;
        p.vy = Math.abs(p.vy) * 0.3;
      }
      if (p.y > 0.88) {
        p.y = 0.88;
        p.vy *= -0.2;
      }
    }
  }
}

/**
 * رسم كبسولة زجاجية فائقة الجودة مع بودرة متحركة
 */
export function drawCapsule(ctx, x, y, w, h, typeId, powder, opts = {}) {
  const def = CAPSULE_TYPES[typeId];
  if (!def) return;

  const {
    selected = false,
    special = null, // 'row' | 'col' | 'bomb' | 'rainbow'
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

  const pad = w * 0.08;
  const bw = w - pad * 2;
  const bh = h - pad * 2;
  const bx = x + pad;
  const by = y + pad;
  const br = bw * 0.48;

  // ظل ناعم تحت الكبسولة
  ctx.beginPath();
  ctx.ellipse(cx, y + h - pad * 0.35, bw * 0.38, bh * 0.08, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fill();

  // جسم زجاجي — مسار كبسولة
  roundCapsulePath(ctx, bx, by, bw, bh, br);

  // تعبئة غلاف شفاف متدرج
  const shell = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  shell.addColorStop(0, def.shell[0]);
  shell.addColorStop(1, def.shell[1]);
  ctx.fillStyle = shell;
  ctx.globalAlpha = alpha * 0.35;
  ctx.fill();
  ctx.globalAlpha = alpha;

  // قصّ لمحتوى البودرة داخل الكبسولة
  ctx.save();
  roundCapsulePath(ctx, bx + bw * 0.06, by + bh * 0.05, bw * 0.88, bh * 0.9, br * 0.85);
  ctx.clip();

  // خلفية داخلية داكنة للعمق
  const inner = ctx.createLinearGradient(bx, by + bh, bx, by);
  const powders = def.powder;
  inner.addColorStop(0, powders[3]);
  inner.addColorStop(0.45, powders[2]);
  inner.addColorStop(0.75, powders[1]);
  inner.addColorStop(1, "rgba(255,255,255,0.15)");
  ctx.fillStyle = inner;
  ctx.fillRect(bx, by, bw, bh);

  // طبقة ضبابية للبودرة الكثيفة في الأسفل
  const mist = ctx.createRadialGradient(cx, by + bh * 0.72, 2, cx, by + bh * 0.65, bw * 0.55);
  mist.addColorStop(0, powders[1]);
  mist.addColorStop(0.6, powders[2] + "cc");
  mist.addColorStop(1, "transparent");
  ctx.fillStyle = mist;
  ctx.fillRect(bx, by, bw, bh);

  // جسيمات البودرة
  if (powder && powder.particles) {
    for (const p of powder.particles) {
      const px = bx + p.x * bw;
      const py = by + p.y * bh;
      const pr = p.r * Math.min(bw, bh);
      const col = powders[p.colorIdx] || powders[1];

      if (p.sparkle) {
        const twinkle = 0.55 + 0.45 * Math.sin(powder.time * 6 + p.phase);
        ctx.globalAlpha = alpha * twinkle;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(px, py, pr * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha;
      }

      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      const pg = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 0, px, py, pr);
      pg.addColorStop(0, powders[0]);
      pg.addColorStop(0.55, col);
      pg.addColorStop(1, powders[3]);
      ctx.fillStyle = pg;
      ctx.fill();
    }
  }

  ctx.restore();

  // إطار زجاجي لامع
  roundCapsulePath(ctx, bx, by, bw, bh, br);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = Math.max(1.5, w * 0.025);
  ctx.stroke();

  // حد خارجي ملون خفيف
  roundCapsulePath(ctx, bx, by, bw, bh, br);
  ctx.strokeStyle = def.shell[1] + "99";
  ctx.lineWidth = Math.max(1, w * 0.015);
  ctx.stroke();

  // تمييز زجاجي علوي (highlight)
  ctx.beginPath();
  ctx.ellipse(cx - bw * 0.12, by + bh * 0.22, bw * 0.12, bh * 0.2, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fill();

  // خط لمعان جانبي
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.18, by + bh * 0.2);
  ctx.quadraticCurveTo(bx + bw * 0.08, cy, bx + bw * 0.2, by + bh * 0.78);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = Math.max(1, w * 0.02);
  ctx.stroke();

  // توهج عند التحديد
  if (selected || highlight > 0) {
    roundCapsulePath(ctx, bx - 2, by - 2, bw + 4, bh + 4, br + 2);
    ctx.strokeStyle = def.glow;
    ctx.lineWidth = 3 + highlight * 2;
    ctx.stroke();
  }

  // رموز القطع الخاصة الطبية
  if (special) {
    drawSpecialBadge(ctx, cx, cy, w * 0.22, special);
  }

  ctx.restore();
}

function roundCapsulePath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function drawSpecialBadge(ctx, cx, cy, r, special) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(10, 40, 50, 0.55)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";

  if (special === "row") {
    // حقنة أفقية = صف
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.55, cy);
    ctx.lineTo(cx + r * 0.35, cy);
    ctx.stroke();
    ctx.fillRect(cx + r * 0.3, cy - r * 0.22, r * 0.35, r * 0.44);
  } else if (special === "col") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.55);
    ctx.lineTo(cx, cy + r * 0.35);
    ctx.stroke();
    ctx.fillRect(cx - r * 0.22, cy + r * 0.3, r * 0.44, r * 0.35);
  } else if (special === "bomb") {
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.2, cy - r * 0.25);
    ctx.quadraticCurveTo(cx + r * 0.45, cy - r * 0.55, cx + r * 0.15, cy - r * 0.6);
    ctx.stroke();
  } else if (special === "rainbow") {
    const colors = ["#ff6b5a", "#f4c15d", "#7ef0d8", "#4db8ff", "#a060f0"];
    colors.forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * (0.55 - i * 0.08), Math.PI, 0);
      ctx.strokeStyle = c;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }
  ctx.restore();
}

/** خلفية لوحة فاخرة */
export function drawBoardFrame(ctx, w, h, cell, gap, rows, cols, pad) {
  const gw = cols * cell + (cols - 1) * gap;
  const gh = rows * cell + (rows - 1) * gap;
  const ox = (w - gw) / 2;
  const oy = (h - gh) / 2;

  // شبكة خلايا زجاجية
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
  return { ox, oy, gw, gh, pad };
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
