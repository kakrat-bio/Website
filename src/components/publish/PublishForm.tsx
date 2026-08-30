"use client";

import { useState } from "react";
import type { Author } from "@/types/content";
import type { TopicMeta } from "@/lib/content/topics";
import { prepareCoverImage } from "@/components/publish/prepare-cover-image";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type Result = { ok: true; path: string; draft: boolean; url: string | null } | { ok: false; error: string };

export function PublishForm({ authors, topics }: { authors: Author[]; topics: TopicMeta[] }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [publishedAt, setPublishedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [topic, setTopic] = useState<string>(topics[0]?.slug ?? "");
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(authors[0] ? [authors[0].id] : []);
  const [tags, setTags] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [draft, setDraft] = useState(true);
  const [secret, setSecret] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  function toggleAuthor(id: string) {
    setSelectedAuthors((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug || slugify(title));
    formData.set("description", description);
    formData.set("publishedAt", publishedAt);
    formData.set("topic", topic);
    formData.set("authors", selectedAuthors.join(","));
    formData.set("tags", tags);
    formData.set("body", body);
    formData.set("draft", String(draft));

    if (image) {
      try {
        const prepared = await prepareCoverImage(image);
        formData.set("coverImageAlt", coverImageAlt);
        formData.set("imageSource", prepared.source);
        for (const variant of prepared.variants) formData.append("imageVariant", variant);
        formData.set("imageFallback", prepared.fallback);
        formData.set("imageMetadata", JSON.stringify(prepared.metadata));
      } catch (err) {
        setResult({
          ok: false,
          error: `Image preparation failed: ${err instanceof Error ? err.message : String(err)}`,
        });
        setSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}` },
        body: formData,
      });

      let data: Result;
      try {
        data = (await res.json()) as Result;
      } catch {
        // Server responded, but not with JSON — show the raw status so the
        // real cause is visible instead of a generic message.
        setResult({
          ok: false,
          error: `Server returned ${res.status} ${res.statusText} (not JSON) — the request reached the server but got an unexpected response.`,
        });
        return;
      }
      setResult(data);
    } catch (err) {
      // fetch() itself rejected — this is a browser/network-level failure,
      // the request never reached the server at all. Surface the real
      // error so it's actionable instead of a generic message.
      const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      setResult({
        ok: false,
        error: `Could not reach the server (${detail}). This usually means the browser blocked or failed to send the request before it left your device.`,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-ink" htmlFor="secret">
          Publish secret
        </label>
        <input
          id="secret"
          type="password"
          required
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink" htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          required
          maxLength={200}
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="publishedAt">
            Published date
          </label>
          <input
            id="publishedAt"
            type="date"
            required
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="topic">
            Topic
          </label>
          <select
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm"
          >
            {topics.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-ink">Authors</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {authors.map((a) => (
            <label key={a.id} className="flex items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={selectedAuthors.includes(a.id)}
                onChange={() => toggleAuthor(a.id)}
              />
              {a.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-medium text-ink" htmlFor="tags">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink" htmlFor="body">
          Body (MDX)
        </label>
        <textarea
          id="body"
          required
          rows={20}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 font-mono text-sm"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="image">
            Cover image (optional)
          </label>
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm"
          />
          <p className="mt-1 text-xs text-ink-muted">JPG, PNG, or WebP; maximum 5MB and 4000px per edge.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="coverImageAlt">
            Cover image alt text {image && <span className="text-accent">(required)</span>}
          </label>
          <input
            id="coverImageAlt"
            value={coverImageAlt}
            onChange={(e) => setCoverImageAlt(e.target.value)}
            required={Boolean(image)}
            disabled={!image}
            placeholder="Describe the image for readers using screen readers"
            className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm disabled:opacity-50"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} />
        Save as draft (excluded from the live site until you flip this off)
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper disabled:opacity-50"
      >
        {submitting ? "Publishing…" : "Publish"}
      </button>

      {result && (
        <div
          className={`rounded-sm border p-4 text-sm ${result.ok ? "border-line text-ink" : "border-accent text-accent"}`}
        >
          {result.ok ? (
            <>
              Committed to <code>{result.path}</code>.{" "}
              {result.draft
                ? "Saved as a draft — not live yet."
                : result.url && (
                    <>
                      Live at <a href={result.url} className="underline">{result.url}</a> once the deploy finishes.
                    </>
                  )}
            </>
          ) : (
            <>Error: {result.error}</>
          )}
        </div>
      )}
    </form>
  );
}
