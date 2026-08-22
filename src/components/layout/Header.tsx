import Link from "next/link";
import { ALL_TOPICS } from "@/lib/content/topics";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          Kakrat
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm md:flex">
          {ALL_TOPICS.slice(0, 5).map((topic) => (
            <Link
              key={topic.slug}
              href={`/topics/${topic.slug}`}
              className="text-ink-muted transition-colors hover:text-ink"
            >
              {topic.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/search" className="text-sm text-ink-muted hover:text-ink" aria-label="Search">
            Search
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
