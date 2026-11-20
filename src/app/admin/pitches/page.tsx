import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { PitchesAdmin } from "@/components/pitch/PitchesAdmin";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Pitches",
    description: "Internal pitch review tool.",
    path: "/admin/pitches",
  }),
  robots: { index: false, follow: false },
};

export default function PitchesAdminPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-4xl text-ink">Pitches</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Pitches from the form on /write-for-us and /student-corner. Same password as comments. Shortlisting or declining
        only sorts them here; it doesn&apos;t email anyone.
      </p>
      <div className="mt-8">
        <PitchesAdmin />
      </div>
    </div>
  );
}
