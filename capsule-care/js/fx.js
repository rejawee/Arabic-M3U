import { CAPSULE_TYPES } from "./config.js";

/** جزيئات ومؤثرات اللوحة — بودرة، زجاج، حلقات، وميض */
export class BoardFx {
  constructor() {
    this.particles = [];
    this.rings = [];
    this.flashes = [];
  }

  clear() {
    this.particles = [];
    this.rings = [];
    this.flashes = [];
  }

  update(dt) {
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.gravity ?? 220) * dt;
      p.vx *= p.drag ?? 0.985;
      if (p.spin) p.angle += p.spin * dt;
      return p.life > 0;
    });

    this.rings = this.rings.filter((r) => {
      r.life -= dt;
      r.radius += r.expand * dt;
      return r.life > 0;
    });

    this.flashes = this.flashes.filter((f) => {
      f.life -= dt;
      return f.life > 0;
    });
  }

  draw(ctx) {
    for (const f of this.flashes) {
      const a = Math.max(0, f.life / f.max) * f.alpha;
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.35, `rgba(255,255,255,${a * 0.35})`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const r of this.rings) {
      const a = Math.max(0, r.life / r.max);
      ctx.globalAlpha = a * 0.85;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = r.width * (1 - (1 - a) * 0.5);
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.max);
      ctx.globalAlpha = a * (p.alpha ?? 1);
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.angle) ctx.rotate(p.angle);
      if (p.kind === "shard") {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r * 0.35, p.r * 2, p.r * 0.7);
      } else if (p.kind === "star") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * Math.PI * 2;
          ctx.lineTo(Math.cos(ang) * p.r, Math.sin(ang) * p.r);
          ctx.lineTo(Math.cos(ang + Math.PI / 4) * p.r * 0.35, Math.sin(ang + Math.PI / 4) * p.r * 0.35);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  /** انفجار مطابقة — بودرة + زجاج + حلقة + وميض */
  burst(x, y, w, h, typeId, intensity = 1) {
    const def = CAPSULE_TYPES[typeId];
    const colors = def?.powder || ["#fff"];
    const cx = x + w / 2;
    const cy = y + h / 2;
    const base = 18 + intensity * 8;

    for (let i = 0; i < base; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 120 + Math.random() * 280 * intensity;
      this.particles.push({
        kind: "dust",
        x: cx,
        y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 40,
        r: 1.5 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.35 + Math.random() * 0.45,
        max: 0.8,
        gravity: 180,
        drag: 0.98,
      });
    }

    for (let i = 0; i < 8 + intensity * 2; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 80 + Math.random() * 200;
      this.particles.push({
        kind: "shard",
        x: cx,
        y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 30,
        r: 1.2 + Math.random() * 2.5,
        angle: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 14,
        color: Math.random() > 0.4 ? "#ffffff" : colors[1] + "cc",
        life: 0.28 + Math.random() * 0.3,
        max: 0.58,
        gravity: 140,
      });
    }

    for (let i = 0; i < 4 + intensity; i++) {
      const ang = Math.random() * Math.PI * 2;
      this.particles.push({
        kind: "star",
        x: cx,
        y: cy,
        vx: Math.cos(ang) * (60 + Math.random() * 120),
        vy: Math.sin(ang) * (60 + Math.random() * 120) - 50,
        r: 2 + Math.random() * 3,
        color: "#ffffff",
        life: 0.25 + Math.random() * 0.35,
        max: 0.6,
        gravity: 60,
        alpha: 0.9,
      });
    }

    this.rings.push({
      x: cx,
      y: cy,
      radius: w * 0.08,
      expand: w * 1.8,
      width: Math.max(2, w * 0.06),
      color: def?.glow || "rgba(255,255,255,0.8)",
      life: 0.32,
      max: 0.32,
    });

    this.flashes.push({
      x: cx,
      y: cy,
      radius: w * 0.55,
      alpha: 0.35 + intensity * 0.08,
      life: 0.14,
      max: 0.14,
    });
  }

  /** موجة ارتداد عند هبوط الكبسولة */
  landRipple(x, y, w, h, typeId) {
    const def = CAPSULE_TYPES[typeId];
    this.rings.push({
      x: x + w / 2,
      y: y + h * 0.85,
      radius: w * 0.12,
      expand: w * 0.9,
      width: Math.max(1.5, w * 0.035),
      color: def?.glow || "rgba(126,240,216,0.5)",
      life: 0.22,
      max: 0.22,
    });
  }

  /** خط سقوط خفيف */
  fallTrail(x, y, w, typeId) {
    const def = CAPSULE_TYPES[typeId];
    const colors = def?.powder || ["#fff"];
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        kind: "dust",
        x: x + w / 2 + (Math.random() - 0.5) * w * 0.3,
        y: y + w * 0.2,
        vx: (Math.random() - 0.5) * 20,
        vy: -30 - Math.random() * 40,
        r: 1 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)] + "aa",
        life: 0.18 + Math.random() * 0.12,
        max: 0.3,
        gravity: 40,
        alpha: 0.6,
      });
    }
  }
}
