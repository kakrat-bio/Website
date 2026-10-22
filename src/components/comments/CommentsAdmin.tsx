"use client";

import { useCallback, useState } from "react";

type AdminComment = {
  id: number;
  slug: string;
  parent_id: number | null;
  parent_name: string | null;
  name: string;
  email: string | null;
  body: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type Status = AdminComment["status"];
const TABS: Status[] = ["pending", "approved", "rejected"];

export function CommentsAdmin() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<Status>("pending");
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (status: Status, key: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/comments/admin?status=${status}`, {
          headers: { authorization: `Bearer ${key}` },
          cache: "no-store",
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; comments?: AdminComment[] };
        if (!res.ok || !data.ok) throw new Error(data.error || "Could not load comments.");
        setComments(data.comments ?? []);
        setUnlocked(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load comments.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  async function act(id: number, action: "approve" | "reject" | "delete") {
    if (action === "delete" && !window.confirm("Delete this comment (and any replies) permanently?")) return;
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/comments/admin", {
        method: "POST",
        headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Action failed.");
      setComments((list) => list.filter((c) => c.id !== id && c.parent_id !== id));
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
      <div className="flex gap-2">
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
      {!loading && comments.length === 0 && (
        <p className="mt-6 text-sm text-ink-muted">Nothing {tab} right now.</p>
      )}

      <ul className="mt-6 space-y-6">
        {comments.map((c) => (
          <li key={c.id} className="rounded-sm border border-line bg-surface p-4">
            <p className="text-xs text-ink-muted">
              <a href={`/articles/${c.slug}#comments-heading`} className="text-accent hover:underline">
                {c.slug}
              </a>
              {" · "}
              {new Date(c.created_at).toLocaleString("en-IN")}
              {c.parent_id && <> · reply to {c.parent_name ?? `#${c.parent_id}`}</>}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-medium text-ink">{c.name}</span>
              {c.email && <span className="text-ink-muted"> · {c.email}</span>}
            </p>
            <p className="mt-2 whitespace-pre-line break-words text-sm text-ink">{c.body}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {c.status !== "approved" && (
                <button
                  type="button"
                  disabled={busy === c.id}
                  onClick={() => act(c.id, "approve")}
                  className="rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-paper disabled:opacity-50"
                >
                  Approve
                </button>
              )}
              {c.status !== "rejected" && (
                <button
                  type="button"
                  disabled={busy === c.id}
                  onClick={() => act(c.id, "reject")}
                  className="rounded-sm border border-line px-3 py-1.5 text-xs text-ink disabled:opacity-50"
                >
                  {c.status === "approved" ? "Unpublish" : "Reject"}
                </button>
              )}
              <button
                type="button"
                disabled={busy === c.id}
                onClick={() => act(c.id, "delete")}
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
