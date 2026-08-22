import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import { mdxComponents } from "@/components/article/mdx-components";

/** Renders an article's MDX body. Compiled server-side, at build time — no client JS required to read the content. */
export function ArticleContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            // "append" (not "wrap"): the heading text itself stays plain
            // text, not a link — only a small appended jump-link is
            // clickable, with its own label, so screen readers don't
            // announce every heading as a self-referential link.
            [
              rehypeAutolinkHeadings,
              {
                behavior: "append",
                properties: { className: ["anchor-link"], ariaLabel: "Link to this section" },
                content: {
                  type: "element",
                  tagName: "span",
                  properties: { className: ["anchor-link-icon"], "aria-hidden": "true" },
                  children: [{ type: "text", value: " #" }],
                },
              },
            ],
            [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
          ],
        },
      }}
    />
  );
}
