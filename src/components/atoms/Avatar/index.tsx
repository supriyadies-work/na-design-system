import React from "react";
import { Image } from "@na-design-system/components/atoms/Image";
import { cn } from "@na-design-system/utils/cn";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean; // Allow priority loading for critical avatars (e.g., in header)
  testId?: string;
}

const sizeStyles = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-3xl",
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = "md",
  className,
  priority = false,
  testId,
}) => {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Calculate sizes for responsive images
  const sizesValue =
    size === "sm"
      ? "32px"
      : size === "md"
        ? "48px"
        : size === "lg"
          ? "64px"
          : "96px";

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center",
        "bg-gradient-to-br from-primary-400 to-secondary-500",
        "text-white font-bold",
        sizeStyles[size],
        className,
      )}
      data-testid={testId}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          fill
          className="object-cover"
          sizes={sizesValue}
          priority={priority}
          quality={85}
          testId={testId ? `${testId}.image` : undefined}
        />
      ) : (
        <span data-testid={testId ? `${testId}.initials` : undefined}>
          {initials || "?"}
        </span>
      )}
    </div>
  );
};

export default Avatar;
