/**
 * كبسولات من صورة المرجع الفوتوغرافية مباشرة
 * + إعادة تلوين البودرة لكل نوع + حركة وميض/اهتزاز
 */
import { CAPSULE_TYPES } from "./config.js";

let refImage = null;
let refReady = false;
const tintCache = new Map();

const REF_SRC = new URL("../assets/capsule-ref.jpg", import.meta.url).href;

function loadRef() {
  if (refImage) return;
  refImage = new Image();
  refImage.decoding = "async";
  refImage.onload = () => {
    refReady = true;
    tintCache.clear();
  };
  refImage.onerror = () => {
    console.warn("capsule-ref failed to load", REF_SRC);
  };
  refImage.src = REF_SRC;
}
loadRef();

/** استخراج منطقة الكبسولة من خلفية بيضاء مع قصّ الحدود */
function buildMaskedSource() {
  if (!refReady) return null;
  const iw = refImage.naturalWidth;
  const ih = refImage.naturalHeight;
  const c = document.createElement("canvas");
  c.width = iw;
  c.height = ih;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(refImage, 0, 0);
  const img = ctx.getImageData(0, 0, iw, ih);
  const d = img.data;

  let minX = iw;
  let minY = ih;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < ih; y++) {
    for (let x = 0; x < iw; x++) {
      const i = (y * iw + x) * 4;
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const isWhite = r > 245 && g > 245 && b > 245;
      const isNearWhite = r > 228 && g > 228 && b > 228 && max - min < 14;
      if (isWhite || isNearWhite) {
        d[i + 3] = 0;
      } else {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  // هامش صغير حول الكبسولة
  const pad = Math.max(4, Math.round(iw * 0.01));
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(iw - 1, maxX + pad);
  maxY = Math.min(ih - 1, maxY + pad);

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  out.getContext("2d").drawImage(c, minX, minY, cw, ch, 0, 0, cw, ch);
  return out;
}

let maskedSource = null;

function getMasked() {
  if (!refReady) return null;
  if (!maskedSource) maskedSource = buildMaskedSource();
  return maskedSource;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r;
  let g;
  let b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [(r * 255) | 0, (g * 255) | 0, (b * 255) | 0];
}

/** هدف Hue لكل نوع (درجة 0-1) */
const TYPE_HUE = {
  cyan: null, // أصلي بدون تحويل
  azure: 0.58,
  jade: 0.38,
  amber: 0.12,
  ruby: 0.0,
  violet: 0.78,
};

function getTintedSprite(typeId) {
  const src = getMasked();
  if (!src) return null;
  if (tintCache.has(typeId)) return tintCache.get(typeId);

  const targetHue = TYPE_HUE[typeId];
  if (targetHue == null) {
    tintCache.set(typeId, src);
    return src;
  }

  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;

  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 10) continue;
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);

    // أعد تلوين البودرة الملوّنة فقط (تشبع واضح، ليست إبرازات زجاجية)
    // البودرة المرجعية في نطاق أزرق/سماوي
    const isPowder =
      s > 0.12 &&
      l > 0.05 &&
      l < 0.92 &&
      !(r > 220 && g > 220 && b > 220) &&
      !(s < 0.2 && l > 0.75);

    if (isPowder) {
      // حافظ على الإضاءة والتشبع تقريباً، غيّر الـ hue
      const satBoost = Math.min(1, s * 1.15);
      const [nr, ng, nb] = hslToRgb(targetHue, satBoost, l);
      d[i] = nr;
      d[i + 1] = ng;
      d[i + 2] = nb;
    }
  }

  ctx.putImageData(img, 0, 0);
  tintCache.set(typeId, c);
  return c;
}

export class CapsulePowder {
  constructor(typeId, seed = Math.random() * 1000) {
    this.typeId = typeId;
    this.seed = seed;
    this.time = seed * 0.01;
    this.shakeAmp = 0;
    this.sparkles = [];
    for (let i = 0; i < 6; i++) {
      this.sparkles.push({
        x: 0.25 + Math.random() * 0.5,
        y: 0.12 + Math.random() * 0.28,
        phase: Math.random() * Math.PI * 2,
        speed: 3 + Math.random() * 5,
        r: 0.01 + Math.random() * 0.015,
      });
    }
  }

  setType(typeId) {
    this.typeId = typeId;
  }

  shake(intensity = 1) {
    this.shakeAmp = Math.min(2, this.shakeAmp + intensity);
  }

  update(dt) {
    this.time += dt;
    if (this.shakeAmp > 0) this.shakeAmp = Math.max(0, this.shakeAmp - dt * 2);
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

  const bw = w * 0.72;
  const bh = h * 0.9;
  const bx = cx - bw / 2;
  const by = cy - bh / 2;

  // ظل
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.93, bw * 0.38, h * 0.04, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fill();

  const sprite = getTintedSprite(typeId);
  const t = powder?.time || 0;
  const shake = powder?.shakeAmp || 0;
  const jx = Math.sin(t * 28) * shake * w * 0.02;
  const jy = Math.cos(t * 24) * shake * h * 0.015;
  // حركة بودرة خفيفة مستمرة (اهتزاز مجهري)
  const breath = Math.sin(t * 2.2) * h * 0.004;

  if (sprite) {
    ctx.drawImage(sprite, bx + jx, by + jy + breath, bw, bh);
  } else {
    // احتياطي ريثما تُحمَّل الصورة
    drawFallback(ctx, bx, by, bw, bh, def);
  }

  // وميض إضافي فوق الفراغ العلوي ليوحي بحركة البودرة
  if (powder?.sparkles && sprite) {
    for (const s of powder.sparkles) {
      const tw = 0.25 + 0.75 * Math.abs(Math.sin(t * s.speed + s.phase));
      const px = bx + s.x * bw + jx;
      const py = by + s.y * bh + jy;
      const pr = s.r * Math.min(bw, bh);
      ctx.globalAlpha = alpha * tw * 0.85;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px - pr * 2.2, py);
      ctx.lineTo(px + pr * 2.2, py);
      ctx.moveTo(px, py - pr * 2);
      ctx.lineTo(px, py + pr * 2);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(0.5, pr * 0.4);
      ctx.stroke();
      ctx.globalAlpha = alpha;
    }
  }

  if (selected || highlight > 0) {
    pillPath(ctx, bx - 2, by - 2, bw + 4, bh + 4);
    ctx.strokeStyle = def.glow;
    ctx.lineWidth = 3 + highlight * 2;
    ctx.stroke();
  }

  if (special) drawSpecialBadge(ctx, cx, cy, w * 0.16, special);

  ctx.restore();
}

function drawFallback(ctx, bx, by, bw, bh, def) {
  pillPath(ctx, bx, by, bw, bh);
  ctx.fillStyle = "rgba(200,220,235,0.25)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();
  const g = ctx.createLinearGradient(bx, by + bh * 0.35, bx, by + bh);
  g.addColorStop(0, def.powder[1]);
  g.addColorStop(1, def.powder[4] || def.powder[3]);
  ctx.fillStyle = g;
  ctx.fillRect(bx + bw * 0.1, by + bh * 0.38, bw * 0.8, bh * 0.55);
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
  ctx.fillStyle = "rgba(8, 30, 40, 0.5)";
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
    ctx.lineTo(cx + r * 0.28, cy);
    ctx.stroke();
    ctx.fillRect(cx + r * 0.26, cy - r * 0.16, r * 0.28, r * 0.32);
  } else if (special === "col") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.5);
    ctx.lineTo(cx, cy + r * 0.28);
    ctx.stroke();
    ctx.fillRect(cx - r * 0.16, cy + r * 0.26, r * 0.32, r * 0.28);
  } else if (special === "bomb") {
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  } else if (special === "rainbow") {
    ["#ff6b5a", "#f4c15d", "#7ef0d8", "#4db8ff"].forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * (0.48 - i * 0.08), Math.PI, 0);
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.5;
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
