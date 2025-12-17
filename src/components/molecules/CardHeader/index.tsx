import React from "react";
import { Text } from "@na-design-system/components/atoms";
import { cn } from "@na-design-system/utils/cn";

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  variant?: "default" | "primary" | "secondary";
}

// Using design tokens via Tailwind classes
const variantStyles = {
  default: "",
  primary: "text-primary-600 dark:text-primary-400",
  secondary: "text-neutral-600 dark:text-neutral-400",
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  className,
  variant = "default",
}) => {
  return (
    <div className={cn("mb-4", className)}>
      <Text variant="h2" className={cn(variantStyles[variant])}>
        {title}
      </Text>
      {subtitle && (
        <Text
          variant="body"
          className="mt-2 text-neutral-600 dark:text-neutral-400"
        >
          {subtitle}
        </Text>
      )}
    </div>
  );
};

export default CardHeader;
