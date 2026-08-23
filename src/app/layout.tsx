import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo/constants";

// next/font self-hosts these at build time: no request to Google Fonts at runtime.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  ...buildMetadata({ title: SITE_NAME, description: SITE_DESCRIPTION, path: "/" }),
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Resolve theme before paint to avoid a light/dark flash. External file keeps CSP script-src strict (no 'unsafe-inline'). */}
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        {/*
          Rendered directly (not via the metadata API's `alternates.types`):
          Next merges route metadata shallowly, so any page's own
          `alternates` (every article/topic/tag/author page sets one, for
          its canonical URL) would silently replace this rather than merge
          with it. A literal <link> here always renders, on every page.
        */}
        <link rel="alternate" type="application/rss+xml" title={SITE_NAME} href={`${SITE_URL}/rss.xml`} />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-sm focus-visible:bg-ink focus-visible:px-4 focus-visible:py-2 focus-visible:text-paper"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
