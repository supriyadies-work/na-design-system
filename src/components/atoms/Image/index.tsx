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
}) => {
  const isExternal = src.startsWith("http://") || src.startsWith("https://");

  if (fill) {
    return (
      <NextImage
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        priority={priority}
        sizes={sizes}
        unoptimized={isExternal || unoptimized}
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
      unoptimized={isExternal || unoptimized}
    />
  );
};

export default Image;
