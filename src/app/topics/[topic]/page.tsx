import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticlesByTopic } from "@/lib/content/articles";
import { ALL_TOPICS, getTopicMeta } from "@/lib/content/topics";
import { ArticleCard } from "@/components/article/ArticleCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/constants";

export function generateStaticParams() {
  return ALL_TOPICS.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic: topicSlug } = await params;
  const topic = getTopicMeta(topicSlug);
  if (!topic) return {};
  return buildMetadata({
    title: topic.label,
    description: topic.description,
    path: `/topics/${topic.slug}`,
  });
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: topicSlug } = await params;
  const topic = getTopicMeta(topicSlug);
  if (!topic) notFound();
  const articles = getArticlesByTopic(topic.slug);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: topic.label, url: `${SITE_URL}/topics/${topic.slug}` },
        ])}
      />
      <h1 className="font-display text-4xl text-ink">{topic.label}</h1>
      <p className="mt-2 max-w-xl text-ink-muted">{topic.description}</p>

      {articles.length === 0 ? (
        <p className="mt-10 text-ink-muted">No articles published in this topic yet.</p>
      ) : (
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
