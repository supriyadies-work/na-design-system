import React from "react";
import { cn } from "@supriyadies-work/supr-design-system/utils/cn";

/** Figma-aligned: display, h1–h5, subtitle01–03, body01–03. Legacy: h6, body, small, caption, label, hero. */
export type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle01"
  | "subtitle02"
  | "subtitle03"
  | "body01"
  | "body02"
  | "body03"
  | "body"
  | "small"
  | "caption"
  | "label"
  | "hero";

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  className?: string;
  as?: React.ElementType;
  style?: React.CSSProperties;
  testId?: string;
  /** Untuk as="label": mengaitkan label ke form control via id. */
  htmlFor?: string;
}

/** Typography tokens (Figma: text display, text h1–h5, text subtitle 01–03, text body 01–03) */
const tokenVariants: Record<
  string,
  { fontSize: string; lineHeight: string }
> = {
  display: { fontSize: "var(--font-size-display)", lineHeight: "var(--line-height-display)" },
  h1: { fontSize: "var(--font-size-h1)", lineHeight: "var(--line-height-heading)" },
  h2: { fontSize: "var(--font-size-h2)", lineHeight: "var(--line-height-heading)" },
  h3: { fontSize: "var(--font-size-h3)", lineHeight: "var(--line-height-heading)" },
  h4: { fontSize: "var(--font-size-h4)", lineHeight: "var(--line-height-heading)" },
  h5: { fontSize: "var(--font-size-h5)", lineHeight: "var(--line-height-heading)" },
  subtitle01: { fontSize: "var(--font-size-subtitle01)", lineHeight: "var(--line-height-subtitle)" },
  subtitle02: { fontSize: "var(--font-size-subtitle02)", lineHeight: "var(--line-height-subtitle)" },
  subtitle03: { fontSize: "var(--font-size-subtitle03)", lineHeight: "var(--line-height-subtitle)" },
  body01: { fontSize: "var(--font-size-body01)", lineHeight: "var(--line-height-body)" },
  body02: { fontSize: "var(--font-size-body02)", lineHeight: "var(--line-height-body)" },
  body03: { fontSize: "var(--font-size-body03)", lineHeight: "var(--line-height-body)" },
};

// Legacy variants: Tailwind-based (responsive/legacy)
const variantStyles: Record<string, string> = {
  h6: "text-base laptop:text-lg font-semibold leading-tight text-neutral-900 dark:text-white",
  body: "text-base leading-relaxed text-neutral-700 dark:text-neutral-300",
  small: "text-sm leading-relaxed text-neutral-600 dark:text-neutral-400",
  caption: "text-xs leading-relaxed text-neutral-500 dark:text-neutral-500",
  label: "text-sm font-medium text-neutral-700 dark:text-neutral-300",
  hero: "text-3xl tablet:text-6xl laptop:text-8xl laptopl:text-8xl p-1 tablet:p-2 font-light w-full laptop:w-4/5",
};

const defaultTags: Record<string, React.ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  subtitle01: "p",
  subtitle02: "p",
  subtitle03: "p",
  body01: "p",
  body02: "p",
  body03: "p",
  body: "p",
  small: "p",
  caption: "span",
  label: "label",
  hero: "h1",
};

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ children, variant = "body", className, as, style, testId, htmlFor }, ref) => {
    const Component = as || defaultTags[variant];
    const tokenStyle = tokenVariants[variant];
    const baseStyles = variantStyles[variant];
    const isTokenVariant = !!tokenStyle;

    const labelProps =
      (Component === "label" || as === "label") && htmlFor != null
        ? { htmlFor }
        : undefined;

    return (
      <Component
        ref={ref as any}
        className={cn(
          isTokenVariant ? "text-neutral-900 dark:text-white" : baseStyles,
          className
        )}
        style={
          isTokenVariant
            ? { ...tokenStyle, ...style }
            : style
        }
        data-testid={testId}
        {...labelProps}
      >
        {children}
      </Component>
    );
  },
);

Text.displayName = "Text";

export default Text;
