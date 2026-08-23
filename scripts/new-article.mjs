#!/usr/bin/env node
// Scaffolds a new article: node scripts/new-article.mjs "My Title" topic
import fs from "node:fs";
import path from "node:path";

const [title, topic] = process.argv.slice(2);

if (!title || !topic) {
  console.error('Usage: node scripts/new-article.mjs "Article Title" <topic>');
  console.error(
    "Topics: science, biotechnology, entrepreneurship, technology, storytelling, philosophy, ideas",
  );
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, "")
  .replace(/\s+/g, "-");

const year = new Date().getFullYear();
const dir = path.join(process.cwd(), "content", "articles", String(year));
fs.mkdirSync(dir, { recursive: true });

const filePath = path.join(dir, `${slug}.mdx`);
if (fs.existsSync(filePath)) {
  console.error(`Already exists: ${filePath}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

const frontmatter = `---
title: "${title}"
slug: "${slug}"
description: ""
publishedAt: "${today}"
authors: ["tanay-bhatt"]
topic: "${topic}"
tags: []
coverImage: "/images/covers/${topic}.svg"
coverImageAlt: ""
draft: true
---

Write here.
`;

fs.writeFileSync(filePath, frontmatter);
console.log(`Created ${path.relative(process.cwd(), filePath)}`);
