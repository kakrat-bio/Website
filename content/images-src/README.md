# Editorial image pipeline

There is no server-side image optimizer in this static-export site
(`next.config.ts` sets `images.unoptimized: true` — there's no server to run
one on). Responsive images are **pre-generated at authoring time** instead.

## Workflow

1. Drop the original, full-resolution image here, under
   `content/images-src/<article-year>/<slug>/<name>.jpg` (jpg/png/webp).
   Keep it under **4000px** on any edge and **5MB** — `npm run build` runs
   `scripts/check-image-sizes.mjs` and **fails the build** above those
   limits (and warns above 2400px / 1.5MB) so an oversized camera export
   can't get committed by accident.
2. Run:
   ```
   npm run optimize-images
   ```
   This generates WebP variants at 480/768/1200/1600px (skipping widths
   larger than the source) plus one universally-supported fallback file,
   under `public/images/generated/<same-path>/`, and writes/updates
   `public/images/generated/manifest.json`.
3. Commit **both** the source under `content/images-src/` and the
   generated files under `public/images/generated/` — generation doesn't
   run during the Cloudflare Pages build, so the generated files must be
   in the repo.
4. Reference the image by its manifest key (the path under
   `content/images-src/` without the extension) — e.g. a source at
   `content/images-src/2026/my-slug/cover.jpg` is referenced as
   `2026/my-slug/cover` in `coverImage` frontmatter or an MDX
   `![alt](2026/my-slug/cover)`.

`ResponsiveImage` (`src/components/media/ResponsiveImage.tsx`) looks the key
up in the manifest and renders a `<picture>` with the WebP `srcSet`. If a
`src` isn't in the manifest (the current SVG placeholders, or an image you
haven't run through the pipeline yet), it falls back to rendering the file
directly — for inline MDX images it still reads the real file's intrinsic
dimensions first, so it's never stretched, just not responsive yet.

## Why not automate this in the build?

Cloudflare Pages' build container would need to run `sharp` (a native
binary) against every source image on every build — slower, and one more
thing that can fail in CI in a way you can't easily reproduce locally.
Running it locally, once, and committing the output keeps builds fast and
deterministic, at the cost of an extra step when you add a new image. Given
Kakrat publishes by PR already, this fits the existing workflow.
