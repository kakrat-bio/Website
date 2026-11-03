import { describe, expect, it } from "vitest";
import { articleJsonLd, organizationJsonLd } from "./json-ld";
import { SITE_URL } from "./constants";
import type { Article } from "@/types/content";

const article = {
  title: "Test Piece",
  slug: "test-piece",
  description: "A test.",
  publishedAt: new Date("2026-11-01T00:00:00Z"),
  authors: ["kakratian"],
  topic: "culture-ideas",
  tags: ["india", "satire"],
  draft: false,
  references: [],
  corrections: [],
  content: "",
  readingTimeMinutes: 1,
  filePath: "x.mdx",
} as Article;

describe("articleJsonLd", () => {
  const ld = articleJsonLd(article, []);
  it("is a NewsArticle with section, keywords and language", () => {
    expect(ld["@type"]).toBe("NewsArticle");
    expect(ld.articleSection).toBe("Culture & Ideas");
    expect(ld.keywords).toBe("india, satire");
    expect(ld.inLanguage).toBe("en");
    expect(Array.isArray(ld.image)).toBe(true);
  });
  it("points its publisher at the site-wide organization node", () => {
    expect(ld.publisher["@id"]).toBe(`${SITE_URL}/#organization`);
    expect(organizationJsonLd()["@id"]).toBe(`${SITE_URL}/#organization`);
  });
});
