/**
 * محرّك juice — مؤثرات Royal Match: كومبو، اهتزاز، نصوص، وميض
 */
const COMBO_LABELS = [
  { min: 1, text: "جيد!", color: "#7ef0d8", scale: 0.85 },
  { min: 2, text: "رائع!", color: "#ffe082", scale: 1 },
  { min: 3, text: "ممتاز!", color: "#ffab40", scale: 1.1 },
  { min: 4, text: "مذهل!", color: "#ff7043", scale: 1.2 },
  { min: 5, text: "أسطوري!", color: "#ff4081", scale: 1.35 },
  { min: 6, text: "شفاء كامل!", color: "#ffd54f", scale: 1.5 },
];

const SPECIAL_LABELS = {
  row: "جرعة صفّية!",
  col: "جرعة عمودية!",
  bomb: "جرعة مركّزة!",
  rainbow: "قوس قزح!",
};

export class JuiceEngine {
  constructor(layerEl, boardWrapEl) {
    this.layer = layerEl;
    this.boardWrap = boardWrapEl;
    this.combo = 0;
    this.comboDecay = null;
    this.shakeAmp = 0;
    this.shakeDecay = 8;
    this.flashAlpha = 0;
    this.running = false;
    this.lastTs = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTs = performance.now();
    const loop = (ts) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
      this.lastTs = ts;
      this._update(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    this.resetCombo();
  }

  resetCombo() {
    this.combo = 0;
    if (this.comboDecay) clearTimeout(this.comboDecay);
    this.comboDecay = null;
  }

  /** خطوة شلال — يزيد الكومبو ويعرض النص */
  onCascadeStep(matchCount, specialCreated = null) {
    this.combo++;
    const label = COMBO_LABELS[Math.min(this.combo - 1, COMBO_LABELS.length - 1)];
    const text = specialCreated ? SPECIAL_LABELS[specialCreated] || label.text : label.text;
    this._spawnComboText(text, label.color, label.scale + Math.min(matchCount, 6) * 0.04);
    this._shake(Math.min(4 + this.combo * 1.8 + matchCount * 0.3, 14));
    this._flash(0.08 + Math.min(this.combo * 0.02, 0.12));

    if (this.comboDecay) clearTimeout(this.comboDecay);
    this.comboDecay = setTimeout(() => this.resetCombo(), 1400);
  }

  onBigMatch(matchCount) {
    if (matchCount >= 5) {
      this._spawnComboText("مطابقة ضخمة!", "#ffd54f", 1.25);
      this._shake(10);
    }
  }

  onInvalidSwap() {
    this.resetCombo();
    this._shake(5);
    if (this.boardWrap) {
      this.boardWrap.classList.remove("board-wobble");
      void this.boardWrap.offsetWidth;
      this.boardWrap.classList.add("board-wobble");
      setTimeout(() => this.boardWrap?.classList.remove("board-wobble"), 420);
    }
  }

  onGoalComplete() {
    this._spawnComboText("هدف مكتمل!", "#7ef0d8", 1.05, true);
    this._flash(0.15);
  }

  onLevelWin() {
    this._spawnComboText("شُفي المريض!", "#ffd54f", 1.4, true);
    this._shake(8);
    this._flash(0.2);
  }

  getShakeOffset() {
    if (this.shakeAmp < 0.3) return { x: 0, y: 0 };
    const a = this.shakeAmp;
    return {
      x: (Math.random() - 0.5) * a * 2,
      y: (Math.random() - 0.5) * a * 2,
    };
  }

  getFlashAlpha() {
    return this.flashAlpha;
  }

  _shake(amp) {
    this.shakeAmp = Math.max(this.shakeAmp, amp);
  }

  _flash(alpha) {
    this.flashAlpha = Math.max(this.flashAlpha, alpha);
  }

  _update(dt) {
    this.shakeAmp = Math.max(0, this.shakeAmp - this.shakeDecay * dt * 60);
    this.flashAlpha = Math.max(0, this.flashAlpha - dt * 2.5);
  }

  _spawnComboText(text, color, scale = 1, center = false) {
    if (!this.layer) return;
    const el = document.createElement("div");
    el.className = "juice-combo" + (center ? " juice-combo--center" : "");
    el.textContent = text;
    el.style.setProperty("--combo-color", color);
    el.style.setProperty("--combo-scale", String(scale));
    if (!center) {
      el.style.left = `${35 + Math.random() * 30}%`;
      el.style.top = `${38 + Math.random() * 12}%`;
    }
    this.layer.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
    setTimeout(() => el.remove(), 1200);
  }
}
