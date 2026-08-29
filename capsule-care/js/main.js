import { LEVELS, CAPSULE_TYPES, getRank, SAVE_KEY } from "./config.js";
import { Board } from "./board.js";
import { BoardView } from "./view.js";
import { CapsulePowder, drawCapsule } from "./capsule.js";

const $ = (sel) => document.querySelector(sel);

const state = {
  progress: loadProgress(),
  levelIndex: 0,
  board: null,
  view: null,
  moves: 0,
  boosters: { syringe: 3, spray: 3, pulse: 2, shuffle: 2 },
  activeBooster: null,
  animator: null,
};

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    unlocked: 1,
    stars: {},
    totalStars: 0,
  };
}

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state.progress));
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

/* —— Hero floating capsules —— */
function initHero() {
  const canvas = $("#hero-capsules");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const types = Object.keys(CAPSULE_TYPES);
  let w = 0;
  let h = 0;
  const pills = [];

  const resize = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < 12; i++) {
    const type = types[i % types.length];
    pills.push({
      type,
      x: Math.random() * Math.max(w, 320),
      y: Math.random() * Math.max(h, 500),
      size: 56 + Math.random() * 64,
      rot: (Math.random() - 0.5) * 0.8,
      vr: (Math.random() - 0.5) * 0.25,
      vy: 18 + Math.random() * 22,
      vx: (Math.random() - 0.5) * 14,
      powder: new CapsulePowder(type, i * 40),
      alpha: 0.4 + Math.random() * 0.4,
    });
  }

  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (w < 10) resize();
    ctx.clearRect(0, 0, w, h);

    // ضوء جوي
    const g = ctx.createRadialGradient(w * 0.5, h * 0.2, 20, w * 0.5, h * 0.35, w * 0.8);
    g.addColorStop(0, "rgba(126,240,216,0.12)");
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (const p of pills) {
      p.powder.update(dt);
      p.y += p.vy * dt;
      p.x += p.vx * dt + Math.sin(now / 900 + p.size) * 8 * dt;
      p.rot += p.vr * dt;
      if (p.y > h + p.size) {
        p.y = -p.size;
        p.x = Math.random() * w;
      }
      if (p.x < -p.size) p.x = w + p.size;
      if (p.x > w + p.size) p.x = -p.size;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      drawCapsule(ctx, -p.size / 2, -p.size * 0.65, p.size, p.size * 1.3, p.type, p.powder, {
        alpha: p.alpha,
        scale: 1,
      });
      ctx.restore();
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* —— Map —— */
function renderMap() {
  const path = $("#map-path");
  path.innerHTML = "";
  const rank = getRank(state.progress.totalStars);
  $("#doctor-rank").textContent = rank.title;
  $("#map-stars").textContent = `★ ${state.progress.totalStars}`;

  LEVELS.forEach((lv, i) => {
    const unlocked = lv.id <= state.progress.unlocked;
    const stars = state.progress.stars[lv.id] || 0;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `clinic-node${stars ? " done" : ""}`;
    btn.disabled = !unlocked;
    btn.style.animationDelay = `${i * 0.05}s`;
    btn.innerHTML = `
      <div class="clinic-badge">${lv.clinicIcon}</div>
      <div class="clinic-meta">
        <h3>${lv.id}. ${lv.patient}</h3>
        <p>${lv.clinic} — ${lv.condition}</p>
        <div class="clinic-stars">${unlocked ? "★".repeat(stars) + "☆".repeat(3 - stars) : "🔒 مقفل"}</div>
      </div>`;
    btn.addEventListener("click", () => openStory(i));
    path.appendChild(btn);
  });
}

function openStory(index) {
  state.levelIndex = index;
  const lv = LEVELS[index];
  $("#story-clinic").textContent = lv.clinic;
  $("#patient-name").textContent = lv.patient;
  $("#patient-condition").textContent = lv.condition;
  $("#story-text").textContent = lv.story;
  const avatar = $("#patient-avatar");
  avatar.dataset.emoji = lv.emoji;
  avatar.setAttribute("data-emoji", lv.emoji);
  avatar.style.setProperty("--e", `"${lv.emoji}"`);

  const objs = $("#story-objectives");
  objs.innerHTML = "";
  lv.goals.forEach((g) => {
    const def = CAPSULE_TYPES[g.type];
    const chip = document.createElement("div");
    chip.className = "obj-chip";
    chip.innerHTML = `<span class="obj-swatch" style="background:linear-gradient(135deg,${def.shell[0]},${def.shell[1]})"></span>×${g.count} ${def.name}`;
    objs.appendChild(chip);
  });
  const movesChip = document.createElement("div");
  movesChip.className = "obj-chip";
  movesChip.textContent = `${lv.moves} حركة`;
  objs.appendChild(movesChip);

  showScreen("screen-story");
}

/* —— Gameplay —— */
function startLevel() {
  const lv = LEVELS[state.levelIndex];
  state.moves = lv.moves;
  state.activeBooster = null;
  document.querySelectorAll(".booster").forEach((b) => b.classList.remove("active"));

  state.board = new Board(lv);
  state.board.init();

  const canvas = $("#board");
  if (!state.view) {
    state.view = new BoardView(canvas);
    state.view.onSwap = handleSwap;
    state.view.onCellTap = handleBoosterTap;
  }
  state.view.setBoard(state.board);
  state.view.boosterMode = null;
  state.view.start();
  state.animator = state.view.createAnimator();

  $("#hud-patient").textContent = `${lv.patient} — ${lv.condition}`;
  updateHud();
  updateBoosterUI();
  showScreen("screen-game");
}

function updateHud() {
  $("#hud-moves").textContent = String(state.moves);
  const { done, total } = state.board.goalProgress();
  $("#hud-goal").textContent = `${done}/${total}`;
  const pct = total ? Math.min(100, (done / total) * 100) : 0;
  // الصحة = تقدم العلاج
  $("#health-fill").style.width = `${Math.max(8, pct)}%`;
}

function updateBoosterUI() {
  for (const k of ["syringe", "spray", "pulse", "shuffle"]) {
    const el = $(`#boost-${k}`);
    if (el) el.textContent = String(state.boosters[k]);
    const btn = document.querySelector(`.booster[data-booster="${k}"]`);
    if (btn) btn.disabled = state.boosters[k] <= 0;
  }
}

async function handleSwap(r1, c1, r2, c2) {
  if (state.moves <= 0 || state.board.busy) return;
  const ok = await state.board.swap(r1, c1, r2, c2, state.animator);
  if (!ok) return;
  state.moves--;
  updateHud();
  checkEnd();
}

async function handleBoosterTap(r, c, kind) {
  if (!kind || state.boosters[kind] <= 0) return;
  if (kind !== "shuffle" && state.board.isBlocked(r, c)) return;

  const used = await state.board.useBooster(kind, r, c, state.animator);
  if (!used) return;
  state.boosters[kind]--;
  state.activeBooster = null;
  state.view.boosterMode = null;
  document.querySelectorAll(".booster").forEach((b) => b.classList.remove("active"));
  updateBoosterUI();
  updateHud();
  checkEnd();
}

function checkEnd() {
  if (state.board.goalsDone()) {
    endLevel(true);
  } else if (state.moves <= 0) {
    endLevel(false);
  }
}

function endLevel(won) {
  const lv = LEVELS[state.levelIndex];
  const title = $("#result-title");
  const msg = $("#result-msg");
  const starsEl = $("#result-stars");
  const btnNext = $("#btn-next");

  if (won) {
    const { done, total } = state.board.goalProgress();
    let stars = 1;
    if (state.moves >= Math.floor(lv.moves * 0.25)) stars = 2;
    if (state.moves >= Math.floor(lv.moves * 0.45)) stars = 3;
    const prev = state.progress.stars[lv.id] || 0;
    if (stars > prev) {
      state.progress.totalStars += stars - prev;
      state.progress.stars[lv.id] = stars;
    }
    if (state.progress.unlocked < lv.id + 1 && lv.id < LEVELS.length) {
      state.progress.unlocked = lv.id + 1;
    }
    if (lv.id === LEVELS.length) {
      state.progress.unlocked = LEVELS.length;
    }
    saveProgress();

    title.textContent = "نجحت العملية ✓";
    msg.textContent = `${lv.patient} تحسّن بفضل وصفاتك. البودرة تحركت في الكبسولات — والعلاج اكتمل.`;
    starsEl.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
    btnNext.hidden = lv.id >= LEVELS.length;
    btnNext.textContent = lv.id >= LEVELS.length ? "أنت عميد العيادة" : "المريض التالي";
  } else {
    title.textContent = "لم تكتمل الوصفة";
    msg.textContent = `الحركات نفدت قبل شفاء ${lv.patient}. أعد ترتيب الكبسولات وحاول مجدداً أيها الطبيب.`;
    starsEl.textContent = "☆☆☆";
    btnNext.hidden = true;
  }

  $("#btn-continue").hidden = false;
  showScreen("screen-result");
}

function wireUI() {
  $("#btn-start").addEventListener("click", () => {
    renderMap();
    showScreen("screen-map");
  });
  $("#btn-continue").addEventListener("click", () => {
    renderMap();
    showScreen("screen-map");
  });
  $("#btn-map-home").addEventListener("click", () => showScreen("screen-title"));
  $("#btn-play-level").addEventListener("click", startLevel);
  $("#btn-story-back").addEventListener("click", () => {
    renderMap();
    showScreen("screen-map");
  });
  $("#btn-pause").addEventListener("click", () => {
    $("#overlay-pause").hidden = false;
  });
  $("#btn-resume").addEventListener("click", () => {
    $("#overlay-pause").hidden = true;
  });
  $("#btn-quit-level").addEventListener("click", () => {
    $("#overlay-pause").hidden = true;
    renderMap();
    showScreen("screen-map");
  });
  $("#btn-retry").addEventListener("click", startLevel);
  $("#btn-to-map").addEventListener("click", () => {
    renderMap();
    showScreen("screen-map");
  });
  $("#btn-next").addEventListener("click", () => {
    if (state.levelIndex < LEVELS.length - 1) {
      openStory(state.levelIndex + 1);
    } else {
      renderMap();
      showScreen("screen-map");
    }
  });

  document.querySelectorAll(".booster").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.booster;
      if (state.boosters[kind] <= 0) return;
      if (kind === "shuffle") {
        handleBoosterTap(0, 0, "shuffle");
        return;
      }
      if (state.activeBooster === kind) {
        state.activeBooster = null;
        state.view.boosterMode = null;
        btn.classList.remove("active");
        return;
      }
      document.querySelectorAll(".booster").forEach((b) => b.classList.remove("active"));
      state.activeBooster = kind;
      state.view.boosterMode = kind;
      btn.classList.add("active");
    });
  });

  // إظهار متابعة إن وُجد تقدم
  if (state.progress.totalStars > 0 || state.progress.unlocked > 1) {
    $("#btn-continue").hidden = false;
  }
}

/* إصلاح عرض إيموجي المريض عبر CSS content */
const styleFix = document.createElement("style");
styleFix.textContent = `.patient-avatar::after { content: attr(data-emoji); }`;
document.head.appendChild(styleFix);

wireUI();
initHero();

// خدمة محلية: إن فُتح الملف مباشرة، كل شيء يعمل كـ ES modules من خادم
console.info("شفاء — عيادة الكبسولات جاهزة");
