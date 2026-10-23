import { NEWSLETTER_FORM_ACTION } from "@/lib/seo/constants";

/**
 * Newsletter sign-up box shown at the end of each article.
 *
 * A plain HTML form that posts straight to the newsletter provider
 * (Buttondown's embed endpoint), so it needs no JavaScript and no backend
 * of our own. The provider handles double opt-in and unsubscribes.
 */
export function NewsletterSignup() {
  return (
    <section
      aria-labelledby="newsletter-heading"
      className="mt-12 rounded-sm border border-line bg-surface px-6 py-7"
    >
      <h2 id="newsletter-heading" className="font-display text-xl text-ink">
        Get the next essay by email
      </h2>
      <p className="mt-2 text-sm text-ink-muted">
        One short email when a new piece is published. No spam, and you can unsubscribe anytime.
      </p>
      <form
        action={NEWSLETTER_FORM_ACTION}
        method="post"
        target="_blank"
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
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
          className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none sm:flex-1"
        />
        <input type="hidden" name="embed" value="1" />
        <button
          type="submit"
          className="rounded-sm bg-accent px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Subscribe
        </button>
      </form>
    </section>
  );
}
