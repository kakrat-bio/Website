import Link from "next/link";
import { getAllArticles } from "@/lib/content/articles";
import { ALL_TOPICS } from "@/lib/content/topics";
import { ArticleCard } from "@/components/article/ArticleCard";

export default function HomePage() {
  const articles = getAllArticles();
  const [featured, ...rest] = articles;
  const secondary = rest.slice(0, 2);
  const latest = rest.slice(2, 8);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      {featured && (
        <section aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="sr-only">
            Featured story
          </h2>
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <ArticleCard article={featured} size="large" />
            {secondary.length > 0 && (
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-1">
                {secondary.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="mt-20 border-t border-line pt-12" aria-labelledby="latest-heading">
          <h2 id="latest-heading" className="font-display text-2xl text-ink">
            Latest
          </h2>
          <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-20 border-t border-line pt-12" aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="font-display text-2xl text-ink">
          Explore by topic
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {ALL_TOPICS.map((topic) => (
            <Link
              key={topic.slug}
              href={`/topics/${topic.slug}`}
              className="rounded-full border border-line px-4 py-2 text-sm text-ink-muted transition-colors hover:border-accent hover:text-ink"
            >
              {topic.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
