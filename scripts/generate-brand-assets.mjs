#!/usr/bin/env node
// Builds every brand raster from the crow masters in scripts/brand/:
//   - public/og-default.png, public/og-article-fallback.png (1200x630 share images;
//     Twitter/X, Facebook, LinkedIn and Slack don't render SVG og:images)
//   - public/logo.png (512x512, the Organization logo in JSON-LD)
//   - public/brand/kakrat-mark-64.png (header mark, 32px shown at 2x)
//   - src/app/icon.png, src/app/apple-icon.png, src/app/favicon.ico (picked up
//     automatically by Next's file-based metadata)
// Re-run after changing a master or the design below:
//   node scripts/generate-brand-assets.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const APP = path.join(ROOT, "src", "app");
const BRAND = path.join(ROOT, "scripts", "brand");
const MARK = path.join(BRAND, "kakrat-crow-mark.png"); // crow in a ringed circle, transparent corners
const SQUARE = path.join(BRAND, "kakrat-crow-square.png"); // crow on paper, no ring, full bleed

const INK = "#17181a";
const PAPER = "#fbfaf8";
const ACCENT = "#a8402c";

function ogSvg({ label }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${INK}"/>
  <rect x="0" y="0" width="12" height="630" fill="${ACCENT}"/>
  <text x="400" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="104" fill="${PAPER}">Kakrat</text>
  <text x="402" y="390" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#a3a6ad">${label}</text>
</svg>`;
}

const resizedMark = (size) => sharp(MARK).resize(size, size, { kernel: "lanczos3" }).png().toBuffer();

async function og(label, out) {
  const mark = await resizedMark(260);
  await sharp(Buffer.from(ogSvg({ label })))
    .composite([{ input: mark, left: 90, top: 185 }])
    .png({ quality: 90 })
    .toFile(path.join(PUBLIC, out));
  console.log(`Wrote public/${out}`);
}

// Minimal ICO writer: one PNG-encoded image per size (supported by every
// current browser), so no extra dependency is needed.
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.data)]);
}

async function main() {
  await og("Science &amp; Technology · Business &amp; Innovation · Culture &amp; Ideas", "og-default.png");
  await og("An independent publication", "og-article-fallback.png");

  await sharp(MARK).resize(512, 512).png({ palette: true, quality: 90 }).toFile(path.join(PUBLIC, "logo.png"));
  console.log("Wrote public/logo.png");

  fs.mkdirSync(path.join(PUBLIC, "brand"), { recursive: true });
  await sharp(MARK).resize(64, 64).png({ palette: true, quality: 90 }).toFile(path.join(PUBLIC, "brand", "kakrat-mark-64.png"));
  console.log("Wrote public/brand/kakrat-mark-64.png");

  await sharp(MARK).resize(512, 512).png({ palette: true, quality: 90 }).toFile(path.join(APP, "icon.png"));
  console.log("Wrote src/app/icon.png");

  // iOS draws the home-screen icon on an opaque square and rounds the corners
  // itself, so it gets the ringless, full-bleed version.
  await sharp(SQUARE).resize(180, 180).png({ palette: true, quality: 90 }).toFile(path.join(APP, "apple-icon.png"));
  console.log("Wrote src/app/apple-icon.png");

  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map(async (size) => ({ size, data: await resizedMark(size) })));
  fs.writeFileSync(path.join(APP, "favicon.ico"), ico(pngs));
  console.log("Wrote src/app/favicon.ico");

  // The old monogram SVG icon would otherwise take precedence in some browsers.
  for (const stale of [path.join(APP, "icon.svg"), path.join(PUBLIC, "og-default.svg"), path.join(PUBLIC, "logo.svg")]) {
    if (fs.existsSync(stale)) {
      fs.unlinkSync(stale);
      console.log(`Removed ${path.relative(ROOT, stale)}`);
    }
  }
}

main();
