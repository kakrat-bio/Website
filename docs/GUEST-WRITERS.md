# Kakrat — guest-writer programme

How guest writing for kakrat.com works: the offer, the rules, how pitches are
judged and checked, and what is still undecided. **Read this before changing
the `/write-for-us` page, replying to a pitch, or commissioning a guest
article.** Update it whenever a rule changes.

Last updated: 12 Nov 2026. Launched 8 Nov 2026.

This file is public (the repo is public), so it holds the rules only. It never
holds applicants' names, emails, outlines or decisions. Those are private and
live in the owner's Claude Project notes.

## Where it lives on the site

- Page: `https://kakrat.com/write-for-us` (code: `src/app/write-for-us/page.tsx`).
  It was `/write-for-kakrat` at launch; that URL still works through a 301 in
  `public/_redirects`. Linked from the footer ("Write for us") and the About page.
- The public page is the **canonical text** of the guidelines and terms. This
  file summarises them, so if the two ever disagree, the page wins; then fix
  this file.
- Pitches arrive by email. The "Email your pitch" button is a `mailto:` link to
  `CONTACT_EMAIL` (`src/lib/seo/constants.ts`, currently `mail@kakrat.com`)
  with the questions pre-filled (`PITCH_BODY` in the page file). There is no
  web form and no database; that is deliberate for the pilot.

## The offer

- Byline and a short author box linking to the writer's work.
- ₹2,000 honorarium per published article, paid within 15 days of publication.
- A Kakrat T-shirt per published article. Not sold anywhere; only published
  writers get one. Posted within India only.
- Selecting an outline is not a promise to publish: a draft that does not meet
  the guidelines after two rounds of edits may be declined. The terms mention no
  kill fee, so none is offered.
- Writers keep the copyright. Kakrat gets a non-exclusive licence to publish on
  the site, newsletter and social channels, keep it in the archive, and edit
  for length, clarity and style. Unpublished elsewhere; after 90 days the
  writer may republish with a link back.

## Headings (fixed topic taxonomy)

Science & Technology, Business & Innovation, Culture & Ideas. These are the
site's only topics (see `CLAUDE.md`: adding one is an editorial decision).

## What a pitch must contain

1. Name, as it should appear in the byline.
2. Heading (one of the three).
3. Working title, up to 12 words.
4. Outline, up to 150 words: the main point, the three or four things the
   piece will cover, and the ending.
5. Why you: one or two lines on first-hand knowledge.
6. **One profile link (required)**: LinkedIn, a staff or institution page, a
   personal site, or a byline on another publication.
7. Optional: one or two writing samples; newsletter or social handles to tag.
8. Two confirmations: own work and unpublished elsewhere; has read the
   guidelines and terms.

## Process and deadlines

1. Pitch arrives by email. Log it with the date.
2. Reply within 7 days: selected or declined.
3. Selected writer confirms the terms by reply.
4. Draft (800 to 1,500 words, every figure and claim linked to a source) due
   within 7 days of selection. Edits and questions back within 5 days. One or
   two revision rounds.
5. Agree final text and title, then tell the writer the publication date.
6. Publish, post to newsletter and social channels, and tag the writer.
7. After acceptance for publication, collect PAN, bank details, T-shirt size
   and postal address. Pay and post the shirt.

Pace for the pilot: about one guest piece a fortnight.

## How outlines are judged

Score each pitch 1 to 5 on the five points below and select pitches that
average 4 or more. Keep a note of why each pitch was declined.

- **A real point.** Something specific, not just a topic. Ends with a position,
  not only a question.
- **First-hand knowledge.** The writer knows the field from doing it.
- **Fit.** Suits Kakrat's tone and one of the three headings; does not repeat
  a recent article.
- **Clear and interesting.** A smart non-expert would want to read it.
- **Not promotional.** Not selling a product, a company or the writer.

A pitch just under 4 can still be selected if the gap is fixable. The
selection email then says exactly what to sharpen.

## Checking that writers are who they say

Proportionate checks for a ₹2,000 honorarium; none proves identity alone.

- The required profile link: does the name, photo and history fit the claim, and
  is the account more than brand new?
- The pitch email: a work or institutional address, or the one on the profile,
  is a good sign. A free address seen nowhere else is a mild flag only.
- A short call before selection, when anything is unclear.
- The name on PAN and bank account must match the byline name.
- For medical, legal or financial claims, confirm credentials through the
  employer's staff page or a professional registration.
- Search a few distinctive sentences of the draft online; open the sources
  linked.
- Don't keep copies of ID documents; collect only what is needed to pay.
- Stronger proof (a code posted from their profile) only if something looks off.

## AI and authorship

The guidelines allow AI tools for research or tidying, but ideas, writing and
voice must be the writer's, and they must say if they used them. Kakrat's own
line is "human-written, AI-edited". Text detectors are unreliable; judge by the
writer's process, the specifics only they would know, and the sources.

## Sensitive topics

For mental health, health, legal and financial pieces:

- No identifiable client or patient stories. Composites or fully anonymised
  examples only; the writer checks their employer's policy on writing publicly.
- No details of self-harm methods, no sensational language, and no claim that
  the right words prevent a crisis.
- Never give individual medical, legal or financial recommendations.
- Mental-health pieces close with a short "where to find help" note. Tele-MANAS,
  the government helpline, is 14416, 24 hours a day, in 20 languages (per a
  Press Information Bureau document, Oct 2024). Re-check the number before
  publishing.

## Email templates

Adapt each one with specific feedback on the outline. Dates in brackets are
7 days after selection.

**Selected**

> Subject: Your Kakrat pitch: "[working title]" is a yes
>
> Hi [Name],
>
> Thank you for your pitch. We would like you to write "[working title]" for
> the [heading] section of Kakrat.
>
> What happens next:
> - You have confirmed that you have read our guidelines and terms
>   (kakrat.com/write-for-us). Please reply to say you are happy to go ahead.
> - Send your draft (800 to 1,500 words) by [date], with a link for every
>   figure, study or claim you cite.
> - If the piece is published, you get a ₹2,000 honorarium and a Kakrat T-shirt
>   (delivery within India). We ask for your PAN, bank details, size and postal
>   address only once it is accepted for publication.
>
> [Specific points to sharpen: a clear position, one concrete example, exact
> facts, Kakrat's voice. For sensitive topics, add the privacy and care points.]
>
> Looking forward to reading it.
>
> [Name], Kakrat

**Declined**

> Subject: Your Kakrat pitch: "[working title]"
>
> Hi [Name],
>
> Thank you for pitching to Kakrat. We have decided not to take this one
> forward. [One honest line why: overlaps with a piece we have, or not the right
> fit for our readers.]
>
> We would be glad to see another idea from you. [Optional: suggest an angle.]
>
> Best wishes,
> [Name], Kakrat

## Pilot: what to measure

Run the first 3 to 5 guest pieces, then decide whether to continue. Before the
first piece goes live, write down what result would make the owner continue,
change the plan, or stop. (Not yet written down; see open decisions.)

| Measure | How | Where |
| --- | --- | --- |
| Pitches received, and share scoring 4+ | Count emails per week | Pitch log |
| Readers per guest piece | Page views in the first 14 days vs the owner's own articles | Cloudflare Web Analytics |
| Where readers came from | Referrals from the writer's links, newsletter, social | Cloudflare Web Analytics |
| Newsletter sign-ups | New subscribers in the 14 days after each piece | Buttondown, Sign-ups sheet |
| Writer shares | Did the writer post it to their own audience? | Writer's accounts |
| Editing time | Hours per piece | Owner's log |

## Open decisions (as of 12 Nov 2026)

- Whether every guest piece is promised newsletter and social promotion. The
  public page does not say so yet.
- A web form instead of `mailto:`, and where the pitch log lives.
- Who edits and approves guest pieces if the owner is away.
- The continue / change / stop rule for the pilot.
- The owner's CA should confirm the TDS wording ("we deduct tax at source where
  the law requires it") and whether writers must invoice.
