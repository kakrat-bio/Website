import { afterEach, describe, expect, it, vi } from "vitest";

import { onRequestPost } from "./publish";

const env = {
  GITHUB_TOKEN: "test-github-token",
  PUBLISH_SECRET: "test-publish-secret",
};

function request(mutate?: (form: FormData) => void): Request {
  const form = new FormData();
  form.set("title", "Diagnostic draft");
  form.set("slug", "diagnostic-draft");
  form.set("description", "A diagnostic draft used to verify publish errors.");
  form.set("topic", "science-technology");
  form.set("authors", "kakratian");
  form.set("tags", "diagnostics");
  form.set("body", "A short diagnostic body.");
  form.set("publishedAt", "2026-08-30");
  form.set("draft", "true");
  mutate?.(form);

  return new Request("https://kakrat.com/api/publish", {
    method: "POST",
    headers: { authorization: `Bearer ${env.PUBLISH_SECRET}` },
    body: form,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("publish Function GitHub errors", () => {
  it("surfaces an authentication failure from the existence check as JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json(
        { message: "Bad credentials" },
        { status: 401, headers: { "x-github-request-id": "test-request" } },
      ),
    );

    const response = await onRequestPost({ request: request(), env });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error:
        "Unexpected server error: Error: GitHub API error checking content/articles/2026/diagnostic-draft.mdx: 401 Bad credentials",
    });
  });

  it("surfaces a rejected file creation as JSON", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(
        Response.json(
          { message: "Resource not accessible by personal access token" },
          { status: 403 },
        ),
      );

    const response = await onRequestPost({ request: request(), env });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error:
        "GitHub API error creating content/articles/2026/diagnostic-draft.mdx: 403 Resource not accessible by personal access token",
    });
  });

  it("commits a prepared cover image, manifest, and article in one Git commit", async () => {
    let blobNumber = 0;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes("/contents/content/articles/")) return new Response(null, { status: 404 });
      if (url.includes("/contents/public/images/generated/manifest.json")) {
        return Response.json({ content: btoa("{}"), encoding: "base64" });
      }
      if (url.endsWith("/git/ref/heads/main")) return Response.json({ object: { sha: "parent" } });
      if (url.endsWith("/git/commits/parent")) return Response.json({ tree: { sha: "base-tree" } });
      if (url.endsWith("/git/blobs")) return Response.json({ sha: `blob-${++blobNumber}` });
      if (url.endsWith("/git/trees")) return Response.json({ sha: "next-tree" });
      if (url.endsWith("/git/commits")) return Response.json({ sha: "next-commit" });
      if (url.endsWith("/git/refs/heads/main") && init?.method === "PATCH") {
        return Response.json({ ref: "refs/heads/main" });
      }
      throw new Error(`Unexpected GitHub request: ${init?.method ?? "GET"} ${url}`);
    });

    const response = await onRequestPost({
      request: request((form) => {
        form.set("coverImageAlt", "A useful description of the cover image.");
        form.set("imageSource", new Blob(["source"], { type: "image/jpeg" }), "cover.jpg");
        form.append("imageVariant", new Blob(["webp"], { type: "image/webp" }), "1.webp");
        form.set("imageFallback", new Blob(["fallback"], { type: "image/jpeg" }), "fallback.jpg");
        form.set(
          "imageMetadata",
          JSON.stringify({
            width: 1,
            height: 1,
            sourceExt: "jpg",
            variantWidths: [1],
            fallbackExt: "jpg",
          }),
        );
      }),
      env,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, draft: true });
    expect(blobNumber).toBe(5);

    const treeCall = fetchMock.mock.calls.find(
      ([input, init]) => String(input).endsWith("/git/trees") && init?.method === "POST",
    );
    expect(treeCall).toBeDefined();
    const treeBody = JSON.parse(String(treeCall?.[1]?.body)) as { tree: { path: string }[] };
    expect(treeBody.tree.map((entry) => entry.path)).toEqual([
      "content/images-src/2026/diagnostic-draft/cover.jpg",
      "public/images/generated/2026/diagnostic-draft/cover/1.webp",
      "public/images/generated/2026/diagnostic-draft/cover/fallback.jpg",
      "public/images/generated/manifest.json",
      "content/articles/2026/diagnostic-draft.mdx",
    ]);
  });
});
