/**
 * THE RULE BOOK for writing for Kakrat.
 *
 * Every public statement of the contributor offer (tracks, word counts,
 * payment, eligibility) is built from this file: /write-for-us,
 * /student-corner and the pitch form. Never type an amount, a word count or
 * an eligibility rule straight into a page: change it here, add a line to
 * RULE_CHANGES below and to the changelog in docs/GUEST-WRITERS.md, and every
 * page updates together. tests/contributor-rules.test.ts fails if a rupee
 * amount appears anywhere else.
 */

export const RULES_UPDATED = "2026-11-23";

export type TrackId = "guest" | "student";

export type TrackRule = {
  id: TrackId;
  label: string;
  /** Who can pitch on this track. */
  who: string;
  words: { min: number; max: number };
  /** Rupee amounts per published article; the first is the standard rate. */
  payINR: number[];
  /** What the writer gets, in one line, for cards and form notes. */
  offer: string;
  extras?: string;
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const TRACKS: Record<TrackId, TrackRule> = {
  guest: {
    id: "guest",
    label: "Guest writer",
    who: "Researchers, doctors, engineers, founders, PhD scholars, practitioners and writers with first-hand knowledge of their topic.",
    words: { min: 800, max: 1500 },
    payINR: [1000, 2000],
    offer: `Byline, an author box linking to your work, and ${inr(1000)} per published article, or ${inr(2000)} if you have significant professional experience in the field.`,
  },
  student: {
    id: "student",
    label: "Student writer",
    who: "College and university students aged 18 and over, from undergraduates to PhD scholars.",
    words: { min: 500, max: 900 },
    payINR: [500],
    offer: `Byline on Student Corner, ${inr(500)} per published article, and a certificate of publication.`,
    extras: "a certificate of publication",
  },
};

export const RULES = {
  /** Payment is only for writers who live in India; others get a byline and author box. */
  paidCountry: "India",
  outsideIndia: "Writers based outside India are welcome, with a byline and author box but no payment.",
  paidWithinDays: 15,
  paymentCondition: "once you've shared the piece and tagged @kakratian",
  feesDiscussed: "We aren't able to discuss fees before a pitch is accepted.",
  paidSlots: "We publish a limited number of paid pieces each month. When a month is full, accepted pieces move to the next month.",
  minAge: 18,
  ai: "AI tools only for research or grammar. The ideas, writing and voice must be yours.",
  original: "Your own work, not published anywhere else.",
  replyWithinDays: 14,
};

export const words = (t: TrackRule) => `${t.words.min.toLocaleString("en-IN")} to ${t.words.max.toLocaleString("en-IN")} words`;

export const payLine = (t: TrackRule) =>
  t.payINR.length > 1
    ? `${inr(t.payINR[0])} per published article, or ${inr(t.payINR[1])} with significant professional experience`
    : `${inr(t.payINR[0])} per published article`;

/** One line per rule decision, newest first. Mirror it in docs/GUEST-WRITERS.md. */
export const RULE_CHANGES: { date: string; change: string }[] = [
  { date: "2026-11-23", change: "Writers based outside India get a byline and author box, no payment. Rule book created; all pages read from it." },
  { date: "2026-11-22", change: "Two paid tracks: guest writers ₹1,000 or ₹2,000, student writers ₹500 plus a certificate. Kakrat Voices and T-shirts dropped." },
  { date: "2026-11-21", change: "Pitch form launched; email pitches no longer reviewed. Profile links, byline and student proof optional." },
];
