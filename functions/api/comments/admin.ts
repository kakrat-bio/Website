// Cloudflare Pages Function — comment moderation API for /admin/comments.
//
//   GET  /api/comments/admin?status=pending|approved|rejected  → comments incl. email
//   POST /api/comments/admin  { id, action: "approve" | "reject" | "delete" }
//
// Authenticated with `Authorization: Bearer <secret>`, where the secret is
// COMMENTS_ADMIN_SECRET if set, otherwise the existing PUBLISH_SECRET.
// Self-contained on purpose, like ../publish.ts.

type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes?: number } }>;
};
type D1Like = { prepare(sql: string): D1Statement };

type Env = {
  COMMENTS_DB?: D1Like;
  COMMENTS_ADMIN_SECRET?: string;
  PUBLISH_SECRET?: string;
};

type PagesContext = { request: Request; env: Env };

const STATUSES = ["pending", "approved", "rejected"] as const;
type Status = (typeof STATUSES)[number];

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

/** Constant-time-ish string comparison so the secret can't be guessed by timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function authorize(request: Request, env: Env): Response | null {
  const secret = env.COMMENTS_ADMIN_SECRET || env.PUBLISH_SECRET;
  if (!env.COMMENTS_DB || !secret) return json({ ok: false, error: "Comments are not configured yet." }, 503);
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!provided || !safeEqual(provided, secret)) return json({ ok: false, error: "Wrong password." }, 401);
  return null;
}

export async function onRequestGet({ request, env }: PagesContext): Promise<Response> {
  const denied = authorize(request, env);
  if (denied) return denied;
  const status = (new URL(request.url).searchParams.get("status") ?? "pending") as Status;
  if (!STATUSES.includes(status)) return json({ ok: false, error: "Invalid status." }, 400);

  const { results } = await env.COMMENTS_DB!.prepare(
    `SELECT c.id, c.slug, c.parent_id, c.name, c.email, c.body, c.status, c.created_at,
            p.name AS parent_name
     FROM comments c LEFT JOIN comments p ON p.id = c.parent_id
     WHERE c.status = ?
     ORDER BY c.created_at ${status === "pending" ? "ASC" : "DESC"}
     LIMIT 200`,
  )
    .bind(status)
    .all();

  return json({ ok: true, comments: results });
}

export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  const denied = authorize(request, env);
  if (denied) return denied;

  let payload: { id?: unknown; action?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }
  const id = Number(payload.id);
  const action = payload.action;
  if (!Number.isInteger(id) || id <= 0) return json({ ok: false, error: "Invalid comment." }, 400);

  const db = env.COMMENTS_DB!;
  if (action === "approve" || action === "reject") {
    await db
      .prepare(
        `UPDATE comments SET status = ?, moderated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`,
      )
      .bind(action === "approve" ? "approved" : "rejected", id)
      .run();
    if (action === "reject") {
      // Replies under a rejected comment would have nowhere to show.
      await db
        .prepare(
          `UPDATE comments SET status = 'rejected', moderated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
           WHERE parent_id = ?`,
        )
        .bind(id)
        .run();
    }
    return json({ ok: true });
  }
  if (action === "delete") {
    await db.prepare(`DELETE FROM comments WHERE parent_id = ?`).bind(id).run();
    await db.prepare(`DELETE FROM comments WHERE id = ?`).bind(id).run();
    return json({ ok: true });
  }
  return json({ ok: false, error: "Invalid action." }, 400);
}
