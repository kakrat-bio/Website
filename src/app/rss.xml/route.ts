import { getAllArticles } from "@/lib/content/articles";
import { getAuthorById } from "@/lib/content/authors";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/seo/constants";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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
      ${author ? `<author>${escapeXml(author.name)}</author>` : ""}
      <pubDate>${a.publishedAt.toUTCString()}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
