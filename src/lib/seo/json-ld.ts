import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "./constants";
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
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    // TEMP placeholder — swap for a designed raster logo before launch.
    logo: `${SITE_URL}/logo.svg`,
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
    ...(author.sameAs.length ? { sameAs: author.sameAs } : {}),
  };
}

export function articleJsonLd(article: Article, authors: Author[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: `${SITE_URL}${article.coverImage}`,
    datePublished: article.publishedAt.toISOString(),
    dateModified: (article.updatedAt ?? article.publishedAt).toISOString(),
    author: authors.map((a) => ({
      "@type": "Person",
      name: a.name,
      url: `${SITE_URL}/authors/${a.id}`,
    })),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.svg` },
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
