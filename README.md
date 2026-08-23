# Kakrat

The source for [kakrat.com](https://kakrat.com) — an independent publication
on science, biotechnology, entrepreneurship, technology, storytelling,
philosophy, and ideas.

Static site: Next.js (App Router, static export) + TypeScript + Tailwind CSS
+ MDX content, no database or backend.

## Development

```
npm install
npm run dev
```

## Publishing an article

```
node scripts/new-article.mjs "Article Title" <topic>
```

This scaffolds `content/articles/<year>/<slug>.mdx` with `draft: true`. Fill
in the body, flip `draft` to `false`, and open a PR. See
`content/articles/README.md` for the frontmatter schema.

Adding a real (non-placeholder) cover photo or in-article image? See
`content/images-src/README.md` — there's no server-side image optimizer in
static export, so responsive variants are pre-generated locally with
`npm run optimize-images` and committed alongside the source image.

### Publish tool (`/publish`)

A private, `noindex` page at `/publish` lets you create a new article from a
browser form instead of editing files directly — it POSTs to
`functions/api/publish.ts`, a Cloudflare Pages Function that validates the
submission with the same zod schema the site itself uses, then commits the
MDX file straight to `main` via the GitHub Contents API. New articles
default to `draft: true`.

Cover images aren't supported through this form (uploading one reliably hit
a Cloudflare Workers resource-limit termination) — articles without one fall
back to a branded default image automatically. To set a real cover image,
add `coverImage`/`coverImageAlt` to the MDX frontmatter directly, following
`content/images-src/README.md`.

This is the only server-side code in the project — everything else stays a
static export, per `CLAUDE.md`.

**Required setup** (Cloudflare Pages dashboard → your project → Settings →
Environment variables, add as **secrets**, not plain variables):

| Secret | Purpose |
|---|---|
| `GITHUB_TOKEN` | A fine-grained GitHub PAT scoped to **Contents: Read and write** on `kakrat-bio/Website` only. |
| `PUBLISH_SECRET` | A password you choose. Enter it into the `/publish` form's "Publish secret" field each time — it's never stored client-side. |

Without both secrets configured, the Function returns a 500 rather than
silently failing open.

## Build

```
npm run build
```

Runs `scripts/check-image-sizes.mjs` (fails the build on an oversized
editorial image), then `next build` (static export to `out/`), then the
Pagefind search indexer against that output.

## Tests

```
npm run test
```

Runs the vitest suite — mainly regression coverage for the content schema
(zod validation) and SEO metadata helpers (canonical URL handling).

## Deployment — Cloudflare Pages

This repo deploys to Cloudflare Pages as a static site (no Workers/wrangler
config needed):

- **Build command:** `npm run build`
- **Build output directory:** `out`
- **Framework preset:** Next.js (Static HTML Export)

Connect the GitHub repo in the Cloudflare dashboard (Workers & Pages →
Create → Pages → Connect to Git) and set the build command/output above.
Every PR gets a preview deployment; merges to `main` deploy to production.

### Custom domain

Under the Pages project's **Custom domains** tab, add `kakrat.com` (and
`www.kakrat.com`, redirected to the apex or vice versa — pick one as
canonical and 301 the other). If the domain's DNS is already on Cloudflare
this is automatic; otherwise point the registrar's nameservers at Cloudflare
first.

Security headers and asset caching are defined in `public/_headers`
(Cloudflare Pages' native mechanism — no separate config file needed).

## Architecture notes

See `CLAUDE.md` for the content model, directory conventions, and
guardrails for extending the site safely.
