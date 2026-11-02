import Link from "next/link";
import type { Author } from "@/types/content";

/**
 * "About the author" box at the end of an article: name, role and bio for
 * each credited author, linking to their author page. Matters most for guest
 * writers, whose credentials readers (and search engines) otherwise can't see
 * from the article itself.
 */
export function AuthorBio({ authors }: { authors: Author[] }) {
  if (authors.length === 0) return null;

  return (
    <aside aria-label="About the author" className="mt-12 border-t border-line pt-8">
      <h2 className="font-display text-xl text-ink">
        {authors.length === 1 ? "About the author" : "About the authors"}
      </h2>
      <div className="mt-4 space-y-5">
        {authors.map((a) => (
          <div key={a.id}>
            <p className="text-ink">
              <Link href={`/authors/${a.id}`} className="font-medium hover:underline">
                {a.name}
              </Link>
              {a.title && <span className="text-ink-muted"> · {a.title}</span>}
            </p>
            <p className="mt-1 text-sm text-ink-muted">{a.bio}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
