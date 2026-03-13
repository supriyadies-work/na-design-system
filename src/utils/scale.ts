/**
 * Scale System for Dynamic Design Tokens
 * Supports predefined scales (nisaaulia, supriyadies, wedwise) and any dynamic scale name.
 * Dynamic scales: client passes defaultScale="brandX" and tokensUrl with color.byScale.brandx;
 * no config change in design system needed.
 */

/** Known scales get autocomplete; any string is allowed for client-defined scales */
export type ScaleName = "nisaaulia" | "supriyadies" | "wedwise" | (string & {});

export interface ScaleConfig {
  name: string;
  multiplier: number;
  spacingMultiplier?: number;
  fontSizeMultiplier?: number;
  lineHeightMultiplier?: number;
  borderRadiusMultiplier?: number;
  description?: string;
  /** Optional font families per scale (applied to :root when set) */
  fontFamily?: { primary?: string; mono?: string; heading?: string };
  /** Prefix for per-scale color CSS vars (e.g. "color-by-scale-wedwise" → --color-by-scale-wedwise-primary-500) */
  colorTokenPrefix?: string;
  /** Direct hex overrides for --color-primary-*, --color-secondary-*, etc. (key: CSS var name without --) */
  colorOverrides?: Record<string, string>;
  /** Icon set key for registry (e.g. "default" | "wedwise") */
  iconSet?: "default" | "wedwise";
}

/** Predefined scale keys (used for typed scales object; dynamic scales are not listed) */
export type KnownScaleName = "nisaaulia" | "supriyadies" | "wedwise";

/**
 * Scale configurations (predefined). Dynamic scale names use auto-generated config via getScaleConfigFor().
 */
export const scales: Record<KnownScaleName, ScaleConfig> = {
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
  wedwise: {
    name: "wedwise",
    multiplier: 1,
    spacingMultiplier: 1,
    fontSizeMultiplier: 1,
    lineHeightMultiplier: 1,
    borderRadiusMultiplier: 1,
    description: "Wedwise brand scale - use colorTokenPrefix or colorOverrides for brand palette",
    colorTokenPrefix: "color-by-scale-wedwise",
  },
};

/**
 * Normalize scale name for CSS var prefix. Matches ScaleProvider's toCSSVarName so that
 * --color-by-scale-{normalized} matches client tokens (e.g. color.byScale.brandX → --color-by-scale-brand-x).
 * Client tokens.json must use the same key under color.byScale (e.g. color.byScale.brandX or color.byScale["brand-x"]).
 */
export function normalizeScaleName(scale: string): string {
  return scale
    .trim()
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Get scale config for a given scale name. Predefined scales use scales[]; any other string gets a default config
 * with colorTokenPrefix "color-by-scale-{normalizedScaleName}" so client can provide palette via tokensUrl.
 */
export function getScaleConfigFor(scale: string): ScaleConfig {
  const known = (scales as Record<string, ScaleConfig>)[scale];
  if (known) return known;
  const normalized = normalizeScaleName(scale);
  return {
    name: scale,
    multiplier: 1,
    spacingMultiplier: 1,
    fontSizeMultiplier: 1,
    lineHeightMultiplier: 1,
    borderRadiusMultiplier: 1,
    description: `Dynamic scale "${scale}" - palette from client (tokensUrl). Use color.byScale.${normalized} in tokens.json.`,
    colorTokenPrefix: normalized ? "color-by-scale-" + normalized : undefined,
  };
}

/**
 * Current active scale (default: nisaaulia for backward compatibility)
 */
let currentScale: string = "nisaaulia";

/**
 * Get current active scale name
 */
export function getCurrentScale(): ScaleName {
  return currentScale as ScaleName;
}

/**
 * Get current scale configuration (uses predefined or auto-generated config for dynamic scale names)
 */
export function getScaleConfig(): ScaleConfig {
  return getScaleConfigFor(currentScale);
}

/** Color token suffixes for per-scale override (primary, secondary, neutral, overlay) */
const COLOR_SCALE_SUFFIXES = [
  "primary-50", "primary-100", "primary-200", "primary-300", "primary-400", "primary-500",
  "primary-600", "primary-700", "primary-800", "primary-900", "primary-950",
  "secondary-50", "secondary-100", "secondary-200", "secondary-300", "secondary-400", "secondary-500",
  "secondary-600", "secondary-700", "secondary-800", "secondary-900", "secondary-950",
  "neutral-50", "neutral-100", "neutral-200", "neutral-300", "neutral-400", "neutral-500",
  "neutral-600", "neutral-700", "neutral-800", "neutral-900", "neutral-950",
  "white", "black",
  "overlay-dark-5", "overlay-dark-10", "overlay-dark-20", "overlay-dark-30", "overlay-dark-40",
  "overlay-dark-50", "overlay-dark-60", "overlay-dark-70", "overlay-dark-80", "overlay-dark-90", "overlay-dark-100",
  "overlay-white-5", "overlay-white-10", "overlay-white-20", "overlay-white-30", "overlay-white-40",
  "overlay-white-50", "overlay-white-60", "overlay-white-70", "overlay-white-80", "overlay-white-90", "overlay-white-100",
];

/**
 * Set active scale
 * @param scale - Scale name (predefined or any string for dynamic scale; palette from client via tokensUrl)
 */
export function setScale(scale: ScaleName): void {
  const name = typeof scale === "string" && scale.trim() ? scale.trim() : "nisaaulia";
  currentScale = name;

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    const config = getScaleConfigFor(name);

    // 1. Multipliers (existing)
    root.style.setProperty("--scale-multiplier", String(config.multiplier));
    root.style.setProperty("--scale-spacing", String(config.spacingMultiplier || config.multiplier));
    root.style.setProperty("--scale-font-size", String(config.fontSizeMultiplier || config.multiplier));
    root.style.setProperty("--scale-line-height", String(config.lineHeightMultiplier || 1));
    root.style.setProperty("--scale-border-radius", String(config.borderRadiusMultiplier || config.multiplier));
    root.setAttribute("data-scale", name);

    // 2. Font family (per-scale)
    if (config.fontFamily) {
      if (config.fontFamily.primary) root.style.setProperty("--font-family-primary", config.fontFamily.primary);
      if (config.fontFamily.mono) root.style.setProperty("--font-family-mono", config.fontFamily.mono);
      if (config.fontFamily.heading) root.style.setProperty("--font-family-heading", config.fontFamily.heading);
    }

    // 3. Color: per-scale token prefix (--color-primary-500 → var(--color-by-scale-wedwise-primary-500))
    if (config.colorTokenPrefix) {
      const prefix = config.colorTokenPrefix.replace(/^--?/, "");
      for (const suffix of COLOR_SCALE_SUFFIXES) {
        const varName = "color-" + suffix;
        const scaleVar = prefix + "-" + suffix;
        root.style.setProperty("--" + varName, `var(--${scaleVar})`);
      }
    }

    // 4. Color: direct overrides (key = var name without --)
    if (config.colorOverrides) {
      for (const [key, value] of Object.entries(config.colorOverrides)) {
        root.style.setProperty(key.startsWith("--") ? key : "--" + key, value);
      }
    }
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
    const envScale = process.env.NEXT_PUBLIC_DESIGN_SYSTEM_SCALE as string | undefined;
    const dataScale = document.documentElement.getAttribute("data-scale");
    const scale = (envScale || dataScale || "nisaaulia").trim();
    setScale(scale || "nisaaulia");
  }
}
