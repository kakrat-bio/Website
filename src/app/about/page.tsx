import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: "Kakrat is an independent publication on science, biotechnology, entrepreneurship, technology, storytelling, philosophy, and ideas.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-4xl text-ink">About Kakrat</h1>
      <div className="prose prose-lg mt-8 max-w-none font-sans">
        <p>
          Kakrat is an independent publication covering science, biotechnology,
          entrepreneurship, technology, storytelling, philosophy, and ideas.
        </p>
        <p>
          We publish long-form essays and reporting written to be read, not
          skimmed &mdash; with sourcing that&apos;s transparent where it needs to be, and
          out of the way where it doesn&apos;t.
        </p>
      </div>
    </div>
  );
}
