import { CapsulePowder } from "./capsule.js";

/**
 * منطق مطابقة ثلاثية بأسلوب Royal Match
 * مع قطع خاصة طبية وشلالات
 */
export class Board {
  constructor(level) {
    this.level = level;
    this.rows = level.rows;
    this.cols = level.cols;
    this.types = level.types;
    this.grid = [];
    this.blocked = new Set(level.blocked.map(([r, c]) => key(r, c)));
    this.collected = Object.fromEntries(level.goals.map((g) => [g.type, 0]));
    this.busy = false;
    this.anim = [];
    this.onCascadeStep = null;
    this.onInvalidSwap = null;
    this.onBigMatch = null;
  }

  init() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        if (this.blocked.has(key(r, c))) {
          row.push(null);
          continue;
        }
        row.push(this._makeTile(r, c, this._randomTypeAvoiding(r, c)));
      }
      this.grid.push(row);
    }
    // تأكد من وجود حركة ممكنة
    if (!this.hasPossibleMove()) this.shuffle(true);
  }

  _makeTile(r, c, type, special = null) {
    return {
      id: `${r}-${c}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      special,
      powder: new CapsulePowder(type, r * 17 + c * 31),
      // مواقع الرسم (نسبية للخلية) للتحريك
      displayR: r,
      displayC: c,
      scale: 1,
      alpha: 1,
      pop: 0,
      tilt: 0,
      squashX: 1,
      squashY: 1,
      glowPulse: 0,
      landPulse: 0,
    };
  }

  _randomType() {
    return this.types[Math.floor(Math.random() * this.types.length)];
  }

  _randomTypeAvoiding(r, c) {
    let tries = 0;
    let t;
    do {
      t = this._randomType();
      tries++;
    } while (tries < 20 && this._wouldMatchAt(r, c, t));
    return t;
  }

  _wouldMatchAt(r, c, type) {
    // أفقي
    if (
      c >= 2 &&
      this.grid[r]?.[c - 1]?.type === type &&
      this.grid[r]?.[c - 2]?.type === type
    )
      return true;
    // عمودي
    if (
      r >= 2 &&
      this.grid[r - 1]?.[c]?.type === type &&
      this.grid[r - 2]?.[c]?.type === type
    )
      return true;
    return false;
  }

  inBounds(r, c) {
    return r >= 0 && c >= 0 && r < this.rows && c < this.cols;
  }

  get(r, c) {
    if (!this.inBounds(r, c)) return null;
    return this.grid[r][c];
  }

  isBlocked(r, c) {
    return this.blocked.has(key(r, c));
  }

  /** تبديل متجاور */
  async swap(r1, c1, r2, c2, animate) {
    if (this.busy) return false;
    if (!this._adjacent(r1, c1, r2, c2)) return false;
    const a = this.get(r1, c1);
    const b = this.get(r2, c2);
    if (!a || !b) return false;

    this.busy = true;
    this._swapCells(r1, c1, r2, c2);
    if (animate) await animate.swap(a, b, r1, c1, r2, c2);

    // قوس قزح + أي شيء
    if (a.special === "rainbow" || b.special === "rainbow") {
      await this._resolveRainbow(r1, c1, r2, c2, a, b, animate);
      this.busy = false;
      return true;
    }

    // قطعتان خاصتان معاً
    if (a.special && b.special) {
      await this._comboSpecials(r1, c1, r2, c2, a, b, animate);
      this.busy = false;
      return true;
    }

    const matches = this.findMatches();
    if (matches.size === 0) {
      this._swapCells(r1, c1, r2, c2);
      if (animate?.swapInvalid) {
        await animate.swapInvalid(a, b, r1, c1, r2, c2);
      } else if (animate) {
        await animate.swap(a, b, r2, c2, r1, c1);
      }
      this.onInvalidSwap?.();
      this.busy = false;
      return false;
    }

    await this._cascade(animate);
    this.busy = false;
    return true;
  }

  _adjacent(r1, c1, r2, c2) {
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
  }

  _swapCells(r1, c1, r2, c2) {
    const t = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = t;
    if (this.grid[r1][c1]) {
      this.grid[r1][c1].displayR = r1;
      this.grid[r1][c1].displayC = c1;
    }
    if (this.grid[r2][c2]) {
      this.grid[r2][c2].displayR = r2;
      this.grid[r2][c2].displayC = c2;
    }
  }

  findMatches() {
    const matched = new Set();
    // أفقي
    for (let r = 0; r < this.rows; r++) {
      let run = 1;
      for (let c = 1; c <= this.cols; c++) {
        const cur = this.get(r, c);
        const prev = this.get(r, c - 1);
        if (c < this.cols && cur && prev && cur.type === prev.type) {
          run++;
        } else {
          if (run >= 3 && prev) {
            for (let k = 0; k < run; k++) matched.add(key(r, c - 1 - k));
          }
          run = 1;
        }
      }
    }
    // عمودي
    for (let c = 0; c < this.cols; c++) {
      let run = 1;
      for (let r = 1; r <= this.rows; r++) {
        const cur = this.get(r, c);
        const prev = this.get(r - 1, c);
        if (r < this.rows && cur && prev && cur.type === prev.type) {
          run++;
        } else {
          if (run >= 3 && prev) {
            for (let k = 0; k < run; k++) matched.add(key(r - 1 - k, c));
          }
          run = 1;
        }
      }
    }
    return matched;
  }

  /** تحليل أشكال لإنشاء قطع خاصة */
  _analyzeSpecialCreation(matched) {
    // مجموعات متصلة حسب اللون
    const groups = this._groupMatches(matched);
    const creations = []; // {r,c,special,type}

    for (const group of groups) {
      if (group.length < 4) continue;
      const cells = group.map(parseKey);
      const type = this.get(cells[0].r, cells[0].c)?.type;
      if (!type) continue;

      const rows = {};
      const cols = {};
      for (const { r, c } of cells) {
        rows[r] = (rows[r] || 0) + 1;
        cols[c] = (cols[c] || 0) + 1;
      }
      const maxRow = Math.max(...Object.values(rows));
      const maxCol = Math.max(...Object.values(cols));
      const isLOrT = maxRow >= 3 && maxCol >= 3;
      const len = group.length;

      // موضع الإنشاء: مركز المجموعة تقريباً
      const mid = cells[Math.floor(cells.length / 2)];
      let special = null;
      if (len >= 5 && (maxRow >= 5 || maxCol >= 5)) special = "rainbow";
      else if (isLOrT || len >= 5) special = "bomb";
      else if (maxRow >= 4) special = "row";
      else if (maxCol >= 4) special = "col";
      else if (len === 4 && maxRow === 4) special = "row";
      else if (len === 4 && maxCol === 4) special = "col";

      if (special) creations.push({ r: mid.r, c: mid.c, special, type, keys: group });
    }
    return creations;
  }

  _groupMatches(matched) {
    const set = new Set(matched);
    const groups = [];
    const visited = new Set();

    for (const k of set) {
      if (visited.has(k)) continue;
      const { r: sr, c: sc } = parseKey(k);
      const type = this.get(sr, sc)?.type;
      if (!type) continue;
      const stack = [k];
      const group = [];
      visited.add(k);
      while (stack.length) {
        const cur = stack.pop();
        group.push(cur);
        const { r, c } = parseKey(cur);
        for (const [dr, dc] of [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ]) {
          const nk = key(r + dr, c + dc);
          if (!set.has(nk) || visited.has(nk)) continue;
          const t = this.get(r + dr, c + dc);
          if (t?.type === type) {
            visited.add(nk);
            stack.push(nk);
          }
        }
      }
      groups.push(group);
    }
    return groups;
  }

  async _cascade(animate) {
    let safety = 0;
    while (safety++ < 40) {
      let matched = this.findMatches();

      // فعّل القطع الخاصة ضمن المطابقة
      const toClear = new Set(matched);
      const queue = [...matched];
      while (queue.length) {
        const k = queue.pop();
        const { r, c } = parseKey(k);
        const tile = this.get(r, c);
        if (!tile?.special) continue;
        const extra = this._specialBlast(r, c, tile.special);
        for (const ek of extra) {
          if (!toClear.has(ek)) {
            toClear.add(ek);
            queue.push(ek);
          }
        }
      }

      if (toClear.size === 0) break;

      const creations = this._analyzeSpecialCreation(matched);
      const specialCreated = creations[0]?.special || null;
      this.onCascadeStep?.(toClear.size, specialCreated);
      if (matched.size >= 5) this.onBigMatch?.(matched.size);

      // اجمع الأهداف وحرّك البودرة
      for (const k of toClear) {
        const { r, c } = parseKey(k);
        const tile = this.get(r, c);
        if (!tile) continue;
        if (this.collected[tile.type] !== undefined) {
          this.collected[tile.type]++;
        }
        tile.powder?.shake(1.6);
      }

      if (animate) await animate.pop(toClear, this);

      // احذف
      for (const k of toClear) {
        const { r, c } = parseKey(k);
        // لا تحذف موضع الإنشاء الخاص بعد
        const keep = creations.find((cr) => cr.r === r && cr.c === c);
        if (keep) continue;
        this.grid[r][c] = null;
      }

      // أنشئ القطع الخاصة
      for (const cr of creations) {
        this.grid[cr.r][cr.c] = this._makeTile(cr.r, cr.c, cr.type, cr.special);
        if (animate) await animate.spawnSpecial?.(this.grid[cr.r][cr.c]);
      }

      await this._collapseAndFill(animate);
    }

    if (!this.hasPossibleMove()) {
      this.shuffle(true);
      if (animate) await animate.shuffleFx?.();
    }
  }

  _specialBlast(r, c, special) {
    const out = new Set();
    if (special === "row") {
      for (let cc = 0; cc < this.cols; cc++) if (!this.isBlocked(r, cc)) out.add(key(r, cc));
    } else if (special === "col") {
      for (let rr = 0; rr < this.rows; rr++) if (!this.isBlocked(rr, c)) out.add(key(rr, c));
    } else if (special === "bomb") {
      for (let rr = r - 1; rr <= r + 1; rr++) {
        for (let cc = c - 1; cc <= c + 1; cc++) {
          if (this.inBounds(rr, cc) && !this.isBlocked(rr, cc)) out.add(key(rr, cc));
        }
      }
    } else if (special === "rainbow") {
      // يُعالَج عند السحب
    }
    return out;
  }

  async _resolveRainbow(r1, c1, r2, c2, a, b, animate) {
    const rainbowIsA = a.special === "rainbow";
    const other = rainbowIsA ? b : a;
    const clearType = other.type;
    const toClear = new Set();
    toClear.add(key(r1, c1));
    toClear.add(key(r2, c2));
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const t = this.get(r, c);
        if (t && t.type === clearType) toClear.add(key(r, c));
      }
    }
    for (const k of toClear) {
      const { r, c } = parseKey(k);
      const tile = this.get(r, c);
      if (tile && this.collected[tile.type] !== undefined) this.collected[tile.type]++;
      tile?.powder?.shake(2);
    }
    if (animate) await animate.pop(toClear, this);
    for (const k of toClear) {
      const { r, c } = parseKey(k);
      this.grid[r][c] = null;
    }
    await this._collapseAndFill(animate);
    await this._cascade(animate);
  }

  async _comboSpecials(r1, c1, r2, c2, a, b, animate) {
    const toClear = new Set([key(r1, c1), key(r2, c2)]);
    // صف + عمود = صليب، قنبلة+أي = منطقة أكبر
    const specs = [a.special, b.special];
    if (specs.includes("bomb") || (specs.includes("row") && specs.includes("col"))) {
      for (let rr = Math.min(r1, r2) - 2; rr <= Math.max(r1, r2) + 2; rr++) {
        for (let cc = Math.min(c1, c2) - 2; cc <= Math.max(c1, c2) + 2; cc++) {
          if (this.inBounds(rr, cc) && !this.isBlocked(rr, cc)) toClear.add(key(rr, cc));
        }
      }
    } else {
      for (const [r, c, s] of [
        [r1, c1, a.special],
        [r2, c2, b.special],
      ]) {
        for (const k of this._specialBlast(r, c, s)) toClear.add(k);
      }
    }
    for (const k of toClear) {
      const { r, c } = parseKey(k);
      const tile = this.get(r, c);
      if (tile && this.collected[tile.type] !== undefined) this.collected[tile.type]++;
    }
    if (animate) await animate.pop(toClear, this);
    for (const k of toClear) {
      const { r, c } = parseKey(k);
      this.grid[r][c] = null;
    }
    await this._collapseAndFill(animate);
    await this._cascade(animate);
  }

  async _collapseAndFill(animate) {
    const moves = [];
    for (let c = 0; c < this.cols; c++) {
      let write = this.rows - 1;
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.isBlocked(r, c)) {
          write = r - 1;
          continue;
        }
        const tile = this.grid[r][c];
        if (tile) {
          if (r !== write) {
            this.grid[write][c] = tile;
            this.grid[r][c] = null;
            moves.push({ tile, fromR: r, fromC: c, toR: write, toC: c });
            tile.displayR = write;
            tile.displayC = c;
          }
          write--;
          while (write >= 0 && this.isBlocked(write, c)) write--;
        }
      }
      // ملء من الأعلى
      let spawn = 0;
      for (let r = write; r >= 0; r--) {
        if (this.isBlocked(r, c)) continue;
        const type = this._randomType();
        const tile = this._makeTile(r, c, type);
        tile.displayR = -1 - spawn;
        tile.displayC = c;
        this.grid[r][c] = tile;
        moves.push({ tile, fromR: -1 - spawn, fromC: c, toR: r, toC: c, spawn: true });
        tile.displayR = r;
        spawn++;
      }
    }
    if (animate && moves.length) await animate.fall(moves, this);
    else {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const t = this.grid[r][c];
          if (t) {
            t.displayR = r;
            t.displayC = c;
          }
        }
      }
    }
  }

  hasPossibleMove() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const t = this.get(r, c);
        if (!t) continue;
        if (t.special === "rainbow") return true;
        for (const [dr, dc] of [
          [0, 1],
          [1, 0],
        ]) {
          const r2 = r + dr;
          const c2 = c + dc;
          const u = this.get(r2, c2);
          if (!u) continue;
          this._swapCells(r, c, r2, c2);
          const ok = this.findMatches().size > 0 || t.special || u.special;
          this._swapCells(r, c, r2, c2);
          if (ok) return true;
        }
      }
    }
    return false;
  }

  shuffle(force = false) {
    const tiles = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const t = this.get(r, c);
        if (t) tiles.push(t);
      }
    }
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    let i = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.isBlocked(r, c)) continue;
        const t = tiles[i++];
        t.displayR = r;
        t.displayC = c;
        this.grid[r][c] = t;
      }
    }
    if (!force && this.findMatches().size) {
      // أعد إن وُجدت مطابقة فورية — تبسيط: استبدل الأنواع
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const t = this.get(r, c);
          if (!t || t.special) continue;
          if (this._wouldMatchAt(r, c, t.type)) {
            t.type = this._randomTypeAvoiding(r, c);
            t.powder.setType(t.type);
          }
        }
      }
    }
  }

  goalsDone() {
    return this.level.goals.every((g) => (this.collected[g.type] || 0) >= g.count);
  }

  goalProgress() {
    const done = this.level.goals.reduce(
      (s, g) => s + Math.min(g.count, this.collected[g.type] || 0),
      0
    );
    const total = this.level.goals.reduce((s, g) => s + g.count, 0);
    return { done, total };
  }

  /** معززات الطبيب */
  async useBooster(kind, r, c, animate) {
    if (this.busy) return false;
    this.busy = true;
    const toClear = new Set();
    if (kind === "syringe") {
      for (let cc = 0; cc < this.cols; cc++) if (!this.isBlocked(r, cc)) toClear.add(key(r, cc));
    } else if (kind === "spray") {
      for (let rr = 0; rr < this.rows; rr++) if (!this.isBlocked(rr, c)) toClear.add(key(rr, c));
    } else if (kind === "pulse") {
      for (let rr = r - 1; rr <= r + 1; rr++) {
        for (let cc = c - 1; cc <= c + 1; cc++) {
          if (this.inBounds(rr, cc) && !this.isBlocked(rr, cc)) toClear.add(key(rr, cc));
        }
      }
    } else if (kind === "shuffle") {
      this.shuffle(true);
      if (animate) await animate.shuffleFx?.();
      this.busy = false;
      return true;
    }

    for (const k of toClear) {
      const { r: rr, c: cc } = parseKey(k);
      const tile = this.get(rr, cc);
      if (tile && this.collected[tile.type] !== undefined) this.collected[tile.type]++;
    }
    if (animate) await animate.pop(toClear, this);
    for (const k of toClear) {
      const { r: rr, c: cc } = parseKey(k);
      this.grid[rr][cc] = null;
    }
    await this._collapseAndFill(animate);
    await this._cascade(animate);
    this.busy = false;
    return true;
  }
}

export function key(r, c) {
  return `${r},${c}`;
}

export function parseKey(k) {
  const [r, c] = k.split(",").map(Number);
  return { r, c };
}
