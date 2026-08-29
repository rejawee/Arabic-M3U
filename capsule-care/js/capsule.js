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
    const n = 68;
    this.particles = [];
    for (let i = 0; i < n; i++) {
      // كثافة أعلى في الأسفل كتدرج البودرة الفاخرة (مرجع الزجاج الشفاف)
      const yBias = 0.42 + Math.pow(Math.random(), 0.45) * 0.5;
      const sparse = Math.random() > 0.78;
      this.particles.push({
        x: 0.18 + Math.random() * 0.64,
        y: sparse ? 0.18 + Math.random() * 0.28 : yBias,
        r: sparse
          ? 0.012 + Math.random() * 0.016
          : 0.016 + Math.random() * 0.032,
        vx: (Math.random() - 0.5) * 0.014,
        vy: (Math.random() - 0.5) * 0.01,
        phase: Math.random() * Math.PI * 2,
        colorIdx: sparse ? 0 : Math.min(3, Math.floor(yBias * 4.5)),
        sparkle: sparse || Math.random() > 0.88,
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
    const g = 0.62;
    for (const p of this.particles) {
      p.vx += Math.sin(this.time * 2.4 + p.phase) * 0.005 * dt;
      p.vy += g * dt * 0.09;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.935;

      // حدود شكل الكبسولة الطولية (stadium)
      const cx = 0.5;
      const halfW = 0.36;
      if (p.x < cx - halfW) {
        p.x = cx - halfW;
        p.vx = Math.abs(p.vx) * 0.4;
      }
      if (p.x > cx + halfW) {
        p.x = cx + halfW;
        p.vx = -Math.abs(p.vx) * 0.4;
      }
      // أطراف نصف دائرية
      if (p.y < 0.16) {
        p.y = 0.16 + Math.random() * 0.01;
        p.vy = Math.abs(p.vy) * 0.25;
      }
      if (p.y > 0.9) {
        p.y = 0.9;
        p.vy *= -0.15;
        p.vx += (Math.random() - 0.5) * 0.02;
      }
      const tipR = 0.36;
      if (p.y < 0.16 + tipR * 0.55) {
        const localY = (0.16 + tipR * 0.55 - p.y) / (tipR * 0.55);
        const maxX = tipR * Math.sqrt(Math.max(0, 1 - localY * localY));
        if (Math.abs(p.x - cx) > maxX) {
          p.x = cx + Math.sign(p.x - cx) * maxX * 0.95;
          p.vx *= -0.3;
        }
      }
      if (p.y > 0.9 - tipR * 0.55) {
        const localY = (p.y - (0.9 - tipR * 0.55)) / (tipR * 0.55);
        const maxX = tipR * Math.sqrt(Math.max(0, 1 - localY * localY));
        if (Math.abs(p.x - cx) > maxX) {
          p.x = cx + Math.sign(p.x - cx) * maxX * 0.95;
          p.vx *= -0.3;
        }
      }
    }
  }
}

/**
 * رسم كبسولة زجاجية فائقة الجودة مع بودرة متحركة
 * شكل كبسولة طبية حقيقية (أطول من عرضها) داخل الخلية
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

  // كبسولة طولية داخل المربع
  const bw = w * 0.58;
  const bh = h * 0.88;
  const bx = cx - bw / 2;
  const by = cy - bh / 2;
  const br = bw / 2;

  // ظل ناعم
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.92, bw * 0.42, h * 0.06, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.fill();

  // غلاف زجاجي شفاف ملون
  pillPath(ctx, bx, by, bw, bh);
  const shell = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  shell.addColorStop(0, def.shell[0]);
  shell.addColorStop(0.5, def.shell[1]);
  shell.addColorStop(1, def.shell[0]);
  ctx.fillStyle = shell;
  ctx.globalAlpha = alpha * 0.28;
  ctx.fill();
  ctx.globalAlpha = alpha;

  // بودرة داخل الزجاج
  ctx.save();
  pillPath(ctx, bx + bw * 0.07, by + bh * 0.04, bw * 0.86, bh * 0.92);
  ctx.clip();

  const powders = def.powder;
  // فراغ علوي لامع + قاع كثيف (مثل المرجع الفاخر)
  const inner = ctx.createLinearGradient(bx, by, bx, by + bh);
  inner.addColorStop(0, "rgba(255,255,255,0.22)");
  inner.addColorStop(0.28, "rgba(255,255,255,0.06)");
  inner.addColorStop(0.45, powders[1] + "55");
  inner.addColorStop(0.7, powders[2]);
  inner.addColorStop(1, powders[3]);
  ctx.fillStyle = inner;
  ctx.fillRect(bx, by, bw, bh);

  const mist = ctx.createRadialGradient(cx, by + bh * 0.78, 1, cx, by + bh * 0.7, bw * 0.7);
  mist.addColorStop(0, powders[1]);
  mist.addColorStop(0.55, powders[2] + "dd");
  mist.addColorStop(1, "transparent");
  ctx.fillStyle = mist;
  ctx.fillRect(bx, by, bw, bh);

  if (powder?.particles) {
    for (const p of powder.particles) {
      const px = bx + p.x * bw;
      const py = by + p.y * bh;
      const pr = Math.max(0.8, p.r * Math.min(bw, bh) * 1.15);
      const col = powders[p.colorIdx] || powders[1];

      if (p.sparkle) {
        const twinkle = 0.5 + 0.5 * Math.sin(powder.time * 7 + p.phase);
        ctx.globalAlpha = alpha * twinkle * 0.95;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(px, py, pr * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha;
      }

      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      const pg = ctx.createRadialGradient(px - pr * 0.35, py - pr * 0.35, 0, px, py, pr);
      pg.addColorStop(0, powders[0]);
      pg.addColorStop(0.5, col);
      pg.addColorStop(1, powders[3]);
      ctx.fillStyle = pg;
      ctx.fill();
    }
  }
  ctx.restore();

  // إطار زجاجي
  pillPath(ctx, bx, by, bw, bh);
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = Math.max(1.8, w * 0.028);
  ctx.stroke();

  pillPath(ctx, bx, by, bw, bh);
  ctx.strokeStyle = def.shell[1] + "aa";
  ctx.lineWidth = Math.max(1, w * 0.014);
  ctx.stroke();

  // لمعان علوي زجاجي
  ctx.beginPath();
  ctx.ellipse(cx - bw * 0.12, by + bh * 0.2, bw * 0.14, bh * 0.14, -0.35, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.22, by + bh * 0.18);
  ctx.quadraticCurveTo(bx + bw * 0.1, cy, bx + bw * 0.24, by + bh * 0.82);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = Math.max(1.2, w * 0.022);
  ctx.lineCap = "round";
  ctx.stroke();

  if (selected || highlight > 0) {
    pillPath(ctx, bx - 3, by - 3, bw + 6, bh + 6);
    ctx.strokeStyle = def.glow;
    ctx.lineWidth = 3.5 + highlight * 2;
    ctx.stroke();
  }

  if (special) {
    drawSpecialBadge(ctx, cx, cy, w * 0.2, special);
  }

  ctx.restore();
}

/** مسار كبسولة طبية (نصف دائرة أعلى وأسفل) */
function pillPath(ctx, x, y, w, h) {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2, false);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + h - r, r, Math.PI / 2, -Math.PI / 2, false);
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
