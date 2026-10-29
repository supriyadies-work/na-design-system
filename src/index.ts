// Export all components
export * from "./components/atoms";
export * from "./components/molecules";
export * from "./components/organisms";
export * from "./components/templates";

// Export token utilities
export { tokens, getToken, getCSSVar, theme } from "./utils/tokens";

// Export utilities
export { cn } from "./utils/cn";

// Export scale utilities
export {
  type ScaleName,
  type KnownScaleName,
  type ScaleConfig,
  scales,
  getCurrentScale,
  getScaleConfig,
  getScaleConfigFor,
  normalizeScaleName,
  setScale,
  applyScale,
  getScaleCSSVar,
  initScale,
} from "./utils/scale";
export { ScaleProvider, useScale } from "./utils/ScaleProvider";

// Image compression helpers (CMS / RichTextEditor)
export {
  compressImageFile,
  computeTargetDimensions,
  getOutputMimeAndExtension,
  assertUnderMaxBytes,
  replaceFileExtension,
  CompressImageError,
  DEFAULT_MAX_IMAGE_WIDTH,
  DEFAULT_MAX_IMAGE_BYTES,
  DEFAULT_IMAGE_QUALITY,
} from "./lib/helpers/compressImage";
export type { CompressImageOptions } from "./lib/helpers/compressImage";
