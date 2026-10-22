"use client";

import { useEffect, useState } from "react";

type Comment = {
  id: number;
  parent_id: number | null;
  name: string;
  body: string;
  created_at: string;
};

type LoadState = "loading" | "ready" | "unavailable";

const inputClass =
  "mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function CommentForm({
  slug,
  parentId,
  onDone,
  onCancel,
}: {
  slug: string;
  parentId: number | null;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const idPrefix = parentId ? `reply-${parentId}` : "comment";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, parentId, name, email, body, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setSent(true);
      setBody("");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <p className="rounded-sm border border-line bg-surface px-4 py-3 text-sm text-ink-muted" role="status">
        Thank you. Your {parentId ? "reply" : "comment"} will appear here once it has been approved.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor={`${idPrefix}-name`}>
            Name or pseudonym
          </label>
          <input
            id={`${idPrefix}-name`}
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            autoComplete="nickname"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor={`${idPrefix}-email`}>
            Email <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input
            id={`${idPrefix}-email`}
            type="email"
            maxLength={200}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-ink-muted">Your email will never be made public.</p>
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${idPrefix}-website`}>Website</label>
        <input
          id={`${idPrefix}-website`}
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink" htmlFor={`${idPrefix}-body`}>
          {parentId ? "Your reply" : "Your comment"}
        </label>
        <textarea
          id={`${idPrefix}-body`}
          required
          maxLength={3000}
          rows={parentId ? 3 : 5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={inputClass}
        />
      </div>
      {error && (
        <p className="text-sm text-accent" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={sending}
          className="rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {sending ? "Sending…" : parentId ? "Post reply" : "Post comment"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-ink-muted hover:text-ink">
            Cancel
          </button>
        )}
        <span className="text-xs text-ink-muted">Comments appear after moderation.</span>
      </div>
    </form>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div>
      <p className="text-sm">
        <span className="font-medium text-ink">{comment.name}</span>
        <span className="text-ink-muted"> · {formatWhen(comment.created_at)}</span>
      </p>
      <p className="mt-1 whitespace-pre-line break-words text-[0.95rem] leading-relaxed text-ink">{comment.body}</p>
    </div>
  );
}

export function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [replyTo, setReplyTo] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json()) as { ok?: boolean; comments?: Comment[] };
        if (!res.ok || !data.ok) throw new Error();
        if (!cancelled) {
          setComments(data.comments ?? []);
          setState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setState("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const topLevel = comments.filter((c) => c.parent_id === null);
  const repliesFor = (id: number) => comments.filter((c) => c.parent_id === id);

  return (
    <section className="mt-16 border-t border-line pt-10" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="font-display text-2xl text-ink">
        Comments{comments.length > 0 ? ` (${comments.length})` : ""}
      </h2>

      {state === "loading" && <p className="mt-4 text-sm text-ink-muted">Loading comments…</p>}
      {state === "unavailable" && (
        <p className="mt-4 text-sm text-ink-muted">Comments aren’t available right now.</p>
      )}
      {state === "ready" && topLevel.length === 0 && (
        <p className="mt-4 text-sm text-ink-muted">No comments yet. Start the kakrat.</p>
      )}

      {topLevel.length > 0 && (
        <ol className="mt-6 space-y-8">
          {topLevel.map((comment) => {
            const replies = repliesFor(comment.id);
            return (
              <li key={comment.id}>
                <CommentItem comment={comment} />
                {replies.length > 0 && (
                  <ol className="mt-4 space-y-4 border-l-2 border-line pl-4 sm:pl-6">
                    {replies.map((reply) => (
                      <li key={reply.id}>
                        <CommentItem comment={reply} />
                      </li>
                    ))}
                  </ol>
                )}
                {replyTo === comment.id ? (
                  <div className="mt-4 border-l-2 border-line pl-4 sm:pl-6">
                    <CommentForm
                      slug={slug}
                      parentId={comment.id}
                      onDone={() => undefined}
                      onCancel={() => setReplyTo(null)}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReplyTo(comment.id)}
                    className="mt-2 text-xs font-medium text-accent hover:underline"
                  >
                    Reply
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {state !== "unavailable" && (
        <div className="mt-10">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-ink-muted">Leave a comment</h3>
          <CommentForm slug={slug} parentId={null} onDone={() => undefined} />
        </div>
      )}
    </section>
  );
}
