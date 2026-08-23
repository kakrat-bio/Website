import type { MetadataRoute } from "next";
import { getAllArticles, getAllTags } from "@/lib/content/articles";
import { getAllAuthors } from "@/lib/content/authors";
import { ALL_TOPICS } from "@/lib/content/topics";
import { SITE_URL } from "@/lib/seo/constants";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();

  const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: a.updatedAt ?? a.publishedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const topicUrls: MetadataRoute.Sitemap = ALL_TOPICS.map((t) => ({
    url: `${SITE_URL}/topics/${t.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const tagUrls: MetadataRoute.Sitemap = getAllTags().map((tag) => ({
    url: `${SITE_URL}/tags/${tag}`,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  const authorUrls: MetadataRoute.Sitemap = getAllAuthors().map((a) => ({
    url: `${SITE_URL}/authors/${a.id}`,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
    ...articleUrls,
    ...topicUrls,
    ...tagUrls,
    ...authorUrls,
  ];
}
