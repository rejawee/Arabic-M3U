/**
 * كبسولة زجاجية فوتوغرافية — بودرة glitter بكسلية دقيقة + غلاف كريستالي
 * مطابقة للمرجع: فراغ علوي صافٍ، ثلثان سفليان كثيفان، خط منتصف، لمعان زجاجي
 */
import { CAPSULE_TYPES } from "./config.js";

const powderCache = new Map();

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** ضوضاء حتمية ناعمة */
function noise2(x, y, seed) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 0.001) * 43758.5453;
  return n - Math.floor(n);
}

function lerpColor(a, b, t) {
  return [
    (a[0] + (b[0] - a[0]) * t) | 0,
    (a[1] + (b[1] - a[1]) * t) | 0,
    (a[2] + (b[2] - a[2]) * t) | 0,
  ];
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * يبني نسيج بودرة عالي الدقة (مرة واحدة لكل نوع/حجم) ثم يُحرَّك بالإزاحة
 */
function getPowderTexture(typeId, tw, th) {
  const key = `${typeId}:${tw}x${th}`;
  if (powderCache.has(key)) return powderCache.get(key);

  const def = CAPSULE_TYPES[typeId];
  const colors = def.powder.map(hexToRgb);
  // ألوان التدرج من الأعلى للأسفل: أبيض لامع → فاتح → وسط → داكن → كحلي
  const stops = [
    { y: 0.0, c: colors[0] },
    { y: 0.15, c: colors[1] },
    { y: 0.4, c: colors[2] },
    { y: 0.7, c: colors[3] },
    { y: 1.0, c: colors[4] || colors[3] },
  ];

  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(tw, th);
  const data = img.data;
  const seed = hashStr(typeId);

  for (let y = 0; y < th; y++) {
    const v = y / th;
    // اختر لون التدرج
    let col = stops[stops.length - 1].c;
    for (let s = 0; s < stops.length - 1; s++) {
      if (v >= stops[s].y && v <= stops[s + 1].y) {
        const tt = (v - stops[s].y) / (stops[s + 1].y - stops[s].y);
        col = lerpColor(stops[s].c, stops[s + 1].c, tt);
        break;
      }
    }

    for (let x = 0; x < tw; x++) {
      const u = x / tw;
      const i = (y * tw + x) * 4;

      // كثافة حبيبية: نقاط لامعة داكنة/فاتحة كرمل glitter
      const n1 = noise2(x * 0.9, y * 0.9, seed);
      const n2 = noise2(x * 2.3 + 10, y * 2.1, seed + 7);
      const n3 = noise2(x * 5.1, y * 4.7, seed + 19);
      const grain = n1 * 0.55 + n2 * 0.3 + n3 * 0.15;

      // فراغات صغيرة بين الحبات
      const gap = n3 > 0.82 ? 0.35 : 1;

      let r = col[0] * (0.55 + grain * 0.7) * gap;
      let g = col[1] * (0.55 + grain * 0.7) * gap;
      let b = col[2] * (0.55 + grain * 0.7) * gap;

      // لمعات glitter بيضاء نجمية نادرة
      if (n2 > 0.92 && n1 > 0.5) {
        r = 255;
        g = 255;
        b = 255;
      } else if (n3 > 0.88) {
        r = Math.min(255, r + 90);
        g = Math.min(255, g + 90);
        b = Math.min(255, b + 100);
      }

      // تغميق عند الحواف الأفقية قليلاً للعمق
      const edge = Math.min(u, 1 - u);
      const shade = 0.75 + edge * 0.5;
      data[i] = Math.min(255, r * shade);
      data[i + 1] = Math.min(255, g * shade);
      data[i + 2] = Math.min(255, b * shade);
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);

  // طبقة حبات أكبر قليلة فوق النسيج لمزيد من الوضوح على المسافات البعيدة
  for (let i = 0; i < 80; i++) {
    const px = noise2(i, 1, seed) * tw;
    const py = noise2(i, 2, seed) * th;
    const pr = 0.8 + noise2(i, 3, seed) * 2.2;
    const v = py / th;
    let col = stops[2].c;
    for (let s = 0; s < stops.length - 1; s++) {
      if (v >= stops[s].y && v <= stops[s + 1].y) {
        col = lerpColor(stops[s].c, stops[s + 1].c, (v - stops[s].y) / (stops[s + 1].y - stops[s].y));
        break;
      }
    }
    const grd = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 0, px, py, pr);
    grd.addColorStop(0, "#ffffff");
    grd.addColorStop(0.4, `rgb(${col[0]},${col[1]},${col[2]})`);
    grd.addColorStop(1, `rgb(${Math.max(0, col[0] - 40)},${Math.max(0, col[1] - 40)},${Math.max(0, col[2] - 30)})`);
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
  }

  powderCache.set(key, canvas);
  return canvas;
}

export class CapsulePowder {
  constructor(typeId, seed = Math.random() * 1000) {
    this.typeId = typeId;
    this.seed = seed;
    this.time = seed * 0.01;
    this.offsetY = 0;
    this.shakeAmp = 0;
    // جزيئات عائمة قليلة جداً في الفراغ العلوي (مثل المرجع)
    this.floaters = [];
    for (let i = 0; i < 7; i++) {
      this.floaters.push({
        x: 0.28 + Math.random() * 0.44,
        y: 0.12 + Math.random() * 0.2,
        r: 0.012 + Math.random() * 0.02,
        vx: (Math.random() - 0.5) * 0.015,
        vy: (Math.random() - 0.5) * 0.01,
        phase: Math.random() * Math.PI * 2,
        twinkle: 3 + Math.random() * 5,
      });
    }
  }

  setType(typeId) {
    if (this.typeId === typeId) return;
    this.typeId = typeId;
  }

  shake(intensity = 1) {
    this.shakeAmp = Math.min(1.5, this.shakeAmp + intensity);
    for (const f of this.floaters) {
      f.vx += (Math.random() - 0.5) * 0.1 * intensity;
      f.vy += (Math.random() - 0.5) * 0.08 * intensity;
    }
  }

  update(dt) {
    this.time += dt;
    this.offsetY += dt * 0.015;
    if (this.shakeAmp > 0) this.shakeAmp = Math.max(0, this.shakeAmp - dt * 1.8);
    for (const f of this.floaters) {
      f.x += f.vx * dt + Math.sin(this.time * 1.5 + f.phase) * 0.002;
      f.y += f.vy * dt;
      f.vx *= 0.97;
      f.vy *= 0.97;
      if (f.y < 0.08) {
        f.y = 0.08;
        f.vy *= -0.3;
      }
      if (f.y > 0.34) {
        f.y = 0.34;
        f.vy *= -0.3;
      }
      if (f.x < 0.22) f.x = 0.22;
      if (f.x > 0.78) f.x = 0.78;
    }
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

  // نسب أقرب للمرجع (أعرض قليلاً، أقل طولاً مبالغاً)
  const bw = w * 0.66;
  const bh = h * 0.88;
  const bx = cx - bw / 2;
  const by = cy - bh / 2;

  // ظل
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.94, bw * 0.4, h * 0.042, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fill();

  // —— المحتوى ——
  ctx.save();
  pillPath(ctx, bx + bw * 0.07, by + bh * 0.04, bw * 0.86, bh * 0.92);
  ctx.clip();

  // فراغ علوي زجاجي صافٍ
  const air = ctx.createLinearGradient(bx, by, bx, by + bh * 0.38);
  air.addColorStop(0, "rgba(255,255,255,0.55)");
  air.addColorStop(0.6, "rgba(235,245,255,0.12)");
  air.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = air;
  ctx.fillRect(bx, by, bw, bh * 0.38);

  // سطح البودرة (~38% من الأعلى) مع تموج خفيف
  const fillTop = by + bh * 0.34;
  const shake = powder ? powder.shakeAmp * bh * 0.02 : 0;
  const t = powder?.time || 0;

  // نسيج البودرة الكثيف
  const texW = Math.max(48, Math.round(bw * 2));
  const texH = Math.max(64, Math.round(bh * 1.6));
  const tex = getPowderTexture(typeId, texW, texH);
  const scroll = ((powder?.offsetY || 0) % 1) * texH * 0.08;
  const jx = shake * Math.sin(t * 30);
  const jy = shake * Math.cos(t * 28) + scroll;

  ctx.save();
  // قص شكل كومة البودرة بسطح غير مستوٍ
  ctx.beginPath();
  ctx.moveTo(bx, by + bh);
  ctx.lineTo(bx, fillTop + bh * 0.02);
  for (let i = 0; i <= 16; i++) {
    const px = bx + (bw * i) / 16;
    const wave =
      Math.sin(i * 0.9 + t * 2.2) * bh * 0.012 +
      Math.sin(i * 2.1 + t * 1.4) * bh * 0.006;
    ctx.lineTo(px, fillTop + wave + jy * 0.15);
  }
  ctx.lineTo(bx + bw, by + bh);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(tex, bx - 4 + jx, fillTop - 8 + jy, bw + 8, bh * 0.72 + 16);
  // طبقة ثانية مزاحمة للعمق الحركي
  ctx.globalAlpha = 0.35;
  ctx.drawImage(tex, bx + 2 - jx, fillTop + 4 - jy * 0.5, bw - 2, bh * 0.7);
  ctx.globalAlpha = 1;
  ctx.restore();

  // جزيئات فضية قليلة جداً فوق السطح
  if (powder?.floaters) {
    for (const f of powder.floaters) {
      const px = bx + f.x * bw;
      const py = by + f.y * bh;
      const pr = Math.max(0.8, f.r * Math.min(bw, bh));
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * f.twinkle + f.phase));
      ctx.globalAlpha = alpha * tw;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      // وميض صغير
      ctx.beginPath();
      ctx.moveTo(px - pr * 2, py);
      ctx.lineTo(px + pr * 2, py);
      ctx.moveTo(px, py - pr * 1.8);
      ctx.lineTo(px, py + pr * 1.8);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(0.5, pr * 0.35);
      ctx.stroke();
      ctx.globalAlpha = alpha;
    }
  }

  ctx.restore(); // end clip interior

  // —— غلاف زجاجي كريستالي ——
  // Fresnel / سماكة الحافة
  pillPath(ctx, bx, by, bw, bh);
  const rim = ctx.createLinearGradient(bx, by, bx + bw, by);
  rim.addColorStop(0, "rgba(140, 175, 205, 0.28)");
  rim.addColorStop(0.2, "rgba(255,255,255,0.05)");
  rim.addColorStop(0.8, "rgba(255,255,255,0.05)");
  rim.addColorStop(1, "rgba(130, 165, 195, 0.26)");
  ctx.fillStyle = rim;
  ctx.fill();

  // تدرج عمودي خفيف للزجاج
  pillPath(ctx, bx, by, bw, bh);
  const glassV = ctx.createLinearGradient(bx, by, bx, by + bh);
  glassV.addColorStop(0, "rgba(255,255,255,0.14)");
  glassV.addColorStop(0.5, "rgba(255,255,255,0.02)");
  glassV.addColorStop(1, "rgba(180, 200, 220, 0.1)");
  ctx.fillStyle = glassV;
  ctx.fill();

  // إطار أبيض خارجي
  pillPath(ctx, bx, by, bw, bh);
  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.lineWidth = Math.max(2, w * 0.034);
  ctx.stroke();

  // إطار داخلي
  pillPath(ctx, bx + 1.8, by + 1.8, bw - 3.6, bh - 3.6);
  ctx.strokeStyle = "rgba(90, 125, 155, 0.42)";
  ctx.lineWidth = Math.max(0.8, w * 0.012);
  ctx.stroke();

  // خط التحام المنتصف الواضح
  ctx.save();
  pillPath(ctx, bx, by, bw, bh);
  ctx.clip();
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.06, cy);
  ctx.lineTo(bx + bw * 0.94, cy);
  ctx.strokeStyle = "rgba(55, 90, 120, 0.55)";
  ctx.lineWidth = Math.max(1.3, w * 0.022);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.08, cy - 1.2);
  ctx.lineTo(bx + bw * 0.92, cy - 1.2);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 1;
  ctx.stroke();
  // ظل خفيف تحت الخط
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.1, cy + 1.3);
  ctx.lineTo(bx + bw * 0.9, cy + 1.3);
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // speculars
  ctx.beginPath();
  ctx.ellipse(cx - bw * 0.16, by + bh * 0.16, bw * 0.15, bh * 0.1, -0.48, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx + bw * 0.12, by + bh * 0.085, bw * 0.06, bh * 0.028, 0.3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fill();

  // شريط لمعان طويل
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.16, by + bh * 0.14);
  ctx.quadraticCurveTo(bx + bw * 0.04, cy, bx + bw * 0.18, by + bh * 0.86);
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = Math.max(1.6, w * 0.028);
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.85, by + bh * 0.2);
  ctx.quadraticCurveTo(bx + bw * 0.96, cy, bx + bw * 0.83, by + bh * 0.78);
  ctx.strokeStyle = "rgba(185, 210, 230, 0.4)";
  ctx.lineWidth = Math.max(1, w * 0.014);
  ctx.stroke();

  if (selected || highlight > 0) {
    pillPath(ctx, bx - 3, by - 3, bw + 6, bh + 6);
    ctx.strokeStyle = def.glow;
    ctx.lineWidth = 3.2 + highlight * 2;
    ctx.stroke();
  }

  if (special) drawSpecialBadge(ctx, cx, cy, w * 0.16, special);

  ctx.restore();
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
