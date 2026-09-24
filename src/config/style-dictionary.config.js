module.exports = {
  // Exclude SuprCircle brand/primitives — generated via style-dictionary.flutter.config.js
  source: [
    "src/tokens/base/**/*.json",
    "src/tokens/semantic/**/*.json",
    "src/tokens/scales/**/*.json",
    "src/tokens/themes/**/*.json",
  ],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "dist/css/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: "dist/js/",
      files: [
        {
          destination: "tokens.js",
          format: "javascript/es6",
        },
      ],
    },
    ts: {
      transformGroup: "js",
      buildPath: "dist/ts/",
      files: [
        {
          destination: "tokens.ts",
          format: "typescript/module-declarations",
        },
      ],
    },
  },
};
