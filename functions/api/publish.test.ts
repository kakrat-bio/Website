import { afterEach, describe, expect, it, vi } from "vitest";

import { onRequestPost } from "./publish";

const env = {
  GITHUB_TOKEN: "test-github-token",
  PUBLISH_SECRET: "test-publish-secret",
};

function request(): Request {
  const form = new FormData();
  form.set("title", "Diagnostic draft");
  form.set("slug", "diagnostic-draft");
  form.set("description", "A diagnostic draft used to verify publish errors.");
  form.set("topic", "technology");
  form.set("authors", "kakratian");
  form.set("tags", "diagnostics");
  form.set("body", "A short diagnostic body.");
  form.set("publishedAt", "2026-08-30");
  form.set("draft", "true");

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
});
