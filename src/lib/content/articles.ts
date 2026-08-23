import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { articleFrontmatterSchema, type Article, type Topic } from "@/types/content";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");
const isProd = process.env.NODE_ENV === "production";

function walkMdxFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkMdxFiles(full);
    return entry.name.endsWith(".mdx") ? [full] : [];
  });
}

let cache: Article[] | null = null;

/**
 * Loads and validates every article in content/articles. Cached so repeated
 * calls within one render/build don't re-read the filesystem — but only in
 * production. In `next dev`, this module stays loaded across requests (it's
 * not part of the page's module graph Next watches), so caching there would
 * mean an edited .mdx file never shows up without restarting the dev server.
 */
export function getAllArticles(): Article[] {
  if (cache && isProd) return cache;

  const files = walkMdxFiles(ARTICLES_DIR);
  const articles = files.map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    const parsed = articleFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(
        `Invalid frontmatter in ${path.relative(process.cwd(), filePath)}:\n${parsed.error.message}`,
      );
    }

    // Guards against a copy-pasted frontmatter block silently publishing at
    // an unexpected URL: the filename (sans extension) must match `slug`.
    const expectedSlug = path.basename(filePath, ".mdx");
    if (parsed.data.slug !== expectedSlug) {
      throw new Error(
        `Slug mismatch in ${path.relative(process.cwd(), filePath)}: ` +
          `frontmatter slug is "${parsed.data.slug}" but the filename implies "${expectedSlug}". ` +
          "Rename the file or fix the slug so they agree.",
      );
    }

    const article: Article = {
      ...parsed.data,
      content,
      readingTimeMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
      filePath: path.relative(process.cwd(), filePath),
    };
    return article;
  });

  const visible = isProd ? articles.filter((a) => !a.draft) : articles;

  const bySlug = new Map<string, Article>();
  for (const a of visible) {
    if (bySlug.has(a.slug)) {
      throw new Error(`Duplicate article slug "${a.slug}" (${a.filePath})`);
    }
    bySlug.set(a.slug, a);
  }

  cache = visible.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  );
  return cache;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find((a) => a.slug === slug);
}

export function getArticlesByTopic(topic: Topic): Article[] {
  return getAllArticles().filter((a) => a.topic === topic);
}

export function getArticlesByTag(tag: string): Article[] {
  return getAllArticles().filter((a) => a.tags.includes(tag));
}

export function getArticlesByAuthor(authorId: string): Article[] {
  return getAllArticles().filter((a) => a.authors.includes(authorId));
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const a of getAllArticles()) for (const t of a.tags) tags.add(t);
  return Array.from(tags).sort();
}

/**
 * Related articles by simple overlap scoring: same topic is worth more than
 * a shared tag. No embeddings/ML — deliberately static and free to compute.
 */
export function getRelatedArticles(article: Article, limit = 3): Article[] {
  const scored = getAllArticles()
    .filter((a) => a.slug !== article.slug)
    .map((a) => {
      let score = 0;
      if (a.topic === article.topic) score += 2;
      score += a.tags.filter((t) => article.tags.includes(t)).length;
      return { article: a, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.article.publishedAt.getTime() - a.article.publishedAt.getTime());

  return scored.slice(0, limit).map((s) => s.article);
}
