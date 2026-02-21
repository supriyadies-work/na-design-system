"use client";

import React from "react";
import { Image } from "@na-design-system/components/atoms/Image";
import { cn } from "@na-design-system/utils/cn";

interface CoverImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
  testId?: string;
}

/**
 * CoverImage Molecule Component
 * Full-width cover that follows device width. Image uses object-contain so nothing is cropped.
 * If aspect ratio leaves empty space, a blurred version of the image is used as background.
 * Fixed aspect ratio prevents layout shift on initial load.
 */
const COVER_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px";

export const CoverImage: React.FC<CoverImageProps> = ({
  src,
  alt,
  className,
  containerClassName,
  priority = false,
  sizes,
  testId,
}) => {
  const effectiveSizes = sizes ?? COVER_IMAGE_SIZES;
  const blurStyle = {
    backgroundSize: "cover" as const,
    backgroundPosition: "center" as const,
    filter: "blur(24px)",
    opacity: 0.6,
    ...(src ? { backgroundImage: `url(${src})` } : {}),
  };

  return (
    <div
      className={cn(
        "w-full -mx-4 md:-mx-8 lg:-mx-16 xl:-mx-32 mb-12 overflow-hidden",
        containerClassName,
      )}
      data-testid={testId}
    >
      <div
        className="relative w-full bg-neutral-200 dark:bg-neutral-800 aspect-[16/10] min-h-[320px]"
        style={{ minHeight: "min(60vh, 320px)" }}
      >
        <div
          className="absolute inset-0 scale-110 bg-neutral-200 dark:bg-neutral-800"
          aria-hidden
          style={blurStyle}
        />
        <Image
          src={src}
          alt={alt}
          fill
          className={cn("object-contain", className)}
          priority={priority}
          sizes={effectiveSizes}
          quality={90}
          unoptimized
          testId={testId ? `${testId}.image` : undefined}
        />
      </div>
    </div>
  );
};

export default CoverImage;
