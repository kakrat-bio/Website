"use client";

import { useState } from "react";
import Link from "next/link";
import { ALL_TOPICS } from "@/lib/content/topics";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 items-center justify-center text-ink"
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-0 top-full z-20 border-b border-line bg-paper px-6 py-6 shadow-sm"
        >
          <nav aria-label="Topics">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {ALL_TOPICS.map((topic) => (
                <li key={topic.slug}>
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="block py-1 text-base text-ink"
                    onClick={() => setOpen(false)}
                  >
                    {topic.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 border-t border-line pt-4">
            <Link href="/search" className="text-base text-ink" onClick={() => setOpen(false)}>
              Search
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
