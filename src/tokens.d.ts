/**
 * Compile-time declaration for design tokens.
 * Actual values come from style-dictionary build (dist/js/tokens.js).
 * From src/utils/tokens.ts, "../tokens" resolves here; at runtime the built
 * dist/js/utils/tokens.js loads dist/js/tokens.js.
 */
declare const tokens: Record<string, unknown>;
export = tokens;
