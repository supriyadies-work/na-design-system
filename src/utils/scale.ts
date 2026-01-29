/**
 * Scale System for Dynamic Design Tokens
 * Supports multiple scales: nisaaulia (default) and supriyadies
 */

export type ScaleName = "nisaaulia" | "supriyadies";

export interface ScaleConfig {
  name: ScaleName;
  multiplier: number;
  spacingMultiplier?: number;
  fontSizeMultiplier?: number;
  lineHeightMultiplier?: number;
  borderRadiusMultiplier?: number;
  description?: string;
}

/**
 * Scale configurations
 */
export const scales: Record<ScaleName, ScaleConfig> = {
  nisaaulia: {
    name: "nisaaulia",
    multiplier: 1,
    spacingMultiplier: 1,
    fontSizeMultiplier: 1,
    lineHeightMultiplier: 1,
    borderRadiusMultiplier: 1,
    description: "Default scale for Nisa Aulia portfolio - maintains existing design system values",
  },
  supriyadies: {
    name: "supriyadies",
    multiplier: 1.25,
    spacingMultiplier: 1.25,
    fontSizeMultiplier: 1.15,
    lineHeightMultiplier: 1.1,
    borderRadiusMultiplier: 1.2,
    description: "Larger scale for Supriyadies brand - increased spacing and typography",
  },
};

/**
 * Current active scale (default: nisaaulia for backward compatibility)
 */
let currentScale: ScaleName = "nisaaulia";

/**
 * Get current active scale name
 */
export function getCurrentScale(): ScaleName {
  return currentScale;
}

/**
 * Get current scale configuration
 */
export function getScaleConfig(): ScaleConfig {
  return scales[currentScale];
}

/**
 * Set active scale
 * @param scale - Scale name to activate
 */
export function setScale(scale: ScaleName): void {
  if (!scales[scale]) {
    console.warn(`Scale "${scale}" not found. Using default "nisaaulia".`);
    currentScale = "nisaaulia";
    return;
  }
  currentScale = scale;
  
  // Apply scale to document root via CSS custom property
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    const config = scales[scale];
    root.style.setProperty("--scale-multiplier", String(config.multiplier));
    root.style.setProperty("--scale-spacing", String(config.spacingMultiplier || config.multiplier));
    root.style.setProperty("--scale-font-size", String(config.fontSizeMultiplier || config.multiplier));
    root.style.setProperty("--scale-line-height", String(config.lineHeightMultiplier || 1));
    root.style.setProperty("--scale-border-radius", String(config.borderRadiusMultiplier || config.multiplier));
    root.setAttribute("data-scale", scale);
  }
}

/**
 * Apply scaled value
 * @param baseValue - Base value (e.g., "1rem", "16px", 16)
 * @param scaleType - Type of scale to apply (default: "multiplier")
 */
export function applyScale(
  baseValue: string | number,
  scaleType: "multiplier" | "spacing" | "fontSize" | "lineHeight" | "borderRadius" = "multiplier"
): string {
  const config = getScaleConfig();
  let multiplier = config.multiplier;

  switch (scaleType) {
    case "spacing":
      multiplier = config.spacingMultiplier || config.multiplier;
      break;
    case "fontSize":
      multiplier = config.fontSizeMultiplier || config.multiplier;
      break;
    case "lineHeight":
      multiplier = config.lineHeightMultiplier || 1;
      break;
    case "borderRadius":
      multiplier = config.borderRadiusMultiplier || config.multiplier;
      break;
  }

  // If base value is a number, multiply directly
  if (typeof baseValue === "number") {
    return String(baseValue * multiplier);
  }

  // If base value is a string with unit, extract number and multiply
  const match = baseValue.match(/^([\d.]+)(.*)$/);
  if (match) {
    const [, numStr, unit] = match;
    const num = parseFloat(numStr);
    if (!isNaN(num)) {
      return `${num * multiplier}${unit}`;
    }
  }

  // Fallback: return as-is
  return baseValue;
}

/**
 * Get CSS variable for scale
 */
export function getScaleCSSVar(scaleType: "multiplier" | "spacing" | "fontSize" | "lineHeight" | "borderRadius" = "multiplier"): string {
  const varName = scaleType === "multiplier" ? "scale-multiplier" : `scale-${scaleType}`;
  return `var(--${varName}, 1)`;
}

/**
 * Initialize scale from environment variable or default to nisaaulia
 */
export function initScale(): void {
  if (typeof window !== "undefined") {
    // Check for scale in data attribute or environment
    const envScale = process.env.NEXT_PUBLIC_DESIGN_SYSTEM_SCALE as ScaleName | undefined;
    const dataScale = document.documentElement.getAttribute("data-scale") as ScaleName | undefined;
    
    const scale = envScale || dataScale || "nisaaulia";
    setScale(scale);
  }
}
