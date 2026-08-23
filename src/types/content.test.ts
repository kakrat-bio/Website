import { describe, expect, it } from "vitest";
import { articleFrontmatterSchema } from "./content";

const baseFrontmatter = {
  title: "Test Article",
  slug: "test-article",
  description: "A test article.",
  publishedAt: "2026-01-01",
  authors: ["tanay-bhatt"],
  topic: "ideas" as const,
  coverImage: "/images/covers/science.svg",
  coverImageAlt: "A test cover image",
};

describe("articleFrontmatterSchema", () => {
  it("normalizes tag casing/spacing so duplicates collapse", () => {
    const parsed = articleFrontmatterSchema.parse({
      ...baseFrontmatter,
      tags: ["Machine Learning", "machine-learning", "  Startups "],
    });
    expect(parsed.tags).toEqual(["machine-learning", "startups"]);
  });

  it("rejects an empty coverImageAlt", () => {
    const result = articleFrontmatterSchema.safeParse({
      ...baseFrontmatter,
      coverImageAlt: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty description", () => {
    const result = articleFrontmatterSchema.safeParse({
      ...baseFrontmatter,
      description: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a well-formed article with the credibility layer populated", () => {
    const result = articleFrontmatterSchema.safeParse({
      ...baseFrontmatter,
      references: [{ title: "A paper", url: "https://example.com/paper" }],
      sourceNote: "Sourced from published research.",
    });
    expect(result.success).toBe(true);
  });
});
