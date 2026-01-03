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
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: () => void;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  suppressHydrationWarning?: boolean;
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
  loading,
  onLoad,
  onError,
  onClick,
  suppressHydrationWarning,
}) => {
  // For external images (from CDN/bucket), use unoptimized to avoid Next.js optimization layer latency
  // Next.js optimization adds latency (fetch, convert, serve) which can hurt performance
  // External images are typically already optimized by CDN
  const isExternal = src.startsWith("http://") || src.startsWith("https://");
  const shouldOptimize = !unoptimized && !isExternal;

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
        loading={loading}
        onLoad={onLoad}
        onError={onError}
        onClick={onClick}
        suppressHydrationWarning={suppressHydrationWarning}
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
      loading={loading}
      onLoad={onLoad}
      onError={onError}
      onClick={onClick}
      suppressHydrationWarning={suppressHydrationWarning}
    />
  );
};

export default Image;
