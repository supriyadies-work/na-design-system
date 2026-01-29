/**
 * Design Tokens Utility
 * Provides type-safe access to design tokens
 */

// Import generated tokens from JS (has actual values)
// IMPORTANT: After build, this file will be at dist/js/utils/tokens.js
// So the import path must be "../tokens" to correctly resolve to dist/js/tokens.js
// NOTE: This path works AFTER build. During development, tokens file is at dist/js/tokens.js
// Build process should handle this correctly
import * as tokens from "../tokens";

export { tokens };

/**
 * Get token value by path
 * Example: getToken('color.primary.600') => '#2563eb'
 */
export function getToken(path: string): string {
  const keys = path.split(".");
  let value: any = tokens;

  for (const key of keys) {
    // Convert kebab-case to camelCase for token names
    const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    value = value?.[camelKey];
    if (value === undefined) {
      console.warn(`Token not found: ${path}`);
      return "";
    }
  }

  return typeof value === "string" ? value : "";
}

/**
 * Get CSS variable name for a token path
 * Example: getCSSVar('color.primary.600') => 'var(--color-primary-600)'
 */
export function getCSSVar(path: string): string {
  const keys = path.split(".");
  const varName = keys
    .map((key) => key.replace(/([A-Z])/g, "-$1").toLowerCase())
    .join("-");
  return `var(--${varName})`;
}

/**
 * Theme utilities - CSS variables for light/dark themes
 */
export const theme = {
  light: {
    background: {
      primary: "var(--theme-light-color-background-primary)",
      secondary: "var(--theme-light-color-background-secondary)",
      tertiary: "var(--theme-light-color-background-tertiary)",
    },
    text: {
      primary: "var(--theme-light-color-text-primary)",
      secondary: "var(--theme-light-color-text-secondary)",
      tertiary: "var(--theme-light-color-text-tertiary)",
      disabled: "var(--theme-light-color-text-disabled)",
    },
    border: {
      default: "var(--theme-light-color-border-default)",
      hover: "var(--theme-light-color-border-hover)",
      focus: "var(--theme-light-color-border-focus)",
    },
  },
  dark: {
    background: {
      primary: "var(--theme-dark-color-background-primary)",
      secondary: "var(--theme-dark-color-background-secondary)",
      tertiary: "var(--theme-dark-color-background-tertiary)",
    },
    text: {
      primary: "var(--theme-dark-color-text-primary)",
      secondary: "var(--theme-dark-color-text-secondary)",
      tertiary: "var(--theme-dark-color-text-tertiary)",
      disabled: "var(--theme-dark-color-text-disabled)",
    },
    border: {
      default: "var(--theme-dark-color-border-default)",
      hover: "var(--theme-dark-color-border-hover)",
      focus: "var(--theme-dark-color-border-focus)",
    },
  },
};
