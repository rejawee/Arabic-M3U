#!/usr/bin/env python3
"""Chroma-key + trim + widen + resize game sprites to RGBA PNGs."""
from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "_generated"
OUT_CAPS = ROOT / "assets" / "capsules"
OUT_OBS = ROOT / "assets" / "obstacles"

MAGENTA = (255, 0, 255)


def dist(c1, c2):
    return sum((a - b) ** 2 for a, b in zip(c1[:3], c2[:3])) ** 0.5


def remove_background(img: Image.Image, keys=None, tol=55) -> Image.Image:
    """Remove chroma-key magenta without eating violet powder pixels."""
    keys = keys or [MAGENTA, (250, 0, 250), (255, 20, 255), (220, 0, 220), (180, 0, 180)]
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if any(dist((r, g, b), k) <= tol for k in keys):
                px[x, y] = (0, 0, 0, 0)
                continue
            # True magenta fringe only: R≈B high, G very low (not deep violet powder)
            if g < 55 and r > 145 and b > 145 and abs(r - b) < 35:
                px[x, y] = (0, 0, 0, 0)
                continue
            if r > 245 and g > 245 and b > 245:
                px[x, y] = (0, 0, 0, 0)
    alpha = img.split()[3].filter(ImageFilter.GaussianBlur(radius=0.55))
    img.putalpha(alpha)
    return img


def trim_alpha(img: Image.Image, pad=2) -> Image.Image:
    alpha = img.split()[3]
    bbox = alpha.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(img.width, x1 + pad)
    y1 = min(img.height, y1 + pad)
    return img.crop((x0, y0, x1, y1))


def widen_content(img: Image.Image, factor: float = 1.42) -> Image.Image:
    """Horizontally expand capsule body so it reads chunkier like Royal Match."""
    w, h = img.size
    nw = max(1, int(w * factor))
    return img.resize((nw, h), Image.Resampling.LANCZOS)


def fit_canvas(img: Image.Image, size: tuple[int, int], fill_ratio=0.88) -> Image.Image:
    tw, th = size
    canvas = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    w, h = img.size
    scale = min(tw / w, th / h) * fill_ratio
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(resized, ((tw - nw) // 2, (th - nh) // 2), resized)
    return canvas


def hue_shift(img: Image.Image, degrees: float) -> Image.Image:
    img = img.convert("RGBA")
    r, g, b, a = img.split()
    rgb = Image.merge("RGB", (r, g, b))
    hsv = rgb.convert("HSV")
    h, s, v = hsv.split()
    hp = h.load()
    w, hgt = h.size
    out_h = Image.new("L", (w, hgt))
    oh = out_h.load()
    shift = degrees / 360.0
    for y in range(hgt):
        for x in range(w):
            if a.getpixel((x, y)) < 16:
                oh[x, y] = hp[x, y]
                continue
            hue = hp[x, y] / 255.0
            oh[x, y] = int(((hue + shift) % 1.0) * 255)
    merged = Image.merge("HSV", (out_h, s, v)).convert("RGB")
    mr, mg, mb = merged.split()
    return Image.merge("RGBA", (mr, mg, mb, a))


def resolve_src(name: str) -> Path:
    src = SRC / name
    if src.exists():
        return src
    alt = SRC / name.replace("-master", "")
    return alt if alt.exists() else src


def process_capsule(src_name: str, out_name: str, size=(168, 176), hue=None, fill_ratio=0.98, widen=1.45):
    src = resolve_src(src_name)
    if not src.exists():
        print("missing", src)
        return
    img = remove_background(Image.open(src))
    img = trim_alpha(img)
    if hue is not None:
        img = hue_shift(img, hue)
    if widen and widen != 1.0:
        img = widen_content(img, widen)
    img = fit_canvas(img, size, fill_ratio=fill_ratio)
    out = OUT_CAPS / out_name
    img.save(out, optimize=True)
    print("capsule", out.name, img.mode, img.size)


def process_obstacle(src_name: str, out_name: str, size=(112, 112)):
    src = resolve_src(src_name)
    if not src.exists():
        print("missing", src)
        return
    img = remove_background(Image.open(src))
    img = trim_alpha(img)
    img = fit_canvas(img, size, fill_ratio=0.90)
    out = OUT_OBS / out_name
    img.save(out, optimize=True)
    print("obstacle", out.name, img.mode, img.size)


def main():
    SRC.mkdir(parents=True, exist_ok=True)
    OUT_CAPS.mkdir(parents=True, exist_ok=True)
    OUT_OBS.mkdir(parents=True, exist_ok=True)

    # Dedicated color masters (hue-shift from ruby produced wrong azure/violet)
    process_capsule("capsule-ruby-master.png", "ruby.png")
    process_capsule("capsule-azure-master.png", "azure.png")
    process_capsule("capsule-jade-master.png", "jade.png")
    process_capsule("capsule-amber-master.png", "amber.png")
    process_capsule("capsule-violet-master.png", "violet.png")
    process_capsule("capsule-cyan-master.png", "cyan.png")
    process_capsule("capsule-fire-master.png", "fire.png")
    process_capsule("capsule-ice-special-master.png", "ice.png")
    process_capsule("capsule-rainbow-master.png", "rainbow.png")

    process_obstacle("obstacle-ice-master.png", "ice.png")
    process_obstacle("obstacle-crate-master.png", "crate.png")
    process_obstacle("obstacle-lock-master.png", "lock.png")
    process_obstacle("obstacle-slime-master.png", "slime.png")


if __name__ == "__main__":
    main()
