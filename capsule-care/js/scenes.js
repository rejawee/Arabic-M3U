/**
 * مشاهد غرف العلاج — خلفيات مرسومة لكل ثيم ومرحلة (أسلوب Royal Match)
 */

const ROOMS = {
  neighborhood: {
    wallTop: "#6aabbf",
    wallBottom: "#4a8498",
    trim: "#d4af6a",
    floor: "#b8884a",
    floorDark: "#8a6230",
    ceiling: "#e8f4f8",
    light: "rgba(255,248,220,0.35)",
    window: true,
    plants: true,
  },
  children: {
    wallTop: "#c48ad4",
    wallBottom: "#9b5fb0",
    trim: "#ffd54f",
    floor: "#f5c882",
    floorDark: "#d4a055",
    ceiling: "#fff3e0",
    light: "rgba(255,200,255,0.3)",
    window: true,
    balloons: true,
  },
  emergency: {
    wallTop: "#8b3030",
    wallBottom: "#5a1818",
    trim: "#ffc107",
    floor: "#6a6a72",
    floorDark: "#454550",
    ceiling: "#eceff1",
    light: "rgba(255,100,80,0.25)",
    cross: true,
    monitors: true,
  },
  research: {
    wallTop: "#3d5a8a",
    wallBottom: "#243d6a",
    trim: "#18ffff",
    floor: "#546e7a",
    floorDark: "#37474f",
    ceiling: "#cfd8dc",
    light: "rgba(100,200,255,0.28)",
    lab: true,
    screens: true,
  },
};

/** رسم مشهد الغرفة الكامل */
export function drawClinicScene(ctx, w, h, theme, level) {
  const room = ROOMS[theme.id] || ROOMS.neighborhood;
  const props = level.sceneProps || theme.decor || [];

  ctx.clearRect(0, 0, w, h);

  const floorY = h * 0.58;
  const wallH = floorY;

  // سقف
  const ceil = ctx.createLinearGradient(0, 0, 0, wallH * 0.18);
  ceil.addColorStop(0, room.ceiling);
  ceil.addColorStop(1, room.wallTop);
  ctx.fillStyle = ceil;
  ctx.fillRect(0, 0, w, wallH * 0.12);

  // إضاءة سقف (skylight)
  ctx.fillStyle = room.light;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, wallH * 0.08, w * 0.35, wallH * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // جدار خلفي
  const wall = ctx.createLinearGradient(0, wallH * 0.1, 0, floorY);
  wall.addColorStop(0, room.wallTop);
  wall.addColorStop(1, room.wallBottom);
  ctx.fillStyle = wall;
  ctx.fillRect(0, wallH * 0.1, w, floorY - wallH * 0.1);

  // إطار ذهبي (wainscoting) — مثل Royal Match
  drawWallPanels(ctx, w, wallH, room);

  // نافذة
  if (room.window) {
    drawWindow(ctx, w * 0.12, wallH * 0.22, w * 0.28, wallH * 0.32, theme.id);
  }

  // أرضية خشبية
  drawWoodFloor(ctx, w, h, floorY, room);

  // دعائم الثيم
  if (room.plants) drawPlant(ctx, w * 0.82, floorY - h * 0.08, h * 0.12);
  if (room.balloons) drawBalloons(ctx, w * 0.78, wallH * 0.2, h * 0.08);
  if (room.cross) drawMedicalCross(ctx, w * 0.85, wallH * 0.25, h * 0.1);
  if (room.monitors) drawMonitor(ctx, w * 0.08, wallH * 0.28, w * 0.22, h * 0.08);
  if (room.lab) drawLabShelf(ctx, w * 0.78, wallH * 0.22, w * 0.18, h * 0.25);
  if (room.screens) drawLabScreen(ctx, w * 0.06, wallH * 0.3, w * 0.2, h * 0.1);

  // دعائم القصة لكل مرحلة
  drawStoryProps(ctx, w, h, floorY, props, level);

  // تظليل خفيف أسفل اللوحة
  const vignette = ctx.createRadialGradient(w * 0.5, h * 0.55, w * 0.2, w * 0.5, h * 0.55, w * 0.65);
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function drawWallPanels(ctx, w, wallH, room) {
  const panelY = wallH * 0.38;
  const panelH = wallH * 0.42;

  // شريط ذهبي علوي
  ctx.fillStyle = room.trim;
  ctx.fillRect(0, panelY - 4, w, 5);
  ctx.fillRect(0, panelY + panelH + 2, w, 4);

  // لوحات الجدار
  const cols = 3;
  const gap = w * 0.04;
  const pw = (w - gap * (cols + 1)) / cols;
  for (let i = 0; i < cols; i++) {
    const px = gap + i * (pw + gap);
    const pg = ctx.createLinearGradient(px, panelY, px, panelY + panelH);
    pg.addColorStop(0, "rgba(255,255,255,0.12)");
    pg.addColorStop(1, "rgba(0,0,0,0.08)");
    ctx.fillStyle = pg;
    roundRect(ctx, px, panelY, pw, panelH, 6);
    ctx.fill();
    ctx.strokeStyle = room.trim + "88";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawWindow(ctx, x, y, ww, wh, themeId) {
  ctx.fillStyle = "#5d4037";
  roundRect(ctx, x - 4, y - 4, ww + 8, wh + 8, 4);
  ctx.fill();

  const sky = ctx.createLinearGradient(x, y, x, y + wh);
  if (themeId === "children") {
    sky.addColorStop(0, "#81d4fa");
    sky.addColorStop(1, "#fff9c4");
  } else {
    sky.addColorStop(0, "#87ceeb");
    sky.addColorStop(1, "#b2dfdb");
  }
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, ww, wh);

  // تقسيم النافذة
  ctx.strokeStyle = "#5d4037";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + ww / 2, y);
  ctx.lineTo(x + ww / 2, y + wh);
  ctx.moveTo(x, y + wh / 2);
  ctx.lineTo(x + ww, y + wh / 2);
  ctx.stroke();

  // شمس/سحب
  ctx.fillStyle = "rgba(255,235,59,0.8)";
  ctx.beginPath();
  ctx.arc(x + ww * 0.7, y + wh * 0.25, wh * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function drawWoodFloor(ctx, w, h, floorY, room) {
  const fg = ctx.createLinearGradient(0, floorY, 0, h);
  fg.addColorStop(0, room.floor);
  fg.addColorStop(1, room.floorDark);
  ctx.fillStyle = fg;
  ctx.fillRect(0, floorY, w, h - floorY);

  // خطوط الخشب
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 1;
  const plankW = w / 8;
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(i * plankW, floorY);
    ctx.lineTo(i * plankW, h);
    ctx.stroke();
  }
  // خطوط أفقية
  for (let j = 0; j < 4; j++) {
    const py = floorY + ((h - floorY) / 4) * j;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(w, py);
    ctx.stroke();
  }

  // انعكاس
  const shine = ctx.createLinearGradient(0, floorY, 0, floorY + 30);
  shine.addColorStop(0, "rgba(255,255,255,0.15)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fillRect(0, floorY, w, 30);
}

function drawPlant(ctx, x, y, size) {
  ctx.fillStyle = "#795548";
  ctx.fillRect(x - size * 0.15, y, size * 0.3, size * 0.5);
  ctx.fillStyle = "#2e7d32";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * size * 0.3, y - size * 0.1 + Math.sin(a) * size * 0.2, size * 0.22, size * 0.14, a, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBalloons(ctx, x, y, size) {
  const colors = ["#ff5252", "#ffd54f", "#69f0ae", "#448aff"];
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(x + (i - 1.5) * size * 0.5, y + i * size * 0.15, size * 0.22, size * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function drawMedicalCross(ctx, x, y, size) {
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  roundRect(ctx, x - size * 0.5, y - size * 0.5, size, size, size * 0.1);
  ctx.fill();
  ctx.fillStyle = "#ff5252";
  ctx.fillRect(x - size * 0.35, y - size * 0.1, size * 0.7, size * 0.2);
  ctx.fillRect(x - size * 0.1, y - size * 0.35, size * 0.2, size * 0.7);
}

function drawMonitor(ctx, x, y, ww, wh) {
  ctx.fillStyle = "#37474f";
  roundRect(ctx, x, y, ww, wh, 4);
  ctx.fill();
  ctx.fillStyle = "#1b5e20";
  ctx.fillRect(x + 4, y + 4, ww - 8, wh - 8);
  // خط نبض
  ctx.strokeStyle = "#69f0ae";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + wh * 0.6);
  for (let i = 0; i < 8; i++) {
    const px = x + 6 + (i / 7) * (ww - 12);
    const py = y + wh * 0.6 + (i % 2 === 0 ? -wh * 0.25 : wh * 0.1);
    ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function drawLabShelf(ctx, x, y, ww, wh) {
  ctx.fillStyle = "#78909c";
  ctx.fillRect(x, y, ww, wh * 0.06);
  ctx.fillRect(x, y + wh * 0.45, ww, wh * 0.06);
  const tubeColors = ["#e53935", "#1e88e5", "#43a047", "#fdd835"];
  tubeColors.forEach((c, i) => {
    const tx = x + ww * 0.15 + i * ww * 0.2;
    ctx.fillStyle = c + "cc";
    ctx.fillRect(tx, y + wh * 0.1, ww * 0.1, wh * 0.32);
    ctx.fillStyle = "#cfd8dc";
    ctx.fillRect(tx - 2, y + wh * 0.08, ww * 0.1 + 4, wh * 0.04);
  });
}

function drawLabScreen(ctx, x, y, ww, wh) {
  ctx.fillStyle = "#263238";
  roundRect(ctx, x, y, ww, wh, 4);
  ctx.fill();
  ctx.fillStyle = "#0d47a1";
  ctx.fillRect(x + 3, y + 3, ww - 6, wh - 6);
  ctx.fillStyle = "rgba(24,255,255,0.6)";
  ctx.font = `${wh * 0.35}px monospace`;
  ctx.fillText("DNA", x + ww * 0.25, y + wh * 0.65);
}

function drawStoryProps(ctx, w, h, floorY, props, level) {
  if (!props.length) return;
  const startX = w * 0.38;
  const y = floorY - h * 0.06;
  props.slice(0, 4).forEach((prop, i) => {
    const px = startX + i * w * 0.14;
    ctx.font = `${h * 0.055}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.fillText(prop, px, y);
    ctx.shadowBlur = 0;
  });

  // شريط القصة
  if (level.condition) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    roundRect(ctx, w * 0.15, wallHint(floorY) - h * 0.04, w * 0.7, h * 0.045, h * 0.015);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = `600 ${h * 0.028}px Cairo, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`${level.patient} — ${level.condition}`, w * 0.5, wallHint(floorY) - h * 0.018);
  }
}

function wallHint(floorY) {
  return floorY;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** رسم مشهد شاشة القصة */
export function drawStoryScene(ctx, w, h, theme, level) {
  drawClinicScene(ctx, w, h, theme, level);
  const overlay = ctx.createLinearGradient(0, h * 0.3, 0, h);
  overlay.addColorStop(0, "rgba(0,0,0,0.1)");
  overlay.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, w, h);
}
