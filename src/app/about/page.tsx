import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/constants";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Kakrat is a Gujarati word for the cawing of crows — several at once, each certain it is the one making sense. It is also the name of this publication.",
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
          <strong>Kakrat</strong> &mdash; whispered by some elders as{" "}
          <em>kaklat</em> &mdash; is a Gujarati word for the cawing of crows. Not
          one crow. Several, all at once, each entirely convinced it is making the
          most important point in the history of avian civilization.
        </p>
        <p>
          The word escaped the birds a long time ago. It now describes any room
          where everybody is talking and nobody is listening: the family dinner
          table, the wedding mandap, the group video call with more than four
          people on it. Noise with ego.{" "}
          <Link href="/articles/kakrat-the-ancient-gujarati-word">There is a whole essay about it</Link>
          {", "}which is as close to a mission statement as this place has.
        </p>

        <h2>What this is</h2>
        <p>
          One person writing, not a masthead. There is no staff, no newsroom and
          no editorial board &mdash; a single byline and an irregular schedule.
          Pieces go up when they are ready, which is sometimes twice in a month
          and sometimes not for a season. That is worth saying plainly rather
          than implying a cadence I do not keep.
        </p>
        <p>
          The writing sorts itself into three areas: science and technology
          (mostly biology, because that is what I know), business and innovation
          (mostly how research becomes a company, and how badly that usually
          goes), and culture and ideas (language, memory, family, and the
          occasional short story).
        </p>

        <h2>What I am trying to do</h2>
        <p>
          Write about serious subjects in neither of the two registers that
          usually get used on them. Science writing tends to arrive either
          breathless &mdash; every result a revolution &mdash; or so hedged that
          you finish a piece unsure whether anything happened. Business writing
          has the same problem in different clothes. The interesting register is
          the one in between, where you can say a thing is genuinely remarkable
          and also that most of its press coverage is nonsense, in the same
          paragraph.
        </p>
        <p>
          The other thing: being funny about serious subjects is not the same as
          not taking them seriously. Usually it is what taking them seriously
          looks like once you have stopped performing gravity.
        </p>

        <h2>How sourcing works here</h2>
        <p>
          Transparent where it needs to be, out of the way where it does not.
          Pieces that make factual claims end with a{" "}
          <strong>Sources &amp; notes</strong> block listing what they lean on
          and, where it matters, which parts are checked fact and which are
          editorial commentary. Essays and stories do not carry one, because
          there is nothing to cite &mdash; a meditation on crows does not need a
          bibliography.
        </p>
        <p>
          Where a piece invents a statistic for comic effect, it says so in the
          sentence that invents it. That rule has no exceptions.
        </p>

        <h2>Reading along</h2>
        <p>
          The <Link href="/articles">archive</Link> has everything by date, the
          three topic pages sort it by subject, and{" "}
          <Link href="/search">search</Link> covers the full text of every piece.
          There is no newsletter and no tracking of any kind; if you want to know
          when something new goes up, the <Link href="/rss.xml">RSS feed</Link> is
          the way.
        </p>
      </div>
    </div>
  );
}
