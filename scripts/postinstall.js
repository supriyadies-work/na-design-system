#!/usr/bin/env node
/**
 * Post-install: show next steps when package is installed as a dependency.
 * Skips when NA_DESIGN_SYSTEM_SKIP_POSTINSTALL=1 or when running inside the package repo.
 */

if (process.env.NA_DESIGN_SYSTEM_SKIP_POSTINSTALL === "1") {
  process.exit(0);
}

const path = require("path");
const fs = require("fs");

const cwd = process.cwd();
const initCwd = process.env.INIT_CWD || process.env.npm_config_prefix || cwd;

// Only show message when package was installed as dependency (path contains node_modules)
function isConsumerInstall() {
  try {
    const pkgPath = require.resolve("@supriyadies-work/supr-design-system/package.json", { paths: [initCwd, cwd] });
    return pkgPath.includes("node_modules");
  } catch {
    return false;
  }
}

if (!isConsumerInstall()) {
  process.exit(0);
}

console.log(`
  @supriyadies-work/supr-design-system installed.

  Next steps (optional, for scalable theming):
  1. Generate example tokens & asset structure:
     npx @supriyadies-work/supr-design-system init

  2. Add your assets (edit generated files or add):
     - theme.json (or use tokensUrl in ScaleProvider)
     - fonts/ + fonts.json
     - icons/selection.json (export from IcoMoon)

  3. Configure ScaleProvider:
     assetBaseUrl, tokensUrl?, fontsManifestUrl?, iconSelectionUrl?

  4. See full guide: https://github.com/supriyadies-work/na-design-system#readme
`);
