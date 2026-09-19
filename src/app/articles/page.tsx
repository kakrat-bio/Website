import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/content/articles";
import { TOPIC_META } from "@/lib/content/topics";
import { getAuthorById } from "@/lib/content/authors";
import { formatDate } from "@/lib/utils/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/constants";
import type { Article } from "@/types/content";

export const metadata: Metadata = buildMetadata({
  title: "Archive",
  description:
    "Everything published on Kakrat, newest first — essays and reporting on science and technology, business and innovation, culture and ideas.",
  path: "/articles",
});

/** Groups articles (already sorted newest-first) by publication year, preserving that order. */
function groupByYear(articles: Article[]): [number, Article[]][] {
  const byYear = new Map<number, Article[]>();
  for (const article of articles) {
    const year = article.publishedAt.getUTCFullYear();
    const existing = byYear.get(year);
    if (existing) existing.push(article);
    else byYear.set(year, [article]);
  }
  return Array.from(byYear.entries()).sort((a, b) => b[0] - a[0]);
}

export default function ArchivePage() {
  const articles = getAllArticles();
  const years = groupByYear(articles);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Archive", url: `${SITE_URL}/articles` },
        ])}
      />
      <h1 className="font-display text-4xl text-ink">Archive</h1>
      <p className="mt-2 text-ink-muted">
        Everything published so far, newest first.{" "}
        {articles.length === 1 ? "One piece" : `${articles.length} pieces`} to date.
      </p>

      {years.length === 0 ? (
        <p className="mt-10 text-ink-muted">Nothing published yet.</p>
      ) : (
        years.map(([year, yearArticles]) => (
          <section key={year} className="mt-14" aria-labelledby={`year-${year}`}>
            <h2
              id={`year-${year}`}
              className="border-b border-line pb-2 font-display text-2xl text-ink"
            >
              {year}
            </h2>
            <ul className="mt-6 space-y-8">
              {yearArticles.map((article) => {
                const author = getAuthorById(article.authors[0]);
                const topic = TOPIC_META[article.topic];
                return (
                  <li key={article.slug}>
                    <article>
                      <p className="text-xs font-medium uppercase tracking-wide text-accent">
                        {topic?.label}
                      </p>
                      <h3 className="mt-1.5 font-display text-xl leading-snug text-ink">
                        <Link href={`/articles/${article.slug}`} className="hover:underline">
                          {article.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-sm text-ink-muted">{article.description}</p>
                      <p className="mt-2 text-xs text-ink-muted">
                        {author?.name}
                        {" · "}
                        <time dateTime={article.publishedAt.toISOString()}>
                          {formatDate(article.publishedAt)}
                        </time>
                        {" · "}
                        {article.readingTimeMinutes} min read
                      </p>
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
