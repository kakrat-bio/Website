# Article frontmatter

Schema enforced by `src/types/content.ts` (zod) — the build fails on
invalid frontmatter, so this doubles as documentation and validation.

```yaml
---
title: "Headline"
slug: "kebab-case-matching-filename-intent"   # permanent — do not change after publishing
description: "150-200 char summary for meta description / cards."
publishedAt: "2026-01-01"
updatedAt: "2026-01-05"                        # optional, only if substantively edited post-publish
authors: ["author-id"]                         # one or more, matching content/authors/<id>.json
topic: "science-technology"                    # one of the three fixed pillars — see src/lib/content/topics.ts
tags: ["tag-one", "tag-two"]
coverImage: "/images/covers/example.svg"
coverImageAlt: "Description of the cover image"
draft: false                                   # true = excluded from production build
canonicalUrl: "https://example.com/original"   # optional, only for cross-posted pieces

# Editorial credibility layer — all optional. Populate what fits the piece;
# a storytelling/philosophy essay can omit all three and no "Sources &
# notes" section will render. A reported science/biotech piece should
# populate `references` at minimum.
references:
  - title: "Cited paper or article title"
    url: "https://..."
    publisher: "Journal or outlet name"
    note: "One line on why this is cited / what it supports."
sourceNote: "A short note on sourcing approach for this piece."
editorialNote: "Corrections, provenance, or other editorial context."
---
```

Reading time is computed automatically from the MDX body — do not add it to
frontmatter.
