import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTags, getArticlesByTag } from "@/lib/content/articles";
import { ArticleCard } from "@/components/article/ArticleCard";
import { buildMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return buildMetadata({
    title: `#${tag}`,
    description: `Articles tagged "${tag}" on Kakrat.`,
    path: `/tags/${tag}`,
  });
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const articles = getArticlesByTag(tag);
  if (articles.length === 0) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="font-display text-4xl text-ink">#{tag}</h1>
      <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
