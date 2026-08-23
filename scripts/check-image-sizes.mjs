#!/usr/bin/env node
// Guards against accidentally committing an oversized editorial image
// (e.g. a straight-from-camera 6000px/8MB photo). Runs as part of
// `npm run build` so an offending file fails CI, not just a local check.
//
// Scans:
//  - content/images-src/**  (raw originals staged for scripts/optimize-images.mjs)
//  - public/images/** excluding public/images/generated/** and *.svg
//    (catches raster images committed directly, bypassing the pipeline)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const HARD_MAX_DIMENSION = 4000; // px, either axis
const HARD_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const SOFT_MAX_DIMENSION = 2400;
const SOFT_MAX_BYTES = 1.5 * 1024 * 1024;

const RASTER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return RASTER_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [full] : [];
  });
}

async function checkFile(filePath) {
  const stat = fs.statSync(filePath);
  const meta = await sharp(filePath).metadata();
  const maxDim = Math.max(meta.width ?? 0, meta.height ?? 0);

  const problems = [];
  if (maxDim > HARD_MAX_DIMENSION) {
    problems.push({
      level: "error",
      message: `${maxDim}px exceeds the ${HARD_MAX_DIMENSION}px hard limit`,
    });
  } else if (maxDim > SOFT_MAX_DIMENSION) {
    problems.push({
      level: "warn",
      message: `${maxDim}px exceeds the ${SOFT_MAX_DIMENSION}px recommended limit`,
    });
  }
  if (stat.size > HARD_MAX_BYTES) {
    problems.push({
      level: "error",
      message: `${(stat.size / 1024 / 1024).toFixed(1)}MB exceeds the ${HARD_MAX_BYTES / 1024 / 1024}MB hard limit`,
    });
  } else if (stat.size > SOFT_MAX_BYTES) {
    problems.push({
      level: "warn",
      message: `${(stat.size / 1024 / 1024).toFixed(1)}MB exceeds the ${SOFT_MAX_BYTES / 1024 / 1024}MB recommended limit`,
    });
  }
  return problems;
}

async function main() {
  const files = [
    ...walk(path.join(process.cwd(), "content", "images-src")),
    ...walk(path.join(process.cwd(), "public", "images")).filter(
      (f) => !f.includes(`${path.sep}generated${path.sep}`),
    ),
  ];

  let hasError = false;
  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    const problems = await checkFile(file);
    for (const p of problems) {
      const prefix = p.level === "error" ? "✖ ERROR" : "⚠ WARN ";
      console.log(`${prefix}  ${rel}: ${p.message}`);
      if (p.level === "error") hasError = true;
    }
  }

  if (files.length === 0) {
    console.log("check-image-sizes: no editorial raster images found — nothing to check.");
  } else if (!hasError) {
    console.log(`check-image-sizes: checked ${files.length} image(s), no hard limit violations.`);
  }

  if (hasError) {
    console.error(
      "\ncheck-image-sizes: failing build — resize/compress the file(s) above " +
        `(max ${HARD_MAX_DIMENSION}px on any edge, max ${HARD_MAX_BYTES / 1024 / 1024}MB) ` +
        "before committing. See content/images-src/README.md.",
    );
    process.exit(1);
  }
}

main();
