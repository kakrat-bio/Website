import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/constants";

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
  metadataBase: new URL("https://kakrat.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Resolve theme before paint to avoid a light/dark flash. External file keeps CSP script-src strict (no 'unsafe-inline'). */}
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </head>
      <body className="font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
