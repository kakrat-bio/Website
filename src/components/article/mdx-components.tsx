import type { MDXComponents } from "mdx/types";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";

/**
 * MDX images. `width`/`height` are honored when an author explicitly passes
 * them (only possible via inline JSX `<img>` in MDX, not `![]()` syntax) —
 * otherwise ResponsiveImage infers the real aspect ratio, either from the
 * pre-generated manifest or, failing that, the source file's own intrinsic
 * dimensions, so an image is never stretched to a guessed box.
 */
export const mdxComponents: MDXComponents = {
  img: ({ src, alt, width, height }) => {
    if (!src || typeof src !== "string") return null;
    const explicitWidth = typeof width === "number" ? width : Number(width) || undefined;
    const explicitHeight = typeof height === "number" ? height : Number(height) || undefined;

    return (
      <span className="my-8 block">
        <ResponsiveImage
          src={src}
          alt={alt ?? ""}
          width={explicitWidth}
          height={explicitHeight}
          className="rounded-sm"
        />
      </span>
    );
  },
};
