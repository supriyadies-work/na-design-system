import React from "react";
import NextLink from "next/link";
import { cn } from "@na-design-system/utils/cn";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary";
  className?: string;
  external?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  testId?: string;
}

const variantStyles = {
  default:
    "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white",
  primary:
    "text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300",
  secondary:
    "text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300",
};

export const Link: React.FC<LinkProps> = ({
  href,
  children,
  variant = "default",
  className,
  external = false,
  onClick,
  onMouseEnter,
  onFocus,
  testId,
}) => {
  const classes = cn(
    "transition-colors underline underline-offset-1",
    variantStyles[variant],
    className,
  );

  if (external || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        aria-label={
          typeof children === "string" ? undefined : `External link: ${href}`
        }
        data-testid={testId}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink
      href={href}
      className={classes}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      data-testid={testId}
    >
      {children}
    </NextLink>
  );
};

export default Link;
