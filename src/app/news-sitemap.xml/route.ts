import { getAllArticles } from "@/lib/content/articles";
import { SITE_NAME, SITE_URL } from "@/lib/seo/constants";
import { escapeXml } from "@/lib/utils/xml";

export const dynamic = "force-static";

/**
 * Google News sitemap (https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap).
 *
 * Google only wants articles from the last two days here; older ones belong
 * in the regular sitemap.xml (which lists everything). Because this is a
 * static export, the window is measured from build time — every new article
 * triggers a deploy, so a fresh piece always lands in this file within
 * minutes of publishing. Between deploys the file may hold entries older
 * than two days; Google simply ignores those, it is not an error.
 *
 * An empty <urlset> is valid and is what this returns when nothing new has
 * been published recently.
 */
const NEWS_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

export function GET() {
  const cutoff = Date.now() - NEWS_WINDOW_MS;
  const recent = getAllArticles().filter(
    (a) => a.publishedAt.getTime() >= cutoff && !a.canonicalUrl,
  );

  const urls = recent
    .map(
      (a) => `
  <url>
    <loc>${SITE_URL}/articles/${encodeURIComponent(a.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt.toISOString()}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
