import { describe, expect, it } from "vitest";
import { shareImageUrl } from "./share-image";

describe("shareImageUrl", () => {
  it("resolves a manifest key to its generated fallback file", () => {
    expect(shareImageUrl("2026/the-hallmarks-of-ageing/cover")).toBe(
      "https://kakrat.com/images/generated/2026/the-hallmarks-of-ageing/cover/fallback.jpg",
    );
  });

  it("uses the branded fallback for missing or SVG covers", () => {
    expect(shareImageUrl(undefined)).toBe("https://kakrat.com/og-article-fallback.png");
    expect(shareImageUrl("/images/covers/science.svg")).toBe("https://kakrat.com/og-article-fallback.png");
  });

  it("makes other local paths absolute and leaves absolute URLs alone", () => {
    expect(shareImageUrl("/og-default.png")).toBe("https://kakrat.com/og-default.png");
    expect(shareImageUrl("https://example.com/a.jpg")).toBe("https://example.com/a.jpg");
  });
});
