import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "./constants";

type PageMetaInput = {
  title: string;
  description: string;
  path: string; // e.g. "/articles/my-slug"
  /**
   * Absolute canonical URL to use instead of `${SITE_URL}${path}` — for
   * content that was originally published elsewhere. Must be a full
   * absolute URL (e.g. "https://other-site.com/original-post"), used
   * as-is, never joined with SITE_URL. `path` is still used to build the
   * page's own OG/Twitter `url` (what this page's address actually is);
   * only the canonical link points elsewhere.
   */
  canonicalUrl?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

/** Builds Next.js Metadata consistently (canonical, OG, Twitter) for any page. */
export function buildMetadata(input: PageMetaInput): Metadata {
  const url = `${SITE_URL}${input.path}`;
  const canonical = input.canonicalUrl ?? url;
  const image = input.image ?? DEFAULT_OG_IMAGE;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: SITE_NAME,
      type: input.type ?? "website",
      images: [{ url: image }],
      ...(input.type === "article" && {
        publishedTime: input.publishedTime,
        modifiedTime: input.modifiedTime,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}
