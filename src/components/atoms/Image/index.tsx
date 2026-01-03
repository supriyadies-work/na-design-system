"use client";

import React from "react";
import NextImage from "next/image";
import { cn } from "@na-design-system/utils/cn";

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  unoptimized?: boolean;
  quality?: number;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes,
  unoptimized = false,
  quality = 85,
}) => {
  // Allow Next.js to optimize external images if unoptimized is not explicitly set to true
  // Next.js can optimize external images from allowed domains in next.config.js
  const shouldOptimize = !unoptimized;

  if (fill) {
    return (
      <NextImage
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        priority={priority}
        sizes={sizes}
        unoptimized={!shouldOptimize}
        quality={quality}
      />
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={cn("object-cover", className)}
      priority={priority}
      sizes={sizes}
      unoptimized={!shouldOptimize}
      quality={quality}
    />
  );
};

export default Image;
