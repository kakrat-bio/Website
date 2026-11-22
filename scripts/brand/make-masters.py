#!/usr/bin/env python3
"""Rebuild the two crow masters from the original artwork.

    python3 -I scripts/brand/make-masters.py

Input:  scripts/brand/source/crow-original.png  (1254x1254, as supplied by the owner)
Output: scripts/brand/kakrat-crow-mark.png      (1024, crow in a ringed circle, transparent corners)
        scripts/brand/kakrat-crow-square.png    (1024, crow on paper, no ring; for the iOS icon)

Steps (see README.md for why):
  1. Remove the three "caw" motion lines right of the beak: they are the only
     dark connected components lying wholly in that region, so they are found
     by connected-component labelling, not hand-painted.
  2. Remove the original thin ring (the one dark component spanning the whole
     image) and flatten everything outside it to the paper colour.
  3. Fit the smallest circle that encloses the crow, so nothing (beak tip,
     tail) is clipped, and redraw a thicker ring that survives 16px.
After running this, run `node scripts/generate-brand-assets.mjs`.
Needs: pillow, numpy, scipy.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE = Path(__file__).resolve().parent
SRC = HERE / "source" / "crow-original.png"
PAPER = np.array([251, 246, 238, 255], np.uint8)  # the artwork's own background
INK = (17, 17, 17, 255)
SIZE = 1024
RING_FRAC = 0.045  # ring thickness as a fraction of the icon size
PAD = 1.07         # breathing room between crow and ring


def main() -> None:
    a = np.array(Image.open(SRC).convert("RGBA"))
    w = a.shape[0]

    # 1. motion lines
    dark = (a[..., :3].astype(int).sum(-1) < 250) & (a[..., 3] > 0)
    lab, _ = ndimage.label(dark)
    lines = [
        i for i, (ys, xs) in enumerate(ndimage.find_objects(lab), 1)
        if xs.start > 960 and xs.stop < 1140 and ys.start > 300 and ys.stop < 560
    ]
    a[ndimage.binary_dilation(np.isin(lab, lines), iterations=4)] = PAPER

    # 2. original ring
    ink = (np.abs(a[..., :3].astype(int) - PAPER[:3]).sum(-1) > 40) & (a[..., 3] > 200)
    lab, _ = ndimage.label(ink)
    ring = next(
        i for i, (ys, xs) in enumerate(ndimage.find_objects(lab), 1)
        if xs.stop - xs.start > w * 0.9 and ys.stop - ys.start > w * 0.9
    )
    interior = ndimage.binary_fill_holes(lab == ring) & ~ndimage.binary_dilation(lab == ring, iterations=6)
    flat = np.tile(PAPER, (w, w, 1))
    flat[interior] = a[interior]

    # 3. smallest enclosing circle of the crow (coarse grid search is plenty)
    crow = np.abs(flat[..., :3].astype(int) - PAPER[:3]).sum(-1) > 40
    ys, xs = np.where(crow)
    pts = np.stack([xs, ys], 1)[::7].astype(float)
    r, cx, cy = min(
        (np.hypot(pts[:, 0] - x, pts[:, 1] - y).max(), x, y)
        for x in range(500, 700, 4) for y in range(560, 760, 4)
    )

    pad = 600  # paper margin so crops never fall off the source
    canvas = np.tile(PAPER, (w + 2 * pad, w + 2 * pad, 1))
    canvas[pad:pad + w, pad:pad + w] = flat
    canvas = Image.fromarray(canvas)

    def crop(half: float) -> Image.Image:
        box = (cx + pad - half, cy + pad - half, cx + pad + half, cy + pad + half)
        return canvas.crop(tuple(int(round(v)) for v in box)).resize((SIZE, SIZE), Image.LANCZOS)

    ring_px = round(SIZE * RING_FRAC)
    inner = SIZE / 2 - ring_px
    art = crop(r * PAD * (SIZE / 2) / inner)

    def disc(inset: int) -> Image.Image:
        m = Image.new("L", (SIZE * 2, SIZE * 2), 0)
        ImageDraw.Draw(m).ellipse((inset * 2, inset * 2, (SIZE - inset) * 2 - 1, (SIZE - inset) * 2 - 1), fill=255)
        return m.resize((SIZE, SIZE), Image.LANCZOS)

    mark = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    mark.paste(Image.new("RGBA", (SIZE, SIZE), INK), (0, 0), disc(0))
    mark.paste(art, (0, 0), disc(ring_px))
    mark.save(HERE / "kakrat-crow-mark.png", optimize=True)

    crop(r * 1.12).convert("RGB").save(HERE / "kakrat-crow-square.png", optimize=True)
    print(f"enclosing radius {r:.0f}px at ({cx}, {cy}); wrote both masters")


if __name__ == "__main__":
    main()
