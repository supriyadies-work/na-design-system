/**
 * Style Dictionary config for SuprCircle → Flutter Dart generation only.
 * Does not alter legacy web CSS/JS/TS token outputs.
 */
const StyleDictionary = require("style-dictionary");
const { fileHeader } = StyleDictionary.formatHelpers || {};

function toDartIdentifier(pathParts) {
  return pathParts
    .join("_")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^(\d)/, "_$1");
}

function hexToFlutterColor(hex) {
  const h = String(hex).replace("#", "").toUpperCase();
  if (h.length === 6) return `Color(0xFF${h})`;
  if (h.length === 8) return `Color(0x${h})`;
  return `Color(0xFF000000) /* unresolved: ${hex} */`;
}

function dimToDouble(value) {
  const n = parseFloat(String(value).replace(/px|ms|rem/gi, ""));
  return Number.isFinite(n) ? n : 0;
}

StyleDictionary.registerFormat({
  name: "flutter/suprcircle_tokens",
  format: function ({ dictionary }) {
    const colors = [];
    const dimensions = [];
    const durations = [];
    const weights = [];
    const strings = [];
    const beziers = [];

    const sorted = [...dictionary.allTokens].sort((a, b) =>
      a.path.join(".").localeCompare(b.path.join(".")),
    );

    for (const token of sorted) {
      const name = toDartIdentifier(token.path);
      const type = token.type || token.$type || "";
      const value = token.value ?? token.$value;

      if (type === "color" || (typeof value === "string" && /^#/.test(value))) {
        if (typeof value === "string" && value.startsWith("#")) {
          colors.push(`  static const Color ${name} = ${hexToFlutterColor(value)};`);
        }
      } else if (
        type === "dimension" ||
        type === "fontSizes" ||
        type === "lineHeights" ||
        type === "borderRadius" ||
        type === "spacing"
      ) {
        dimensions.push(`  static const double ${name} = ${dimToDouble(value)};`);
      } else if (type === "duration") {
        durations.push(
          `  static const Duration ${name} = Duration(milliseconds: ${Math.round(dimToDouble(value))});`,
        );
      } else if (type === "fontWeights") {
        const w = Math.round(dimToDouble(value));
        weights.push(`  static const FontWeight ${name} = FontWeight.w${w};`);
      } else if (type === "fontFamilies" || type === "string") {
        const escaped = String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        strings.push(`  static const String ${name} = '${escaped}';`);
      } else if (type === "cubicBezier" && Array.isArray(value)) {
        const [a, b, c, d] = value.map(Number);
        beziers.push(
          `  static const Cubic ${name} = Cubic(${a}, ${b}, ${c}, ${d});`,
        );
      }
    }

    return `// GENERATED CODE — do not edit by hand.
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
  },
});

module.exports = {
  source: [
    "src/tokens/primitives/suprcircle/**/*.json",
    "src/tokens/brands/suprcircle/**/*.json",
  ],
  platforms: {
    flutter: {
      transformGroup: "js",
      buildPath: "packages/supr_design_system_flutter/lib/src/generated/",
      files: [
        {
          destination: "supr_circle_tokens.g.dart",
          format: "flutter/suprcircle_tokens",
        },
      ],
    },
  },
};
