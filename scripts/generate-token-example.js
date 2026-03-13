#!/usr/bin/env node
/**
 * Generate example token and asset files for consumer project.
 * Usage: node generate-token-example.js [targetDir] [--force]
 * Default targetDir: src/assets
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const force = args.includes("--force");
const targetDir = args.filter((a) => !a.startsWith("-"))[0] || "src/assets";
const cwd = process.cwd();
const base = path.resolve(cwd, targetDir);

const THEME_JSON = {
  "color.primary.500": "#3b82f6",
  "color.primary.600": "#2563eb",
  "color.secondary.500": "#a855f7",
  "color.secondary.600": "#9333ea",
  "fontFamily.primary": "var(--font-family-primary)",
  "fontFamily.mono": "var(--font-family-mono)",
};

const FONTS_JSON = {
  primary: "primary.woff2",
  mono: "mono.woff2",
  icon: "iconfont.woff",
};

const SELECTION_JSON = {
  IcoMoonType: "selection",
  icons: [],
  metadata: { name: "custom" },
  preferences: { showGlyphs: true, fontPref: { prefix: "icon-", metadata: { fontFamily: "icomoon" } } },
};

function writeIfMissing(filePath, content, description) {
  const full = path.join(base, filePath);
  const dir = path.dirname(full);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (fs.existsSync(full) && !force) {
    console.log(`File ${description} already exists, skip. Use --force to overwrite.`);
    return;
  }
  const data = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  fs.writeFileSync(full, data, "utf8");
  console.log(`Created: ${path.relative(cwd, full)}`);
}

function main() {
  console.log(`Generating example assets in: ${path.relative(cwd, base)}\n`);
  writeIfMissing("theme.json", THEME_JSON, "theme.json");
  writeIfMissing("fonts.json", FONTS_JSON, "fonts.json");
  writeIfMissing("icons/selection.json", SELECTION_JSON, "icons/selection.json");
  console.log(`
Next steps:
  1. Edit theme.json and add your fonts to the fonts/ folder.
  2. Export your icon set from IcoMoon and replace icons/selection.json.
  3. Configure ScaleProvider: assetBaseUrl, tokensUrl?, fontsManifestUrl?, iconSelectionUrl?
  4. See README for full guide.
`);
}

main();
