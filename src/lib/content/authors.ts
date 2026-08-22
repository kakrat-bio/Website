import fs from "node:fs";
import path from "node:path";
import { authorSchema, type Author } from "@/types/content";

const AUTHORS_DIR = path.join(process.cwd(), "content", "authors");

let cache: Author[] | null = null;

export function getAllAuthors(): Author[] {
  if (cache) return cache;

  const files = fs.readdirSync(AUTHORS_DIR).filter((f) => f.endsWith(".json"));
  cache = files.map((file) => {
    const raw = fs.readFileSync(path.join(AUTHORS_DIR, file), "utf8");
    const parsed = authorSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      throw new Error(`Invalid author file ${file}:\n${parsed.error.message}`);
    }
    return parsed.data;
  });
  return cache;
}

export function getAuthorById(id: string): Author | undefined {
  return getAllAuthors().find((a) => a.id === id);
}
