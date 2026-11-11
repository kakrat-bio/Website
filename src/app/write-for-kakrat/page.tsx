import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/seo/constants";

export const metadata: Metadata = buildMetadata({
  title: "Write for Kakrat",
  description:
    "Kakrat publishes guest writers on science and technology, business and innovation, and culture and ideas. Send a short outline. If we pick it, you write the piece, and you get ₹2,000 and a Kakrat T-shirt.",
  path: "/write-for-kakrat",
});

const PITCH_SUBJECT = "Pitch for Kakrat: [working title]";
const PITCH_BODY = [
  "Name (as it should appear in the byline):",
  "Heading (Science & Technology / Business & Innovation / Culture & Ideas):",
  "Working title (up to 12 words):",
  "",
  "Outline (up to 150 words: the main point, the three or four things the piece will cover, and the ending):",
  "",
  "",
  "Why me (one or two lines on what I know first-hand about this topic):",
  "",
  "Profile link (REQUIRED: LinkedIn, a staff or institution page, a personal site, or a byline on another publication):",
  "1-2 samples of my writing (optional):",
  "My newsletter or social handles, if you want to tag me (optional):",
  "",
  "[ ] This is my own work and has not been published elsewhere.",
  "[ ] I have read the contributor guidelines and the terms.",
].join("\r\n");

const PITCH_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  PITCH_SUBJECT,
)}&body=${encodeURIComponent(PITCH_BODY)}`;

export default function WriteForKakratPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Write for Kakrat", url: `${SITE_URL}/write-for-kakrat` },
        ])}
      />
      <h1 className="font-display text-4xl text-ink">Write for Kakrat</h1>
      <div className="prose prose-lg mt-8 max-w-none font-sans">
        <p>
          Kakrat is an independent publication on science and technology,
          business and innovation, and culture and ideas. We publish guest
          writers who know their field and can explain it with a little wit. You
          pitch an outline first. If we pick it, you write the full piece.
        </p>

        <h2>What you get</h2>
        <ul>
          <li>
            Your article published on Kakrat, with your byline and a short
            author box linking to your work.
          </li>
          <li>₹2,000 honorarium, paid after publication.</li>
          <li>
            A Kakrat T-shirt. It is not for sale anywhere. Published writers are
            the only people who get one.
          </li>
        </ul>

        <h2>How it works</h2>
        <ol>
          <li>
            <strong>Pitch.</strong> Send a 150-word outline, the heading it fits
            under, one line about you, and a link to your profile. The{" "}
            <a href="#pitch">pitch checklist below</a> lists what to include.
          </li>
          <li>
            <strong>Hear back.</strong> We reply to every pitch within 7 days,
            yes or no.
          </li>
          <li>
            <strong>Write.</strong> If we select your outline, you write the
            full piece (800 to 1,500 words). We edit it with you.
          </li>
          <li>
            <strong>Publish.</strong> We publish it, pay the honorarium, and
            post you the T-shirt (within India).
          </li>
        </ol>

        <h2>Pick a heading</h2>
        <ul>
          <li>
            <strong>
              <Link href="/topics/science-technology">Science &amp; Technology</Link>:
            </strong>{" "}
            what the research says, what it doesn’t, and what the press
            release left out.
          </li>
          <li>
            <strong>
              <Link href="/topics/business-innovation">Business &amp; Innovation</Link>:
            </strong>{" "}
            how things actually get built, funded and sold.
          </li>
          <li>
            <strong>
              <Link href="/topics/culture-ideas">Culture &amp; Ideas</Link>:
            </strong>{" "}
            essays, observations, and arguments with a point of view.
          </li>
        </ul>

        <h2>Who we are looking for</h2>
        <p>
          Researchers, doctors, founders, engineers, teachers and writers who
          have first-hand knowledge and an opinion. You do not need a big
          following. We do not publish promotional pieces or press releases in
          disguise.
        </p>
      </div>

      <section
        id="pitch"
        aria-labelledby="pitch-heading"
        className="mt-10 scroll-mt-24 rounded-sm border border-line bg-surface px-6 py-7"
      >
        <h2 id="pitch-heading" className="font-display text-xl text-ink">
          Send your pitch
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          The button opens an email to{" "}
          <a className="underline underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{" "}
          with the questions below already filled in. It takes about ten
          minutes. Anything longer than an outline puts off busy writers.
        </p>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-ink">
          <li>Your name, as it should appear in the byline.</li>
          <li>
            The heading: Science &amp; Technology, Business &amp; Innovation, or
            Culture &amp; Ideas.
          </li>
          <li>A working title of up to 12 words.</li>
          <li>
            An outline of up to 150 words: the main point, the three or four
            things the piece will cover, and the ending.
          </li>
          <li>One or two lines on what you know first-hand about the topic.</li>
          <li>
            <strong>A link to your profile</strong> that shows who you are:
            LinkedIn, a staff or institution page, a personal site, or a byline
            on another publication. We check it before we select a pitch.
          </li>
          <li>
            Optional: one or two samples of your writing, and your newsletter or
            social handles if you want us to tag you.
          </li>
          <li>
            Confirm that it is your own work, not published elsewhere, and that
            you have read the <a className="underline underline-offset-2" href="#guidelines">guidelines</a> and{" "}
            <a className="underline underline-offset-2" href="#terms">terms</a> below.
          </li>
        </ul>
        <a
          href={PITCH_HREF}
          className="mt-5 inline-block rounded-sm bg-accent px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Email your pitch
        </a>
      </section>

      <div className="prose prose-lg mt-12 max-w-none font-sans">
        <h2 id="guidelines" className="scroll-mt-24">
          Contributor guidelines
        </h2>
        <p>We send these to every writer whose outline is selected.</p>

        <h3>Voice</h3>
        <p>
          Kakrat reads like a smart friend explaining something over chai. Be
          clear, curious and a little funny. Humour should make the point
          sharper, not replace it. Write in the first person if it helps.
          Explain any jargon the first time you use it.
        </p>

        <h3>Length and shape</h3>
        <ul>
          <li>800 to 1,500 words. Shorter is welcome if the idea is complete.</li>
          <li>
            A title of up to 12 words and a one-sentence standfirst that says
            what the reader will learn.
          </li>
          <li>Short paragraphs and a subheading every 300 words or so.</li>
          <li>Open with a scene, a question or a surprise, not a definition.</li>
          <li>End on a point the reader will remember, not a summary.</li>
        </ul>

        <h3>Facts and sources</h3>
        <ul>
          <li>
            Every number, date, quote and study needs a source. Send the links
            with your draft.
          </li>
          <li>
            Say clearly what is established, what is debated and what is your
            opinion.
          </li>
          <li>
            Do not make medical, legal or financial recommendations to readers.
          </li>
          <li>
            Disclose any link between you and a company, product or person you
            write about.
          </li>
        </ul>

        <h3>Originality and AI</h3>
        <ul>
          <li>
            The piece must be your own work and unpublished elsewhere, including
            your own blog.
          </li>
          <li>
            Do not copy text, images or charts that you do not own or have
            permission to use.
          </li>
          <li>
            You may use AI tools for research or tidying, but the ideas, the
            writing and the voice must be yours. Tell us if you used them.
          </li>
        </ul>

        <h3>Images</h3>
        <p>
          Send images only if you own them or they are free to use, and say
          where each one comes from. We can find or create images if you do not
          have any.
        </p>

        <h3>Editing</h3>
        <ol>
          <li>You send the draft within 7 days of selection.</li>
          <li>We send back edits and questions within 5 days.</li>
          <li>
            You revise once or twice. We agree the final text and title
            together.
          </li>
          <li>
            We tell you the publication date before it goes live. You see the
            final version and can flag any error.
          </li>
        </ol>
        <p>
          We may cut, reorder and retitle for clarity, and we will not change
          your argument without asking you.
        </p>

        <h2 id="terms" className="scroll-mt-24">
          Terms for guest writers
        </h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Term</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Honorarium</td>
              <td>
                ₹2,000 per published article, paid within 15 days of
                publication.
              </td>
            </tr>
            <tr>
              <td>T-shirt</td>
              <td>
                One Kakrat T-shirt per published article. Not sold, and not
                given for pitches that are not published.
              </td>
            </tr>
            <tr>
              <td>Selection</td>
              <td>
                Selecting an outline is not a promise to publish. If the full
                draft does not meet the guidelines after two rounds of edits, we
                may decline it.
              </td>
            </tr>
            <tr>
              <td>Copyright</td>
              <td>You keep the copyright in your article.</td>
            </tr>
            <tr>
              <td>Licence</td>
              <td>
                You give Kakrat a non-exclusive right to publish it on
                kakrat.com, in the newsletter and on our social channels, and to
                keep it in the archive. Kakrat may edit it for length, clarity
                and style.
              </td>
            </tr>
            <tr>
              <td>Exclusivity</td>
              <td>
                The piece must be unpublished elsewhere. After 90 days you may
                republish it with a link back to Kakrat.
              </td>
            </tr>
            <tr>
              <td>Originality</td>
              <td>
                You confirm that the work is yours, that sources are accurate,
                and that it does not defame anyone or infringe any copyright.
              </td>
            </tr>
            <tr>
              <td>Removal</td>
              <td>
                You can ask us to take the article down or correct it. We will
                do so within 7 days.
              </td>
            </tr>
            <tr>
              <td>Checks</td>
              <td>
                We check the profile link you send. Where your piece relies on
                professional credentials, we may ask you to confirm them. We may
                also ask for a short call before we select your pitch, and we
                check your sources before we publish.
              </td>
            </tr>
            <tr>
              <td>Payment details</td>
              <td>
                We need your full name, PAN and bank details to pay you, and we
                deduct tax at source where the law requires it.
              </td>
            </tr>
            <tr>
              <td>T-shirt delivery</td>
              <td>
                We ask for your size and postal address only after your article
                is accepted for publication. We post the T-shirt when we pay
                the honorarium.
              </td>
            </tr>
          </tbody>
        </table>

        <p>
          Questions before you pitch? Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. To see the
          kind of writing we publish, start with the{" "}
          <Link href="/articles">archive</Link> and read{" "}
          <Link href="/about">about Kakrat</Link>.
        </p>
      </div>
    </div>
  );
}
