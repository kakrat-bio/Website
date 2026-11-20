# Kakrat — guest-writer programme

How guest writing for kakrat.com works: the offer, the rules, how pitches are
judged and checked, and what is still undecided. **Read this before changing
the `/write-for-us` page, replying to a pitch, or commissioning a guest
article.** Update it whenever a rule changes.

Last updated: 21 Nov 2026. Launched 8 Nov 2026. Pitch form and tracks added 21 Nov 2026.

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
- Student Corner: `https://kakrat.com/student-corner`
  (`src/app/student-corner/page.tsx`), linked from the footer. Same form,
  with the Student Corner track pre-selected.
- Pitches arrive through the on-page form (`src/components/pitch/PitchForm.tsx`),
  which posts to the Pages Function `functions/api/pitches/index.ts`. It stores
  each pitch in the `pitches` table of the D1 database bound as `COMMENTS_DB`
  (the table creates itself on first use; schema in `migrations/pitches/`).
  Read and sort them at `kakrat.com/admin/pitches` (same password as
  comments). Email pitches are no longer reviewed; the page says so.
- The form checks: required fields, a profile link, at least one platform where
  they follow Kakrat plus their handle, a link to a kakrat.com article they read
  with 10 to 60 words on it, title up to 12 words, outline 60 to 150 words,
  "why me" 15 to 60 words, AI use, and five declarations (own work, not a job
  application, honorarium is discretionary, will share and tag @kakratian, read
  the terms). Students also confirm they are 18+ and give proof of enrolment.
  There is a honeypot field and a limit of 3 pitches per hour per address.
- Each new pitch emails kakratkosh@gmail.com through the Apps Script's existing
  comment-alert branch (subject "New comment on Kakrat: NEW PITCH: <title>").
  It needs the Cloudflare secret `COMMENTS_WEBHOOK_TOKEN`, which is already set.

## The offer (three tracks, from 21 Nov 2026)

| Track | Who | Length | What they get |
| --- | --- | --- | --- |
| Kakrat Voices | Experienced professionals with a track record | 800 to 1,500 words | Byline, author box, T-shirt, ₹2,000 honorarium at the editor's discretion |
| Guest contributor | Professionals, PhD scholars, writers with first-hand knowledge | 800 to 1,500 words | Byline and author box |
| Student Corner | College/university students 18+, undergraduate to PhD | 500 to 900 words | Byline and T-shirt, no honorarium |

- PhD scholars may pitch as guest contributors or to Student Corner.
- The honorarium is never automatic: the editor decides at acceptance and
  confirms it in writing. Fees aren't discussed before acceptance.
- T-shirt and honorarium are sent within 15 days of publication, once the
  writer has shared the piece and tagged @kakratian. T-shirts are not sold;
  posted within India only.
- School students are not accepted (under-18s would need parental consent).
- The page is for pitches only, not job, internship or freelance applications.
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

1. Pitch arrives through the form and waits under "New" at `/admin/pitches`.
2. Reply within 14 days to shortlisted pitches. The page says not every pitch
   gets an individual reply.
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
- Who edits and approves guest pieces if the owner is away.
- The continue / change / stop rule for the pilot.
- The owner's CA should confirm the TDS wording ("we deduct tax at source where
  the law requires it") and whether writers must invoice.
