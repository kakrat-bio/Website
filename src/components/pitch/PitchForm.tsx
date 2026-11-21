"use client";

import { useState, type FormEvent, type ReactNode } from "react";

/**
 * The pitch form on /write-for-us and /student-corner. Posts JSON to the
 * Cloudflare Pages Function at /api/pitches, which stores it for review at
 * /admin/pitches. The checks here mirror functions/api/pitches/index.ts;
 * the server's checks are the ones that count.
 */

type Track = "voices" | "guest" | "student";

const inputClass =
  "w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none";

function words(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

const TRACKS: { value: Track; label: string; note: string }[] = [
  {
    value: "voices",
    label: "Kakrat Voices",
    note: "Experienced professionals with a track record in their field. Byline, T-shirt, and a ₹2,000 honorarium at the editor's discretion.",
  },
  {
    value: "guest",
    label: "Guest contributor",
    note: "Professionals, PhD scholars and writers with first-hand knowledge of their topic. Byline and author box.",
  },
  {
    value: "student",
    label: "Student Corner",
    note: "College and university students aged 18 and over, from undergraduates to PhD scholars. Byline and T-shirt.",
  },
];

const DECLARATIONS: { value: string; label: string }[] = [
  { value: "original", label: "This pitch is my own work and hasn't been published anywhere, including on my blog." },
  { value: "not-a-job", label: "I understand this is a pitch for an article, not a job, internship or freelance application." },
  { value: "honorarium", label: "I understand the honorarium is offered only for selected Kakrat Voices pieces, at the editor's discretion." },
  { value: "share", label: "If my piece is published, I'll share it on my social media and tag @kakratian." },
  { value: "read-terms", label: "I've read the guidelines and terms on this page." },
];

const STEPS = ["About you", "You and Kakrat", "Your idea", "Confirm"];
const STEP_FIELDS: string[][] = [
  ["track", "name", "byline", "email", "age18", "institution", "courseYear", "enrolment", "role", "experience", "profileUrl"],
  ["platforms", "handle", "articleUrl", "articleThoughts"],
  ["section", "title", "outline", "whyMe", "aiUse"],
  ["declarations"],
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
  const [step, setStep] = useState(0);

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
    req("byline", "Please enter your byline name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email").trim())) e.email = "Please enter a valid email address.";
    if (track === "student") {
      if (!age18) e.age18 = "Student Corner is open to students aged 18 and over.";
      req("institution", "Please enter your college or university.");
      req("courseYear", "Please enter your course and year.");
      req("enrolment", "Please give your institutional email, or a link to a photo of your college ID.");
    } else if (track) {
      req("role", "Please enter your current role and organisation.");
      if (!val("experience")) e.experience = "Please choose your years of experience.";
    }
    if (!/^https?:\/\/\S+\.\S+/.test(val("profileUrl").trim()))
      e.profileUrl = "Please paste a full profile link, starting with https://";
    if (platforms.length === 0) e.platforms = "Please tell us where you follow Kakrat.";
    req("handle", "Please give your handle, so we can find you.");
    if (!/^https?:\/\/(www\.)?kakrat\.com\/articles\/[a-z0-9-]+/i.test(val("articleUrl").trim()))
      e.articleUrl = "Please paste the link to a Kakrat article, like https://kakrat.com/articles/…";
    range("articleThoughts", 10, 60, "Please write 10 to 60 words about the article.");
    if (!val("section")) e.section = "Please choose a section.";
    range("title", 2, 12, "Please keep the working title to 12 words or fewer.");
    range("outline", 60, 150, "Please write an outline of 60 to 150 words.");
    range("whyMe", 15, 60, "Please write 15 to 60 words.");
    if (!val("aiUse")) e.aiUse = "Please tell us how you'll use AI tools.";
    if (declarations.length < DECLARATIONS.length) e.declarations = "Please tick all the boxes to submit.";
    return e;
  }

  function stepErrors(i: number): Record<string, string> {
    const all = check();
    return Object.fromEntries(Object.entries(all).filter(([k]) => STEP_FIELDS[i].includes(k)));
  }

  function goTo(i: number) {
    setStep(i);
    setFormError(null);
    document.getElementById("pitch")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function next() {
    const found = stepErrors(step);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError("A few answers need another look. They're marked below.");
      document.getElementById(`pitch-${Object.keys(found)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    goTo(step + 1);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (step < STEPS.length - 1) {
      next();
      return;
    }
    const found = check();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0];
      const at = STEP_FIELDS.findIndex((f) => f.includes(firstKey));
      if (at >= 0 && at !== step) setStep(at);
      setFormError("A few answers need another look. They're marked below.");
      setTimeout(() => document.getElementById(`pitch-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
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

      <ol className="flex gap-2 text-xs" aria-label="Steps">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <span className={`block h-1.5 rounded-full ${i <= step ? "bg-accent" : "bg-line"}`} />
            <span className={`mt-1.5 block ${i === step ? "font-medium text-ink" : "text-ink-muted"}`}>
              <span className="sr-only">{i === step ? "Current step: " : ""}</span>
              {label}
            </span>
          </li>
        ))}
      </ol>
      <p className="-mt-4 text-xs text-ink-muted">
        Step {step + 1} of {STEPS.length}
      </p>

      {step === 0 && defaultTrack === "student" && (
        <p className="text-sm text-ink-muted">
          You&apos;re pitching for <span className="font-medium text-ink">Student Corner</span>. Working, not studying?{" "}
          <a className="underline underline-offset-2" href="/write-for-us#pitch">Pitch as a guest contributor</a>.
        </p>
      )}

      {step === 0 && !defaultTrack && (
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
            Not sure? Pick the closest one. Our editors will suggest another track if it suits your piece better.
          </p>
          {errors.track && <p className="text-xs text-accent">{errors.track}</p>}
        </div>
      </Section>
      )}

      {step === 0 && (
      <Section title="About you">
        <Field id="pitch-name" label="Full name *" hint="As on your ID." error={errors.name}>
          <input id="pitch-name" className={inputClass} autoComplete="name" value={val("name")} onChange={set("name")} />
        </Field>
        <Field id="pitch-byline" label="Byline name *" hint="The name you'd like printed on the article." error={errors.byline}>
          <input id="pitch-byline" className={inputClass} value={val("byline")} onChange={set("byline")} />
        </Field>
        <Field id="pitch-email" label="Email *" hint="We'll reply here." error={errors.email}>
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
            <Field id="pitch-courseYear" label="Course and year *" hint="For example, B.Sc. Biotechnology, 2nd year, or PhD, 3rd year." error={errors.courseYear}>
              <input id="pitch-courseYear" className={inputClass} value={val("courseYear")} onChange={set("courseYear")} />
            </Field>
            <Field
              id="pitch-enrolment"
              label="Proof that you're a student *"
              hint='Your institutional email address, or a Google Drive link (shared as "Anyone with the link") to a photo of your college ID.'
              error={errors.enrolment}
            >
              <input id="pitch-enrolment" className={inputClass} value={val("enrolment")} onChange={set("enrolment")} />
            </Field>
            <Field id="pitch-faculty" label="A faculty member who can vouch for you (optional)" hint="Name, department and email.">
              <input id="pitch-faculty" className={inputClass} value={val("faculty")} onChange={set("faculty")} />
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
          id="pitch-profileUrl"
          label="Profile link *"
          hint="LinkedIn, an institution or company page, a personal site, or a byline elsewhere. It helps us see the real person behind each pitch."
          error={errors.profileUrl}
        >
          <input id="pitch-profileUrl" type="url" inputMode="url" placeholder="https://" className={inputClass} value={val("profileUrl")} onChange={set("profileUrl")} />
        </Field>
      </Section>
      )}

      {step === 1 && (
      <Section title="You and Kakrat" intro="We love hearing from people who already read Kakrat.">
        <div id="pitch-platforms">
          <p className="text-sm font-medium text-ink">Where do you follow Kakrat? *</p>
          <p className="mt-0.5 text-xs text-ink-muted">Not following yet? It takes a second, and it&apos;s where we share themes and open calls first.</p>
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
        <Field id="pitch-handle" label="Your handle on that platform *" hint="So we can say hello, for example @yourname." error={errors.handle}>
          <input id="pitch-handle" className={inputClass} value={val("handle")} onChange={set("handle")} />
        </Field>
        <Field id="pitch-articleUrl" label="Link to a Kakrat article you've read *" hint="Copy it from your browser's address bar." error={errors.articleUrl}>
          <input id="pitch-articleUrl" type="url" inputMode="url" placeholder="https://kakrat.com/articles/…" className={inputClass} value={val("articleUrl")} onChange={set("articleUrl")} />
        </Field>
        <Field id="pitch-articleThoughts" label="What did you make of it? *" hint="A sentence or three." error={errors.articleThoughts}>
          <textarea id="pitch-articleThoughts" rows={3} className={inputClass} value={val("articleThoughts")} onChange={set("articleThoughts")} />
          <Counter text={val("articleThoughts")} min={10} max={60} />
        </Field>
      </Section>
      )}

      {step === 2 && (
      <Section title="Your idea" intro="An outline is all we need. Please don't write the full article yet.">
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
        <Field id="pitch-outline" label="Outline *" hint="Your main point, the three or four things you'll cover, and how it ends." error={errors.outline}>
          <textarea id="pitch-outline" rows={7} className={inputClass} value={val("outline")} onChange={set("outline")} />
          <Counter text={val("outline")} min={60} max={150} />
        </Field>
        <Field id="pitch-whyMe" label="Why are you the right person to write this? *" hint="What you know about it first-hand." error={errors.whyMe}>
          <textarea id="pitch-whyMe" rows={3} className={inputClass} value={val("whyMe")} onChange={set("whyMe")} />
          <Counter text={val("whyMe")} min={15} max={60} />
        </Field>
        <Field id="pitch-aiUse" label="How will you use AI tools for this piece? *" hint="AI can help you research or tidy up, but the ideas, writing and voice should be yours." error={errors.aiUse}>
          <select id="pitch-aiUse" className={inputClass} value={val("aiUse")} onChange={set("aiUse")}>
            <option value="">Choose one</option>
            <option value="none">Not at all</option>
            <option value="research">For research only</option>
            <option value="tidying">For grammar and tidying only</option>
            <option value="research-and-tidying">For research and tidying</option>
          </select>
        </Field>
      </Section>
      )}

      {step === 3 && (
      <Section title="Almost done">
        <div id="pitch-declarations" className="space-y-2 text-sm text-ink">
          {DECLARATIONS.map((d) => (
            <label key={d.value} className="flex gap-2">
              <input
                type="checkbox"
                className="mt-0.5 shrink-0"
                checked={declarations.includes(d.value)}
                onChange={() => toggle(declarations, setDeclarations, d.value)}
              />
              <span>{d.label}</span>
            </label>
          ))}
          {errors.declarations && <p className="text-xs text-accent">{errors.declarations}</p>}
        </div>
      </Section>
      )}

      {formError && (
        <p role="alert" className="text-sm text-accent">
          {formError}
        </p>
      )}
      <div className="flex items-center gap-4">
        {step > 0 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="rounded-sm border border-line px-5 py-2.5 text-sm font-medium text-ink hover:border-accent"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={sending}
          className="rounded-sm bg-accent px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {step < STEPS.length - 1 ? "Next" : sending ? "Sending…" : "Send my pitch"}
        </button>
      </div>
    </form>
  );
}
