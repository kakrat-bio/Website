import Link from "next/link";
import { ALL_TOPICS } from "@/lib/content/topics";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-12 text-sm text-ink-muted">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg text-ink">Kakrat</p>
            <p className="mt-2 max-w-xs">
              An independent publication on science, technology, and the ideas
              behind them.
            </p>
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
                <Link href="/about" className="hover:text-ink">About</Link>
              </li>
              <li>
                <Link href="/rss.xml" className="hover:text-ink">RSS</Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-ink">Search</Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-10 border-t border-line pt-6">
          &copy; {new Date().getFullYear()} Kakrat. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
