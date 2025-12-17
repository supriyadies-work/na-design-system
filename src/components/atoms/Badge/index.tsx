import React from "react";
import { cn } from "@na-design-system/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Using design tokens via Tailwind classes
const variantStyles = {
  default:
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300",
  primary:
    "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300",
  success:
    "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300",
  warning:
    "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300",
  danger:
    "bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300",
  info: "bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-300",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-5 py-1 text-sm",
  lg: "px-8 py-1.5 text-base",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      style={{
        paddingRight: "10px",
        paddingLeft: "10px",
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
