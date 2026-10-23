import { getManifestEntry } from "../images/manifest";
import { ARTICLE_FALLBACK_IMAGE, SITE_URL } from "./constants";

/**
 * Absolute URL for an article's social-share (OG/Twitter/JSON-LD) image.
 *
 * `coverImage` is usually a manifest key ("2026/my-slug/cover"), not a URL,
 * so it can't be used as-is: crawlers would get a 404. A pipeline image
 * resolves to its generated JPEG/PNG fallback (WebP isn't reliably supported
 * by link-preview crawlers). SVG covers fall back to the branded OG card,
 * since most platforms don't render SVG previews.
 */
export function shareImageUrl(src: string | undefined): string {
  const fallback = `${SITE_URL}${ARTICLE_FALLBACK_IMAGE}`;
  if (!src) return fallback;

  const entry = getManifestEntry(src);
  if (entry) return `${SITE_URL}${entry.fallback}`;

  if (/^https?:\/\//.test(src)) return src;
  if (src.toLowerCase().endsWith(".svg")) return fallback;
  return `${SITE_URL}${src.startsWith("/") ? src : `/${src}`}`;
}
