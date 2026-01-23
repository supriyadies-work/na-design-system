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
  testId?: string;
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
  testId,
}) => {
  // For external images, use conditional optimization:
  // - Desktop: unoptimized (faster, desktop has bandwidth)
  // - Mobile: optimized (smaller file size, mobile needs compression)
  const isExternal = src.startsWith("http://") || src.startsWith("https://");
  
  // Always optimize if explicitly requested, or if it's not external
  let shouldOptimize = !unoptimized && !isExternal;
  
  // For external images, optimize on mobile to reduce file size
  if (isExternal && typeof window !== "undefined") {
    // Check if mobile (width < 1024px) - optimize for mobile
    const isMobile = window.innerWidth < 1024;
    shouldOptimize = isMobile; // Optimize on mobile, unoptimized on desktop
  }

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
        data-testid={testId}
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
      data-testid={testId}
    />
  );
};

export default Image;
