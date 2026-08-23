import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug, getRelatedArticles } from "@/lib/content/articles";
import { getAuthorById } from "@/lib/content/authors";
import { TOPIC_META } from "@/lib/content/topics";
import { ArticleContent } from "@/lib/mdx/compile";
import { AuthorByline } from "@/components/article/AuthorByline";
import { SourcesNotes } from "@/components/article/SourcesNotes";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { ShareBar } from "@/components/article/ShareBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL, ARTICLE_FALLBACK_IMAGE, SITE_NAME } from "@/lib/seo/constants";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

function loadArticle(slug: string) {
  const article = getArticleBySlug(slug);
  if (!article) return null;
  const authors = article.authors.map(getAuthorById).filter((a) => a !== undefined);
  return { article, authors };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loaded = loadArticle(slug);
  if (!loaded) return {};
  const { article } = loaded;

  return buildMetadata({
    title: article.title,
    description: article.description,
    path: `/articles/${article.slug}`,
    image: article.coverImage || ARTICLE_FALLBACK_IMAGE,
    type: "article",
    publishedTime: article.publishedAt.toISOString(),
    modifiedTime: (article.updatedAt ?? article.publishedAt).toISOString(),
    // If this piece was originally published elsewhere, canonicalUrl is
    // that external URL, used as the canonical link as-is (see buildMetadata).
    canonicalUrl: article.canonicalUrl,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loaded = loadArticle(slug);
  if (!loaded) notFound();
  const { article, authors } = loaded;
  const topic = TOPIC_META[article.topic];
  const related = getRelatedArticles(article);
  const url = `${SITE_URL}/articles/${article.slug}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <JsonLd data={articleJsonLd(article, authors)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: topic.label, url: `${SITE_URL}/topics/${topic.slug}` },
          { name: article.title, url },
        ])}
      />

      <p className="text-xs font-medium uppercase tracking-wide text-accent">
        <a href={`/topics/${topic.slug}`}>{topic.label}</a>
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">
        {article.title}
      </h1>
      <p className="mt-4 text-lg text-ink-muted">{article.description}</p>

      <div className="mt-6">
        <AuthorByline
          authors={authors}
          publishedAt={article.publishedAt}
          updatedAt={article.updatedAt}
          readingTimeMinutes={article.readingTimeMinutes}
        />
      </div>

      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-sm bg-line">
        <ResponsiveImage
          src={article.coverImage || ARTICLE_FALLBACK_IMAGE}
          alt={article.coverImageAlt || SITE_NAME}
          fill
          priority
          sizes="(min-width: 768px) 768px, 100vw"
        />
      </div>

      <article className="prose prose-lg mt-10 max-w-none font-sans">
        <ArticleContent source={article.content} />
      </article>

      {article.tags.length > 0 && (
        <nav aria-label="Tags" className="mt-8 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted transition-colors hover:border-accent hover:text-ink"
            >
              #{tag}
            </Link>
          ))}
        </nav>
      )}

      <ShareBar url={url} title={article.title} />

      <SourcesNotes
        references={article.references}
        editorialNote={article.editorialNote}
        sourceNote={article.sourceNote}
      />

      <RelatedArticles articles={related} />
    </div>
  );
}
