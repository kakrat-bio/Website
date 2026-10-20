// Cloudflare Pages Function — public comments API for article pages.
//
//   GET  /api/comments?slug=<article-slug>  → approved comments (no emails)
//   POST /api/comments                      → submit a comment (held as "pending")
//
// Every new comment waits for moderation at /admin/comments (see ./admin.ts).
// Self-contained on purpose, like ../publish.ts: no imports from src/.
//
// Bindings / secrets (Cloudflare Pages → Settings):
//   COMMENTS_DB            D1 binding (database "kakrat-comments")          — required
//   RESEND_API_KEY         Resend API key, for new-comment emails           — optional
//   COMMENTS_NOTIFY_EMAIL  where new-comment emails go                       — optional
//   COMMENTS_FROM_EMAIL    verified sender, e.g. "Kakrat <comments@kakrat.com>" — optional

export type D1Result<T> = { results: T[] };
export type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<D1Result<T>>;
  first<T>(): Promise<T | null>;
  run(): Promise<{ meta: { last_row_id: number } }>;
};
export type D1Like = { prepare(sql: string): D1Statement };

type Env = {
  COMMENTS_DB?: D1Like;
  ASSETS?: { fetch(request: Request | string): Promise<Response> };
  RESEND_API_KEY?: string;
  COMMENTS_NOTIFY_EMAIL?: string;
  COMMENTS_FROM_EMAIL?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
  waitUntil?: (promise: Promise<unknown>) => void;
};

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 60;
const MAX_EMAIL = 200;
const MAX_BODY = 3000;
const RATE_WINDOW_MINUTES = 10;
const RATE_MAX = 5;

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders },
  });
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function articleExists(env: Env, origin: string, slug: string): Promise<boolean> {
  // Only article pages that were actually built can receive comments.
  if (!env.ASSETS) return true;
  try {
    const res = await env.ASSETS.fetch(new Request(`${origin}/articles/${slug}`, { method: "GET" }));
    return res.ok;
  } catch {
    return true;
  }
}

async function notify(env: Env, comment: { slug: string; name: string; body: string; isReply: boolean }, origin: string) {
  if (!env.RESEND_API_KEY || !env.COMMENTS_NOTIFY_EMAIL) return;
  const from = env.COMMENTS_FROM_EMAIL || "Kakrat <comments@kakrat.com>";
  const html = `
    <p><strong>${escapeHtml(comment.name)}</strong> left a ${comment.isReply ? "reply" : "comment"} on
    <a href="${origin}/articles/${comment.slug}">${escapeHtml(comment.slug)}</a>:</p>
    <blockquote style="border-left:3px solid #ccc;padding-left:12px;white-space:pre-wrap">${escapeHtml(comment.body)}</blockquote>
    <p><a href="${origin}/admin/comments">Review pending comments →</a></p>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [env.COMMENTS_NOTIFY_EMAIL],
        subject: `New comment awaiting moderation: ${comment.slug}`,
        html,
      }),
    });
    if (!res.ok) console.error(JSON.stringify({ message: "comment email failed", status: res.status }));
  } catch (error) {
    console.error(JSON.stringify({ message: "comment email error", error: String(error) }));
  }
}

type PublicComment = {
  id: number;
  parent_id: number | null;
  name: string;
  body: string;
  created_at: string;
};

export async function onRequestGet({ request, env }: PagesContext): Promise<Response> {
  if (!env.COMMENTS_DB) return json({ ok: false, error: "Comments are not configured yet." }, 503);
  const slug = new URL(request.url).searchParams.get("slug") ?? "";
  if (!SLUG_RE.test(slug)) return json({ ok: false, error: "Invalid article." }, 400);

  const { results } = await env.COMMENTS_DB.prepare(
    `SELECT id, parent_id, name, body, created_at FROM comments
     WHERE slug = ? AND status = 'approved'
     ORDER BY created_at ASC`,
  )
    .bind(slug)
    .all<PublicComment>();

  return json({ ok: true, comments: results }, 200, { "cache-control": "no-store" });
}

export async function onRequestPost({ request, env, waitUntil }: PagesContext): Promise<Response> {
  if (!env.COMMENTS_DB) return json({ ok: false, error: "Comments are not configured yet." }, 503);
  const db = env.COMMENTS_DB;

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  // Honeypot: real people never see or fill this field. Pretend success.
  if (clean(payload.website)) return json({ ok: true, pending: true });

  const slug = clean(payload.slug);
  const name = clean(payload.name).replace(/\s+/g, " ");
  const email = clean(payload.email).toLowerCase();
  const body = clean(payload.body);
  const parentRaw = payload.parentId;
  const parentId =
    parentRaw === null || parentRaw === undefined || parentRaw === "" ? null : Number(parentRaw);

  if (!SLUG_RE.test(slug)) return json({ ok: false, error: "Invalid article." }, 400);
  if (!name || name.length > MAX_NAME)
    return json({ ok: false, error: `Please enter a name (up to ${MAX_NAME} characters).` }, 400);
  if (email && (email.length > MAX_EMAIL || !EMAIL_RE.test(email)))
    return json({ ok: false, error: "That email address doesn't look right." }, 400);
  if (!body || body.length > MAX_BODY)
    return json({ ok: false, error: `Please write a comment (up to ${MAX_BODY} characters).` }, 400);
  if (parentId !== null && (!Number.isInteger(parentId) || parentId <= 0))
    return json({ ok: false, error: "Invalid reply." }, 400);

  const origin = new URL(request.url).origin;
  if (!(await articleExists(env, origin, slug))) return json({ ok: false, error: "Invalid article." }, 400);

  if (parentId !== null) {
    // Replies go one level deep, and only under an approved top-level comment on the same article.
    const parent = await db
      .prepare(`SELECT id, parent_id, slug, status FROM comments WHERE id = ?`)
      .bind(parentId)
      .first<{ id: number; parent_id: number | null; slug: string; status: string }>();
    if (!parent || parent.slug !== slug || parent.status !== "approved" || parent.parent_id !== null)
      return json({ ok: false, error: "You can only reply to a top-level comment." }, 400);
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "";
  const ipHash = ip ? await sha256(`kakrat-comments:${ip}`) : null;
  if (ipHash) {
    const recent = await db
      .prepare(
        `SELECT COUNT(*) AS n FROM comments
         WHERE ip_hash = ? AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?)`,
      )
      .bind(ipHash, `-${RATE_WINDOW_MINUTES} minutes`)
      .first<{ n: number }>();
    if ((recent?.n ?? 0) >= RATE_MAX)
      return json({ ok: false, error: "Too many comments in a short time. Please try again later." }, 429);
  }

  await db
    .prepare(
      `INSERT INTO comments (slug, parent_id, name, email, body, status, ip_hash)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    )
    .bind(slug, parentId, name, email || null, body, ipHash)
    .run();

  const mail = notify(env, { slug, name, body, isReply: parentId !== null }, origin);
  if (waitUntil) waitUntil(mail);
  else await mail;

  return json({ ok: true, pending: true });
}
