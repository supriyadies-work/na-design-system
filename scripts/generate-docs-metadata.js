"use strict";

/**
 * Docs metadata generator for na-design-system.
 * Output: docs-metadata.json consumed by na-profile design-pattern page.
 *
 * Output shape (DocsMetadata):
 * - version: string
 * - tokens?: { colors?, spacing?, typography? }
 * - components: DocComponent[] with id, name, category, description?, props, examples
 *
 * Design-pattern uses: component.id (iframe preview, registry), component.name (UI),
 * component.category (sidebar group), component.props (table), component.examples (optional).
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const COMPONENTS_DIR = path.join(SRC, "components");
const TOKENS_DIR = path.join(SRC, "tokens");
const DIST_DIR = path.join(ROOT, "dist");

const CATEGORIES = ["atoms", "molecules", "organisms", "templates"];

/** CamelCase / PascalCase -> "Display Name" for sidebar and headings */
function humanizeComponentName(name) {
  if (!name || typeof name !== "string") return name;
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/**
 * Extract union literal values from a type string.
 * e.g. "primary" | "secondary" | "outline" => ["primary", "secondary", "outline"]
 * Handles both double and single quotes.
 */
function extractUnionLiterals(typeStr) {
  if (!typeStr || typeof typeStr !== "string") return null;
  const trimmed = typeStr.trim();
  const literals = [];
  const regex = /["']([^"']+)["']/g;
  let m;
  while ((m = regex.exec(trimmed)) !== null) {
    literals.push(m[1]);
  }
  return literals.length > 0 ? literals : null;
}

/**
 * Parse a Props interface body (content between { and }) and return array of { name, type, required, default }.
 */
function parsePropsInterface(body) {
  const props = [];
  const segments = body.split(/(?<=;)\s*/).filter(Boolean);
  for (const segment of segments) {
    const colonIdx = segment.indexOf(":");
    if (colonIdx === -1) continue;
    const beforeColon = segment.slice(0, colonIdx).trim();
    const nameMatch = beforeColon.match(/^(\w+)(\??)$/);
    if (!nameMatch) continue;
    const [, name, optional] = nameMatch;
    const typeStr = segment
      .slice(colonIdx + 1)
      .replace(/\s*;?\s*$/, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!typeStr) continue;
    props.push({
      name,
      type: typeStr,
      required: optional !== "?",
      default: undefined,
      description: undefined,
    });
  }
  return props;
}

/**
 * Extract the first interface ending with "Props" from file content.
 * Handles "interface XProps {" and "interface XProps extends ... {".
 * Returns { componentName, props } or null.
 */
function extractPropsFromSource(content) {
  const interfaceMatch = content.match(
    /interface\s+(\w+Props)\s*(?:extends\s+[^{]+)?\s*\{([\s\S]*?)\n\}/
  );
  if (!interfaceMatch) return null;
  const propsBody = interfaceMatch[2];
  const componentName = interfaceMatch[1].replace(/Props$/, "");
  const props = parsePropsInterface(propsBody);
  return { componentName, props };
}

/**
 * For each prop with union literals, derive examples: one per literal, varying only that prop.
 * Returns { label, props }[].
 */
function deriveExamples(parsedProps, defaultChildren = "Label") {
  const examples = [];
  for (const prop of parsedProps) {
    const literals = extractUnionLiterals(prop.type);
    if (!literals || literals.length > 5) continue;
    for (const value of literals) {
      const label = `${prop.name}: ${value}`;
      const props = { [prop.name]: value };
      if (prop.name !== "children" && defaultChildren) {
        props.children = defaultChildren;
      }
      examples.push({ label, props });
    }
  }
  return examples;
}

/**
 * Default children for components that need a label (Button, etc.)
 */
const DEFAULT_CHILDREN = {
  Button: "Button",
  Badge: "Badge",
  Link: "Link",
  Text: "Sample text",
  Label: "Label",
  Alert: "Alert message",
  Input: "",
  Textarea: "",
};

function getDefaultChildren(componentName) {
  return DEFAULT_CHILDREN[componentName] ?? "Content";
}

/**
 * Scan a category directory for index.tsx and return component names (sorted).
 */
function getComponentNames(category) {
  const dir = path.join(COMPONENTS_DIR, category);
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const names = entries
    .filter((e) => e.isDirectory())
    .map((d) => d.name)
    .filter((name) => {
      const indexPath = path.join(dir, name, "index.tsx");
      return fs.existsSync(indexPath);
    });
  return names.sort((a, b) => a.localeCompare(b, "en"));
}

/**
 * Parse one component file and return doc entry.
 */
function parseComponent(category, componentName) {
  const indexPath = path.join(
    COMPONENTS_DIR,
    category,
    componentName,
    "index.tsx"
  );
  const content = fs.readFileSync(indexPath, "utf8");
  const extracted = extractPropsFromSource(content);
  if (!extracted) {
    return {
      id: componentName,
      name: humanizeComponentName(componentName),
      category,
      description: undefined,
      props: [],
      examples: [],
    };
  }
  const { props } = extracted;
  const examples = deriveExamples(props, getDefaultChildren(componentName));
  return {
    id: componentName,
    name: humanizeComponentName(componentName),
    category,
    description: undefined,
    props,
    examples,
  };
}

/**
 * Collect all components from all categories.
 */
function collectComponents() {
  const components = [];
  for (const category of CATEGORIES) {
    const names = getComponentNames(category);
    for (const name of names) {
      components.push(parseComponent(category, name));
    }
  }
  return components;
}

/**
 * Recursively extract token values into nested object. Leaves with { value } become the value.
 */
function extractTokenValues(obj) {
  if (obj && typeof obj === "object" && "value" in obj && Object.keys(obj).length === 1) {
    return obj.value;
  }
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = extractTokenValues(v);
    }
    return result;
  }
  return obj;
}

/**
 * Build tokens section for docs: colors, spacing, typography (nested for UI).
 */
function buildTokens() {
  const readJson = (p) => {
    if (!fs.existsSync(p)) return {};
    return JSON.parse(fs.readFileSync(p, "utf8"));
  };
  const colorsBase = extractTokenValues(
    readJson(path.join(TOKENS_DIR, "base", "colors.json"))
  );
  const colorsSemantic = extractTokenValues(
    readJson(path.join(TOKENS_DIR, "semantic", "colors.json"))
  );
  const spacing = extractTokenValues(
    readJson(path.join(TOKENS_DIR, "base", "spacing.json"))
  );
  const typography = extractTokenValues(
    readJson(path.join(TOKENS_DIR, "base", "typography.json"))
  );
  return {
    colors: colorsBase?.color
      ? { ...colorsBase.color, ...colorsSemantic?.color?.semantic }
      : {},
    spacing: spacing?.spacing || {},
    typography: typography?.fontFamily
      ? {
          fontFamily: typography.fontFamily,
          fontSize: typography.fontSize || {},
          fontWeight: typography.fontWeight || {},
          lineHeight: typography.lineHeight || {},
          letterSpacing: typography.letterSpacing || {},
        }
      : {},
  };
}

/**
 * Main: read package version, collect components, build tokens, write JSON.
 */
function main() {
  const pkgPath = path.join(ROOT, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const version = pkg.version || "0.0.0";

  const components = collectComponents();
  const tokens = buildTokens();

  const metadata = {
    version,
    tokens,
    components,
  };

  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }
  const outPath = path.join(DIST_DIR, "docs-metadata.json");
  fs.writeFileSync(outPath, JSON.stringify(metadata, null, 2), "utf8");
  console.log(
    `✅ docs-metadata.json written to ${outPath} (${components.length} components, version ${version})`
  );
}

main();
