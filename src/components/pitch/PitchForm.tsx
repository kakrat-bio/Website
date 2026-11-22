"use client";

import { useState, type FormEvent, type ReactNode } from "react";

/**
 * The pitch form on /write-for-us and /student-corner. Posts JSON to the
 * Cloudflare Pages Function at /api/pitches, which stores it for review at
 * /admin/pitches. The checks here mirror functions/api/pitches/index.ts;
 * the server's checks are the ones that count.
 */

type Track = "guest" | "student";

const inputClass =
  "w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none";

function words(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

const TRACKS: { value: Track; label: string; note: string }[] = [
  {
    value: "guest",
    label: "Guest writer",
    note: "Researchers, professionals, PhD scholars and writers with first-hand knowledge of their topic. ₹1,000 per published article, or ₹2,000 with significant professional experience.",
  },
  {
    value: "student",
    label: "Student writer",
    note: "College and university students aged 18 and over, from undergraduates to PhD scholars. ₹500 per published article and a certificate of publication.",
  },
];

const DECLARATIONS: { value: string; label: string }[] = [
  { value: "original", label: "It's my own work and not published anywhere else." },
  { value: "not-a-job", label: "It's a pitch for an article, not a job application." },
  { value: "honorarium", label: "Payment is at the fixed rate for my track, sent after publication once I share the piece, and paid slots each month are limited." },
  { value: "share", label: "If it's published, I'll share it and tag @kakratian." },
  { value: "read-terms", label: "I've read the guidelines and terms." },
];

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>}
      <div className="mt-1.5">{children}</div>
      {error && (
        <p className="mt-1 text-xs text-accent" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Counter({ text, min, max }: { text: string; min: number; max: number }) {
  const n = words(text);
  const ok = n >= min && n <= max;
  return (
    <p className={`mt-1 text-right text-xs ${ok || n === 0 ? "text-ink-muted" : "text-accent"}`}>
      {n} / {min}–{max} words
    </p>
  );
}

function Section({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-5 border-t border-line pt-6">
      <legend className="font-display text-lg text-ink">{title}</legend>
      {intro && <p className="-mt-2 text-sm text-ink-muted">{intro}</p>}
      {children}
    </fieldset>
  );
}

export function PitchForm({ defaultTrack }: { defaultTrack?: Track }) {
  const [track, setTrack] = useState<Track | "">(defaultTrack ?? "");
  const [v, setV] = useState<Record<string, string>>({});
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [declarations, setDeclarations] = useState<string[]>([]);
  const [age18, setAge18] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: string) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [key]: e.target.value }));
  const val = (key: string) => v[key] ?? "";
  const toggle = (list: string[], setList: (x: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  function check(): Record<string, string> {
    const e: Record<string, string> = {};
    const req = (key: string, msg: string) => {
      if (val(key).trim().length < 2) e[key] = msg;
    };
    const range = (key: string, min: number, max: number, msg: string) => {
      const n = words(val(key));
      if (n < min || n > max) e[key] = msg;
    };
    if (!track) e.track = "Please choose a track.";
    req("name", "Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email").trim())) e.email = "Please enter a valid email address.";
    if (track === "student") {
      if (!age18) e.age18 = "Student Corner is open to students aged 18 and over.";
      req("institution", "Please enter your college or university.");
      req("courseYear", "Please enter your course and year.");
    } else if (track) {
      req("role", "Please enter your current role and organisation.");
      if (!val("experience")) e.experience = "Please choose your years of experience.";
    }
    if (platforms.length === 0) e.platforms = "Please tell us where you follow Kakrat.";
    req("handle", "Please give your handle, so we can find you.");
    if (val("articleTitle").trim().length < 3) e.articleTitle = "Please name a Kakrat article you've read.";
    range("articleThoughts", 10, 60, "Please write 10 to 60 words about the article.");
    if (!val("section")) e.section = "Please choose a section.";
    range("title", 2, 12, "Please keep the working title to 12 words or fewer.");
    range("outline", 60, 150, "Please write an outline of 60 to 150 words.");
    range("whyMe", 15, 60, "Please write 15 to 60 words.");
    if (!val("aiUse")) e.aiUse = "Please tell us how you'll use AI tools.";
    if (declarations.length < DECLARATIONS.length) e.declarations = "Please tick the box to submit.";
    return e;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const found = check();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError("A few answers need another look. They're marked below.");
      const first = document.getElementById(`pitch-${Object.keys(found)[0]}`);
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSending(true);
    try {
      const website = (event.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
      const res = await fetch("/api/pitches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...v, track, platforms, declarations, age18, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; field?: string };
      if (!res.ok || !data.ok) {
        if (data.field) setErrors({ [data.field]: data.error ?? "Please check this answer." });
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setSent(true);
      document.getElementById("pitch")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="rounded-sm border-l-4 border-accent bg-paper px-5 py-5 text-sm text-ink">
        <p className="font-display text-lg">Thank you, your pitch has reached us!</p>
        <p className="mt-2">
          Our editors will read it carefully. If we&apos;d like to take it forward, we&apos;ll write to you within 14
          days. Meanwhile, come and say hello on{" "}
          <a className="underline underline-offset-2" href="https://www.instagram.com/kakratian">Instagram</a>,{" "}
          <a className="underline underline-offset-2" href="https://x.com/kakratian">X</a> and{" "}
          <a className="underline underline-offset-2" href="https://www.linkedin.com/company/kakrat">LinkedIn</a>, where
          we share monthly themes and open calls first.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="pitch-website">Website</label>
        <input id="pitch-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {defaultTrack === "student" ? (
        <p className="text-sm text-ink-muted">
          You&apos;re pitching as a <span className="font-medium text-ink">student writer</span>. Not a student?{" "}
          <a className="underline underline-offset-2" href="/write-for-us#pitch">Pitch as a guest writer</a>.
        </p>
      ) : (
      <Section title="Your track">
        <div id="pitch-track" className="space-y-3" role="radiogroup" aria-label="Track">
          {TRACKS.map((t) => (
            <label
              key={t.value}
              className={`flex cursor-pointer gap-3 rounded-sm border px-4 py-3 text-sm ${
                track === t.value ? "border-accent bg-paper" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="track"
                value={t.value}
                checked={track === t.value}
                onChange={() => setTrack(t.value)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-ink">{t.label}</span>
                <span className="mt-0.5 block text-ink-muted">{t.note}</span>
              </span>
            </label>
          ))}
          <p className="text-xs text-ink-muted">
            PhD scholars can choose either track. We confirm the track and amount when we accept your pitch.
          </p>
          {errors.track && <p className="text-xs text-accent">{errors.track}</p>}
        </div>
      </Section>
      )}

      <Section title="About you">
        <Field id="pitch-name" label="Full name *" error={errors.name}>
          <input id="pitch-name" className={inputClass} autoComplete="name" value={val("name")} onChange={set("name")} />
        </Field>
        <Field id="pitch-byline" label="Byline name (optional)" hint="Only if you'd like a different name printed on the article." error={errors.byline}>
          <input id="pitch-byline" className={inputClass} value={val("byline")} onChange={set("byline")} />
        </Field>
        <Field id="pitch-email" label="Email *" error={errors.email}>
          <input id="pitch-email" type="email" className={inputClass} autoComplete="email" value={val("email")} onChange={set("email")} />
        </Field>

        {track === "student" ? (
          <>
            <div id="pitch-age18">
              <label className="flex gap-2 text-sm text-ink">
                <input type="checkbox" checked={age18} onChange={(e) => setAge18(e.target.checked)} className="mt-0.5" />
                I confirm I&apos;m 18 years old or older. *
              </label>
              {errors.age18 && <p className="mt-1 text-xs text-accent">{errors.age18}</p>}
            </div>
            <Field id="pitch-institution" label="College or university *" error={errors.institution}>
              <input id="pitch-institution" className={inputClass} value={val("institution")} onChange={set("institution")} />
            </Field>
            <Field id="pitch-courseYear" label="Course and year *" hint="For example, B.Sc. Biotechnology, 2nd year." error={errors.courseYear}>
              <input id="pitch-courseYear" className={inputClass} value={val("courseYear")} onChange={set("courseYear")} />
            </Field>
            <Field
              id="pitch-enrolment"
              label="Proof that you're a student (optional)"
              hint="Your college email address, or a link to a photo of your college ID."
              error={errors.enrolment}
            >
              <input id="pitch-enrolment" className={inputClass} value={val("enrolment")} onChange={set("enrolment")} />
            </Field>
          </>
        ) : (
          <>
            <Field id="pitch-role" label="Current role and organisation *" hint="For example, Senior Scientist, XYZ Institute." error={errors.role}>
              <input id="pitch-role" className={inputClass} value={val("role")} onChange={set("role")} />
            </Field>
            <Field id="pitch-experience" label="Years of experience in the field you're writing about *" error={errors.experience}>
              <select id="pitch-experience" className={inputClass} value={val("experience")} onChange={set("experience")}>
                <option value="">Choose one</option>
                <option value="under-2">Less than 2</option>
                <option value="2-5">2 to 5</option>
                <option value="5-10">5 to 10</option>
                <option value="over-10">More than 10</option>
              </select>
            </Field>
            <Field id="pitch-samples" label="Writing samples (optional)" hint="Up to three links to things you've written.">
              <textarea id="pitch-samples" rows={2} className={inputClass} value={val("samples")} onChange={set("samples")} />
            </Field>
          </>
        )}

        <Field
          id="pitch-profiles"
          label="Your profiles (optional)"
          hint="Links to one or more: LinkedIn, Instagram, X, Facebook, a website. We'd love to follow you."
          error={errors.profiles}
        >
          <textarea id="pitch-profiles" rows={2} placeholder="https://" className={inputClass} value={val("profiles")} onChange={set("profiles")} />
        </Field>
      </Section>

      <Section title="You and Kakrat">
        <div id="pitch-platforms">
          <p className="text-sm font-medium text-ink">Follow Kakrat on at least one of these *</p>
          <p className="mt-0.5 text-xs text-ink-muted">Tap a name to open our page, then tick where you follow us.</p>
          <div className="mt-2 space-y-2 text-sm text-ink">
            {[
              { value: "instagram", label: "Instagram", href: "https://www.instagram.com/kakratian", handle: "@kakratian" },
              { value: "x", label: "X", href: "https://x.com/kakratian", handle: "@kakratian" },
              { value: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/kakrat", handle: "Kakrat" },
            ].map((p) => (
              <label key={p.value} className="flex items-center gap-2">
                <input type="checkbox" checked={platforms.includes(p.value)} onChange={() => toggle(platforms, setPlatforms, p.value)} />
                <span>
                  {p.label} ·{" "}
                  <a className="underline underline-offset-2" href={p.href} target="_blank" rel="noopener noreferrer">
                    {p.handle}
                  </a>
                </span>
              </label>
            ))}
          </div>
          {errors.platforms && <p className="mt-1 text-xs text-accent">{errors.platforms}</p>}
        </div>
        <Field id="pitch-handle" label="Your handle there *" hint="For example, @yourname." error={errors.handle}>
          <input id="pitch-handle" className={inputClass} value={val("handle")} onChange={set("handle")} />
        </Field>
        <Field id="pitch-articleTitle" label="A Kakrat article you've read *" hint="The title is enough." error={errors.articleTitle}>
          <input id="pitch-articleTitle" className={inputClass} value={val("articleTitle")} onChange={set("articleTitle")} />
        </Field>
        <Field id="pitch-articleThoughts" label="What did you take from it? *" hint="A sentence or three, in your own words." error={errors.articleThoughts}>
          <textarea id="pitch-articleThoughts" rows={3} className={inputClass} value={val("articleThoughts")} onChange={set("articleThoughts")} />
          <Counter text={val("articleThoughts")} min={10} max={60} />
        </Field>
      </Section>

      <Section title="Your idea" intro="An outline is all we need, not the full article.">
        <Field id="pitch-section" label="Section *" error={errors.section}>
          <select id="pitch-section" className={inputClass} value={val("section")} onChange={set("section")}>
            <option value="">Choose one</option>
            <option value="science-technology">Science &amp; Technology</option>
            <option value="business-innovation">Business &amp; Innovation</option>
            <option value="culture-ideas">Culture &amp; Ideas</option>
          </select>
        </Field>
        <Field id="pitch-title" label="Working title *" hint="12 words or fewer." error={errors.title}>
          <input id="pitch-title" className={inputClass} value={val("title")} onChange={set("title")} />
          <Counter text={val("title")} min={2} max={12} />
        </Field>
        <Field id="pitch-outline" label="Outline *" hint="Your main point, what you'll cover, and how it ends." error={errors.outline}>
          <textarea id="pitch-outline" rows={7} className={inputClass} value={val("outline")} onChange={set("outline")} />
          <Counter text={val("outline")} min={60} max={150} />
        </Field>
        <Field id="pitch-whyMe" label="Why you? *" hint="What you know about this first-hand." error={errors.whyMe}>
          <textarea id="pitch-whyMe" rows={3} className={inputClass} value={val("whyMe")} onChange={set("whyMe")} />
          <Counter text={val("whyMe")} min={15} max={60} />
        </Field>
        <Field id="pitch-aiUse" label="How will you use AI tools? *" hint="The ideas and writing should be yours." error={errors.aiUse}>
          <select id="pitch-aiUse" className={inputClass} value={val("aiUse")} onChange={set("aiUse")}>
            <option value="">Choose one</option>
            <option value="none">Not at all</option>
            <option value="research">For research only</option>
            <option value="tidying">For grammar and tidying only</option>
            <option value="research-and-tidying">For research and tidying</option>
          </select>
        </Field>
      </Section>

      <div id="pitch-declarations" className="border-t border-line pt-6 text-sm text-ink">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1 shrink-0 self-start"
            checked={declarations.length === DECLARATIONS.length}
            onChange={(e) => setDeclarations(e.target.checked ? DECLARATIONS.map((d) => d.value) : [])}
          />
          <span>
            I confirm that:
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-ink-muted">
              {DECLARATIONS.map((d) => (
                <li key={d.value}>{d.label}</li>
              ))}
            </ul>
          </span>
        </label>
        {errors.declarations && <p className="mt-1 text-xs text-accent">{errors.declarations}</p>}
      </div>

      {formError && (
        <p role="alert" className="text-sm text-accent">
          {formError}
        </p>
      )}
      <button
        type="submit"
        disabled={sending}
        className="rounded-sm bg-accent px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {sending ? "Sending…" : "Send my pitch"}
      </button>
    </form>
  );
}
