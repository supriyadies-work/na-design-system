/**
 * Parse IcoMoon selection.json to a mapping of icon name → unicode code point.
 * Used for icon font rendering when consumer provides selection.json.
 */

export interface IcoMoonIcon {
  icon?: { paths?: string[]; attrs?: unknown[] };
  properties?: { name?: string; code?: number; order?: number; id?: number; prevSize?: number };
  setIdx?: number;
  setId?: number;
  iconIdx?: number;
}

export interface IcoMoonSelection {
  IcoMoonType?: string;
  icons?: IcoMoonIcon[];
  height?: number;
  metadata?: { name?: string };
  preferences?: { showGlyphs?: boolean; fontPref?: { prefix?: string; metadata?: { fontFamily?: string } } };
}

/**
 * Parse IcoMoon selection.json and return a map of icon name → unicode code point.
 * Icons without properties.code fall back to a derived code if possible.
 */
export function parseIcoMoonSelection(json: IcoMoonSelection): Record<string, number> {
  const result: Record<string, number> = {};
  const icons = json?.icons ?? [];
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    const name = icon?.properties?.name;
    if (!name || typeof name !== "string") continue;
    let code = icon?.properties?.code;
    if (typeof code !== "number" || code <= 0) {
      code = 0xe000 + i;
    }
    result[name] = code;
  }
  return result;
}

/**
 * Parse IcoMoon selection.json and return a map of icon name → SVG path d strings.
 * Use this to render custom icons as SVG from selection.json without an icon font.
 */
export function parseIcoMoonSelectionToSvgPaths(json: IcoMoonSelection): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const icons = json?.icons ?? [];
  for (const icon of icons) {
    const name = icon?.properties?.name;
    if (!name || typeof name !== "string") continue;
    const paths = icon?.icon?.paths;
    if (Array.isArray(paths) && paths.length > 0 && paths.every((p) => typeof p === "string")) {
      result[name] = paths as string[];
    }
  }
  return result;
}
