import { drawCapsule, drawBoardFrame } from "./capsule.js";
import { key, parseKey } from "./board.js";
import { CAPSULE_TYPES } from "./config.js";

/**
 * محرّك الرسم والحركة — دقة عالية 60fps
 */
export class BoardView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.board = null;
    this.selected = null;
    this.hover = null;
    this.cell = 80;
    this.gap = 6;
    this.layout = { ox: 0, oy: 0 };
    this.fx = [];
    this.running = false;
    this.lastTs = 0;
    this.onSwap = null;
    this.onCellTap = null;
    this.boosterMode = null;
    this.theme = null;
    this._bindInput();
  }

  setTheme(theme) {
    this.theme = theme;
  }

  setBoard(board) {
    this.board = board;
    this.selected = null;
    this._resize();
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
      this._draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }

  _resize() {
    if (!this.board) return;
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    const css = Math.min(420, this.canvas.parentElement?.clientWidth || 420);
    const size = Math.floor(css);
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.canvas.width = Math.floor(size * dpr);
    this.canvas.height = Math.floor(size * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cssSize = size;
    const maxDim = Math.max(this.board.rows, this.board.cols);
    this.gap = Math.max(4, size * 0.012);
    this.cell = (size - this.gap * (maxDim + 1) - size * 0.04) / maxDim;
  }

  cellAt(r, c) {
    const ox = (this.cssSize - (this.board.cols * this.cell + (this.board.cols - 1) * this.gap)) / 2;
    const oy = (this.cssSize - (this.board.rows * this.cell + (this.board.rows - 1) * this.gap)) / 2;
    return {
      x: ox + c * (this.cell + this.gap),
      y: oy + r * (this.cell + this.gap),
      w: this.cell,
      h: this.cell,
      ox,
      oy,
    };
  }

  _update(dt) {
    if (!this.board) return;
    for (let r = 0; r < this.board.rows; r++) {
      for (let c = 0; c < this.board.cols; c++) {
        const t = this.board.get(r, c);
        if (t?.powder) t.powder.update(dt);
        if (t && t.pop > 0) t.pop = Math.max(0, t.pop - dt * 4);
      }
    }
    // FX particles
    this.fx = this.fx.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
      return p.life > 0;
    });
  }

  _draw() {
    if (!this.board) return;
    const ctx = this.ctx;
    const s = this.cssSize;
    ctx.clearRect(0, 0, s, s);

    const tc = this.theme?.colors;
    const bg = ctx.createRadialGradient(s * 0.5, s * 0.3, 10, s * 0.5, s * 0.5, s * 0.7);
    bg.addColorStop(0, tc?.canvasGlow || "rgba(30, 110, 120, 0.35)");
    bg.addColorStop(1, "rgba(4, 28, 36, 0.15)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    drawBoardFrame(ctx, s, s, this.cell, this.gap, this.board.rows, this.board.cols, this.theme);

    // خلايا محظورة (معدات طبية / أسرّة)
    for (let r = 0; r < this.board.rows; r++) {
      for (let c = 0; c < this.board.cols; c++) {
        if (!this.board.isBlocked(r, c)) continue;
        const { x, y, w, h } = this.cellAt(r, c);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        roundRect(ctx, x + 4, y + 4, w - 8, h - 8, 12);
        ctx.fill();
        ctx.strokeStyle = "rgba(126,240,216,0.2)";
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.font = `${w * 0.35}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✚", x + w / 2, y + h / 2);
      }
    }

    // الكبسولات
    for (let r = 0; r < this.board.rows; r++) {
      for (let c = 0; c < this.board.cols; c++) {
        const tile = this.board.get(r, c);
        if (!tile) continue;
        const dr = tile.displayR ?? r;
        const dc = tile.displayC ?? c;
        const { x, y, w, h } = this.cellAt(dr, dc);
        const sel =
          this.selected && this.selected.r === r && this.selected.c === c;
        const sc = tile.scale * (sel ? 1.06 : 1) * (1 + (tile.pop || 0) * 0.15);
        drawCapsule(ctx, x, y, w, h, tile.type, tile.powder, {
          selected: sel,
          special: tile.special,
          alpha: tile.alpha ?? 1,
          scale: sc,
        });
      }
    }

    // جزيئات FX
    for (const p of this.fx) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  burstAt(r, c, type) {
    const { x, y, w, h } = this.cellAt(r, c);
    const def = CAPSULE_TYPES[type];
    const colors = def?.powder || ["#fff"];
    for (let i = 0; i < 22; i++) {
      this.fx.push({
        x: x + w / 2,
        y: y + h / 2,
        vx: (Math.random() - 0.5) * 320,
        vy: (Math.random() - 0.5) * 320 - 60,
        r: 1.8 + Math.random() * 4.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.4 + Math.random() * 0.45,
        max: 0.85,
      });
    }
    // شظايا زجاجية بيضاء
    for (let i = 0; i < 6; i++) {
      this.fx.push({
        x: x + w / 2,
        y: y + h / 2,
        vx: (Math.random() - 0.5) * 260,
        vy: (Math.random() - 0.5) * 260 - 40,
        r: 1 + Math.random() * 2,
        color: "#ffffff",
        life: 0.25 + Math.random() * 0.25,
        max: 0.5,
      });
    }
  }

  /** واجهة حركات للمجلس */
  createAnimator() {
    const view = this;
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const tween = (ms, fn) =>
      new Promise((resolve) => {
        const t0 = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - t0) / ms);
          fn(ease(t));
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });

    return {
      async swap(a, b, r1, c1, r2, c2) {
        const fromA = { r: r1, c: c1 };
        const fromB = { r: r2, c: c2 };
        await tween(160, (t) => {
          a.displayR = fromA.r + (r2 - fromA.r) * t;
          a.displayC = fromA.c + (c2 - fromA.c) * t;
          b.displayR = fromB.r + (r1 - fromB.r) * t;
          b.displayC = fromB.c + (c1 - fromB.c) * t;
        });
        a.displayR = r2;
        a.displayC = c2;
        b.displayR = r1;
        b.displayC = c1;
      },

      async pop(keys, board) {
        const list = [...keys];
        for (const k of list) {
          const { r, c } = parseKey(k);
          const tile = board.get(r, c);
          if (tile) {
            tile.pop = 1;
            view.burstAt(r, c, tile.type);
          }
        }
        await tween(180, (t) => {
          for (const k of list) {
            const { r, c } = parseKey(k);
            const tile = board.get(r, c);
            if (tile) {
              tile.scale = 1 - t * 0.85;
              tile.alpha = 1 - t;
            }
          }
        });
      },

      async fall(moves) {
        // عيّن نقطة البداية
        for (const m of moves) {
          m.tile.displayR = m.fromR;
          m.tile.displayC = m.fromC;
          m.tile.scale = 1;
          m.tile.alpha = 1;
        }
        await tween(220, (t) => {
          for (const m of moves) {
            m.tile.displayR = m.fromR + (m.toR - m.fromR) * t;
            m.tile.displayC = m.fromC + (m.toC - m.fromC) * t;
            if (m.spawn) m.tile.alpha = Math.min(1, t * 1.4);
          }
        });
        for (const m of moves) {
          m.tile.displayR = m.toR;
          m.tile.displayC = m.toC;
          m.tile.alpha = 1;
          m.tile.powder?.shake(0.4);
        }
      },

      async spawnSpecial(tile) {
        tile.scale = 0.2;
        await tween(220, (t) => {
          tile.scale = 0.2 + 0.8 * t;
        });
        tile.scale = 1;
      },

      async shuffleFx() {
        await tween(300, (t) => {
          if (!view.board) return;
          for (let r = 0; r < view.board.rows; r++) {
            for (let c = 0; c < view.board.cols; c++) {
              const tile = view.board.get(r, c);
              if (tile) tile.scale = 0.85 + 0.15 * Math.sin(t * Math.PI);
            }
          }
        });
      },
    };
  }

  _bindInput() {
    const pos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * this.cssSize,
        y: ((clientY - rect.top) / rect.height) * this.cssSize,
      };
    };

    const hit = (p) => {
      if (!this.board) return null;
      for (let r = 0; r < this.board.rows; r++) {
        for (let c = 0; c < this.board.cols; c++) {
          if (this.board.isBlocked(r, c)) continue;
          const cell = this.cellAt(r, c);
          if (p.x >= cell.x && p.x <= cell.x + cell.w && p.y >= cell.y && p.y <= cell.y + cell.h) {
            return { r, c };
          }
        }
      }
      return null;
    };

    let down = null;

    const onDown = (e) => {
      if (this.board?.busy) return;
      e.preventDefault();
      down = hit(pos(e));
      if (!down) return;

      if (this.boosterMode) {
        this.onCellTap?.(down.r, down.c, this.boosterMode);
        return;
      }

      if (this.selected) {
        const s = this.selected;
        if (s.r === down.r && s.c === down.c) {
          this.selected = null;
          return;
        }
        if (Math.abs(s.r - down.r) + Math.abs(s.c - down.c) === 1) {
          this.onSwap?.(s.r, s.c, down.r, down.c);
          this.selected = null;
          return;
        }
      }
      this.selected = down;
    };

    const onMove = (e) => {
      if (!down || this.boosterMode) return;
      const cur = hit(pos(e));
      if (!cur) return;
      if (Math.abs(cur.r - down.r) + Math.abs(cur.c - down.c) === 1) {
        this.onSwap?.(down.r, down.c, cur.r, cur.c);
        this.selected = null;
        down = null;
      }
    };

    const onUp = () => {
      down = null;
    };

    this.canvas.addEventListener("mousedown", onDown);
    this.canvas.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    this.canvas.addEventListener("touchstart", onDown, { passive: false });
    this.canvas.addEventListener("touchmove", onMove, { passive: false });
    this.canvas.addEventListener("touchend", onUp);

    window.addEventListener("resize", () => this._resize());
  }
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

export { key };
