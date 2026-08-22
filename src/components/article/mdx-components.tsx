import type { MDXComponents } from "mdx/types";
import Image from "next/image";

export const mdxComponents: MDXComponents = {
  img: ({ src, alt }) => {
    if (!src || typeof src !== "string") return null;
    return (
      <span className="my-8 block">
        <Image
          src={src}
          alt={alt ?? ""}
          width={1200}
          height={675}
          className="w-full rounded-sm"
          sizes="(min-width: 768px) 720px, 100vw"
        />
      </span>
    );
  },
};
