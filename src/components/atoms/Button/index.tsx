import React from "react";
import Link from "next/link";
import { cn } from "@na-design-system/utils/cn";

interface ButtonProps {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "filter"
    | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  isActive?: boolean;
  hideFocusRing?: boolean;
  testId?: string;
}

// Using design tokens via Tailwind classes
const variantStyles = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600",
  secondary:
    "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600",
  outline:
    "border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800",
  ghost:
    "text-neutral-700 hover:opacity-70 dark:text-neutral-300 dark:hover:opacity-70",
  danger:
    "bg-error-600 text-white hover:bg-error-700 dark:bg-error-500 dark:hover:bg-error-600",
  filter:
    "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
  text: "text-neutral-900 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-300 bg-transparent hover:bg-transparent border-0 shadow-none font-medium",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const textSizeStyles = {
  sm: "px-1 py-0.5 text-sm",
  md: "px-2 py-1 text-base",
  lg: "px-3 py-1.5 text-lg",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  onMouseEnter,
  onFocus,
  href,
  type = "button",
  disabled = false,
  isActive = false,
  hideFocusRing = false,
  testId,
}) => {
  const focusRingStyles = hideFocusRing
    ? "focus:outline-none focus:ring-0 focus:ring-offset-0"
    : variant === "text"
      ? "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      : "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500";

  const baseStyles =
    variant === "text"
      ? `inline-flex items-center justify-center font-medium transition-colors ${focusRingStyles} disabled:opacity-50 disabled:cursor-not-allowed`
      : `inline-flex items-center justify-center rounded-lg font-medium transition-colors ${focusRingStyles} disabled:opacity-50 disabled:cursor-not-allowed`;

  // Active state styling for filter variant
  const activeStyles =
    variant === "filter" && isActive
      ? "bg-black text-white dark:bg-white dark:text-black"
      : "";

  const classes = cn(
    baseStyles,
    variantStyles[variant],
    variant === "text" ? textSizeStyles[size] : sizeStyles[size],
    activeStyles,
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        data-testid={testId}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      disabled={disabled}
      className={classes}
      aria-disabled={disabled}
      data-testid={testId}
    >
      {children}
    </button>
  );
};

export default Button;
