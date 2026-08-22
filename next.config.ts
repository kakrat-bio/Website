import type { NextConfig } from "next";

// Static export: Kakrat is a static publication (no server runtime, no DB).
// This produces plain HTML/CSS/JS in `out/`, which Cloudflare Pages serves
// directly from its edge network. See CLAUDE.md before changing this.
const nextConfig: NextConfig = {
  output: "export",
  images: {
    // next/image's optimization API needs a server; static export has none.
    // Article images are pre-sized at authoring time (see content/ conventions).
    unoptimized: true,
    // TEMP: seed content uses SVG placeholder covers. Remove once real
    // raster cover art replaces them (see content/articles/README.md).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
  trailingSlash: false,
};

export default nextConfig;
