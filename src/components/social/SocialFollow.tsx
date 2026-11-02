import clsx from "clsx";
import { SOCIAL_LINKS } from "@/lib/seo/constants";

type SocialFollowProps = {
  /**
   * - "compact": small pills for the site header, visible at every screen size.
   * - "buttons": larger labelled buttons with the handle, for content areas
   *   (the newsletter box) where someone has just finished reading.
   * - "list": plain stacked links, for the footer column.
   */
  variant: "compact" | "buttons" | "list";
  className?: string;
};

/**
 * Kakrat's social accounts (Instagram, X), from SOCIAL_LINKS in
 * src/lib/seo/constants.ts — add a network there and it appears everywhere
 * this component is used. Text labels rather than brand logos: they read
 * clearly at any size and need no third-party artwork.
 */
export function SocialFollow({ variant, className }: SocialFollowProps) {
  if (variant === "compact") {
    return (
      <ul aria-label="Follow Kakrat" className={clsx("flex items-center gap-1.5", className)}>
        {SOCIAL_LINKS.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="me noopener"
              aria-label={`Follow Kakrat on ${s.label}`}
              className="block rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  if (variant === "buttons") {
    return (
      <ul aria-label="Follow Kakrat" className={clsx("flex flex-wrap gap-2", className)}>
        {SOCIAL_LINKS.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="me noopener"
              className="inline-flex items-baseline gap-1.5 rounded-sm border border-accent px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white"
            >
              {s.label}
              <span className="text-xs font-normal opacity-80">{s.handle}</span>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={clsx("space-y-1.5", className)}>
      {SOCIAL_LINKS.map((s) => (
        <li key={s.url}>
          <a href={s.url} target="_blank" rel="me noopener" className="hover:text-ink">
            {s.label} <span className="text-xs">{s.handle}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
