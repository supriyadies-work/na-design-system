import React from "react";
import { Button } from "@na-design-system/components/atoms/Button";
import { Icon } from "@na-design-system/components/atoms/Icon";
import { Text } from "@na-design-system/components/atoms/Text";
import { cn } from "@na-design-system/utils/cn";
import type { IconName } from "@na-design-system/components/atoms/Icon/icons";

interface ButtonIconProps {
  icon: IconName;
  label: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  href?: string;
  iconFill?: boolean;
  iconSize?: "sm" | "md" | "lg" | "xl";
}

/**
 * ButtonIcon Molecule Component
 * Button with icon and label text
 * Text color automatically adapts to background (dark bg = white text, light bg = dark text)
 */
export const ButtonIcon: React.FC<ButtonIconProps> = ({
  icon,
  label,
  variant = "primary",
  size = "md",
  className,
  onClick,
  href,
  iconFill = false,
  iconSize = "md",
}) => {
  // Determine text color based on variant and custom className
  // Dark backgrounds (primary, danger, custom dark bg) -> white text
  // Light backgrounds (ghost, outline, secondary) -> dark text
  const hasDarkBg =
    variant === "primary" ||
    variant === "danger" ||
    (className &&
      (className.includes("bg-primary") ||
        className.includes("bg-success") ||
        className.includes("bg-neutral-600") ||
        className.includes("bg-neutral-700") ||
        className.includes("bg-secondary") ||
        className.includes("bg-error") ||
        className.includes("bg-info")));

  const textColorClass = hasDarkBg
    ? "text-white"
    : variant === "ghost" || variant === "outline"
      ? "text-neutral-700 dark:text-neutral-300"
      : "text-neutral-900 dark:text-white";

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("inline-flex items-center gap-2", className)}
      onClick={onClick}
      href={href}
    >
      <Icon name={icon} size={iconSize} fill={iconFill} />
      <Text variant="body" className={cn("font-medium", textColorClass)}>
        {label}
      </Text>
    </Button>
  );
};

export default ButtonIcon;
