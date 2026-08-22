"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-2xl text-ink">Something went wrong</h1>
      <p className="mt-3 text-ink-muted">Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-block text-accent hover:underline"
      >
        Try again
      </button>
    </div>
  );
}
