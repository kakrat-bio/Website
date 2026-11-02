import Link from "next/link";
import { formatDate } from "@/lib/utils/format";

/**
 * Visible record of factual corrections made after publication (frontmatter
 * `corrections`). Renders nothing for an uncorrected piece. Kept separate
 * from "Sources & notes" so a correction is never tucked into a block that
 * essays and stories don't show.
 */
export function Corrections({ corrections }: { corrections: { date: Date; text: string }[] }) {
  if (corrections.length === 0) return null;

  return (
    <aside
      aria-label="Corrections"
      className="mt-10 rounded-sm border-l-2 border-accent bg-surface px-5 py-4 text-sm text-ink-muted"
    >
      <p className="font-medium text-ink">{corrections.length === 1 ? "Correction" : "Corrections"}</p>
      <ul className="mt-2 space-y-2">
        {corrections.map((c) => (
          <li key={`${c.date.toISOString()}-${c.text}`}>
            <time dateTime={c.date.toISOString()} className="text-ink">
              {formatDate(c.date)}:
            </time>{" "}
            {c.text}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs">
        How corrections work: <Link href="/editorial-standards#corrections" className="underline underline-offset-2 hover:text-ink">editorial standards</Link>.
      </p>
    </aside>
  );
}
