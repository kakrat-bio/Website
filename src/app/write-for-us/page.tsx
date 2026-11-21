import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { PitchForm } from "@/components/pitch/PitchForm";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/seo/constants";

export const metadata: Metadata = buildMetadata({
  title: "Write for us",
  description:
    "Write for Kakrat on science and technology, business and innovation, or culture and ideas. Researchers, professionals, PhD scholars and students are welcome. Send us a short outline through the pitch form.",
  path: "/write-for-us",
});

export default function WriteForUsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Write for us", url: `${SITE_URL}/write-for-us` },
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
      <h1 className="font-display text-4xl text-ink">Write for Kakrat</h1>
      <div className="prose prose-lg mt-8 max-w-none font-sans">
        <p>
          We&apos;d love to hear from you. Kakrat publishes clear, curious
          writing on science and technology, business and innovation, and
          culture and ideas. Much of the best of it comes from people who know
          their subject up close: researchers, doctors, engineers, founders,
          teachers, students and practitioners.
        </p>
        <p>
          If you&apos;ve ever thought &ldquo;someone should explain this
          properly&rdquo;, that someone could be you. You don&apos;t need a big
          following or a long list of publications. You need first-hand
          knowledge, an idea you care about, and a little patience with our
          editing.
        </p>

        <h2>A few things to know first</h2>
        <ul>
          <li>
            <strong>Pitches come through the form on this page.</strong> It
            helps us give every pitch proper attention. Pitches sent by email
            can&apos;t be reviewed.
          </li>
          <li>
            <strong>This page is for article pitches only.</strong> We
            aren&apos;t able to consider job, internship or freelance
            applications here.
          </li>
          <li>
            <strong>The honorarium is offered for selected Kakrat Voices
            pieces,</strong> at the editor&apos;s discretion. We aren&apos;t
            able to discuss fees before a pitch is accepted.
          </li>
          <li>
            <strong>Students are very welcome.</strong>{" "}
            <Link href="/student-corner">Student Corner</Link> has its own page,
            made just for you.
          </li>
        </ul>

        <h2>Three ways to write for us</h2>
        <p>
          Wherever you are in your career, there&apos;s a place for your writing
          here. Choose the track that fits you best in the form. If another
          track suits your piece better, our editors will suggest it.
        </p>
        <table>
          <thead>
            <tr>
              <th>Track</th>
              <th>Who it&apos;s for</th>
              <th>What you get</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Kakrat Voices</strong>
                <br />
                800 to 1,500 words
              </td>
              <td>
                Experienced professionals with a track record in their field:
                researchers, doctors, engineers, founders and senior
                practitioners.
              </td>
              <td>
                Byline and author box, a Kakrat T-shirt, and a ₹2,000
                honorarium at the editor&apos;s discretion.
              </td>
            </tr>
            <tr>
              <td>
                <strong>Guest contributor</strong>
                <br />
                800 to 1,500 words
              </td>
              <td>
                Professionals, PhD scholars and writers with first-hand
                knowledge of their topic.
              </td>
              <td>Byline and an author box linking to your work.</td>
            </tr>
            <tr>
              <td>
                <strong>
                  <Link href="/student-corner">Student Corner</Link>
                </strong>
                <br />
                500 to 900 words
              </td>
              <td>
                College and university students aged 18 and over, from
                undergraduates to PhD scholars.
              </td>
              <td>Byline on Student Corner and a Kakrat T-shirt.</td>
            </tr>
          </tbody>
        </table>
        <p>
          The editor decides on the honorarium once a pitch is accepted, based
          on your experience and the piece. Choosing Kakrat Voices tells us
          about your background, but doesn&apos;t guarantee it. We&apos;ll
          confirm everything in writing when we say yes.
        </p>
        <p>
          Once your article is live, we&apos;ll ask you to share it on your
          social media and tag @kakratian. It helps your work reach more
          readers, and it&apos;s when we send your T-shirt and any honorarium.
        </p>

        <h2>Pick a section</h2>
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

        <h2>Before you pitch</h2>
        <p>
          Three small steps help us get to know you, and they help your pitch
          stand out.
        </p>
        <ol>
          <li>
            <strong>Come and say hello on social media.</strong> Follow Kakrat
            on <a href="https://www.instagram.com/kakratian">Instagram</a>,{" "}
            <a href="https://x.com/kakratian">X</a> or{" "}
            <a href="https://www.linkedin.com/company/kakrat">LinkedIn</a>. We
            share monthly themes and open calls there first. Following us on at
            least one is required to pitch.
          </li>
          <li>
            <strong>Read a Kakrat piece or two.</strong> You&apos;ll get a feel
            for our voice, and the form will ask which one you read and what
            you made of it. The <Link href="/articles">archive</Link> is a good
            place to start.
          </li>
          <li>
            <strong>Share your profiles if you like.</strong> Links to your
            LinkedIn, Instagram, X, Facebook or website are optional, but they
            help us see the real person behind each pitch, and we&apos;d love to
            follow you.
          </li>
        </ol>

        <h2>What happens after you pitch</h2>
        <ol>
          <li>
            <strong>Hear from us.</strong> Our editors read every pitch
            carefully. If we&apos;d like to take yours forward, we&apos;ll write
            to you within 14 days. We receive many pitches and can&apos;t reply
            to each one individually, so if you haven&apos;t heard from us by
            then, please don&apos;t be discouraged. A fresh idea is always
            welcome.
          </li>
          <li>
            <strong>Get to know each other.</strong> We&apos;ll look at your
            profile and may suggest a short call.
          </li>
          <li>
            <strong>Write it together.</strong> You&apos;ll have 7 days to send
            your draft, followed by one or two rounds of friendly edits. The
            argument stays yours.
          </li>
          <li>
            <strong>Celebrate and share.</strong> We publish your piece and tag
            you. Share it with your network and tag @kakratian, and we&apos;ll
            send your T-shirt (and the honorarium, for Kakrat Voices) within 15
            days.
          </li>
        </ol>
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
          It takes about ten minutes. Answers marked * are needed. Please have
          a look at the <a className="underline underline-offset-2" href="#guidelines">guidelines</a>{" "}
          and <a className="underline underline-offset-2" href="#terms">terms</a> below
          before you send it.
        </p>
        <div className="mt-6">
          <PitchForm />
        </div>
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
          <li>
            800 to 1,500 words (500 to 900 for Student Corner). Shorter is
            welcome if the idea is complete.
          </li>
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
                ₹2,000 for selected Kakrat Voices articles, at the editor&apos;s
                discretion and confirmed in writing when we accept your pitch.
                Paid within 15 days of publication, once you&apos;ve shared the
                piece and tagged @kakratian. Guest contributor and Student
                Corner pieces don&apos;t carry an honorarium.
              </td>
            </tr>
            <tr>
              <td>T-shirt</td>
              <td>
                One Kakrat T-shirt per published Kakrat Voices or Student
                Corner article. It isn&apos;t sold anywhere, and isn&apos;t
                given for pitches that aren&apos;t published.
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
                is accepted for publication. We post it within India, within
                15 days of publication, once you&apos;ve shared the piece.
              </td>
            </tr>
          </tbody>
        </table>

        <p>
          Have a question this page doesn&apos;t answer? We&apos;re happy to
          help at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          Pitches sent there can&apos;t be reviewed, so please use the{" "}
          <a href="#pitch">form</a> for those. To see the
          kind of writing we publish, start with the{" "}
          <Link href="/articles">archive</Link> and read{" "}
          <Link href="/about">about Kakrat</Link>.
        </p>
      </div>
    </div>
  );
}
