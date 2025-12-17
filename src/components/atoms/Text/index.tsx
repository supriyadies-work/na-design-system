import React from "react";
import { cn } from "@na-design-system/utils/cn";

interface TextProps {
  children: React.ReactNode;
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body"
    | "small"
    | "caption"
    | "label"
    | "hero";
  className?: string;
  as?: React.ElementType;
  style?: React.CSSProperties;
}

// Using design tokens via Tailwind classes
const variantStyles = {
  h1: "text-4xl laptop:text-6xl laptopl:text-7xl font-light leading-tight text-neutral-900 dark:text-white",
  h2: "text-3xl laptop:text-4xl font-semibold leading-tight text-neutral-900 dark:text-white",
  h3: "text-2xl laptop:text-3xl font-semibold leading-tight text-neutral-900 dark:text-white",
  h4: "text-xl laptop:text-2xl font-semibold leading-tight text-neutral-900 dark:text-white",
  h5: "text-lg laptop:text-xl font-semibold leading-tight text-neutral-900 dark:text-white",
  h6: "text-base laptop:text-lg font-semibold leading-tight text-neutral-900 dark:text-white",
  body: "text-base leading-relaxed text-neutral-700 dark:text-neutral-300",
  small: "text-sm leading-relaxed text-neutral-600 dark:text-neutral-400",
  caption: "text-xs leading-relaxed text-neutral-500 dark:text-neutral-500",
  label: "text-sm font-medium text-neutral-700 dark:text-neutral-300",
  hero: "text-3xl tablet:text-6xl laptop:text-8xl laptopl:text-8xl p-1 tablet:p-2 font-light w-full laptop:w-4/5",
};

const defaultTags = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body: "p",
  small: "p",
  caption: "span",
  label: "label",
  hero: "h1",
};

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ children, variant = "body", className, as, style }, ref) => {
    const Component = as || (defaultTags[variant] as any);
    const baseStyles = variantStyles[variant];

    return (
      <Component ref={ref} className={cn(baseStyles, className)} style={style}>
        {children}
      </Component>
    );
  }
);

Text.displayName = "Text";

export default Text;
