/**
 * ClassName utility with design token support
 * Enhanced version of cn utility with token-aware class merging
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind merge support
 * This ensures proper class precedence and removes conflicting classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Token-aware className utility
 * Can be extended to support token-based class generation in the future
 */
export function tokenCn(...inputs: ClassValue[]) {
  return cn(...inputs);
}
