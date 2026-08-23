#!/usr/bin/env node
// Pre-generates responsive WebP variants for editorial images. Run this
// locally after adding/changing a source image in content/images-src/, and
// commit the generated files under public/images/generated/ — there is no
// server-side image optimizer in this static-export site, so these files
// ARE the responsive image strategy. See content/images-src/README.md.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const WIDTHS = [480, 768, 1200, 1600];
const WEBP_QUALITY = 75;
const SRC_DIR = path.join(process.cwd(), "content", "images-src");
const OUT_DIR = path.join(process.cwd(), "public", "images", "generated");
const RASTER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return RASTER_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [full] : [];
  });
}

async function processImage(filePath) {
  const relFromSrc = path.relative(SRC_DIR, filePath);
  const key = relFromSrc.slice(0, -path.extname(relFromSrc).length).split(path.sep).join("/");
  const outDir = path.join(OUT_DIR, key);
  fs.mkdirSync(outDir, { recursive: true });

  const image = sharp(filePath);
  const meta = await image.metadata();
  const sourceWidth = meta.width ?? Math.max(...WIDTHS);

  const variants = [];
  for (const width of WIDTHS) {
    if (width > sourceWidth && variants.length > 0) continue; // skip upscaling past the source
    const targetWidth = Math.min(width, sourceWidth);
    const outFile = path.join(outDir, `${targetWidth}.webp`);
    await image
      .clone()
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outFile);
    if (!variants.some((v) => v.width === targetWidth)) {
      variants.push({ width: targetWidth, path: `/images/generated/${key}/${targetWidth}.webp` });
    }
  }

  // Universally-supported fallback (for the <img> src, in case <picture>/webp isn't used).
  const fallbackExt = meta.format === "png" ? "png" : "jpg";
  const fallbackWidth = Math.min(1600, sourceWidth);
  const fallbackFile = path.join(outDir, `fallback.${fallbackExt}`);
  await image
    .clone()
    .resize({ width: fallbackWidth, withoutEnlargement: true })
    [fallbackExt === "png" ? "png" : "jpeg"]({ quality: 82 })
    .toFile(fallbackFile);

  return {
    key,
    width: meta.width,
    height: meta.height,
    variants: variants.sort((a, b) => a.width - b.width),
    fallback: `/images/generated/${key}/fallback.${fallbackExt}`,
  };
}

async function main() {
  const files = walk(SRC_DIR);
  if (files.length === 0) {
    console.log(`optimize-images: no source images found in ${path.relative(process.cwd(), SRC_DIR)}/`);
    return;
  }

  const manifest = {};
  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    process.stdout.write(`Processing ${rel} ... `);
    const entry = await processImage(file);
    manifest[entry.key] = entry;
    console.log(`done (${entry.variants.length} variant(s))`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nWrote manifest for ${Object.keys(manifest).length} image(s) to public/images/generated/manifest.json`);
  console.log("Commit the generated files under public/images/generated/ along with your article.");
}

main();
