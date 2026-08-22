import { z } from "zod";

/**
 * Topics are a fixed, curated taxonomy (not open-ended tags). Adding a topic
 * is an editorial decision — update this enum *and* src/lib/content/topics.ts.
 */
export const TOPICS = [
  "science",
  "biotechnology",
  "entrepreneurship",
  "technology",
  "storytelling",
  "philosophy",
  "ideas",
] as const;

export const topicSchema = z.enum(TOPICS);
export type Topic = z.infer<typeof topicSchema>;

/**
 * A single cited source. Used for the optional "Sources & Notes" block on
 * an article. Kept deliberately lightweight (not a full academic citation
 * format) so it reads naturally in an editorial piece, not a paper.
 */
export const referenceSchema = z.object({
  title: z.string(),
  url: z.url(),
  publisher: z.string().optional(),
  note: z.string().optional(),
});
export type Reference = z.infer<typeof referenceSchema>;

export const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string().optional(), // e.g. "Founder, Kakrat" / "Contributing Writer"
  bio: z.string(),
  avatar: z.string().optional(),
  /** Canonical profile links for Person JSON-LD `sameAs`. */
  sameAs: z.array(z.url()).default([]),
  website: z.url().optional(),
});
export type Author = z.infer<typeof authorSchema>;

/**
 * Editorial credibility layer: every field here is optional except the
 * dates. A storytelling or philosophy essay can carry none of
 * references/editorialNote/sourceNote and simply won't render a sourcing
 * block. A science/biotech piece is expected to populate `references`.
 */
export const articleFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be kebab-case"),
  description: z.string().max(200),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  /** One or more author ids, referencing content/authors/<id>.json */
  authors: z.array(z.string()).min(1),
  topic: topicSchema,
  tags: z.array(z.string()).default([]),
  coverImage: z.string(),
  coverImageAlt: z.string(),
  draft: z.boolean().default(false),
  /** Set when this piece was originally published elsewhere. */
  canonicalUrl: z.url().optional(),
  /** Formal citations — primarily for science/biotechnology reporting. */
  references: z.array(referenceSchema).default([]),
  /** Freeform note on methodology, corrections, or provenance. */
  editorialNote: z.string().optional(),
  /** Short note on sourcing philosophy, distinct from a formal reference list. */
  sourceNote: z.string().optional(),
});
export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

export type Article = ArticleFrontmatter & {
  content: string; // raw MDX body
  readingTimeMinutes: number;
  /** Filesystem-relative path, used only for error messages / debugging. */
  filePath: string;
};
