import { createRequire } from "node:module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { onRequestPost } from "../functions/api/pitches/index";
import { onRequestGet as adminGet, onRequestPost as adminPost } from "../functions/api/pitches/admin";
// node:sqlite (Node 22+) has no types in @types/node 20, so load it untyped.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite") as any;

/** Minimal D1-shaped wrapper over node:sqlite (same as the comments tests). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fakeD1(db: any) {
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

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");

function validPitch(overrides: Record<string, unknown> = {}) {
  return {
    track: "guest",
    name: "Asha Rao",
    byline: "Asha Rao",
    email: "asha@example.org",
    role: "Scientist, XYZ Institute",
    experience: "5-10",
    profiles: "https://www.linkedin.com/in/asha",
    platforms: ["instagram"],
    handle: "@asha",
    articleTitle: "Antibiotics: A Love Story With a Bad Ending",
    articleThoughts: words(20),
    section: "science-technology",
    title: "Why lab mice keep lying to us",
    outline: words(100),
    whyMe: words(30),
    aiUse: "none",
    declarations: ["original", "not-a-job", "honorarium", "share", "read-terms"],
    ...overrides,
  };
}

function post(body: Record<string, unknown>, ip = "1.2.3.4") {
  return new Request("https://kakrat.com/api/pitches", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify(body),
  });
}

function admin(method: "GET" | "POST", query = "", body?: unknown, secret = "s3cret") {
  return new Request(`https://kakrat.com/api/pitches/admin${query}`, {
    method,
    headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

let env: Record<string, unknown>;

beforeEach(() => {
  // A fresh, empty database each time: the function must create its own table.
  env = { COMMENTS_DB: fakeD1(new DatabaseSync(":memory:")), PUBLISH_SECRET: "s3cret" };
});

describe("pitches API", () => {
  it("stores a valid pitch as new, creating the table on first use", async () => {
    const res = await onRequestPost({ request: post(validPitch()), env } as never);
    expect(res.status).toBe(200);
    const list = await (await adminGet({ request: admin("GET", "?status=new"), env } as never)).json();
    expect(list.pitches).toHaveLength(1);
    expect(list.pitches[0].title).toBe("Why lab mice keep lying to us");
    expect(list.pitches[0].details.role).toBe("Scientist, XYZ Institute");
  });

  it("asks students for enrolment details and the 18+ confirmation", async () => {
    const student = validPitch({ track: "student", role: undefined, experience: undefined });
    const res = await onRequestPost({ request: post(student), env } as never);
    expect(res.status).toBe(400);
    expect((await res.json()).field).toBe("age18");

    const ok = await onRequestPost({
      request: post({ ...student, age18: true, institution: "IISc", courseYear: "PhD, 2nd year", enrolment: "asha@iisc.ac.in" }),
      env,
    } as never);
    expect(ok.status).toBe(200);
  });

  it("rejects outlines outside 60-150 words and a missing article", async () => {
    const short = await onRequestPost({ request: post(validPitch({ outline: words(20) })), env } as never);
    expect((await short.json()).field).toBe("outline");
    const none = await onRequestPost({ request: post(validPitch({ articleTitle: "" })), env } as never);
    expect((await none.json()).field).toBe("articleTitle");
  });

  it("treats profile links, byline and student proof as optional", async () => {
    const ok = await onRequestPost({ request: post(validPitch({ profiles: "", byline: "" })), env } as never);
    expect(ok.status).toBe(200);
    const student = validPitch({ track: "student", role: undefined, experience: undefined, age18: true, institution: "IISc", courseYear: "B.Sc., 2nd year" });
    const st = await onRequestPost({ request: post(student), env } as never);
    expect(st.status).toBe(200);
  });

  it("needs every declaration and at least one followed platform", async () => {
    const decl = await onRequestPost({ request: post(validPitch({ declarations: ["original"] })), env } as never);
    expect((await decl.json()).field).toBe("declarations");
    const follow = await onRequestPost({ request: post(validPitch({ platforms: [] })), env } as never);
    expect((await follow.json()).field).toBe("platforms");
  });

  it("silently drops honeypot submissions", async () => {
    const res = await onRequestPost({ request: post(validPitch({ website: "spam" })), env } as never);
    expect(res.status).toBe(200);
    const list = await (await adminGet({ request: admin("GET", "?status=new"), env } as never)).json();
    expect(list.pitches).toHaveLength(0);
  });

  it("rate-limits repeated pitches from one address", async () => {
    for (let i = 0; i < 3; i++) {
      expect((await onRequestPost({ request: post(validPitch()), env } as never)).status).toBe(200);
    }
    expect((await onRequestPost({ request: post(validPitch()), env } as never)).status).toBe(429);
  });

  it("keeps the admin API behind the password and moves pitches between lists", async () => {
    await onRequestPost({ request: post(validPitch()), env } as never);
    expect((await adminGet({ request: admin("GET", "?status=new", undefined, "wrong"), env } as never)).status).toBe(401);
    await adminPost({ request: admin("POST", "", { id: 1, action: "shortlist" }), env } as never);
    const shortlisted = await (await adminGet({ request: admin("GET", "?status=shortlisted"), env } as never)).json();
    expect(shortlisted.pitches).toHaveLength(1);
    await adminPost({ request: admin("POST", "", { id: 1, action: "delete" }), env } as never);
    const after = await (await adminGet({ request: admin("GET", "?status=shortlisted"), env } as never)).json();
    expect(after.pitches).toHaveLength(0);
  });

  it("emails a pitch alert through the comment webhook when the token is set", async () => {
    const calls: { url: string; body: string }[] = [];
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      calls.push({ url, body: String(init.body) });
      return new Response("ok");
    });
    env.COMMENTS_WEBHOOK_TOKEN = "tok";
    await onRequestPost({ request: post(validPitch()), env } as never);
    expect(calls).toHaveLength(2);
    const sent = calls.map((c) => new URLSearchParams(c.body));
    const mail = sent.find((x) => x.get("type") === "comment")!;
    expect(mail.get("token")).toBe("tok");
    expect(mail.get("slug")).toBe("NEW PITCH: Why lab mice keep lying to us");
    expect(mail.get("body")).toContain("kakrat.com/admin/pitches");
    const row = sent.find((x) => x.get("type") === "pitch")!;
    expect(row.get("token")).toBe("tok");
    expect(row.get("applicantEmail")).toBe("asha@example.org");
    expect(row.get("articleRead")).toBe("Antibiotics: A Love Story With a Bad Ending");
    // Never an `email` field: an older Apps Script would file it as a newsletter sign-up.
    expect(row.has("email")).toBe(false);
  });

  it("sends no alert without the token", async () => {
    let called = false;
    vi.stubGlobal("fetch", async () => {
      called = true;
      return new Response("ok");
    });
    await onRequestPost({ request: post(validPitch()), env } as never);
    expect(called).toBe(false);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
