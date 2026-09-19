export const SITE_NAME = "Kakrat";
export const SITE_DESCRIPTION =
  "Independent essays and reporting on science, business, and culture. Named for the Gujarati word for a racket of crows, each one sure it is the one making sense.";
/** Public contact address. Cloudflare Email Routing forwards it to a private inbox, so this is the only address that ever appears on the site. */
export const CONTACT_EMAIL = "mail@kakrat.com";
/** Update if the domain or protocol ever changes — everything (sitemap, RSS, JSON-LD, canonical URLs) reads from here. */
export const SITE_URL = "https://kakrat.com";
/** Site-wide default social share image (1200x630). Regenerate with `node scripts/generate-brand-assets.mjs`. */
export const DEFAULT_OG_IMAGE = "/og-default.png";
/** Used for an article that (defensively) has no coverImage — schema requires one, so this mainly guards against future schema changes. */
export const ARTICLE_FALLBACK_IMAGE = "/og-article-fallback.png";
