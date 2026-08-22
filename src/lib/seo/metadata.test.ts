import { describe, expect, it } from "vitest";
import { buildMetadata } from "./metadata";
import { SITE_URL } from "./constants";

describe("buildMetadata canonical URL handling", () => {
  it("builds a canonical URL under SITE_URL when no canonicalUrl is given", () => {
    const meta = buildMetadata({
      title: "Local Article",
      description: "A local article.",
      path: "/articles/local-article",
    });
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/articles/local-article`);
  });

  it("uses an external canonicalUrl as-is, never joined with SITE_URL", () => {
    const external = "https://other-site.example/original-post";
    const meta = buildMetadata({
      title: "Cross-posted Article",
      description: "Originally published elsewhere.",
      path: "/articles/cross-posted-article",
      canonicalUrl: external,
    });
    expect(meta.alternates?.canonical).toBe(external);
    // Regression guard: SITE_URL must never be prepended to an external canonical.
    expect(String(meta.alternates?.canonical)).not.toContain(SITE_URL + "http");
  });

  it("still uses the page's own path for openGraph.url even with an external canonical", () => {
    const meta = buildMetadata({
      title: "Cross-posted Article",
      description: "Originally published elsewhere.",
      path: "/articles/cross-posted-article",
      canonicalUrl: "https://other-site.example/original-post",
    });
    expect(meta.openGraph?.url).toBe(`${SITE_URL}/articles/cross-posted-article`);
  });
});
