import { shareImageUrl } from "./share-image";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, CONTACT_EMAIL, SOCIAL_PROFILES } from "./constants";
import { TOPIC_META } from "@/lib/content/topics";
import type { Article, Author } from "@/types/content";

/**
 * Only Google-supported, currently-relevant structured data is implemented
 * here. Notably no `SearchAction` sitelinks-searchbox markup: it requires a
 * query-string-driven results page, and Kakrat's search is a static,
 * client-rendered Pagefind index — implementing SearchAction against it
 * would be non-functional markup copied from a generic template.
 */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    email: CONTACT_EMAIL,
    publishingPrinciples: `${SITE_URL}/about`,
    ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };
}

export function personJsonLd(author: Author) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    description: author.bio,
    url: `${SITE_URL}/authors/${author.id}`,
    ...(author.title ? { jobTitle: author.title } : {}),
    ...(author.sameAs.length || author.website
      ? { sameAs: [...(author.website ? [author.website] : []), ...author.sameAs] }
      : {}),
  };
}

/**
 * `NewsArticle` (a Google-documented Article subtype) rather than plain
 * `Article`: it's the type Google's news surfaces key on, and it's accurate
 * for a dated, bylined editorial publication. `articleSection`, `keywords`
 * and `inLanguage` help news and AI-answer systems classify the piece.
 */
export function articleJsonLd(article: Article, authors: Author[]) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    image: [shareImageUrl(article.coverImage)],
    articleSection: TOPIC_META[article.topic].label,
    ...(article.tags.length ? { keywords: article.tags.join(", ") } : {}),
    inLanguage: "en",
    isAccessibleForFree: true,
    datePublished: article.publishedAt.toISOString(),
    dateModified: (article.updatedAt ?? article.publishedAt).toISOString(),
    author: authors.map((a) => ({
      "@type": "Person",
      name: a.name,
      url: `${SITE_URL}/authors/${a.id}`,
    })),
    publisher: {
      "@type": "NewsMediaOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/articles/${article.slug}`,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
