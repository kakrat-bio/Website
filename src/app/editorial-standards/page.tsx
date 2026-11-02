import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/seo/constants";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = buildMetadata({
  title: "Editorial standards",
  description:
    "How Kakrat works: who writes it, how facts, commentary and humour are kept apart, how sources are shown, how AI tools are used, and how corrections are made.",
  path: "/editorial-standards",
});

/** Bump when the policy text below changes materially. */
const LAST_REVISED = new Date("2026-11-02");

export default function EditorialStandardsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Editorial standards", url: `${SITE_URL}/editorial-standards` },
        ])}
      />
      <h1 className="font-display text-4xl text-ink">Editorial standards</h1>
      <p className="mt-3 text-sm text-ink-muted">
        Last revised{" "}
        <time dateTime={LAST_REVISED.toISOString()}>
          {formatDate(LAST_REVISED)}
        </time>
      </p>

      <div className="prose prose-lg mt-8 max-w-none font-sans">
        <p>
          Kakrat is small, but it tries to be easy to trust. These are the
          rules it runs on. If a piece breaks one, please{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>tell me</a>.
        </p>

        <h2 id="who">Who writes Kakrat</h2>
        <p>
          Kakrat is an independent publication. Most pieces are written under
          the name <Link href="/authors/kakratian">Kakratian</Link>, the
          site’s own voice. Guest writers are credited under their own names,
          with a short bio at the end of their piece and on their author page.
        </p>
        <p>
          No advertiser, sponsor or investor sees or shapes a piece before it is
          published. If Kakrat ever runs sponsored content, it will be labelled
          as sponsored at the top, not the bottom.
        </p>
        <p>
          When a writer has a professional or financial interest in what they
          are writing about, such as a company they work for, own or compete
          with, the piece says so.
        </p>

        <h2 id="fact-and-humour">Fact, commentary and humour</h2>
        <p>
          A lot of Kakrat is funny on purpose. That only works if you can tell
          the jokes from the facts, so:
        </p>
        <ul>
          <li>
            Factual claims are meant to be true and checkable. Where they matter,
            they are sourced.
          </li>
          <li>
            Opinion and commentary are written as opinion, in the writer’s own
            voice, not dressed up as findings.
          </li>
          <li>
            If a piece invents a statistic, a study or a quote for comic effect,
            it says so in the same sentence or in the piece’s notes. No
            exceptions.
          </li>
        </ul>

        <h2 id="sources">Sources</h2>
        <p>
          Pieces that make factual claims end with a{" "}
          <strong>Sources &amp; notes</strong> section listing what they rely
          on, with links. Primary sources, such as the paper, the filing or the
          data, are preferred over coverage of them. Essays and short stories
          don’t carry a source list, because they aren’t making factual claims.
        </p>

        <h2 id="ai">How AI tools are used</h2>
        <p>
          Kakrat is written by people. AI tools help with editing, with checking
          facts and references against their sources, with some illustrations,
          and with building this website.
        </p>
        <p>
          A person reads and approves every word before it is published. AI is
          never credited as an author, and it is never used to invent quotes,
          sources or data presented as real.
        </p>

        <h2 id="corrections">Corrections</h2>
        <p>
          When a piece gets a fact wrong, it is fixed as soon as I know about
          it, and a dated <strong>Correction</strong> note at the end says what
          changed. The original error is not quietly deleted.
        </p>
        <p>
          Typos and small wording changes that don’t change the meaning are
          fixed without a note. When a piece is substantially expanded or
          updated, the date at the top shows when.
        </p>
        <p>
          To report an error, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the link
          and what’s wrong.
        </p>

        <h2 id="guest-writers">Guest writers</h2>
        <p>
          Guest pieces start as a short pitch: a heading and an outline. Pieces
          that go ahead are edited to the same standards as everything else and
          published under the writer’s name. To pitch, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2 id="contact">Contact</h2>
        <p>
          Corrections, complaints, pitches and arguments all go to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. More about
          the publication is on the <Link href="/about">About</Link> page.
        </p>
      </div>
    </div>
  );
}
