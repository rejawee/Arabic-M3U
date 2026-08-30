import { drawCapsule, drawBoardFrame } from "./capsule.js";
import { key, parseKey } from "./board.js";
import { BoardFx } from "./fx.js";
import {
  easeOutBack,
  easeOutElastic,
  easeFall,
  easeOutCubic,
  easeInOutCubic,
  squashStretch,
  tween,
} from "./motion.js";

/**
 * محرّك الرسم والحركة — حركة كبسولات juicy + مؤثرات اللوحة
 */
export class BoardView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.board = null;
    this.selected = null;
    this.cell = 80;
    this.gap = 6;
    this.boardFx = new BoardFx();
    this.running = false;
    this.lastTs = 0;
    this.time = 0;
    this.onSwap = null;
    this.onCellTap = null;
    this.boosterMode = null;
    this.theme = null;
    this.juice = null;
    this._bindInput();
    if (typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver(() => this._resize());
    }
  }

  setTheme(theme) {
    this.theme = theme;
  }

  setBoard(board) {
    this.board = board;
    this.selected = null;
    this.boardFx.clear();
    this._initTileMotion();
    this._resize();
    if (this._ro && this.canvas.parentElement) {
      this._ro.disconnect();
      this._ro.observe(this.canvas.parentElement);
    }
  }

  _initTileMotion() {
    if (!this.board) return;
    for (let r = 0; r < this.board.rows; r++) {
      for (let c = 0; c < this.board.cols; c++) {
        const t = this.board.get(r, c);
        if (t) this._resetTileMotion(t);
      }
    }
  }

  _resetTileMotion(tile) {
    tile.tilt = 0;
    tile.squashX = 1;
    tile.squashY = 1;
    tile.glowPulse = 0;
    tile.landPulse = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTs = performance.now();
    const loop = (ts) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
      this.lastTs = ts;
      this.time += dt;
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
    const wrap = this.canvas.parentElement;
    const pad = 8;
    const availW = Math.max(80, (wrap?.clientWidth || 320) - pad);
    const availH = Math.max(80, (wrap?.clientHeight || 320) - pad);
    const size = Math.floor(Math.min(availW, availH, 520));
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.canvas.width = Math.floor(size * dpr);
    this.canvas.height = Math.floor(size * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cssSize = size;
    const maxDim = Math.max(this.board.rows, this.board.cols);
    this.gap = Math.max(3, size * 0.011);
    this.cell = (size - this.gap * (maxDim + 1) - size * 0.035) / maxDim;
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
        if (!t) continue;
        if (t.powder) t.powder.update(dt);
        if (t.pop > 0) t.pop = Math.max(0, t.pop - dt * 5);
        if (t.glowPulse > 0) t.glowPulse = Math.max(0, t.glowPulse - dt * 2.2);
        if (t.landPulse > 0) t.landPulse = Math.max(0, t.landPulse - dt * 3.5);
        // رجوع تدريجي للميل والانضغاط
        t.tilt = (t.tilt || 0) * (1 - dt * 12);
        const sx = t.squashX ?? 1;
        const sy = t.squashY ?? 1;
        t.squashX = sx + (1 - sx) * Math.min(1, dt * 14);
        t.squashY = sy + (1 - sy) * Math.min(1, dt * 14);
      }
    }
    this.boardFx.update(dt);
  }

  _draw() {
    if (!this.board) return;
    const ctx = this.ctx;
    const s = this.cssSize;
    const shake = this.juice?.getShakeOffset() || { x: 0, y: 0 };
    ctx.clearRect(0, 0, s, s);
    ctx.save();
    ctx.translate(shake.x, shake.y);

    const bg = ctx.createRadialGradient(s * 0.5, s * 0.5, s * 0.15, s * 0.5, s * 0.5, s * 0.55);
    bg.addColorStop(0, "rgba(0,0,0,0.08)");
    bg.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    drawBoardFrame(ctx, s, s, this.cell, this.gap, this.board.rows, this.board.cols, this.theme);

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

    // ترتيب الرسم: صفوف من الأسفل للأعلى (عمق بصري)
    const tiles = [];
    for (let r = 0; r < this.board.rows; r++) {
      for (let c = 0; c < this.board.cols; c++) {
        const tile = this.board.get(r, c);
        if (!tile) continue;
        tiles.push({ tile, r, c });
      }
    }
    tiles.sort((a, b) => {
      const da = a.tile.displayR ?? a.r;
      const db = b.tile.displayR ?? b.r;
      return da - db;
    });

    for (const { tile, r, c } of tiles) {
      const dr = tile.displayR ?? r;
      const dc = tile.displayC ?? c;
      const { x, y, w, h } = this.cellAt(dr, dc);
      const sel = this.selected && this.selected.r === r && this.selected.c === c;
      const bob = sel ? Math.sin(this.time * 7) * w * 0.018 : 0;
      const popBoost = (tile.pop || 0) * 0.18;
      const landBoost = (tile.landPulse || 0) * 0.06;
      const sc = tile.scale * (sel ? 1.08 : 1) * (1 + popBoost + landBoost);
      const highlight = (tile.glowPulse || 0) + (sel ? 0.35 + Math.sin(this.time * 8) * 0.15 : 0);

      drawCapsule(ctx, x, y + bob, w, h, tile.type, tile.powder, {
        selected: sel,
        special: tile.special,
        alpha: tile.alpha ?? 1,
        scale: sc,
        highlight,
        rotation: tile.tilt || 0,
        squashX: tile.squashX ?? 1,
        squashY: tile.squashY ?? 1,
      });
    }

    this.boardFx.draw(ctx);

    const flash = this.juice?.getFlashAlpha() || 0;
    if (flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${flash})`;
      ctx.fillRect(0, 0, s, s);
    }
    ctx.restore();
  }

  burstAt(r, c, type, intensity = 1) {
    const { x, y, w, h } = this.cellAt(r, c);
    this.boardFx.burst(x, y, w, h, type, intensity);
  }

  createAnimator() {
    const view = this;

    return {
      async swap(a, b, r1, c1, r2, c2) {
        const fromA = { r: r1, c: c1 };
        const fromB = { r: r2, c: c2 };
        const dr = r2 - r1;
        const dc = c2 - c1;
        a.powder?.shake(0.35);
        b.powder?.shake(0.35);

        await tween(190, (t) => {
          const e = easeOutBack(t, 1.4);
          a.displayR = fromA.r + dr * e;
          a.displayC = fromA.c + dc * e;
          b.displayR = fromB.r - dr * e;
          b.displayC = fromB.c - dc * e;
          const tilt = (1 - Math.abs(t - 0.5) * 2) * 0.12;
          a.tilt = dc !== 0 ? tilt * Math.sign(dc) : 0;
          b.tilt = dc !== 0 ? -tilt * Math.sign(dc) : dr !== 0 ? -tilt * Math.sign(dr) : 0;
          const sq = 1 + Math.sin(t * Math.PI) * 0.06;
          a.squashX = sq;
          a.squashY = 2 - sq;
          b.squashX = sq;
          b.squashY = 2 - sq;
        }, easeOutCubic);

        a.displayR = r2;
        a.displayC = c2;
        b.displayR = r1;
        b.displayC = c1;
        view._resetTileMotion(a);
        view._resetTileMotion(b);
      },

      async swapInvalid(a, b, r1, c1, r2, c2) {
        const fromA = { r: r1, c: c1 };
        const fromB = { r: r2, c: c2 };
        const dr = r2 - r1;
        const dc = c2 - c1;

        await tween(130, (t) => {
          const e = easeOutCubic(t) * 0.55;
          a.displayR = fromA.r + dr * e;
          a.displayC = fromA.c + dc * e;
          b.displayR = fromB.r - dr * e;
          b.displayC = fromB.c - dc * e;
        });

        await tween(220, (t) => {
          const e = easeOutElastic(t);
          a.displayR = fromA.r + dr * 0.55 * (1 - e);
          a.displayC = fromA.c + dc * 0.55 * (1 - e);
          b.displayR = fromB.r - dr * 0.55 * (1 - e);
          b.displayC = fromB.c - dc * 0.55 * (1 - e);
          const wobble = Math.sin(t * Math.PI * 3) * (1 - t) * 0.08;
          a.tilt = wobble;
          b.tilt = -wobble;
        });

        a.displayR = r1;
        a.displayC = c1;
        b.displayR = r2;
        b.displayC = c2;
        view._resetTileMotion(a);
        view._resetTileMotion(b);
        a.powder?.shake(0.8);
        b.powder?.shake(0.8);
      },

      async pop(keys, board) {
        const list = [...keys];
        const intensity = Math.min(3, 1 + list.length * 0.08);

        for (const k of list) {
          const { r, c } = parseKey(k);
          const tile = board.get(r, c);
          if (!tile) continue;
          tile.pop = 1;
          tile.glowPulse = 1;
          view.burstAt(r, c, tile.type, intensity);
        }

        await tween(240, (t) => {
          const popScale = t < 0.22 ? 1 + (t / 0.22) * 0.14 : 1.14 - ((t - 0.22) / 0.78) * 1.0;
          for (const k of list) {
            const { r, c } = parseKey(k);
            const tile = board.get(r, c);
            if (!tile) continue;
            tile.scale = popScale;
            tile.alpha = 1 - easeInOutCubic(Math.max(0, (t - 0.12) / 0.88));
            tile.glowPulse = Math.max(0, 1 - t * 1.2);
          }
        });
      },

      async fall(moves) {
        if (!moves.length) return;

        const byCol = {};
        for (const m of moves) {
          byCol[m.toC] = byCol[m.toC] || [];
          byCol[m.toC].push(m);
        }
        for (const col of Object.values(byCol)) {
          col.sort((a, b) => b.toR - a.toR);
        }

        for (const m of moves) {
          m.tile.displayR = m.fromR;
          m.tile.displayC = m.fromC;
          m.tile.scale = m.spawn ? 0.65 : 1;
          m.tile.alpha = m.spawn ? 0 : 1;
        }

        const maxDist = Math.max(...moves.map((m) => Math.abs(m.toR - m.fromR)), 1);
        const baseMs = 180;
        const perCell = 38;

        await Promise.all(
          moves.map((m) => {
            const dist = Math.abs(m.toR - m.fromR);
            const colMoves = byCol[m.toC] || [];
            const staggerIdx = colMoves.indexOf(m);
            const delay = staggerIdx * 28;
            const duration = baseMs + dist * perCell;

            return new Promise((resolve) => {
              setTimeout(() => {
                let lastT = 0;
                tween(duration, (t) => {
                  const fallT = easeFall(t);
                  m.tile.displayR = m.fromR + (m.toR - m.fromR) * fallT;
                  m.tile.displayC = m.fromC + (m.toC - m.fromC) * t;
                  if (m.spawn) {
                    m.tile.alpha = Math.min(1, t * 1.6);
                    m.tile.scale = 0.65 + t * 0.35;
                  }
                  const { x, y, w } = view.cellAt(m.tile.displayR, m.tile.displayC);
                  if (t > lastT + 0.08) {
                    view.boardFx.fallTrail(x, y, w, m.tile.type);
                    lastT = t;
                  }
                  if (t > 0.75) {
                    const sq = squashStretch(t);
                    m.tile.squashX = sq.sx;
                    m.tile.squashY = sq.sy;
                  }
                }).then(resolve);
              }, delay);
            });
          })
        );

        for (const m of moves) {
          m.tile.displayR = m.toR;
          m.tile.displayC = m.toC;
          m.tile.alpha = 1;
          m.tile.scale = 1;
          m.tile.powder?.shake(0.55);
          const { x, y, w, h } = view.cellAt(m.toR, m.toC);
          view.boardFx.landRipple(x, y, w, h, m.tile.type);
          view._resetTileMotion(m.tile);
          m.tile.landPulse = 1;
        }
      },

      async spawnSpecial(tile) {
        tile.scale = 0.15;
        tile.alpha = 0.5;
        tile.glowPulse = 1;
        await tween(280, (t) => {
          const e = easeOutBack(t, 2);
          tile.scale = 0.15 + 0.85 * e;
          tile.alpha = 0.5 + 0.5 * t;
          tile.glowPulse = 1 - t * 0.5;
        });
        tile.scale = 1;
        tile.alpha = 1;
        tile.glowPulse = 0.4;
      },

      async shuffleFx() {
        await tween(340, (t) => {
          if (!view.board) return;
          const wave = Math.sin(t * Math.PI);
          for (let r = 0; r < view.board.rows; r++) {
            for (let c = 0; c < view.board.cols; c++) {
              const tile = view.board.get(r, c);
              if (!tile) continue;
              tile.scale = 0.82 + wave * 0.18;
              tile.tilt = Math.sin(t * Math.PI * 2 + (r + c) * 0.7) * 0.06 * wave;
            }
          }
        });
        view._initTileMotion();
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
      const tile = this.board.get(down.r, down.c);
      tile?.powder?.shake(0.2);
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
