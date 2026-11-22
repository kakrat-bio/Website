# Kakrat brand assets

The Kakrat mark is a **crow, beak open mid-caw**, in a cream circle with a
black ring. "Kakrat" is an old word for crows cawing all at once, so the crow
is the publication's sign. It replaced the earlier red "K" monogram in
November 2026.

## Files here

| File | What it is |
| --- | --- |
| `source/crow-original.png` | The original artwork as supplied by the owner (1254×1254, with three "caw" motion lines by the beak and a thin ring). Keep it untouched. |
| `make-masters.py` | Turns the original into the two masters below. |
| `kakrat-crow-mark.png` | **Main mark.** 1024×1024, crow in a ringed circle, transparent corners, motion lines removed. |
| `kakrat-crow-square.png` | 1024×1024, crow on cream, no ring, full bleed. Used only for the iOS home-screen icon (iOS draws its own rounded square; a circle inside it looks wrong, and transparent corners turn black). |

## Where the mark appears on the site

All of these are **generated**. Never edit them by hand.

| Output | Used for |
| --- | --- |
| `src/app/favicon.ico` (16/32/48) | Browser tab icon |
| `src/app/icon.png` (512) | Modern browsers, Android |
| `src/app/apple-icon.png` (180, from the square master) | iOS home screen |
| `public/brand/kakrat-mark-64.png` | Mark beside the "Kakrat" wordmark in the header (`src/components/layout/Header.tsx`, shown at 32px) |
| `public/logo.png` (512) | Organization logo in JSON-LD (`src/lib/seo/json-ld.ts`) |
| `public/og-default.png`, `public/og-article-fallback.png` (1200×630) | Link previews on WhatsApp, X, LinkedIn: mark on the left, wordmark on the right, on ink with the rust accent bar |

Next.js picks up `src/app/favicon.ico`, `icon.png` and `apple-icon.png`
automatically (file-based metadata). Do not add an `icon.svg` back: it would
compete with `icon.png`.

## How to change the mark

1. To change the artwork: replace `source/crow-original.png`, then run
   `python3 -I scripts/brand/make-masters.py` (needs pillow, numpy, scipy).
   The motion-line and ring removal look for specific shapes, so a very
   different drawing may need the script adjusted; check both masters by eye.
2. Run `node scripts/generate-brand-assets.mjs` (after `npm ci`). It writes
   every output listed above and deletes stale icons.
3. Run `npm run lint && npm run test && npm run build`, then look at the
   favicon at 16px, the header in light and dark mode, and an OG image.
4. Commit the masters and the outputs together.

## Design rules learned so far

- **Favicon legibility:** at 16px the feathers and red mouth vanish; what
  carries is the dark bird shape inside a pale disc. That's why the ring is
  thicker than in the original (4.5% of the size) and the crow is fitted to
  the smallest circle that holds it. Don't add detail, text, or the motion
  lines back to the small sizes.
- **Motion lines:** fine in large illustrations (see the About page crow),
  removed from every icon.
- **Dark mode:** the black ring merges into dark backgrounds; the cream disc
  still reads, which is enough. No separate dark icon is needed.
- **Colours:** cream `#fbf6ee` (the artwork's paper, slightly warmer than the
  site's `#fbfaf8`), ink `#111111`. Site accent stays rust `#a8402c`.
- **File weight:** icon, logo and header PNGs are palette-compressed by the
  generator (`palette: true`). Keep `icon.png` well under 100 KB.
