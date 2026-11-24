import type { Metadata } from "next";
import Link from "next/link";
import { TRACKS, RULES, words, payLine } from "@/lib/contributors/rules";
import { JsonLd } from "@/components/seo/JsonLd";
import { PitchForm } from "@/components/pitch/PitchForm";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/constants";

export const metadata: Metadata = buildMetadata({
  title: "Student Corner",
  description:
    "Student Corner is Kakrat's home for writing by college and university students, from undergraduates to PhD scholars. Pitch an explainer, a project story or an argued opinion.",
  path: "/student-corner",
});

export default function StudentCornerPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Write for us", url: `${SITE_URL}/write-for-us` },
          { name: "Student Corner", url: `${SITE_URL}/student-corner` },
        ])}
      />
      <p
        role="note"
        className="mb-8 rounded-sm border-l-4 border-accent bg-surface px-4 py-3 text-sm text-ink"
      >
        We are getting a lot of exciting articles and applications right now.
        Do keep sending them, and spread the word. Just expect a little delay
        in our reply.
      </p>
      <h1 className="font-display text-4xl text-ink">Student Corner</h1>
      <p className="mt-3 font-display text-xl text-ink-muted">Your first byline could start here.</p>
      <p className="mt-6 text-lg text-ink">
        Studying something that fascinates you? Win a T-shirt!
      </p>

      <dl className="mt-6 divide-y divide-line rounded-sm border border-line text-sm">
        {[
          ["Who", `${TRACKS.student.who} Payment is for students based in ${RULES.paidCountry}.`],
          ["What", `${words(TRACKS.student)}. An explainer, a project or field-trip story, or an argued opinion, for readers outside your field.`],
          ["You get", `Your byline, careful editing, ${payLine(TRACKS.student)} and ${TRACKS.student.extras}, sent ${RULES.paymentCondition.replace("you've shared", "you share").replace("tagged", "tag")}.`],
          ["Rules", `${RULES.original} ${RULES.ai}`],
        ].map(([k, d]) => (
          <div key={k} className="flex gap-4 px-4 py-3">
            <dt className="w-20 shrink-0 font-medium text-ink">{k}</dt>
            <dd className="text-ink-muted">{d}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-ink-muted">
        The full <Link className="underline underline-offset-2" href="/write-for-us#guidelines">guidelines</Link> and{" "}
        <Link className="underline underline-offset-2" href="/write-for-us#terms">terms</Link> apply.
      </p>

      <section
        id="pitch"
        aria-labelledby="pitch-heading"
        className="mt-10 scroll-mt-24 rounded-sm border border-line bg-surface px-6 py-7"
      >
        <h2 id="pitch-heading" className="font-display text-2xl text-ink">
          Share your pitch
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          About ten minutes. An outline is all we need.
        </p>
        <div className="mt-6">
          <PitchForm defaultTrack="student" />
        </div>
      </section>
    </div>
  );
}
