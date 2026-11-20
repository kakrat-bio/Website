// Cloudflare Pages Function — pitch review API for /admin/pitches.
//
//   GET  /api/pitches/admin?status=new|shortlisted|declined  → pitches
//   POST /api/pitches/admin  { id, action: "shortlist" | "decline" | "reset" | "delete" }
//
// Same password as /admin/comments: `Authorization: Bearer <secret>`, where
// the secret is COMMENTS_ADMIN_SECRET if set, otherwise PUBLISH_SECRET.
// Self-contained on purpose, like ../publish.ts (the one import is a sibling).

import { ensurePitchesTable, type D1Like } from "./index";

type Env = {
  COMMENTS_DB?: D1Like;
  COMMENTS_ADMIN_SECRET?: string;
  PUBLISH_SECRET?: string;
};

type PagesContext = { request: Request; env: Env };

const STATUSES = ["new", "shortlisted", "declined"] as const;
type Status = (typeof STATUSES)[number];

const ACTIONS: Record<string, Status> = { shortlist: "shortlisted", decline: "declined", reset: "new" };

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function authorize(request: Request, env: Env): Response | null {
  const secret = env.COMMENTS_ADMIN_SECRET || env.PUBLISH_SECRET;
  if (!env.COMMENTS_DB || !secret) return json({ ok: false, error: "Pitches are not configured yet." }, 503);
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!provided || !safeEqual(provided, secret)) return json({ ok: false, error: "Wrong password." }, 401);
  return null;
}

export async function onRequestGet({ request, env }: PagesContext): Promise<Response> {
  const denied = authorize(request, env);
  if (denied) return denied;
  const status = (new URL(request.url).searchParams.get("status") ?? "new") as Status;
  if (!STATUSES.includes(status)) return json({ ok: false, error: "Invalid status." }, 400);

  const db = env.COMMENTS_DB!;
  await ensurePitchesTable(db);
  const { results } = await db
    .prepare(
      `SELECT id, track, name, byline, email, section, title, outline, why_me, details, status, created_at
       FROM pitches WHERE status = ?
       ORDER BY created_at ${status === "new" ? "ASC" : "DESC"}
       LIMIT 300`,
    )
    .bind(status)
    .all<Record<string, unknown>>();

  const pitches = results.map((r) => {
    let details: unknown = {};
    try {
      details = JSON.parse(String(r.details ?? "{}"));
    } catch {
      details = {};
    }
    return { ...r, details };
  });
  return json({ ok: true, pitches });
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
  const action = String(payload.action ?? "");
  if (!Number.isInteger(id) || id <= 0) return json({ ok: false, error: "Invalid pitch." }, 400);

  const db = env.COMMENTS_DB!;
  await ensurePitchesTable(db);
  if (action in ACTIONS) {
    await db
      .prepare(`UPDATE pitches SET status = ?, reviewed_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`)
      .bind(ACTIONS[action], id)
      .run();
    return json({ ok: true });
  }
  if (action === "delete") {
    await db.prepare(`DELETE FROM pitches WHERE id = ?`).bind(id).run();
    return json({ ok: true });
  }
  return json({ ok: false, error: "Invalid action." }, 400);
}
