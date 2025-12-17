"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Text } from "@na-design-system/components/atoms/Text";
import { Button } from "@na-design-system/components/atoms/Button";
import { Image } from "@na-design-system/components/atoms/Image";
import { cn } from "@na-design-system/utils/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  };
  className?: string;
  icon?: React.ReactNode;
  image?: string;
  showDefaultImage?: boolean;
}

/**
 * EmptyState Molecule Component
 * Reusable empty state component for displaying "no results" or "no data" messages
 * Commonly used in lists, search results, and data tables
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  className,
  icon,
  image,
  showDefaultImage = true,
}) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by only showing theme-dependent content after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Determine what to display: icon > custom image > default image
  const shouldShowDefaultImage = showDefaultImage && !icon && !image;
  const shouldShowCustomImage = image && !icon;
  const shouldShowIcon = !!icon;

  // Determine if dark mode is active
  // Use resolvedTheme to handle "system" theme preference
  const isDarkMode = mounted && (resolvedTheme === "dark" || theme === "dark");

  return (
    <div className={cn("py-20 text-center", className)}>
      {shouldShowIcon && <div className="mb-4 flex justify-center">{icon}</div>}
      {shouldShowCustomImage && (
        <div className="mb-4 flex justify-center">
          <Image
            src={image}
            alt="Empty state"
            width={350}
            height={350}
            className="mx-auto"
          />
        </div>
      )}
      {shouldShowDefaultImage && (
        <div className="mb-4 flex justify-center">
          {mounted ? (
            <Image
              src={
                isDarkMode
                  ? "/images/empty-result-dark.png"
                  : "/images/empty-result.png"
              }
              alt="Empty result"
              width={350}
              height={350}
              className="mx-auto"
            />
          ) : (
            // Fallback during SSR to prevent hydration mismatch
            <Image
              src="/images/empty-result.png"
              alt="Empty result"
              width={350}
              height={350}
              className="mx-auto"
            />
          )}
        </div>
      )}
      <Text variant="body" className="text-lg mb-4">
        {title}
      </Text>
      {description && (
        <Text
          variant="small"
          className="text-neutral-500 dark:text-neutral-400 mb-4"
        >
          {description}
        </Text>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "primary"}
          size="md"
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
