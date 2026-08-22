import type { Article } from "@/types/content";
import { ArticleCard } from "./ArticleCard";

export function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-20 border-t border-line pt-10" aria-labelledby="related-heading">
      <h2 id="related-heading" className="font-display text-2xl text-ink">
        Related reading
      </h2>
      <div className="mt-6 grid gap-8 sm:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
}
