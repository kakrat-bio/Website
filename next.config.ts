import type { NextConfig } from "next";

// Static export: Kakrat is a static publication (no server runtime, no DB).
// This produces plain HTML/CSS/JS in `out/`, which Cloudflare Pages serves
// directly from its edge network. See CLAUDE.md before changing this.
const nextConfig: NextConfig = {
  output: "export",
  images: {
    // next/image's optimization API needs a server; static export has none.
    // This site doesn't use next/image at all — see
    // src/components/media/ResponsiveImage.tsx and
    // content/images-src/README.md for the actual (pre-generated,
    // build-time) responsive image strategy. `unoptimized: true` is kept
    // only as a safe default in case next/image is ever reintroduced.
    unoptimized: true,
  },
  trailingSlash: false,
};

export default nextConfig;
