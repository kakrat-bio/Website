import { SignupForm } from "@/components/article/SignupForm";
import { SocialFollow } from "@/components/social/SocialFollow";

type NewsletterSignupProps = {
  /** Heading above the form. Defaults to the article-page wording. */
  heading?: string;
  /** One line under the heading. */
  blurb?: string;
  /** Extra classes for spacing in the host page (defaults to a top margin). */
  className?: string;
};

/**
 * Newsletter sign-up box. Shown at the end of each article and on the
 * home, about, archive, topic, tag and author pages.
 *
 * The form (SignupForm) posts straight to the newsletter provider
 * (Buttondown's embed endpoint), which handles double opt-in and
 * unsubscribes, and also copies name + email to the subscribers Google Sheet.
 *
 * The section carries id="subscribe" so other pages can link to it
 * (e.g. the footer's "Subscribe" link points at /about#subscribe).
 * Render at most one per page.
 */
export function NewsletterSignup({
  heading = "Get the next essay by email",
  blurb = "One short email when a new piece is published. No spam, your email is never shared, and you can unsubscribe anytime.",
  className = "mt-12",
}: NewsletterSignupProps) {
  return (
    <section
      id="subscribe"
      aria-labelledby="newsletter-heading"
      className={`${className} scroll-mt-24 rounded-sm border border-line bg-surface px-6 py-7`}
    >
      <h2 id="newsletter-heading" className="font-display text-xl text-ink">
        {heading}
      </h2>
      <p className="mt-2 text-sm text-ink-muted">{blurb}</p>
      <SignupForm />
      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm font-medium text-ink">Or follow Kakrat</p>
        <SocialFollow variant="buttons" className="mt-3" />
      </div>
    </section>
  );
}
