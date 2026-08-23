import Link from "next/link";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import type { Article } from "@/types/content";
import { TOPIC_META } from "@/lib/content/topics";
import { getAuthorById } from "@/lib/content/authors";
import { formatDate } from "@/lib/utils/format";
import { ARTICLE_FALLBACK_IMAGE, SITE_NAME } from "@/lib/seo/constants";

export function ArticleCard({
  article,
  size = "default",
  priority = false,
}: {
  article: Article;
  size?: "default" | "large";
  /** Set for the single above-the-fold hero card (e.g. homepage featured story) so its image isn't lazy-loaded. */
  priority?: boolean;
}) {
  const author = getAuthorById(article.authors[0]);
  const topic = TOPIC_META[article.topic];

  return (
    <article className="group">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className={`relative overflow-hidden rounded-sm bg-line ${size === "large" ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
          <ResponsiveImage
            src={article.coverImage || ARTICLE_FALLBACK_IMAGE}
            alt={article.coverImageAlt || SITE_NAME}
            fill
            priority={priority}
            className="transition-transform duration-300 group-hover:scale-[1.02]"
            sizes={size === "large" ? "(min-width: 768px) 800px, 100vw" : "(min-width: 768px) 360px, 100vw"}
          />
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">
            {topic?.label}
          </p>
          <h3
            className={`mt-2 font-display text-ink group-hover:underline ${
              size === "large" ? "text-3xl leading-tight md:text-4xl" : "text-xl leading-snug"
            }`}
          >
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{article.description}</p>
          <p className="mt-3 text-xs text-ink-muted">
            {author?.name}
            {" · "}
            <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt)}</time>
            {" · "}
            {article.readingTimeMinutes} min read
          </p>
        </div>
      </Link>
    </article>
  );
}
