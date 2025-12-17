import React from "react";
import { cn } from "@na-design-system/utils/cn";

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className,
  variant = "rectangular",
}) => {
  const baseStyles = "animate-pulse bg-neutral-200 dark:bg-neutral-700";

  const variantStyles = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={{ width, height }}
      aria-busy="true"
      aria-label="Loading content"
    />
  );
};

export default Skeleton;
