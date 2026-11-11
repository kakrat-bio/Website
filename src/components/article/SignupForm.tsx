"use client";

import type { FormEvent } from "react";
import { NEWSLETTER_FORM_ACTION, SIGNUP_SHEET_URL } from "@/lib/seo/constants";

const inputClass =
  "w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none";

/**
 * The sign-up form itself. It still posts straight to Buttondown (which sends
 * the confirmation email and handles unsubscribes), so it works without
 * JavaScript. When JavaScript is on, it also sends a copy of the first name,
 * email and page to the "Kakrat subscribers" Google Sheet via a small Apps
 * Script web app (SIGNUP_SHEET_URL). That copy is fire-and-forget: if it
 * fails, the Buttondown sign-up still goes through.
 */
export function SignupForm() {
  function copyToSheet(event: FormEvent<HTMLFormElement>) {
    if (!SIGNUP_SHEET_URL) return;
    try {
      const data = new FormData(event.currentTarget);
      const body = new URLSearchParams({
        email: String(data.get("email") ?? ""),
        name: String(data.get("first_name") ?? ""),
        page: window.location.pathname,
      });
      navigator.sendBeacon(SIGNUP_SHEET_URL, body);
    } catch {
      // Never block the real sign-up.
    }
  }

  return (
    <form
      action={NEWSLETTER_FORM_ACTION}
      method="post"
      target="_blank"
      onSubmit={copyToSheet}
      className="mt-4 flex flex-col gap-3 sm:flex-row"
    >
      <label htmlFor="newsletter-name" className="sr-only">
        First name (optional)
      </label>
      <input
        id="newsletter-name"
        type="text"
        name="first_name"
        autoComplete="given-name"
        maxLength={80}
        placeholder="First name (optional)"
        className={`${inputClass} sm:w-44`}
      />
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className={`${inputClass} sm:flex-1`}
      />
      <input type="hidden" name="embed" value="1" />
      <button
        type="submit"
        className="rounded-sm bg-accent px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Subscribe
      </button>
    </form>
  );
}
