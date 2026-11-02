import { getAllArticles } from "@/lib/content/articles";
import { getAuthorById } from "@/lib/content/authors";
import { TOPIC_META } from "@/lib/content/topics";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/seo/constants";
import { escapeXml } from "@/lib/utils/xml";

export const dynamic = "force-static";

export function GET() {
  const articles = getAllArticles().slice(0, 30);

  const items = articles
    .map((a) => {
      const author = getAuthorById(a.authors[0]);
      const url = `${SITE_URL}/articles/${a.slug}`;
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${escapeXml(a.description)}</description>
      <category>${escapeXml(TOPIC_META[a.topic].label)}</category>${a.tags
        .map((t) => `\n      <category>${escapeXml(t)}</category>`)
        .join("")}
      ${author ? `<dc:creator>${escapeXml(author.name)}</dc:creator>` : ""}
      <pubDate>${a.publishedAt.toUTCString()}</pubDate>
    </item>`;
    })
    .join("");

  // Newest article's date, not build time: a feed whose lastBuildDate moves on
  // every deploy tells readers there's something new when there isn't.
  const lastBuildDate = articles[0]?.publishedAt ?? new Date(0);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
