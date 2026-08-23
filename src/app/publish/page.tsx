import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAllAuthors } from "@/lib/content/authors";
import { ALL_TOPICS } from "@/lib/content/topics";
import { PublishForm } from "@/components/publish/PublishForm";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Publish",
    description: "Internal publishing tool.",
    path: "/publish",
  }),
  robots: { index: false, follow: true },
};

export default function PublishPage() {
  const authors = getAllAuthors();

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-4xl text-ink">Publish</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Commits a new article directly to <code>main</code>. Requires the publish
        secret configured on the Cloudflare Pages Function.
      </p>
      <div className="mt-8">
        <PublishForm authors={authors} topics={ALL_TOPICS} />
      </div>
    </div>
  );
}
