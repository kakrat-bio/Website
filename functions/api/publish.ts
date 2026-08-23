// Cloudflare Pages Function — not part of the static-exported Next app.
// Lets an authenticated request create a new article directly via the
// GitHub Contents API, committed to `main`. This is the only server-side
// code in the project, by design (see CLAUDE.md "Future evolution": Pages
// Functions, not a rewrite to SSR, when an interactive feature genuinely
// needs one).
import { articleFrontmatterSchema, TOPICS } from "../../src/types/content";

type Env = {
  GITHUB_TOKEN: string;
  PUBLISH_SECRET: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

const REPO_OWNER = "kakrat-bio";
const REPO_NAME = "Website";
const BRANCH = "main";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Minimal, dependency-free YAML string emitter — good enough for the flat frontmatter shape we control here. */
function yamlString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

// Note: cover image upload was removed from this Function — attaching an
// image reliably triggered a raw platform 502 (an uncatchable Workers
// resource-limit termination, not a normal exception), and cover images are
// optional by design (articles fall back to a branded default). Set
// coverImage/coverImageAlt by editing the MDX frontmatter directly instead.

async function githubRequest(env: Env, path: string, init?: RequestInit): Promise<Response> {
  return fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "kakrat-publish-function",
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

async function fileExists(env: Env, path: string): Promise<boolean> {
  const res = await githubRequest(env, `/contents/${path}?ref=${BRANCH}`);
  return res.status === 200;
}

async function putFile(env: Env, path: string, base64Content: string, message: string): Promise<void> {
  const res = await githubRequest(env, `/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: base64Content,
      branch: BRANCH,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API error creating ${path}: ${res.status} ${body}`);
  }
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  // Top-level safety net: anything that throws unexpectedly below becomes a
  // clean JSON error instead of an opaque platform 502, so a real bug is
  // always diagnosable from the response itself.
  try {
    return await handlePublish(context);
  } catch (err) {
    return json(
      {
        ok: false,
        error: `Unexpected server error: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`,
      },
      500,
    );
  }
}

async function handlePublish(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  if (!env.PUBLISH_SECRET || !env.GITHUB_TOKEN) {
    return json({ ok: false, error: "Publish tool is not configured (missing secrets)." }, 500);
  }

  const auth = request.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!provided || provided !== env.PUBLISH_SECRET) {
    return json({ ok: false, error: "Unauthorized." }, 401);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "Expected multipart/form-data." }, 400);
  }

  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const topic = String(form.get("topic") ?? "").trim();
  const authorsRaw = String(form.get("authors") ?? "").trim();
  const tagsRaw = String(form.get("tags") ?? "").trim();
  const body = String(form.get("body") ?? "");
  const publishedAt = String(form.get("publishedAt") ?? "").trim();
  const draft = String(form.get("draft") ?? "true") === "true";

  let slug = String(form.get("slug") ?? "").trim();
  if (!slug) slug = slugify(title);
  else slug = slugify(slug);

  const authors = authorsRaw
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!TOPICS.includes(topic as (typeof TOPICS)[number])) {
    return json({ ok: false, error: `Invalid topic "${topic}".` }, 400);
  }

  const year = (publishedAt || new Date().toISOString()).slice(0, 4);
  const articlePath = `content/articles/${year}/${slug}.mdx`;

  // Validate the assembled frontmatter with the exact same schema the site
  // itself enforces at build time, so nothing reaches GitHub that would
  // fail the build once it's there.
  const frontmatterCandidate = {
    title,
    slug,
    description,
    publishedAt: publishedAt || new Date().toISOString().slice(0, 10),
    authors,
    topic,
    tags,
    draft,
  };
  const parsed = articleFrontmatterSchema.safeParse(frontmatterCandidate);
  if (!parsed.success) {
    return json({ ok: false, error: `Validation failed: ${parsed.error.message}` }, 400);
  }
  if (!body.trim()) {
    return json({ ok: false, error: "Article body cannot be empty." }, 400);
  }

  if (await fileExists(env, articlePath)) {
    return json({ ok: false, error: `An article already exists at ${articlePath}. Choose a different slug.` }, 409);
  }

  const frontmatterLines = [
    "---",
    `title: ${yamlString(parsed.data.title)}`,
    `slug: ${yamlString(parsed.data.slug)}`,
    `description: ${yamlString(parsed.data.description)}`,
    `publishedAt: ${yamlString(String(publishedAt || new Date().toISOString().slice(0, 10)))}`,
    `authors: [${parsed.data.authors.map(yamlString).join(", ")}]`,
    `topic: ${yamlString(parsed.data.topic)}`,
    `tags: [${parsed.data.tags.map(yamlString).join(", ")}]`,
    `draft: ${draft ? "true" : "false"}`,
    "---",
    "",
  ].join("\n");

  const mdxContent = frontmatterLines + body;
  // UTF-8-safe base64 via TextEncoder rather than the deprecated
  // escape()/unescape() idiom — this content routinely contains non-ASCII
  // text (e.g. accented characters, non-Latin scripts), and legacy globals
  // aren't guaranteed across runtimes.
  const mdxBase64 = bytesToBase64(new TextEncoder().encode(mdxContent));

  try {
    await putFile(env, articlePath, mdxBase64, `${draft ? "Add draft" : "Publish"}: ${title}`);
  } catch (err) {
    return json({ ok: false, error: err instanceof Error ? err.message : "Unknown error committing to GitHub." }, 502);
  }

  return json({
    ok: true,
    path: articlePath,
    draft,
    url: draft ? null : `https://kakrat.com/articles/${slug}`,
  });
}
