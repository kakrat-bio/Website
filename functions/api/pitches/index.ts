// Cloudflare Pages Function — pitch form for /write-for-us and /student-corner.
//
//   POST /api/pitches → validate a pitch and store it as "new"
//
// Pitches are read at /admin/pitches (see ./admin.ts). Self-contained on
// purpose, like ../publish.ts and ../comments: no imports from src/.
//
// Storage: the `pitches` table in the existing D1 database bound as
// COMMENTS_DB ("kakrat-comments"). The table is created on first use
// (schema mirrored in migrations/pitches/0001_init.sql), so no manual
// migration is needed before this goes live.
//
// The rules here mirror src/components/pitch/PitchForm.tsx. The browser
// checks are for the writer's convenience; these are the ones that count.

export type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<{ results: T[] }>;
  first<T>(): Promise<T | null>;
  run(): Promise<{ meta: { last_row_id?: number; changes?: number } }>;
};
export type D1Like = { prepare(sql: string): D1Statement };

type Env = {
  COMMENTS_DB?: D1Like;
  COMMENTS_WEBHOOK_TOKEN?: string;
  COMMENTS_WEBHOOK_URL?: string;
};
type PagesContext = { request: Request; env: Env; waitUntil?: (promise: Promise<unknown>) => void };

// The same Apps Script web app (account kakratkosh) that emails comment
// alerts. Pitch alerts reuse its existing `type=comment` branch, so no change
// to the Apps Script is needed: the email arrives at kakratkosh@gmail.com with
// a subject like "New comment on Kakrat: NEW PITCH: <title>". Don't send
// anything here without type=comment: the script treats every other POST as a
// newsletter sign-up.
const DEFAULT_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbybscPtWujVIva3bs5W5eymVH9Zb9OHlD_GGi-4HnpIbELacgqiph5JSmvQZ00i4XVP/exec";

const TRACK_LABEL: Record<string, string> = {
  voices: "Kakrat Voices",
  guest: "Guest contributor",
  student: "Student Corner",
};

type StoredPitch = {
  track: string; name: string; byline: string; email: string; section: string;
  title: string; outline: string; whyMe: string; details: Record<string, unknown>;
};

export function pitchAlertBody(p: StoredPitch): string {
  const d = p.details;
  const who =
    p.track === "student"
      ? `${d.courseYear ?? ""}, ${d.institution ?? ""}`
      : `${d.role ?? ""} (${d.experience ?? "?"} years)`;
  return [
    `Track: ${TRACK_LABEL[p.track] ?? p.track}`,
    `Section: ${p.section}`,
    `From: ${p.name} <${p.email}>, ${who}`,
    `Profile: ${d.profileUrl ?? ""}`,
    `Follows on: ${Array.isArray(d.platforms) ? d.platforms.join(", ") : ""} as ${d.handle ?? ""}`,
    "",
    `Title: ${p.title}`,
    "",
    p.outline,
    "",
    `Why them: ${p.whyMe}`,
    "",
    "(This is a new PITCH, not a comment.) Read and sort it at kakrat.com/admin/pitches",
  ].join("\n");
}

async function notifyPitch(env: Env, p: StoredPitch): Promise<void> {
  if (!env.COMMENTS_WEBHOOK_TOKEN) return;
  try {
    const res = await fetch(env.COMMENTS_WEBHOOK_URL || DEFAULT_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        type: "comment",
        token: env.COMMENTS_WEBHOOK_TOKEN,
        slug: `NEW PITCH: ${p.title}`.slice(0, 120),
        name: `${p.name} (${TRACK_LABEL[p.track] ?? p.track})`.slice(0, 80),
        body: pitchAlertBody(p).slice(0, 3000),
        isReply: "false",
      }).toString(),
      redirect: "manual",
    });
    if (res.status >= 400) console.error(JSON.stringify({ message: "pitch alert failed", status: res.status }));
  } catch (error) {
    console.error(JSON.stringify({ message: "pitch alert error", error: String(error) }));
  }
}

export const PITCHES_SCHEMA = `CREATE TABLE IF NOT EXISTS pitches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  track TEXT NOT NULL CHECK (track IN ('voices','guest','student')),
  name TEXT NOT NULL,
  byline TEXT NOT NULL,
  email TEXT NOT NULL,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  outline TEXT NOT NULL,
  why_me TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','shortlisted','declined')),
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  reviewed_at TEXT
)`;
export const PITCHES_INDEX = `CREATE INDEX IF NOT EXISTS idx_pitches_status_created ON pitches(status, created_at)`;

// Remember which database bindings already have the table, per isolate.
const readyDbs = new WeakSet<object>();
export async function ensurePitchesTable(db: D1Like): Promise<void> {
  if (readyDbs.has(db)) return;
  await db.prepare(PITCHES_SCHEMA).run();
  await db.prepare(PITCHES_INDEX).run();
  readyDbs.add(db);
}

const TRACKS = ["voices", "guest", "student"] as const;
const SECTIONS = ["science-technology", "business-innovation", "culture-ideas"] as const;
const EXPERIENCE = ["under-2", "2-5", "5-10", "over-10"] as const;
const AI_USE = ["none", "research", "tidying", "research-and-tidying"] as const;
const PLATFORMS = ["instagram", "x", "linkedin"] as const;
const DECLARATIONS = ["original", "not-a-job", "honorarium", "share", "read-terms"] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KAKRAT_ARTICLE_RE = /^https?:\/\/(www\.)?kakrat\.com\/articles\/[a-z0-9-]+\/?([?#].*)?$/i;
const RATE_WINDOW_MINUTES = 60;
const RATE_MAX = 3;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function clean(value: unknown, max = 2000): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").trim().slice(0, max);
}

export function wordCount(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function isUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function oneOf<T extends readonly string[]>(list: T, value: string): value is T[number] {
  return (list as readonly string[]).includes(value);
}

type Fail = { field: string; error: string };

export function validatePitch(p: Record<string, unknown>): { ok: true; pitch: Record<string, unknown> } | { ok: false; fail: Fail } {
  const f = (field: string, error: string) => ({ ok: false as const, fail: { field, error } });

  const track = clean(p.track, 20);
  if (!oneOf(TRACKS, track)) return f("track", "Please choose a track.");

  const name = clean(p.name, 100).replace(/\s+/g, " ");
  const byline = clean(p.byline, 100).replace(/\s+/g, " ");
  const email = clean(p.email, 200).toLowerCase();
  if (name.length < 2) return f("name", "Please enter your full name.");
  if (byline.length < 2) return f("byline", "Please enter your byline name.");
  if (!EMAIL_RE.test(email)) return f("email", "Please enter a valid email address.");

  const details: Record<string, unknown> = {};

  if (track === "student") {
    if (p.age18 !== true) return f("age18", "Student Corner is open to students aged 18 and over.");
    const institution = clean(p.institution, 200);
    const courseYear = clean(p.courseYear, 200);
    const enrolment = clean(p.enrolment, 300);
    if (institution.length < 2) return f("institution", "Please enter your college or university.");
    if (courseYear.length < 2) return f("courseYear", "Please enter your course and year.");
    if (!EMAIL_RE.test(enrolment) && !isUrl(enrolment))
      return f("enrolment", "Please give your institutional email, or a link to a photo of your college ID.");
    Object.assign(details, { institution, courseYear, enrolment, faculty: clean(p.faculty, 300) });
  } else {
    const role = clean(p.role, 200);
    const experience = clean(p.experience, 20);
    if (role.length < 2) return f("role", "Please enter your current role and organisation.");
    if (!oneOf(EXPERIENCE, experience)) return f("experience", "Please choose your years of experience.");
    Object.assign(details, { role, experience, samples: clean(p.samples, 1000) });
  }

  const profileUrl = clean(p.profileUrl, 500);
  if (!isUrl(profileUrl)) return f("profileUrl", "Please paste a full profile link, starting with https://");
  details.profileUrl = profileUrl;

  const platforms = Array.isArray(p.platforms) ? p.platforms.filter((x): x is string => typeof x === "string") : [];
  const followed = PLATFORMS.filter((x) => platforms.includes(x));
  if (followed.length === 0) return f("platforms", "Please tell us where you follow Kakrat.");
  const handle = clean(p.handle, 200);
  if (handle.length < 2) return f("handle", "Please give your handle, so we can find you.");
  Object.assign(details, { platforms: followed, handle });

  const articleUrl = clean(p.articleUrl, 500);
  if (!KAKRAT_ARTICLE_RE.test(articleUrl))
    return f("articleUrl", "Please paste the link to a Kakrat article, like https://kakrat.com/articles/…");
  const articleThoughts = clean(p.articleThoughts, 1000);
  const tw = wordCount(articleThoughts);
  if (tw < 10 || tw > 60) return f("articleThoughts", "Please write 10 to 60 words about the article.");
  Object.assign(details, { articleUrl, articleThoughts });

  const section = clean(p.section, 40);
  if (!oneOf(SECTIONS, section)) return f("section", "Please choose a section.");
  const title = clean(p.title, 200).replace(/\s+/g, " ");
  const titleWords = wordCount(title);
  if (titleWords < 2 || titleWords > 12) return f("title", "Please keep the working title to 12 words or fewer.");
  const outline = clean(p.outline, 3000);
  const ow = wordCount(outline);
  if (ow < 60 || ow > 150) return f("outline", "Please write an outline of 60 to 150 words.");
  const whyMe = clean(p.whyMe, 1000);
  const ww = wordCount(whyMe);
  if (ww < 15 || ww > 60) return f("whyMe", "Please write 15 to 60 words on why you're the right person.");
  const aiUse = clean(p.aiUse, 40);
  if (!oneOf(AI_USE, aiUse)) return f("aiUse", "Please tell us how you'll use AI tools.");
  details.aiUse = aiUse;

  const declarations = Array.isArray(p.declarations) ? p.declarations : [];
  if (!DECLARATIONS.every((d) => declarations.includes(d)))
    return f("declarations", "Please tick all the boxes to submit.");

  return {
    ok: true,
    pitch: { track, name, byline, email, section, title, outline, whyMe, details },
  };
}

export async function onRequestPost({ request, env, waitUntil }: PagesContext): Promise<Response> {
  if (!env.COMMENTS_DB) return json({ ok: false, error: "The pitch form isn't available right now." }, 503);
  const db = env.COMMENTS_DB;

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  // Honeypot: real people never see or fill this field. Pretend success.
  if (clean(payload.website)) return json({ ok: true });

  const result = validatePitch(payload);
  if (!result.ok) return json({ ok: false, field: result.fail.field, error: result.fail.error }, 400);
  const p = result.pitch as StoredPitch;

  await ensurePitchesTable(db);

  const ip = request.headers.get("cf-connecting-ip") ?? "";
  const ipHash = ip ? await sha256(`kakrat-pitches:${ip}`) : null;
  if (ipHash) {
    const recent = await db
      .prepare(
        `SELECT COUNT(*) AS n FROM pitches
         WHERE ip_hash = ? AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?)`,
      )
      .bind(ipHash, `-${RATE_WINDOW_MINUTES} minutes`)
      .first<{ n: number }>();
    if ((recent?.n ?? 0) >= RATE_MAX)
      return json({ ok: false, error: "You've sent several pitches in the last hour. Please try again later." }, 429);
  }

  await db
    .prepare(
      `INSERT INTO pitches (track, name, byline, email, section, title, outline, why_me, details, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(p.track, p.name, p.byline, p.email, p.section, p.title, p.outline, p.whyMe, JSON.stringify(p.details), ipHash)
    .run();

  const alert = notifyPitch(env, p);
  if (waitUntil) waitUntil(alert);
  else await alert;

  return json({ ok: true });
}
