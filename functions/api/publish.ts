// Cloudflare Pages Function — not part of the static-exported Next app.
// Lets an authenticated request create a new article (and optional cover
// image) directly via the GitHub Contents API, committed to `main`. This
// is the only server-side code in the project, by design (see CLAUDE.md
// "Future evolution": Pages Functions, not a rewrite to SSR, when an
// interactive feature genuinely needs one).
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
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB — matches scripts/check-image-sizes.mjs's hard limit.

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
  const coverImageAlt = String(form.get("coverImageAlt") ?? "").trim();
  const image = form.get("image");

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

  let coverImagePath: string | undefined;
  let imageCommitPath: string | undefined;
  let imageBase64: string | undefined;

  if (image instanceof File && image.size > 0) {
    if (image.size > MAX_IMAGE_BYTES) {
      return json({ ok: false, error: `Image exceeds ${MAX_IMAGE_BYTES / 1024 / 1024}MB.` }, 400);
    }
    if (!coverImageAlt) {
      return json({ ok: false, error: "coverImageAlt is required when uploading an image." }, 400);
    }
    const ext = (image.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const year = (publishedAt || new Date().toISOString()).slice(0, 4);
    imageCommitPath = `public/images/uploads/${year}/${slug}/cover.${ext}`;
    coverImagePath = `/images/uploads/${year}/${slug}/cover.${ext}`;
    const bytes = new Uint8Array(await image.arrayBuffer());
    imageBase64 = bytesToBase64(bytes);
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
    coverImage: coverImagePath,
    coverImageAlt: coverImagePath ? coverImageAlt : undefined,
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
    ...(coverImagePath ? [`coverImage: ${yamlString(coverImagePath)}`] : []),
    ...(coverImagePath ? [`coverImageAlt: ${yamlString(coverImageAlt)}`] : []),
    `draft: ${draft ? "true" : "false"}`,
    "---",
    "",
  ].join("\n");

  const mdxContent = frontmatterLines + body;
  const mdxBase64 = btoa(unescape(encodeURIComponent(mdxContent)));

  try {
    if (imageCommitPath && imageBase64) {
      await putFile(env, imageCommitPath, imageBase64, `Add cover image for "${title}"`);
    }
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
