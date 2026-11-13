import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="font-display text-6xl text-ink">404</p>
      <h1 className="mt-4 font-display text-2xl text-ink">This page has flown</h1>
      <p className="mt-3 text-ink-muted">
        Or it was never here. Crows are unreliable witnesses.
      </p>
      <Link href="/" className="mt-8 inline-block text-accent hover:underline">
        Back to Kakrat
      </Link>
    </div>
  );
}
