"use client";

import { useCallback, useState } from "react";

type Details = Record<string, unknown> & { platforms?: string[] };

type Pitch = {
  id: number;
  track: "voices" | "guest" | "student";
  name: string;
  byline: string;
  email: string;
  section: string;
  title: string;
  outline: string;
  why_me: string;
  details: Details;
  status: "new" | "shortlisted" | "declined";
  created_at: string;
};

type Status = Pitch["status"];
const TABS: Status[] = ["new", "shortlisted", "declined"];

const TRACK_LABEL: Record<Pitch["track"], string> = {
  voices: "Kakrat Voices",
  guest: "Guest contributor",
  student: "Student Corner",
};
const SECTION_LABEL: Record<string, string> = {
  "science-technology": "Science & Technology",
  "business-innovation": "Business & Innovation",
  "culture-ideas": "Culture & Ideas",
};
const DETAIL_LABEL: Record<string, string> = {
  role: "Role",
  experience: "Experience (years)",
  institution: "College / university",
  courseYear: "Course and year",
  enrolment: "Proof of enrolment",
  faculty: "Faculty reference",
  profileUrl: "Profile",
  profiles: "Profiles",
  samples: "Samples",
  platforms: "Follows Kakrat on",
  handle: "Handle",
  articleUrl: "Kakrat article read",
  articleTitle: "Kakrat article read",
  articleThoughts: "Thoughts on it",
  aiUse: "AI use",
};

function DetailValue({ value }: { value: unknown }) {
  const text = Array.isArray(value) ? value.join(", ") : String(value ?? "");
  if (/^https?:\/\/\S+$/.test(text)) {
    return (
      <a href={text} target="_blank" rel="noopener noreferrer" className="break-all text-accent hover:underline">
        {text}
      </a>
    );
  }
  return <span className="whitespace-pre-line break-words">{text}</span>;
}

export function PitchesAdmin() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<Status>("new");
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (status: Status, key: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pitches/admin?status=${status}`, {
        headers: { authorization: `Bearer ${key}` },
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; pitches?: Pitch[] };
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not load pitches.");
      setPitches(data.pitches ?? []);
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pitches.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function act(id: number, action: "shortlist" | "decline" | "reset" | "delete") {
    if (action === "delete" && !window.confirm("Delete this pitch permanently?")) return;
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/pitches/admin", {
        method: "POST",
        headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Action failed.");
      setPitches((list) => list.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  if (!unlocked) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(tab, secret);
        }}
        className="max-w-sm space-y-4"
      >
        <label className="block text-sm font-medium text-ink" htmlFor="admin-secret">
          Password
        </label>
        <input
          id="admin-secret"
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink"
          autoComplete="current-password"
          required
        />
        {error && <p className="text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-50"
        >
          {loading ? "Checking…" : "Open"}
        </button>
      </form>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              load(t, secret);
            }}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize ${
              t === tab ? "border-accent text-ink" : "border-line text-ink-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-accent">{error}</p>}
      {loading && <p className="mt-6 text-sm text-ink-muted">Loading…</p>}
      {!loading && pitches.length === 0 && <p className="mt-6 text-sm text-ink-muted">No {tab} pitches right now.</p>}

      <ul className="mt-6 space-y-6">
        {pitches.map((p) => (
          <li key={p.id} className="rounded-sm border border-line bg-surface p-4 text-sm">
            <p className="text-xs text-ink-muted">
              {TRACK_LABEL[p.track]} · {SECTION_LABEL[p.section] ?? p.section} ·{" "}
              {new Date(p.created_at).toLocaleString("en-IN")}
            </p>
            <p className="mt-2 font-display text-lg text-ink">{p.title}</p>
            <p className="mt-1">
              <span className="font-medium text-ink">{p.name}</span>
              {p.byline !== p.name && <span className="text-ink-muted"> (byline: {p.byline})</span>}
              <span className="text-ink-muted"> · </span>
              <a href={`mailto:${p.email}`} className="text-accent hover:underline">
                {p.email}
              </a>
            </p>
            <p className="mt-3 whitespace-pre-line break-words text-ink">{p.outline}</p>
            <p className="mt-3 text-ink">
              <span className="font-medium">Why them: </span>
              <span className="whitespace-pre-line break-words">{p.why_me}</span>
            </p>
            <details className="mt-3">
              <summary className="cursor-pointer text-ink-muted">More about them</summary>
              <dl className="mt-2 space-y-1.5">
                {Object.entries(p.details)
                  .filter(([, value]) => value !== "" && value !== undefined && value !== null)
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt className="inline font-medium text-ink">{DETAIL_LABEL[key] ?? key}: </dt>
                      <dd className="inline text-ink">
                        <DetailValue value={value} />
                      </dd>
                    </div>
                  ))}
              </dl>
            </details>
            <div className="mt-4 flex flex-wrap gap-3">
              {p.status !== "shortlisted" && (
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => act(p.id, "shortlist")}
                  className="rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-paper disabled:opacity-50"
                >
                  Shortlist
                </button>
              )}
              {p.status !== "declined" && (
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => act(p.id, "decline")}
                  className="rounded-sm border border-line px-3 py-1.5 text-xs text-ink disabled:opacity-50"
                >
                  Decline
                </button>
              )}
              {p.status !== "new" && (
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => act(p.id, "reset")}
                  className="rounded-sm border border-line px-3 py-1.5 text-xs text-ink disabled:opacity-50"
                >
                  Move back to new
                </button>
              )}
              <button
                type="button"
                disabled={busy === p.id}
                onClick={() => act(p.id, "delete")}
                className="px-3 py-1.5 text-xs text-ink-muted hover:text-accent disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
