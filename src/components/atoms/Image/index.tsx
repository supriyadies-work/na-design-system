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
  // SSR-safe: no window or client-only logic so server and client output match.
  const srcStr = typeof src === "string" ? src : "";
  const isExternal =
    srcStr.startsWith("http://") || srcStr.startsWith("https://");
  const shouldOptimize = !unoptimized && !isExternal;

  if (!srcStr) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-sm min-h-[120px]",
          className
        )}
        data-testid={testId}
      >
        No image
      </div>
    );
  }

  if (fill) {
    const fillSizes =
      sizes ?? "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px";
    const forceContain =
      typeof className === "string" && className.includes("object-contain");
    return (
      <NextImage
        src={srcStr}
        alt={alt ?? ""}
        fill
        className={className}
        style={forceContain ? { objectFit: "contain" } : undefined}
        priority={priority}
        sizes={fillSizes}
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

  const nonFillSizes = sizes ?? "100vw";
  return (
    <NextImage
      src={srcStr}
      alt={alt ?? ""}
      width={width || 400}
      height={height || 300}
      className={cn("object-cover", className)}
      priority={priority}
      sizes={nonFillSizes}
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
