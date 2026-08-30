/** دوال حركة مستوحاة من Royal Match */

export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t) => t * t * t;
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function easeOutBack(t, overshoot = 1.70158) {
  const c3 = overshoot + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
}

export function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}

export function easeOutBounce(t) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

/** سقوط مع ارتداد خفيف في النهاية */
export function easeFall(t) {
  if (t < 0.82) return easeOutCubic(t / 0.82) * 1.06;
  const bounce = (t - 0.82) / 0.18;
  return 1.06 - easeOutBounce(bounce) * 0.06;
}

/** squash & stretch: t=0..1, peak at impact */
export function squashStretch(t, impactAt = 0.85) {
  if (t < impactAt) {
    const p = t / impactAt;
    return { sx: 1 + p * 0.06, sy: 1 - p * 0.08 };
  }
  const p = (t - impactAt) / (1 - impactAt);
  const bounce = Math.sin(p * Math.PI) * (1 - p);
  return { sx: 1.06 - bounce * 0.12, sy: 0.92 + bounce * 0.16 };
}

export function tween(ms, fn, easeFn = easeOutCubic) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      fn(easeFn(t), t);
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}
