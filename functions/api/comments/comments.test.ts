import { createRequire } from "node:module";
import { beforeEach, describe, expect, it } from "vitest";

import { onRequestGet, onRequestPost } from "./index";
// node:sqlite (Node 22+) has no types in @types/node 20, so load it untyped.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite") as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DatabaseSync = any;

import { onRequestGet as adminGet, onRequestPost as adminPost } from "./admin";

const SCHEMA = `
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  moderated_at TEXT
);`;

/** Minimal D1-shaped wrapper over node:sqlite, enough for these Functions. */
function fakeD1(db: DatabaseSync) {
  return {
    prepare(sql: string) {
      let params: unknown[] = [];
      const stmt = {
        bind(...values: unknown[]) {
          params = values;
          return stmt;
        },
        async all<T>() {
          return { results: db.prepare(sql).all(...(params as never[])) as T[] };
        },
        async first<T>() {
          return (db.prepare(sql).get(...(params as never[])) ?? null) as T | null;
        },
        async run() {
          const r = db.prepare(sql).run(...(params as never[]));
          return { meta: { last_row_id: Number(r.lastInsertRowid), changes: Number(r.changes) } };
        },
      };
      return stmt;
    },
  };
}

let db: DatabaseSync;
let env: Record<string, unknown>;
const assets = {
  fetch: async (req: Request | string) => {
    const url = new URL(typeof req === "string" ? req : req.url);
    return new Response("", { status: url.pathname === "/articles/real-article" ? 200 : 404 });
  },
};

function post(body: Record<string, unknown>, ip = "1.2.3.4") {
  return new Request("https://kakrat.com/api/comments", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify(body),
  });
}

function admin(method: "GET" | "POST", query = "", body?: unknown, secret = "s3cret") {
  return new Request(`https://kakrat.com/api/comments/admin${query}`, {
    method,
    headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  db = new DatabaseSync(":memory:");
  db.exec(SCHEMA);
  env = { COMMENTS_DB: fakeD1(db), ASSETS: assets, PUBLISH_SECRET: "s3cret" };
});

describe("comments API", () => {
  it("holds new comments as pending and hides them publicly", async () => {
    const res = await onRequestPost({ request: post({ slug: "real-article", name: "Asha", email: "a@x.com", body: "Nice" }), env } as never);
    expect(res.status).toBe(200);
    const list = await (await onRequestGet({ request: new Request("https://kakrat.com/api/comments?slug=real-article"), env } as never)).json();
    expect(list.comments).toEqual([]);
  });

  it("shows approved comments without exposing email", async () => {
    await onRequestPost({ request: post({ slug: "real-article", name: "Asha", email: "a@x.com", body: "Nice" }), env } as never);
    await adminPost({ request: admin("POST", "", { id: 1, action: "approve" }), env } as never);
    const list = await (await onRequestGet({ request: new Request("https://kakrat.com/api/comments?slug=real-article"), env } as never)).json();
    expect(list.comments).toHaveLength(1);
    expect(list.comments[0].name).toBe("Asha");
    expect(JSON.stringify(list)).not.toContain("a@x.com");
  });

  it("allows email to be omitted", async () => {
    const res = await onRequestPost({ request: post({ slug: "real-article", name: "Anon", body: "Hi" }), env } as never);
    expect(res.status).toBe(200);
  });

  it("rejects unknown articles and empty bodies", async () => {
    expect((await onRequestPost({ request: post({ slug: "nope", name: "A", body: "x" }), env } as never)).status).toBe(400);
    expect((await onRequestPost({ request: post({ slug: "real-article", name: "A", body: "  " }), env } as never)).status).toBe(400);
  });

  it("allows only one level of replies, under approved comments", async () => {
    await onRequestPost({ request: post({ slug: "real-article", name: "A", body: "top" }), env } as never);
    // parent still pending
    expect((await onRequestPost({ request: post({ slug: "real-article", name: "B", body: "r", parentId: 1 }, "5.5.5.5"), env } as never)).status).toBe(400);
    await adminPost({ request: admin("POST", "", { id: 1, action: "approve" }), env } as never);
    expect((await onRequestPost({ request: post({ slug: "real-article", name: "B", body: "r", parentId: 1 }, "5.5.5.5"), env } as never)).status).toBe(200);
    await adminPost({ request: admin("POST", "", { id: 2, action: "approve" }), env } as never);
    // reply to a reply is refused
    expect((await onRequestPost({ request: post({ slug: "real-article", name: "C", body: "r2", parentId: 2 }, "6.6.6.6"), env } as never)).status).toBe(400);
  });

  it("silently drops honeypot submissions", async () => {
    const res = await onRequestPost({ request: post({ slug: "real-article", name: "Bot", body: "spam", website: "x" }), env } as never);
    expect(res.status).toBe(200);
    expect(db.prepare("SELECT COUNT(*) AS n FROM comments").get()).toEqual({ n: 0 });
  });

  it("rate limits bursts from one address", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await onRequestPost({ request: post({ slug: "real-article", name: "A", body: `c${i}` }), env } as never)).status).toBe(200);
    }
    expect((await onRequestPost({ request: post({ slug: "real-article", name: "A", body: "c6" }), env } as never)).status).toBe(429);
  });
});

describe("moderation API", () => {
  it("requires the password", async () => {
    const res = await adminGet({ request: admin("GET", "?status=pending", undefined, "wrong"), env } as never);
    expect(res.status).toBe(401);
  });

  it("lists pending comments with email for the moderator", async () => {
    await onRequestPost({ request: post({ slug: "real-article", name: "Asha", email: "a@x.com", body: "Nice" }), env } as never);
    const data = await (await adminGet({ request: admin("GET", "?status=pending"), env } as never)).json();
    expect(data.comments[0].email).toBe("a@x.com");
  });

  it("rejecting a comment also hides its replies", async () => {
    await onRequestPost({ request: post({ slug: "real-article", name: "A", body: "top" }), env } as never);
    await adminPost({ request: admin("POST", "", { id: 1, action: "approve" }), env } as never);
    await onRequestPost({ request: post({ slug: "real-article", name: "B", body: "r", parentId: 1 }, "7.7.7.7"), env } as never);
    await adminPost({ request: admin("POST", "", { id: 2, action: "approve" }), env } as never);
    await adminPost({ request: admin("POST", "", { id: 1, action: "reject" }), env } as never);
    const list = await (await onRequestGet({ request: new Request("https://kakrat.com/api/comments?slug=real-article"), env } as never)).json();
    expect(list.comments).toEqual([]);
  });
});
