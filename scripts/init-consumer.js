#!/usr/bin/env node
/**
 * CLI entrypoint for: npx @supriyadies-work/supr-design-system init
 * Resolves path to generate-token-example and runs it with cwd and args.
 */

const path = require("path");
const { spawnSync } = require("child_process");

const scriptDir = __dirname;
const generateScript = path.join(scriptDir, "generate-token-example.js");
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [generateScript, ...args], {
  stdio: "inherit",
  cwd: process.cwd(),
});

process.exit(result.status ?? 0);
