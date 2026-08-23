import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { PagefindSearch } from "@/components/search/PagefindSearch";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Search",
    description: "Search Kakrat's archive.",
    path: "/search",
  }),
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
      <h1 className="font-display text-4xl text-ink">Search</h1>
      <div className="mt-8">
        <PagefindSearch />
      </div>
    </div>
  );
}
