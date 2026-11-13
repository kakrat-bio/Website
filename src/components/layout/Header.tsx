import Link from "next/link";
import { ALL_TOPICS } from "@/lib/content/topics";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";
import { SocialFollow } from "@/components/social/SocialFollow";

export function Header() {
  return (
    <header className="relative border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          Kakrat
        </Link>
        {/* Desktop: all seven topics, deliberately — not a truncated subset. */}
        <nav aria-label="Topics" className="hidden md:block">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm">
            {ALL_TOPICS.map((topic) => (
              <li key={topic.slug}>
                <Link
                  href={`/topics/${topic.slug}`}
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  {topic.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3 md:gap-4">
          {/* Wide screens: social links sit inline with the controls. */}
          <div className="hidden lg:block">
            <SocialFollow variant="compact" />
          </div>
          <Link
            href="/search"
            className="hidden text-sm text-ink-muted hover:text-ink md:inline"
            aria-label="Search"
          >
            Search
          </Link>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
      {/* Narrower screens: social links get their own row under the logo, so
          they don't crowd the wordmark, theme toggle and menu. */}
      <div className="mx-auto max-w-6xl px-6 pb-4 lg:hidden">
        <SocialFollow variant="compact" />
      </div>
    </header>
  );
}
