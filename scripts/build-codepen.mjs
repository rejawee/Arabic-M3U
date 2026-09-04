#!/usr/bin/env node
/**
 * Bundles Capsule Care into a single CodePen-ready HTML (no ES modules, no image assets).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "capsule-care");
const outDir = path.join(root, "codepen");

const ORDER = [
  "motion.js",
  "config.js",
  "capsule.js",
  "board.js",
  "fx.js",
  "juice.js",
  "scenes.js",
  "view.js",
  "main.js",
];

function stripModule(src, file) {
  let s = src;
  // Remove import lines
  s = s.replace(/^\s*import\s+[\s\S]*?from\s+["'][^"']+["']\s*;?\s*$/gm, "");
  // export { ... }
  s = s.replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, "");
  // export default ...
  s = s.replace(/^\s*export\s+default\s+/gm, "");
  // export async function / export function / export class / export const / export let
  s = s.replace(/^\s*export\s+(async\s+function|function|class|const|let|var)\s+/gm, "$1 ");
  return `/* ===== ${file} ===== */\n${s.trim()}\n`;
}

function codepenPatches() {
  return `
/* ===== CodePen asset helpers (no external PNGs) ===== */
function __capsuleIconDataUrl(typeId, w = 72, h = 88) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  try {
    drawCapsule(ctx, 0, 0, w, h, typeId, new CapsulePowder(typeId, 0), { bounce: 0 });
  } catch (_) {
    ctx.fillStyle = (CAPSULE_TYPES[typeId] && CAPSULE_TYPES[typeId].powder[2]) || "#ff1744";
    ctx.beginPath();
    const r = Math.min(w, h) / 2;
    ctx.moveTo(w / 2, r);
    ctx.arcTo(w, r, w, h - r, r);
    ctx.arcTo(w, h, w / 2, h, r);
    ctx.arcTo(0, h, 0, h - r, r);
    ctx.arcTo(0, 0, w / 2, 0, r);
    ctx.closePath();
    ctx.fill();
  }
  return c.toDataURL("image/png");
}

function __starDataUrl(size = 48, on = true) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const cx = size / 2;
  const cy = size / 2;
  const spikes = 5;
  const outer = size * 0.42;
  const inner = size * 0.18;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (Math.PI / spikes) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    const x = cx + Math.cos(ang) * r;
    const y = cy + Math.sin(ang) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  if (on) {
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, "#fff8e1");
    g.addColorStop(0.45, "#ffd54f");
    g.addColorStop(1, "#f9a825");
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.22)";
  }
  ctx.fill();
  ctx.strokeStyle = on ? "#c4922a" : "rgba(255,255,255,0.15)";
  ctx.lineWidth = size * 0.04;
  ctx.stroke();
  return c.toDataURL("image/png");
}

function __boosterDataUrl(id, state = "default", size = 128) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  drawBoosterIcon(ctx, id, size);
  if (state === "disabled") {
    ctx.fillStyle = "rgba(40,40,40,0.45)";
    ctx.fillRect(0, 0, size, size);
  } else if (state === "active") {
    ctx.strokeStyle = "rgba(255, 220, 80, 0.95)";
    ctx.lineWidth = size * 0.06;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.44, 0, Math.PI * 2);
    ctx.stroke();
  }
  return c.toDataURL("image/png");
}

function __installCodepenAssets() {
  const types = Object.keys(CAPSULE_TYPES || {});
  for (const id of types) {
    CAPSULE_SPRITES[id] = __capsuleIconDataUrl(id);
  }
  SPECIAL_SPRITES.fire = __capsuleIconDataUrl("ruby");
  SPECIAL_SPRITES.ice = __capsuleIconDataUrl("azure");
  SPECIAL_SPRITES.rainbow = __capsuleIconDataUrl("violet");
  UI_ICONS.star = __starDataUrl(48, true);
  UI_ICONS.coin = __starDataUrl(48, true);
  UI_ICONS.heart = __starDataUrl(48, true);
  UI_ICONS.treasure = __starDataUrl(48, true);
  for (const id of Object.keys(BOOSTER_SPRITES || {})) {
    BOOSTER_SPRITES[id].default = __boosterDataUrl(id, "default");
    BOOSTER_SPRITES[id].active = __boosterDataUrl(id, "active");
    BOOSTER_SPRITES[id].disabled = __boosterDataUrl(id, "disabled");
  }
  for (const id of Object.keys(OBSTACLE_SPRITES || {})) {
    OBSTACLE_SPRITES[id] = "";
  }
}

const __origPreload = typeof preloadAllSprites === "function" ? preloadAllSprites : null;
preloadAllSprites = function () {
  __installCodepenAssets();
  document.querySelectorAll(".booster").forEach((btn) => {
    const id = btn.dataset.booster;
    const img = btn.querySelector(".booster-icon");
    if (img && id) img.src = boosterSpritePath(id, "default");
  });
  if (__origPreload) {
    try { __origPreload(); } catch (_) {}
  }
};
`;
}

function buildJs() {
  const beforeMain = ORDER.filter((f) => f !== "main.js");
  const parts = beforeMain.map((file) => {
    const src = fs.readFileSync(path.join(root, "js", file), "utf8");
    return stripModule(src, file);
  });
  let mainSrc = fs.readFileSync(path.join(root, "js", "main.js"), "utf8");
  // Ensure CodePen asset install runs before first preload / HUD paint
  mainSrc = mainSrc.replace(/\bpreloadAllSprites\s*\(\s*\)\s*;?/g, "/* preload moved */");
  parts.push(codepenPatches());
  parts.push(stripModule(mainSrc, "main.js"));
  parts.push(`/* boot */
try { preloadAllSprites(); } catch (e) { console.warn(e); }
`);
  let bundled = parts.join("\n");
  // Empty leftover asset paths so Image() preload never hits the network
  bundled = bundled.replace(/(["'])assets\/[^"']+\1/g, "$1$1");
  return `(function () {
"use strict";
${bundled}
})();
`;
}

const PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

function buildHtml(css, jsInline) {
  let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  // Drop external stylesheet + module script
  html = html.replace(/<link rel="stylesheet" href="css\/styles\.css" \/>/, "<style>\n" + css + "\n</style>");
  html = html.replace(
    /<script type="module" src="js\/main\.js"><\/script>/,
    "<script>\n" + jsInline + "\n</script>"
  );
  // No external PNGs in CodePen — placeholder until JS paints procedural icons
  html = html.replace(/src="assets\/[^"]+"/g, `src="${PIXEL}"`);
  html = html.replace(
    /<title>.*?<\/title>/,
    "<title>شفاء — عيادة الكبسولات (CodePen)</title>"
  );
  html = html.replace(
    '<div id="app">',
    `<div id="app" data-codepen="1">`
  );
  return html;
}

fs.mkdirSync(outDir, { recursive: true });
const css = fs.readFileSync(path.join(root, "css", "styles.css"), "utf8");
const js = buildJs();
const html = buildHtml(css, js);

fs.writeFileSync(path.join(outDir, "shifa-codepen.html"), html);
fs.writeFileSync(path.join(outDir, "pen.css"), css);
fs.writeFileSync(path.join(outDir, "pen.js"), js);
// HTML panel body only (no html/head) for classic CodePen
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
const bodyInner = bodyMatch ? bodyMatch[1].replace(/<script>[\s\S]*<\/script>/i, "").trim() : "";
const headFonts = `<!-- Fonts loaded in HTML settings or paste this in HTML -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=El+Messiri:wght@500;600;700&display=swap" rel="stylesheet" />
`;
fs.writeFileSync(
  path.join(outDir, "pen.html"),
  headFonts + "\n" + bodyInner + "\n"
);

fs.writeFileSync(
  path.join(outDir, "README.md"),
  `# شفاء — نسخة CodePen

## طريقة سريعة
1. افتح الملف \`shifa-codepen.html\` في المتصفح مباشرة، أو
2. ارفع المحتوى إلى [CodePen](https://codepen.io/pen/):
   - **HTML** ← \`pen.html\`
   - **CSS** ← \`pen.css\`
   - **JS** ← \`pen.js\`
3. في إعدادات الـ Pen: فعّل *Add Vendor Prefixes* اختياريًا، ولا تستخدم Babel/TypeScript.

اللعبة كاملة: شاشات + لوحة مطابقة + معززات + قصة مستويات. الرسوم إجرائية (بدون ملفات PNG خارجية).
`
);

const sizes = {
  html: fs.statSync(path.join(outDir, "shifa-codepen.html")).size,
  js: fs.statSync(path.join(outDir, "pen.js")).size,
  css: fs.statSync(path.join(outDir, "pen.css")).size,
};
console.log("Built CodePen bundle:", sizes);
console.log("Output:", outDir);
