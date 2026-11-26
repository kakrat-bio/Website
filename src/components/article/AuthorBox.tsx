import Link from "next/link";
import type { Author } from "@/types/content";

/** The house byline. Its pieces carry no author box; guest pieces do. */
const HOUSE_AUTHOR_ID = "kakratian";

/**
 * "About the author" box at the end of a guest piece: name, short bio, and
 * links to the writer's author page and profiles. The /write-for-us terms
 * promise guest writers "a short author box linking to their work".
 */
export function AuthorBox({ authors }: { authors: Author[] }) {
  const guests = authors.filter((a) => a.id !== HOUSE_AUTHOR_ID);
  if (guests.length === 0) return null;

  return (
    <section aria-label="About the author" className="mt-12 space-y-6">
      {guests.map((a) => {
        const links = [a.website, ...a.sameAs].filter((u): u is string => Boolean(u));
        return (
          <div key={a.id} className="rounded-sm border border-line p-6">
            <p className="text-xs uppercase tracking-wider text-ink-muted">About the author</p>
            <div className="mt-3 flex items-center gap-4">
              {a.avatar && (
                // eslint-disable-next-line @next/next/no-img-element -- static export; small pre-sized headshot
                <img
                  src={a.avatar}
                  alt={`Photo of ${a.name}`}
                  width={64}
                  height={64}
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              )}
              <p className="font-display text-xl text-ink">
                <Link href={`/authors/${a.id}`} className="hover:text-accent">
                  {a.name}
                </Link>
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{a.bio}</p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <li>
                <Link
                  href={`/authors/${a.id}`}
                  className="text-ink underline decoration-accent underline-offset-2 hover:text-accent"
                >
                  More from {a.name.split(" ")[0]}
                </Link>
              </li>
              {links.map((u) => (
                <li key={u}>
                  <a
                    href={u}
                    target="_blank"
                    rel="noopener"
                    className="text-ink underline decoration-accent underline-offset-2 hover:text-accent"
                  >
                    {new URL(u).hostname.replace(/^www\./, "")}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
