@AGENTS.md

# Kakrat — conventions for AI agents

Kakrat is a static editorial publication: Next.js App Router, `output: "export"`,
MDX content, no database/backend/auth. Read this before extending it.

## Non-negotiables

- **No server runtime for v1.** Don't add API routes, middleware, `cookies()`/
  `headers()` reads at request time, or anything that requires a Node server —
  `output: "export"` forbids it and the build will fail. If a feature
  genuinely needs a backend (see "Future evolution" below), that's a
  deliberate architecture change to discuss, not something to slip in.
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
- **Images:** `next/image` with `unoptimized: true` (no image server in
  static export). Pre-size and compress images before adding them; there's
  no runtime resizing.
- **Search is Pagefind**, generated as a post-build step
  (`npm run build` = `next build && pagefind --site out`). Don't add a
  hosted search backend for this.

## Future evolution (do not implement until asked)

The architecture is deliberately not closed off from these — don't add
premature abstractions for them, but don't block them either:

- **APIs / interactive features:** if added, prefer Cloudflare Pages
  Functions (`/functions` directory) or a separate service, keeping the
  static article pages untouched. Don't convert the whole site to SSR to
  support one interactive feature.
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

- `public/og-default.svg`, `public/logo.svg`, `public/images/covers/*.svg`
  are generated placeholders, not designed assets.
- `src/lib/seo/constants.ts` `SITE_URL` assumes `https://kakrat.com` — correct
  if that changes.

