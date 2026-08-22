import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllAuthors, getAuthorById } from "@/lib/content/authors";
import { getArticlesByAuthor } from "@/lib/content/articles";
import { ArticleCard } from "@/components/article/ArticleCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { personJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/constants";

export function generateStaticParams() {
  return getAllAuthors().map((a) => ({ author: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string }>;
}): Promise<Metadata> {
  const { author: authorId } = await params;
  const author = getAuthorById(authorId);
  if (!author) return {};
  return buildMetadata({
    title: author.name,
    description: author.bio,
    path: `/authors/${author.id}`,
  });
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ author: string }>;
}) {
  const { author: authorId } = await params;
  const author = getAuthorById(authorId);
  if (!author) notFound();
  const articles = getArticlesByAuthor(author.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <JsonLd data={personJsonLd(author)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: author.name, url: `${SITE_URL}/authors/${author.id}` },
        ])}
      />
      <h1 className="font-display text-4xl text-ink">{author.name}</h1>
      {author.title && <p className="mt-1 text-ink-muted">{author.title}</p>}
      <p className="mt-4 max-w-xl text-ink-muted">{author.bio}</p>

      <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
