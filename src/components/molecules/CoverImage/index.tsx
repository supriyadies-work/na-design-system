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
 * Reusable cover/hero image component with full-width styling and negative margins
 * Commonly used for blog posts, articles, and detail pages
 */
export const CoverImage: React.FC<CoverImageProps> = ({
  src,
  alt,
  className,
  containerClassName,
  priority = false,
  sizes = "100vw",
  testId,
}) => {
  return (
    <div
      className={cn(
        "w-full -mx-4 md:-mx-8 lg:-mx-16 xl:-mx-32 mb-12",
        containerClassName
      )}
      data-testid={testId}
    >
      <div className="relative w-full h-[60vh] min-h-[400px]">
        <Image
          src={src}
          alt={alt}
          fill
          className={cn("object-cover", className)}
          priority={priority}
          sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"}
          quality={90}
          testId={testId ? `${testId}.image` : undefined}
        />
      </div>
    </div>
  );
};

export default CoverImage;
