import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getManifestEntry } from "@/lib/images/manifest";

type CommonProps = {
  src: string;
  alt: string;
  /** `<picture>` sizes attribute. Defaults to a sensible full-bleed guess. */
  sizes?: string;
  priority?: boolean;
  className?: string;
};

type FillProps = CommonProps & {
  /** Absolute cover-crop mode — parent must be `position: relative` with a fixed aspect ratio (see ArticleCard). */
  fill: true;
};

type NaturalProps = CommonProps & {
  fill?: false;
  /** Explicit override — otherwise inferred from the manifest, or the file's real dimensions for local images. */
  width?: number;
  height?: number;
};

export type ResponsiveImageProps = FillProps | NaturalProps;

const dimCache = new Map<string, { width: number; height: number } | null>();

/** Reads intrinsic dimensions of a local file under public/ so unprocessed images never get stretched. */
async function readLocalDimensions(src: string): Promise<{ width: number; height: number } | null> {
  if (!src.startsWith("/")) return null; // remote URL — can't read from disk
  if (dimCache.has(src)) return dimCache.get(src) ?? null;

  const filePath = path.join(process.cwd(), "public", src);
  if (!fs.existsSync(filePath)) {
    dimCache.set(src, null);
    return null;
  }
  try {
    const meta = await sharp(filePath).metadata();
    const result = meta.width && meta.height ? { width: meta.width, height: meta.height } : null;
    dimCache.set(src, result);
    return result;
  } catch {
    dimCache.set(src, null);
    return null;
  }
}

/**
 * Renders a responsive image using pre-generated WebP variants (see
 * scripts/optimize-images.mjs) when the manifest has an entry for `src`.
 * Falls back to the raw `src` file directly otherwise — always preserving
 * its real aspect ratio, never stretching it to a guessed box (see
 * content/images-src/README.md for the full pipeline).
 */
export async function ResponsiveImage(props: ResponsiveImageProps) {
  const { src, alt, priority = false, className } = props;
  const sizes = props.sizes ?? (props.fill ? "100vw" : "(min-width: 768px) 720px, 100vw");
  const manifestEntry = getManifestEntry(src);
  const loading = priority ? "eager" : "lazy";
  const fetchPriority = priority ? "high" : undefined;

  if (props.fill) {
    const boxClass = `absolute inset-0 h-full w-full object-cover ${className ?? ""}`;
    if (manifestEntry) {
      return (
        <picture>
          <source type="image/webp" srcSet={buildSrcSet(manifestEntry)} sizes={sizes} />
          <img
            src={manifestEntry.fallback}
            alt={alt}
            className={boxClass}
            loading={loading}
            fetchPriority={fetchPriority}
            decoding="async"
          />
        </picture>
      );
    }
    // No manifest entry (e.g. current SVG placeholders) — render the source
    // directly. next/image would add nothing here: `unoptimized` mode never
    // generates a srcset, so this is equivalent, without the extra wrapper.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={boxClass}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
      />
    );
  }

  // Natural (inline, aspect-ratio-preserving) mode.
  if (manifestEntry) {
    return (
      <picture>
        <source type="image/webp" srcSet={buildSrcSet(manifestEntry)} sizes={sizes} />
        <img
          src={manifestEntry.fallback}
          alt={alt}
          width={manifestEntry.width}
          height={manifestEntry.height}
          style={{ width: "100%", height: "auto" }}
          className={className}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
        />
      </picture>
    );
  }

  const explicitDims = props.width && props.height ? { width: props.width, height: props.height } : null;
  const dims = explicitDims ?? (await readLocalDimensions(src));

  // No manifest entry — same rationale as the fill-mode fallback above.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={dims?.width}
      height={dims?.height}
      style={dims ? { width: "100%", height: "auto" } : undefined}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
    />
  );
}

function buildSrcSet(entry: { variants: { width: number; path: string }[] }): string {
  return entry.variants.map((v) => `${v.path} ${v.width}w`).join(", ");
}
