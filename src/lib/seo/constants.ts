export const SITE_NAME = "Kakrat";
export const SITE_DESCRIPTION =
  "An independent publication on science, biotechnology, entrepreneurship, technology, storytelling, philosophy, and ideas.";
/** Update if the domain or protocol ever changes — everything (sitemap, RSS, JSON-LD, canonical URLs) reads from here. */
export const SITE_URL = "https://kakrat.com";
/** Site-wide default social share image (1200x630). Regenerate with `node scripts/generate-brand-assets.mjs`. */
export const DEFAULT_OG_IMAGE = "/og-default.png";
/** Used for an article that (defensively) has no coverImage — schema requires one, so this mainly guards against future schema changes. */
export const ARTICLE_FALLBACK_IMAGE = "/og-article-fallback.png";
