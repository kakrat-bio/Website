@AGENTS.md

# Kakrat — conventions for AI agents

Kakrat is a static editorial publication: Next.js App Router, `output: "export"`,
MDX content, no database/backend/auth. Read this before extending it.

## Non-negotiables

- **No server runtime for the Next app.** Don't add API routes, middleware,
  `cookies()`/`headers()` reads at request time, or anything that requires a
  Node server — `output: "export"` forbids it and the build will fail. The
  one deliberate exception is `functions/api/publish.ts` (see below) — a
  single, narrowly-scoped Cloudflare Pages Function, not a general-purpose
  backend. Don't add more server-side code without discussing it first; it's
  an exception, not a precedent.
- **`functions/` is a separate runtime from the Next app** — Cloudflare
  Workers, not Next.js, deployed alongside the static export but not part of
  it. It's intentionally excluded from nothing special in `tsconfig.json`
  (it type-checks fine using only DOM-lib globals: `Request`/`Response`/
  `fetch`/`crypto`), but don't import Next-specific code into it, and don't
  import server-only Node builtins Workers doesn't support. It exists to
  power `/publish` (see README's "Publish tool" section for the two
  required Cloudflare secrets, `GITHUB_TOKEN` and `PUBLISH_SECRET`) —
  authenticated article creation that commits straight to `main` via the
  GitHub Contents API. Don't add more routes here casually; each one is
  server-side attack surface the rest of this site doesn't have.
- **Content lives in `content/`, not in the database-that-doesn't-exist.**
  Articles are MDX files under `content/articles/<year>/`, authors are JSON
  under `content/authors/`. Frontmatter is validated by zod
  (`src/types/content.ts`) — the build fails loudly on bad content, which is
  the intended safety net.
- **`slug` is permanent.** Once an article is published, never change its
  `slug` or move it to a different topic in a way that changes its URL.
  If a piece must move, add a redirect in `public/_redirects` rather than
  breaking the URL.
- **Topics are a fixed, curated taxonomy**, not open-ended tags. Adding a
  topic means updating both `src/types/content.ts` (`TOPICS`) and
  `src/lib/content/topics.ts` (`TOPIC_META`), and is an editorial decision —
  confirm with the user before adding one.
- **Every route needs metadata.** Use `buildMetadata()` from
  `src/lib/seo/metadata.ts` for canonical/OG/Twitter tags on any new page.
  Add appropriate JSON-LD via `src/lib/seo/json-ld.ts` + `<JsonLd data={...}/>`.
  Only add structured data types Google currently documents support for —
  don't copy schema from generic templates "because SEO."
- **The "Sources & notes" block is opt-in per article**, not a fixed template
  section. It renders only when an article's frontmatter has `references`,
  `sourceNote`, or `editorialNote`. Don't force it to always render, and
  don't remove its conditional rendering to make science pieces "look more
  official" — the point is storytelling/philosophy pieces stay clean.
- **Images use `ResponsiveImage` (`src/components/media/ResponsiveImage.tsx`),
  not `next/image`.** There's no image server in static export, so
  `next/image` would never generate a real `srcset` regardless — it was
  removed from the codebase entirely to avoid the false impression that
  optimization is happening. Real editorial images go through the
  pre-generated-variant pipeline: see `content/images-src/README.md` before
  adding any raster image. `npm run build` runs
  `scripts/check-image-sizes.mjs` first and **fails** on an oversized
  source image — don't bypass or remove that check.
- **Search is Pagefind**, generated as a post-build step
  (`npm run build` = `next build && pagefind --site out`). Don't add a
  hosted search backend for this.
- **CSP (`public/_headers`) intentionally includes `'unsafe-inline'` and
  `'wasm-unsafe-eval'` in `script-src`.** This was verified, not assumed —
  see below. Don't "tighten" this back to a bare `script-src 'self'`
  without re-verifying against a real build (`npm run build`, serve `out/`
  with `npx wrangler pages dev out`, load a page in a real browser): doing
  so silently breaks React hydration on every page and Pagefind search
  specifically.
  - `'unsafe-inline'`: Next.js inlines the RSC hydration payload as
    `<script>` tags on every static-exported page, with content that
    differs per page/build. Static export has no server to mint per-request
    nonces, and hashing every page's unique inline payload in a single
    global `_headers` file isn't maintainable. The risk this normally
    guards against (attacker-controlled content reaching an inline
    `<script>` at request time) doesn't apply here — all HTML is built
    ahead of time from git-controlled content, not from live user input.
  - `'wasm-unsafe-eval'`: Pagefind's search index runs as WebAssembly, which
    `script-src 'self'` alone blocks (confirmed: search returned 0 results
    and threw a `WebAssembly.instantiate` CSP error without this).
    `'wasm-unsafe-eval'` is scoped to WASM compilation only — it does not
    enable `eval()`/`Function()` the way `'unsafe-eval'` would.
  - `img-src` is deliberately just `'self' data:`, not `https:` — nothing
    in the codebase hotlinks external images. If an article genuinely needs
    to embed an image from another domain, allowlist that specific domain
    rather than reopening `https:` broadly.

## Future evolution (do not implement until asked)

The architecture is deliberately not closed off from these — don't add
premature abstractions for them, but don't block them either:

- **APIs / interactive features:** prefer Cloudflare Pages Functions
  (`/functions` directory) or a separate service, keeping the static
  article pages untouched — `functions/api/publish.ts` is the existing
  example. Don't convert the whole site to SSR to support one interactive
  feature.
- **Interactive scientific visualizations:** should be isolated client
  components (e.g. an MDX component embedded in specific articles), not a
  site-wide rendering mode change.
- **Newsletter:** not implemented in v1. When added, it should be a form
  posting to a third-party provider (Buttondown, ConvertKit, etc.) or a
  Cloudflare Pages Function — not a reason to add a database.
- **Comments, auth, or any user-generated content:** out of scope until
  explicitly requested; would be the first genuine reason to introduce a
  backend.

## Placeholders to swap before real launch

- `public/og-default.png`, `public/og-article-fallback.png`, `public/logo.png`
  are programmatically generated (`scripts/generate-brand-assets.mjs`), not
  designed assets — real ones, correctly sized for OG/Twitter (1200×630) and
  Organization logo (512×512), should replace them before launch.
- `public/images/covers/*.svg` (the current article cover images) are
  placeholders too. They work fine as-is (SVGs are resolution-independent,
  so there's no responsive-variant concern for them specifically) — but
  real cover photography should go through the pipeline in
  `content/images-src/README.md`, not be dropped in as more SVGs.
- `src/lib/seo/constants.ts` `SITE_URL` assumes `https://kakrat.com` — correct
  if that changes.

