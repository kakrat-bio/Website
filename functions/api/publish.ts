// Cloudflare Pages Function — not part of the static-exported Next app.
// Lets an authenticated request create a new article directly via the
// GitHub Contents API, committed to `main`. This is the only server-side
// code in the project, by design (see CLAUDE.md "Future evolution": Pages
// Functions, not a rewrite to SSR, when an interactive feature genuinely
// needs one).
//
// Deliberately self-contained: earlier versions imported the frontmatter
// schema from `../../src/types/content`, reaching outside this directory.
// Cloudflare's production Pages Functions bundler resolves that differently
// than `wrangler pages dev` does locally, and every production request was
// failing with a raw, uncatchable 502 regardless of payload — consistent
// with the module itself failing to bundle/load rather than a runtime
// error in our code (a real runtime error would have been caught by the
// top-level try/catch below and returned as JSON, which never happened).
// `zod` is a real npm package (not a cross-directory relative import), so
// it's safe to import directly here; the frontmatter shape is duplicated
// from `src/types/content.ts` — keep the two in sync if that schema
// changes.
import { z } from "zod";

const TOPICS = [
  "science",
  "biotechnology",
  "entrepreneurship",
  "technology",
  "storytelling",
  "philosophy",
  "ideas",
] as const;

const articleFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be kebab-case"),
  description: z.string().min(1, "description cannot be empty").max(200),
  publishedAt: z.coerce.date(),
  authors: z.array(z.string()).min(1),
  topic: z.enum(TOPICS),
  tags: z
    .array(z.string().trim().min(1))
    .default([])
    .transform((tags) => Array.from(new Set(tags))),
  coverImage: z.string().optional(),
  coverImageAlt: z.string().min(1).optional(),
  draft: z.boolean().default(false),
});

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
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 4000;
const MAX_TOTAL_IMAGE_BYTES = 20 * 1024 * 1024;
const VARIANT_WIDTHS = [480, 768, 1200, 1600] as const;
const IMAGE_MANIFEST_PATH = "public/images/generated/manifest.json";
// (Deploy marker — an earlier deployment of a stale commit got redeployed
// on top of the real fixes via a dashboard "Retry deployment" click, which
// rebuilds that same old commit rather than pulling latest. This push
// exists purely to force a fresh, unambiguously-latest deployment.)

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

function base64ToString(value: string): string {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
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

async function githubError(res: Response, operation: string): Promise<Error> {
  let message = res.statusText || "Request failed";
  try {
    const body: unknown = await res.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
    ) {
      message = body.message;
    }
  } catch {
    // GitHub normally returns a small JSON error object. Status and statusText
    // still provide a useful, non-sensitive fallback if that ever changes.
  }

  console.error(
    JSON.stringify({
      message: "GitHub API request failed",
      operation,
      status: res.status,
      requestId: res.headers.get("x-github-request-id"),
    }),
  );
  return new Error(`GitHub API error ${operation}: ${res.status} ${message}`);
}

async function githubJson<T>(res: Response, operation: string): Promise<T> {
  if (!res.ok) throw await githubError(res, operation);
  return (await res.json()) as T;
}

async function fileExists(env: Env, path: string): Promise<boolean> {
  const res = await githubRequest(env, `/contents/${path}?ref=${BRANCH}`);
  if (res.status === 200) return true;
  if (res.status === 404) return false;
  throw await githubError(res, `checking ${path}`);
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
    throw await githubError(res, `creating ${path}`);
  }
}

type CommitFile = { path: string; content: string };

/** Commits every file through GitHub's Git Data API in one atomic commit. */
async function commitFiles(env: Env, files: CommitFile[], message: string): Promise<void> {
  const ref = await githubJson<{ object: { sha: string } }>(
    await githubRequest(env, `/git/ref/heads/${BRANCH}`),
    `reading ${BRANCH} ref`,
  );
  const parent = await githubJson<{ tree: { sha: string } }>(
    await githubRequest(env, `/git/commits/${ref.object.sha}`),
    `reading ${BRANCH} commit`,
  );

  const tree: { path: string; mode: "100644"; type: "blob"; sha: string }[] = [];
  for (const file of files) {
    const blob = await githubJson<{ sha: string }>(
      await githubRequest(env, "/git/blobs", {
        method: "POST",
        body: JSON.stringify({ content: file.content, encoding: "base64" }),
      }),
      `creating blob for ${file.path}`,
    );
    tree.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
  }

  const nextTree = await githubJson<{ sha: string }>(
    await githubRequest(env, "/git/trees", {
      method: "POST",
      body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
    }),
    "creating publish tree",
  );
  const commit = await githubJson<{ sha: string }>(
    await githubRequest(env, "/git/commits", {
      method: "POST",
      body: JSON.stringify({ message, tree: nextTree.sha, parents: [ref.object.sha] }),
    }),
    "creating publish commit",
  );
  await githubJson(
    await githubRequest(env, `/git/refs/heads/${BRANCH}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false }),
    }),
    `updating ${BRANCH}`,
  );
}

type ImageManifestEntry = {
  key: string;
  width: number;
  height: number;
  variants: { width: number; path: string }[];
  fallback: string;
};

type CoverUpload = {
  key: string;
  entry: ImageManifestEntry;
  files: CommitFile[];
};

type ImageMetadata = {
  width: number;
  height: number;
  sourceExt: "jpg" | "png" | "webp";
  variantWidths: number[];
  fallbackExt: "jpg" | "png";
};

function expectedVariantWidths(sourceWidth: number): number[] {
  return VARIANT_WIDTHS.map((width) => Math.min(width, sourceWidth)).filter(
    (width, index, widths) => widths.indexOf(width) === index,
  );
}

async function validateCoverUpload(
  form: FormData,
  year: string,
  slug: string,
  alt: string,
): Promise<{ ok: true; upload: CoverUpload | null } | { ok: false; error: string }> {
  const source = form.get("imageSource");
  const variants = form.getAll("imageVariant");
  const fallback = form.get("imageFallback");
  const metadataRaw = String(form.get("imageMetadata") ?? "").trim();
  const hasUpload = source instanceof File || variants.length > 0 || fallback instanceof File || Boolean(metadataRaw);
  if (!hasUpload) return { ok: true, upload: null };

  if (!(source instanceof File) || !(fallback instanceof File) || !metadataRaw || variants.length === 0) {
    return { ok: false, error: "The cover image upload is incomplete. Select the image again." };
  }
  if (!alt) return { ok: false, error: "Cover image alt text is required." };
  if (source.size <= 0 || source.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "The source image must be between 1 byte and 5MB." };
  }

  let metadata: ImageMetadata;
  try {
    metadata = JSON.parse(metadataRaw) as ImageMetadata;
  } catch {
    return { ok: false, error: "The cover image metadata is invalid." };
  }
  if (
    !Number.isInteger(metadata.width) ||
    !Number.isInteger(metadata.height) ||
    metadata.width < 1 ||
    metadata.height < 1 ||
    Math.max(metadata.width, metadata.height) > MAX_IMAGE_DIMENSION
  ) {
    return { ok: false, error: "The cover image dimensions are invalid or exceed 4000px." };
  }

  const sourceMime = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" }[metadata.sourceExt];
  const fallbackMime = { jpg: "image/jpeg", png: "image/png" }[metadata.fallbackExt];
  if (!sourceMime || source.type !== sourceMime || !fallbackMime || fallback.type !== fallbackMime) {
    return { ok: false, error: "The cover image file types do not match their metadata." };
  }

  const expectedWidths = expectedVariantWidths(metadata.width);
  if (
    !Array.isArray(metadata.variantWidths) ||
    metadata.variantWidths.length !== expectedWidths.length ||
    metadata.variantWidths.some((width, index) => width !== expectedWidths[index])
  ) {
    return { ok: false, error: "The responsive cover image widths are invalid." };
  }

  const variantFiles = variants.filter((value): value is File => value instanceof File);
  if (variantFiles.length !== variants.length || variantFiles.length !== expectedWidths.length) {
    return { ok: false, error: "The responsive cover image files are incomplete." };
  }
  const variantsByName = new Map(variantFiles.map((file) => [file.name, file]));
  const orderedVariants: File[] = [];
  for (const width of expectedWidths) {
    const file = variantsByName.get(`${width}.webp`);
    if (!file || file.type !== "image/webp") {
      return { ok: false, error: `The ${width}px WebP cover image is missing.` };
    }
    orderedVariants.push(file);
  }

  const allOutputs = [...orderedVariants, fallback];
  if (allOutputs.some((file) => file.size <= 0 || file.size > MAX_IMAGE_BYTES)) {
    return { ok: false, error: "A generated cover image file is empty or exceeds 5MB." };
  }
  const totalBytes = source.size + allOutputs.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_TOTAL_IMAGE_BYTES) {
    return { ok: false, error: "The prepared cover image files exceed the 20MB upload limit." };
  }

  const key = `${year}/${slug}/cover`;
  const files: CommitFile[] = [
    {
      path: `content/images-src/${key}.${metadata.sourceExt}`,
      content: bytesToBase64(new Uint8Array(await source.arrayBuffer())),
    },
  ];
  for (let index = 0; index < expectedWidths.length; index += 1) {
    files.push({
      path: `public/images/generated/${key}/${expectedWidths[index]}.webp`,
      content: bytesToBase64(new Uint8Array(await orderedVariants[index].arrayBuffer())),
    });
  }
  files.push({
    path: `public/images/generated/${key}/fallback.${metadata.fallbackExt}`,
    content: bytesToBase64(new Uint8Array(await fallback.arrayBuffer())),
  });

  return {
    ok: true,
    upload: {
      key,
      files,
      entry: {
        key,
        width: metadata.width,
        height: metadata.height,
        variants: expectedWidths.map((width) => ({
          width,
          path: `/images/generated/${key}/${width}.webp`,
        })),
        fallback: `/images/generated/${key}/fallback.${metadata.fallbackExt}`,
      },
    },
  };
}

async function readImageManifest(env: Env): Promise<Record<string, ImageManifestEntry>> {
  const file = await githubJson<{ content: string; encoding: string }>(
    await githubRequest(env, `/contents/${IMAGE_MANIFEST_PATH}?ref=${BRANCH}`),
    `reading ${IMAGE_MANIFEST_PATH}`,
  );
  if (file.encoding !== "base64") throw new Error("GitHub returned the image manifest in an unsupported encoding.");
  return JSON.parse(base64ToString(file.content)) as Record<string, ImageManifestEntry>;
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
  const coverImageAlt = String(form.get("coverImageAlt") ?? "").trim();

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
  const coverResult = await validateCoverUpload(form, year, slug, coverImageAlt);
  if (!coverResult.ok) return json({ ok: false, error: coverResult.error }, 400);
  const coverUpload = coverResult.upload;

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
    coverImage: coverUpload?.key,
    coverImageAlt: coverUpload ? coverImageAlt : undefined,
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
    ...(coverUpload ? [`coverImage: ${yamlString(coverUpload.key)}`] : []),
    ...(coverUpload ? [`coverImageAlt: ${yamlString(coverImageAlt)}`] : []),
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
    const commitMessage = `${draft ? "Add draft" : "Publish"}: ${title}`;
    if (coverUpload) {
      const manifest = await readImageManifest(env);
      manifest[coverUpload.key] = coverUpload.entry;
      await commitFiles(
        env,
        [
          ...coverUpload.files,
          {
            path: IMAGE_MANIFEST_PATH,
            content: bytesToBase64(new TextEncoder().encode(`${JSON.stringify(manifest, null, 2)}\n`)),
          },
          { path: articlePath, content: mdxBase64 },
        ],
        commitMessage,
      );
    } else {
      await putFile(env, articlePath, mdxBase64, commitMessage);
    }
  } catch (err) {
    // A 502 response from a Pages Function is rendered by Cloudflare as an
    // opaque edge error, hiding our JSON body from the publish form. This is
    // an application-level GitHub failure, so return JSON 500 instead.
    return json({ ok: false, error: err instanceof Error ? err.message : "Unknown error committing to GitHub." }, 500);
  }

  return json({
    ok: true,
    path: articlePath,
    draft,
    url: draft ? null : `https://kakrat.com/articles/${slug}`,
  });
}
