/**
 * كبسولات Royal Match طبية — أسلوب juicy ثلاثي الأبعاد
 * غلاف زجاجي لامع + بودرة متوهجة متحركة + هالة اختيار + قطع خاصة
 */
import { CAPSULE_TYPES, CAPSULE_SPRITES, SPECIAL_SPRITES, OBSTACLE_SPRITES, capsuleSpritePath } from "./config.js";

/** نسب قطع Royal Match: كبسولة ممتلئة داخل الخلية (أعرض من 2:1 النحيف) */
export const CAPSULE_ASPECT = 1.28;
export const CAPSULE_FILL = 0.5;
const SPRITE_FILL = 0.9;
/** الرسم الإجرائي يطابق مرجع الزجاج+البودرة أفضل من PNG المتفاوت */
const PREFER_PROCEDURAL = true;

const spriteCache = new Map();
const obstacleCache = new Map();

export function preloadCapsuleSprites() {
  const paths = { ...CAPSULE_SPRITES, ...SPECIAL_SPRITES };
  for (const [key, src] of Object.entries(paths)) {
    if (spriteCache.has(key)) continue;
    const img = new Image();
    img.src = src;
    spriteCache.set(key, img);
  }
}

export function preloadObstacleSprites() {
  for (const [key, src] of Object.entries(OBSTACLE_SPRITES)) {
    if (obstacleCache.has(key)) continue;
    const img = new Image();
    img.src = src;
    obstacleCache.set(key, img);
  }
}

export function preloadAllSprites() {
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
export function capsuleBounds(x, y, w, h) {
  const padX = w * 0.02;
  const padY = h * 0.02;
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

export class CapsulePowder {
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
export function drawCapsule(ctx, x, y, w, h, typeId, powder, opts = {}) {
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
export function drawObstacle(ctx, x, y, w, h, typeId = "crate") {
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

export function drawBoardFrame(ctx, w, h, cell, gap, rows, cols, theme = null) {
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
export function drawBoosterIcon(ctx, kind, size) {
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
