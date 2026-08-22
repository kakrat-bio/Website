import type { Reference } from "@/types/content";

/**
 * Editorial credibility block. Renders nothing if the article carries none
 * of references/editorialNote/sourceNote — a storytelling or philosophy
 * piece simply won't show this section, so sourcing transparency doesn't
 * force an academic-paper look onto content that isn't reporting.
 */
export function SourcesNotes({
  references,
  editorialNote,
  sourceNote,
}: {
  references: Reference[];
  editorialNote?: string;
  sourceNote?: string;
}) {
  const hasContent = references.length > 0 || Boolean(editorialNote) || Boolean(sourceNote);
  if (!hasContent) return null;

  return (
    <aside className="mt-16 border-t border-line pt-8" aria-label="Sources and notes">
      <h2 className="font-display text-xl text-ink">Sources &amp; notes</h2>

      {sourceNote && <p className="mt-3 text-sm text-ink-muted">{sourceNote}</p>}

      {references.length > 0 && (
        <ol className="mt-4 space-y-3">
          {references.map((ref) => (
            <li key={ref.url} className="text-sm text-ink-muted">
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline decoration-accent underline-offset-2 hover:text-accent"
              >
                {ref.title}
              </a>
              {ref.publisher && <span> — {ref.publisher}</span>}
              {ref.note && <p className="mt-0.5">{ref.note}</p>}
            </li>
          ))}
        </ol>
      )}

      {editorialNote && (
        <p className="mt-4 text-sm italic text-ink-muted">{editorialNote}</p>
      )}
    </aside>
  );
}
