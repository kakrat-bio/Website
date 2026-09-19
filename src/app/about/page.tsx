import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/seo/constants";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Kakrat is a Gujarati word for the cawing of crows, several at once, each certain it is the one making sense. It is also the name of this publication.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "About", url: `${SITE_URL}/about` },
        ])}
      />
      <h1 className="font-display text-4xl text-ink">About Kakrat</h1>
      <div className="prose prose-lg mt-8 max-w-none font-sans">
        <p>
          <strong>Kakrat</strong> is a Gujarati word for the cawing of crows. Not
          one crow. Several, all at once, each one convinced it is making the most
          important point in the history of birds. Some elders say{" "}
          <em>kaklat</em> instead.
        </p>
        <p>
          The word left the birds a long time ago. It now covers any room where
          everyone is talking and nobody is listening. The family dinner table.
          The wedding mandap. A video call with more than four people on it.{" "}
          <Link href="/articles/kakrat-the-ancient-gujarati-word">
            There’s a whole essay about it
          </Link>
          , which is the closest thing this site has to a mission statement.
        </p>

        <h2>What this is</h2>
        <p>
          One person writing. No staff, no newsroom, no editorial board. Pieces go
          up when they’re finished, which is sometimes twice in a month and
          sometimes not for a season. I’d rather say that than claim a schedule I
          don’t keep.
        </p>
        <p>
          The writing falls into three areas. Science and technology, mostly
          biology, because that’s what I trained in. Business and innovation,
          mostly what happens when research tries to become a company. Culture and
          ideas, which covers language, memory, family, and the occasional short
          story.
        </p>

        <h2>What I’m trying to do</h2>
        <p>
          Most science writing arrives in one of two registers. Either every
          result is a revolution, or the hedging is thick enough that you finish a
          piece unsure whether anything happened. Business writing has the same
          problem. I’m after the register in between, where you can say that
          something is genuinely remarkable and that most of the coverage of it is
          nonsense, in the same paragraph.
        </p>
        <p>
          I also think being funny about a serious subject is a way of taking it
          seriously rather than a way of dodging it.
        </p>

        <h2>How sourcing works</h2>
        <p>
          Anything that makes factual claims ends with a{" "}
          <strong>Sources &amp; notes</strong> block. It lists what the piece
          leans on and, where it matters, marks which parts are checked fact and
          which are my own commentary. Essays and stories don’t carry one. A
          meditation on crows doesn’t need a bibliography.
        </p>
        <p>
          If a piece invents a statistic for comic effect, it says so in the same
          sentence. That rule has no exceptions.
        </p>

        <h2>Reading along</h2>
        <p>
          The <Link href="/articles">archive</Link> has everything by date. The
          three topic pages sort it by subject.{" "}
          <Link href="/search">Search</Link> covers the full text of every piece.
          There’s no newsletter and no tracking of any kind. If you want to know
          when something new goes up, use the{" "}
          <Link href="/rss.xml">RSS feed</Link>.
        </p>

        <h2>Getting in touch</h2>
        <p>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Corrections,
          arguments, and tips are all welcome. Corrections especially. If
          something here is wrong, I’d rather hear it from you than leave it
          standing.
        </p>
      </div>
    </div>
  );
}
