import Link from "next/link";
import { ALL_TOPICS } from "@/lib/content/topics";
import { CONTACT_EMAIL, SITE_DESCRIPTION } from "@/lib/seo/constants";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-12 text-sm text-ink-muted">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg text-ink">Kakrat</p>
            <p className="mt-2 max-w-xs">{SITE_DESCRIPTION}</p>
          </div>
          <nav aria-label="Topics">
            <p className="mb-2 font-medium text-ink">Topics</p>
            <ul className="space-y-1.5">
              {ALL_TOPICS.map((topic) => (
                <li key={topic.slug}>
                  <Link href={`/topics/${topic.slug}`} className="hover:text-ink">
                    {topic.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="More">
            <p className="mb-2 font-medium text-ink">More</p>
            <ul className="space-y-1.5">
              <li>
                <Link href="/articles" className="hover:text-ink">Archive</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-ink">About</Link>
              </li>
              <li>
                <Link href="/about#subscribe" className="hover:text-ink">Subscribe</Link>
              </li>
              <li>
                <Link href="/rss.xml" className="hover:text-ink">RSS</Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-ink">Search</Link>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink">Contact</a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:items-baseline sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Kakrat. All rights reserved.</p>
          <p className="text-xs">Inspired and designed by humans, assisted by AI.</p>
        </div>
      </div>
    </footer>
  );
}
