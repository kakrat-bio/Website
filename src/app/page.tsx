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
      <section className="mb-12 max-w-3xl" aria-labelledby="masthead-heading">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Kakrat <span className="normal-case tracking-normal text-ink-muted">· Gujarati, n.</span>
        </p>
        <h1
          id="masthead-heading"
          className="mt-3 font-display text-3xl leading-tight text-ink md:text-5xl"
        >
          The racket of many crows, each certain it is the one making sense.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-muted">
          An independent publication on science and technology, business and innovation,
          culture and ideas &mdash; written for the parts of the noise worth listening to.
        </p>
        <p className="mt-4 text-sm">
          <Link
            href="/articles/kakrat-the-ancient-gujarati-word"
            className="text-accent hover:underline"
          >
            Where the name comes from &rarr;
          </Link>
        </p>
      </section>
      {featured && (
        <section aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="sr-only">
            Featured story
          </h2>
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <ArticleCard article={featured} size="large" priority />
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
          Browse
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
          <Link
            href="/articles"
            className="rounded-full border border-line px-4 py-2 text-sm text-ink-muted transition-colors hover:border-accent hover:text-ink"
          >
            Everything, by date
          </Link>
        </div>
      </section>
    </div>
  );
}
