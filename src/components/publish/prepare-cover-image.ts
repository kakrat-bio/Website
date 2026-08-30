const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 4000;
const VARIANT_WIDTHS = [480, 768, 1200, 1600] as const;

const SOURCE_EXTENSIONS: Record<string, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type PreparedCoverImage = {
  source: File;
  variants: File[];
  fallback: File;
  metadata: {
    width: number;
    height: number;
    sourceExt: "jpg" | "png" | "webp";
    variantWidths: number[];
    fallbackExt: "jpg" | "png";
  };
};

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`The browser could not encode ${type}.`))),
      type,
      quality,
    );
  });
}

async function resize(
  image: ImageBitmap,
  width: number,
  type: "image/webp" | "image/jpeg" | "image/png",
  quality?: number,
): Promise<Blob> {
  const height = Math.max(1, Math.round((image.height * width) / image.width));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas image processing is unavailable in this browser.");
  context.drawImage(image, 0, 0, width, height);
  return canvasToBlob(canvas, type, quality);
}

/**
 * Generates the same responsive files as scripts/optimize-images.mjs before
 * the request reaches Cloudflare. The Function only validates and commits the
 * already-encoded files, keeping Worker CPU use low.
 */
export async function prepareCoverImage(source: File): Promise<PreparedCoverImage> {
  const sourceExt = SOURCE_EXTENSIONS[source.type];
  if (!sourceExt) throw new Error("Use a JPG, PNG, or WebP image.");
  if (source.size > MAX_IMAGE_BYTES) throw new Error("The source image must be 5MB or smaller.");

  const image = await createImageBitmap(source);
  try {
    if (!image.width || !image.height) throw new Error("The selected image has invalid dimensions.");
    if (Math.max(image.width, image.height) > MAX_IMAGE_DIMENSION) {
      throw new Error("The source image must be no more than 4000px on either edge.");
    }

    const variantWidths = VARIANT_WIDTHS.map((width) => Math.min(width, image.width)).filter(
      (width, index, widths) => widths.indexOf(width) === index,
    );
    const variants: File[] = [];
    for (const width of variantWidths) {
      const blob = await resize(image, width, "image/webp", 0.75);
      variants.push(new File([blob], `${width}.webp`, { type: "image/webp" }));
    }

    const fallbackExt = sourceExt === "png" ? "png" : "jpg";
    const fallbackType = fallbackExt === "png" ? "image/png" : "image/jpeg";
    const fallbackWidth = Math.min(1600, image.width);
    const fallbackBlob = await resize(image, fallbackWidth, fallbackType, 0.82);

    return {
      source,
      variants,
      fallback: new File([fallbackBlob], `fallback.${fallbackExt}`, { type: fallbackType }),
      metadata: {
        width: image.width,
        height: image.height,
        sourceExt,
        variantWidths,
        fallbackExt,
      },
    };
  } finally {
    image.close();
  }
}
