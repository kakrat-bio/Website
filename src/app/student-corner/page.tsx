import type { Metadata } from "next";
import Link from "next/link";
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
      <div className="prose prose-lg mt-8 max-w-none font-sans">
        <p>
          Studying something that fascinates you? Worked on a project, a field
          trip or an experiment you can&apos;t stop talking about? We&apos;d
          love to help you share it with curious readers.
        </p>

        <h2>Who can write</h2>
        <p>
          Students at a college or university in India, aged 18 and over. That
          includes undergraduates, postgraduates and PhD scholars. PhD scholars
          can pitch here or as{" "}
          <Link href="/write-for-us">guest contributors</Link>, whichever fits
          the piece. We aren&apos;t able to accept pieces from school students
          just yet.
        </p>

        <h2>What we&apos;re looking for</h2>
        <p>
          500 to 900 words. An explainer on something you&apos;re studying, the
          story of a project or field trip, or a well-argued opinion. One clear
          idea, told in your own words, for readers outside your field. The
          sections are the same as the rest of Kakrat:{" "}
          <Link href="/topics/science-technology">Science &amp; Technology</Link>,{" "}
          <Link href="/topics/business-innovation">Business &amp; Innovation</Link>{" "}
          and <Link href="/topics/culture-ideas">Culture &amp; Ideas</Link>.
        </p>

        <h2>What you get</h2>
        <p>
          Your byline on Student Corner, careful editing from our team, and a
          Kakrat T-shirt (delivery within India). We send it once your piece is
          live and you&apos;ve shared it on social media, tagging @kakratian.
          Student Corner pieces don&apos;t carry an honorarium.
        </p>

        <h2>What the form will ask for</h2>
        <p>To keep things fair and genuine, we&apos;ll ask for:</p>
        <ul>
          <li>Your institutional email address, or a photo of your college ID.</li>
          <li>Your course and year.</li>
          <li>
            A social media handle, and where you follow Kakrat:{" "}
            <a href="https://www.instagram.com/kakratian">Instagram</a>,{" "}
            <a href="https://x.com/kakratian">X</a> or{" "}
            <a href="https://www.linkedin.com/company/kakrat">LinkedIn</a>.
          </li>
          <li>A link to a Kakrat article you&apos;ve read, and what you made of it.</li>
          <li>Optional: a faculty member who can vouch for you.</li>
        </ul>

        <h2>A few ground rules</h2>
        <ul>
          <li>
            Your piece should be your own work and not published anywhere else,
            including your blog.
          </li>
          <li>
            AI tools can help you research or check grammar, but the writing
            should be yours, and we&apos;ll ask how you used them.
          </li>
          <li>
            You&apos;re welcome to build on coursework, as long as you rework it
            for general readers.
          </li>
          <li>
            The full <Link href="/write-for-us#guidelines">guidelines</Link> and{" "}
            <Link href="/write-for-us#terms">terms</Link> apply to Student
            Corner too.
          </li>
        </ul>
      </div>

      <section
        id="pitch"
        aria-labelledby="pitch-heading"
        className="mt-10 scroll-mt-24 rounded-sm border border-line bg-surface px-6 py-7"
      >
        <h2 id="pitch-heading" className="font-display text-2xl text-ink">
          Share your pitch
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          It takes about ten minutes, and an outline is all we need. We
          can&apos;t wait to read it.
        </p>
        <div className="mt-6">
          <PitchForm defaultTrack="student" />
        </div>
      </section>
    </div>
  );
}
