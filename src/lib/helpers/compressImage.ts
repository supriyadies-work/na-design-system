/**
 * Client-side image compression for CMS / RichTextEditor uploads.
 * Resizes to a max width, encodes WebP (JPEG fallback), and enforces a size cap.
 */

export const DEFAULT_MAX_IMAGE_WIDTH = 1600;
/** ~800 KB after compression */
export const DEFAULT_MAX_IMAGE_BYTES = 800 * 1024;
export const DEFAULT_IMAGE_QUALITY = 0.8;

export type CompressImageOptions = {
  maxWidth?: number;
  maxBytes?: number;
  quality?: number;
};

export class CompressImageError extends Error {
  readonly code: "TOO_LARGE" | "NOT_IMAGE" | "ENCODE_FAILED";

  constructor(code: CompressImageError["code"], message: string) {
    super(message);
    this.name = "CompressImageError";
    this.code = code;
  }
}

/**
 * Scale dimensions so the longest side (width) does not exceed maxWidth.
 * Height-only images taller than maxWidth keep aspect ratio the same way
 * (width is the constraining dimension per CMS policy).
 */
export function computeTargetDimensions(
  width: number,
  height: number,
  maxWidth: number = DEFAULT_MAX_IMAGE_WIDTH
): { width: number; height: number; scaled: boolean } {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  if (w <= maxWidth) {
    return { width: w, height: h, scaled: false };
  }
  const scale = maxWidth / w;
  return {
    width: maxWidth,
    height: Math.max(1, Math.round(h * scale)),
    scaled: true,
  };
}

/** Prefer WebP; fall back to JPEG for types that encode poorly as WebP in practice. */
export function getOutputMimeAndExtension(inputMime?: string): {
  mime: "image/webp" | "image/jpeg";
  extension: "webp" | "jpg";
} {
  const mime = (inputMime || "").toLowerCase();
  // Always prefer WebP; JPEG is the encode fallback when WebP blob creation fails.
  if (mime === "image/jpeg" || mime === "image/jpg") {
    return { mime: "image/webp", extension: "webp" };
  }
  return { mime: "image/webp", extension: "webp" };
}

export function replaceFileExtension(
  filename: string,
  extension: string
): string {
  const base = filename.replace(/\.[^/.]+$/, "") || "image";
  return `${base}.${extension}`;
}

export function assertUnderMaxBytes(
  size: number,
  maxBytes: number = DEFAULT_MAX_IMAGE_BYTES
): void {
  if (size > maxBytes) {
    const kb = Math.round(maxBytes / 1024);
    throw new CompressImageError(
      "TOO_LARGE",
      `Image is still larger than ${kb} KB after compression. Please use a smaller image.`
    );
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), mime, quality);
  });
}

/**
 * Resize (max width) + encode WebP (JPEG fallback) at ~quality.
 * Throws CompressImageError if the result is still over maxBytes.
 */
export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  if (typeof window === "undefined") {
    return file;
  }
  if (!file.type.startsWith("image/")) {
    throw new CompressImageError("NOT_IMAGE", "File must be an image");
  }

  const maxWidth = options.maxWidth ?? DEFAULT_MAX_IMAGE_WIDTH;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_IMAGE_BYTES;
  const quality = options.quality ?? DEFAULT_IMAGE_QUALITY;

  const imageUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
      image.src = imageUrl;
    });

    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;
    const { width, height } = computeTargetDimensions(
      naturalW,
      naturalH,
      maxWidth
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new CompressImageError("ENCODE_FAILED", "Could not encode image");
    }
    ctx.drawImage(img, 0, 0, width, height);

    const preferred = getOutputMimeAndExtension(file.type);
    let blob = await canvasToBlob(canvas, preferred.mime, quality);
    let extension = preferred.extension;
    let mime = preferred.mime;

    if (!blob || blob.size === 0) {
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
      extension = "jpg";
      mime = "image/jpeg";
    }

    if (!blob) {
      throw new CompressImageError("ENCODE_FAILED", "Could not encode image");
    }

    // One more pass at slightly lower quality if still over limit
    if (blob.size > maxBytes) {
      const retryQuality = Math.max(0.5, quality * 0.75);
      let retry = await canvasToBlob(canvas, mime, retryQuality);
      if ((!retry || retry.size === 0) && mime === "image/webp") {
        retry = await canvasToBlob(canvas, "image/jpeg", retryQuality);
        if (retry) {
          mime = "image/jpeg";
          extension = "jpg";
        }
      }
      if (retry && retry.size < blob.size) {
        blob = retry;
      }
    }

    assertUnderMaxBytes(blob.size, maxBytes);

    return new File(
      [blob],
      replaceFileExtension(file.name, extension),
      {
        type: mime,
        lastModified: Date.now(),
      }
    );
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
