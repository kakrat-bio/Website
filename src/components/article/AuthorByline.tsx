import Link from "next/link";
import type { Author } from "@/types/content";
import { formatDate } from "@/lib/utils/format";

export function AuthorByline({
  authors,
  publishedAt,
  updatedAt,
  readingTimeMinutes,
}: {
  authors: Author[];
  publishedAt: Date;
  updatedAt?: Date;
  readingTimeMinutes: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
      <span>
        By{" "}
        {authors.map((a, i) => (
          <span key={a.id}>
            <Link href={`/authors/${a.id}`} className="text-ink hover:underline">
              {a.name}
            </Link>
            {i < authors.length - 1 ? ", " : ""}
          </span>
        ))}
      </span>
      <span aria-hidden>·</span>
      <time dateTime={publishedAt.toISOString()}>{formatDate(publishedAt)}</time>
      {updatedAt && updatedAt.getTime() !== publishedAt.getTime() && (
        <>
          <span aria-hidden>·</span>
          <span>
            Updated <time dateTime={updatedAt.toISOString()}>{formatDate(updatedAt)}</time>
          </span>
        </>
      )}
      <span aria-hidden>·</span>
      <span>{readingTimeMinutes} min read</span>
    </div>
  );
}
