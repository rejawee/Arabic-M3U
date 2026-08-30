#!/usr/bin/env python3
"""Chroma-key + trim + resize game sprites to RGBA PNGs."""
from __future__ import annotations

import colorsys
import os
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "_generated"
OUT_CAPS = ROOT / "assets" / "capsules"
OUT_OBS = ROOT / "assets" / "obstacles"

MAGENTA = (255, 0, 255)
WHITE_BG = (255, 255, 255)


def dist(c1, c2):
    return sum((a - b) ** 2 for a, b in zip(c1[:3], c2[:3])) ** 0.5


def remove_background(img: Image.Image, keys=None, tol=55) -> Image.Image:
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
            elif g < 80 and b > 120 and r > 100 and r < 240:
                # magenta/purple fringe
                px[x, y] = (0, 0, 0, 0)
            elif r > 240 and g > 240 and b > 240:
                px[x, y] = (0, 0, 0, 0)
    # soften alpha edges
    alpha = img.split()[3].filter(ImageFilter.GaussianBlur(radius=0.6))
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
    sp = s.load()
    vp = v.load()
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
            sat = sp[x, y] / 255.0
            val = vp[x, y] / 255.0
            nh, ns, nv = colorsys.hsv_to_rgb((hue + shift) % 1.0, sat, val)
            # convert back via rgb->hsv route: store shifted hue only
            old_rgb = colorsys.hsv_to_rgb(hue, sat, val)
            new_rgb = colorsys.hsv_to_rgb((hue + shift) % 1.0, sat, val)
            # approximate by rgb blend preserving value structure
            _ = old_rgb
            hr, hg, hb = [int(c * 255) for c in new_rgb]
            hh, hs, hv = colorsys.rgb_to_hsv(hr / 255, hg / 255, hb / 255)
            oh[x, y] = int(hh * 255)
    merged = Image.merge("HSV", (out_h, s, v)).convert("RGB")
    mr, mg, mb = merged.split()
    return Image.merge("RGBA", (mr, mg, mb, a))


def process_capsule(src_name: str, out_name: str, size=(128, 168), hue=None):
    src = SRC / src_name
    if not src.exists():
        print("missing", src)
        return
    img = remove_background(Image.open(src))
    img = trim_alpha(img)
    if hue is not None:
        img = hue_shift(img, hue)
    img = fit_canvas(img, size, fill_ratio=0.92)
    out = OUT_CAPS / out_name
    img.save(out, optimize=True)
    print("capsule", out.name, img.mode, img.size)


def process_obstacle(src_name: str, out_name: str, size=(112, 112)):
    src = SRC / src_name
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

    process_capsule("capsule-ruby-master.png", "ruby.png")
    process_capsule("capsule-ruby-master.png", "azure.png", hue=-28)
    process_capsule("capsule-ruby-master.png", "jade.png", hue=95)
    process_capsule("capsule-ruby-master.png", "amber.png", hue=38)
    process_capsule("capsule-ruby-master.png", "violet.png", hue=-55)
    process_capsule("capsule-ruby-master.png", "cyan.png", hue=-95)
    process_capsule("capsule-fire-master.png", "fire.png")
    process_capsule("capsule-ice-special-master.png", "ice.png")
    process_capsule("capsule-rainbow-master.png", "rainbow.png")

    process_obstacle("obstacle-ice-master.png", "ice.png")
    process_obstacle("obstacle-crate-master.png", "crate.png")
    process_obstacle("obstacle-lock-master.png", "lock.png")
    process_obstacle("obstacle-slime-master.png", "slime.png")


if __name__ == "__main__":
    main()
