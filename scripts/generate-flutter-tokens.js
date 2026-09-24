#!/usr/bin/env node
/**
 * Deterministic SuprCircle → Dart token generator.
 * Reads shared JSON tokens and writes packages/.../supr_circle_tokens.g.dart
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(
  ROOT,
  "packages/supr_design_system_flutter/lib/src/generated/supr_circle_tokens.g.dart",
);

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function walk(obj, pathParts, out) {
  if (obj == null || typeof obj !== "object") return;
  if (Object.prototype.hasOwnProperty.call(obj, "value") && (obj.type || obj.$type)) {
    out.push({ path: pathParts.slice(), value: obj.value, type: obj.type || obj.$type });
    return;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k === "comment") continue;
    walk(v, pathParts.concat(k), out);
  }
}

function id(parts) {
  return parts.join("_").replace(/[^a-zA-Z0-9_]/g, "_");
}

function hexColor(v) {
  const h = String(v).replace("#", "").toUpperCase();
  return `Color(0xFF${h})`;
}

function resolveRefs(tokens) {
  // Flatten then resolve {a.b.c} against flat map of path→value for primitives first
  const flat = {};
  for (const t of tokens) {
    flat[t.path.join(".")] = t;
  }
  function resolveValue(val, type, depth = 0) {
    if (depth > 10) return val;
    if (typeof val === "string" && val.startsWith("{") && val.endsWith("}")) {
      const ref = val.slice(1, -1);
      const target = flat[ref];
      if (!target) return val;
      return resolveValue(target.value, target.type, depth + 1);
    }
    return val;
  }
  return tokens.map((t) => ({
    ...t,
    resolved: resolveValue(t.value, t.type),
  }));
}

const files = [
  "src/tokens/primitives/suprcircle/colors.json",
  "src/tokens/primitives/suprcircle/dimensions.json",
  "src/tokens/brands/suprcircle/semantic.light.json",
  "src/tokens/brands/suprcircle/component.json",
  "src/tokens/brands/suprcircle/typography.json",
  "src/tokens/brands/suprcircle/motion.json",
];

const collected = [];
for (const f of files) {
  walk(readJson(f), [], collected);
}
const resolved = resolveRefs(collected).sort((a, b) =>
  a.path.join(".").localeCompare(b.path.join(".")),
);

const colors = [];
const dimensions = [];
const durations = [];
const weights = [];
const strings = [];
const beziers = [];

for (const t of resolved) {
  const name = id(t.path);
  const v = t.resolved;
  if (t.type === "color" && typeof v === "string" && v.startsWith("#")) {
    colors.push(`  static const Color ${name} = ${hexColor(v)};`);
  } else if (t.type === "dimension") {
    dimensions.push(`  static const double ${name} = ${parseFloat(v)};`);
  } else if (t.type === "duration") {
    durations.push(
      `  static const Duration ${name} = Duration(milliseconds: ${Math.round(parseFloat(v))});`,
    );
  } else if (t.type === "fontWeights") {
    weights.push(`  static const FontWeight ${name} = FontWeight.w${Math.round(parseFloat(v))};`);
  } else if (t.type === "fontFamilies") {
    const escaped = String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    strings.push(`  static const String ${name} = '${escaped}';`);
  } else if (t.type === "cubicBezier" && Array.isArray(v)) {
    beziers.push(`  static const Cubic ${name} = Cubic(${v.map(Number).join(", ")});`);
  }
}

const dart = `// GENERATED CODE — do not edit by hand.
// Source: src/tokens/primitives/suprcircle + src/tokens/brands/suprcircle
// Regenerate: npm run build:flutter-tokens

// ignore_for_file: constant_identifier_names, non_constant_identifier_names

import 'package:flutter/material.dart';

/// Resolved SuprCircle design tokens (primitive + semantic).
/// Prefer ThemeExtensions / semantic APIs in app code over these constants.
abstract final class SuprCircleTokens {
${colors.join("\n")}

${dimensions.join("\n")}

${durations.join("\n")}

${weights.join("\n")}

${strings.join("\n")}

${beziers.join("\n")}
}
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, dart);
console.error(`Wrote ${OUT}`);
