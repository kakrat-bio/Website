"use client";

import { useState } from "react";

export function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-8 flex items-center gap-4 text-sm text-ink-muted">
      <span>Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-ink"
      >
        X
      </a>
      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
        className="hover:text-ink"
      >
        Email
      </a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Clipboard API unavailable — no-op.
          }
        }}
        className="hover:text-ink"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
