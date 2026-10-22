import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { CommentsAdmin } from "@/components/comments/CommentsAdmin";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Comment moderation",
    description: "Internal comment moderation tool.",
    path: "/admin/comments",
  }),
  robots: { index: false, follow: false },
};

export default function CommentsAdminPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-4xl text-ink">Comments</h1>
      <p className="mt-2 text-sm text-ink-muted">
        New comments wait here until you approve them. Approved comments appear under their article immediately.
      </p>
      <div className="mt-8">
        <CommentsAdmin />
      </div>
    </div>
  );
}
