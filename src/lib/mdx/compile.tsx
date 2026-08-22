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
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
            [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
          ],
        },
      }}
    />
  );
}
