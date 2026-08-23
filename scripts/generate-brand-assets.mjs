#!/usr/bin/env node
// Rasterizes the brand SVG sources in this script into the PNG assets social
// platforms actually render (Twitter/X, Facebook, LinkedIn, Slack unfurls
// don't support SVG for og:image). Re-run after changing the design below.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public");

const INK = "#17181a";
const PAPER = "#fbfaf8";
const ACCENT = "#a8402c";

function ogSvg({ label }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${INK}"/>
  <rect x="0" y="0" width="12" height="630" fill="${ACCENT}"/>
  <text x="80" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="104" fill="${PAPER}">Kakrat</text>
  <text x="80" y="400" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#a3a6ad">${label}</text>
</svg>`;
}

function logoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${INK}"/>
  <text x="50%" y="58%" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="280" fill="${PAPER}">K</text>
</svg>`;
}

const assets = [
  { svg: ogSvg({ label: "Science · Biotechnology · Ideas" }), out: "og-default.png" },
  { svg: ogSvg({ label: "An independent publication" }), out: "og-article-fallback.png" },
  { svg: logoSvg(), out: "logo.png", size: 512 },
];

async function main() {
  for (const asset of assets) {
    const buffer = Buffer.from(asset.svg);
    await sharp(buffer).png({ quality: 90 }).toFile(path.join(OUT_DIR, asset.out));
    console.log(`Wrote public/${asset.out}`);
  }
  // Clean up the old SVG-only placeholders now that raster versions exist.
  for (const stale of ["og-default.svg", "logo.svg"]) {
    const p = path.join(OUT_DIR, stale);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`Removed public/${stale}`);
    }
  }
}

main();
