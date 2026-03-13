"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { ScaleName, setScale, getCurrentScale, getScaleConfig, initScale } from "./scale";
import { parseIcoMoonSelection, parseIcoMoonSelectionToSvgPaths } from "./parseIcoMoonSelection";

interface ScaleContextType {
  scale: ScaleName;
  setScale: (scale: ScaleName) => void;
  config: ReturnType<typeof getScaleConfig>;
  assetsLoadError?: { tokens?: boolean; fonts?: boolean; icons?: boolean };
}

export const ScaleContext = createContext<ScaleContextType | undefined>(undefined);

/** Runtime icon set from IcoMoon selection.json: name → unicode (font) and/or name → SVG path d[] (SVG mapping) */
export interface IconAssetsContextType {
  nameToCode: Record<string, number> | null;
  /** name → array of SVG path d strings (for custom icon SVG from IcoMoon) */
  nameToSvgPaths: Record<string, string[]> | null;
  loaded: boolean;
}

const IconAssetsContext = createContext<IconAssetsContextType>({ nameToCode: null, nameToSvgPaths: null, loaded: false });

export { IconAssetsContext };

export interface ScaleProviderAssetsConfig {
  /** Base URL for assets (e.g. "" or "/assets") */
  assetBaseUrl?: string;
  /** URL to fonts manifest JSON (primary, mono, icon, heading) */
  fontsManifestUrl?: string;
  /** URL to IcoMoon selection.json */
  iconSelectionUrl?: string;
  /** URL to theme/tokens JSON (flat or nested, applied to :root) */
  tokensUrl?: string;
  /** Called when asset fetch fails (dev-friendly) */
  onAssetsLoadError?: (error: { tokens?: boolean; fonts?: boolean; icons?: boolean }) => void;
}

interface ScaleProviderProps {
  children: React.ReactNode;
  defaultScale?: ScaleName;
  /** Optional runtime assets (fonts, icons, tokens) */
  assetBaseUrl?: string;
  fontsManifestUrl?: string;
  iconSelectionUrl?: string;
  tokensUrl?: string;
  onAssetsLoadError?: (error: { tokens?: boolean; fonts?: boolean; icons?: boolean }) => void;
}

function resolveUrl(base: string | undefined, path: string): string {
  if (!base) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : "/" + path;
  return b + p;
}

function toCSSVarName(key: string): string {
  return key.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "").replace(/\./g, "-");
}

/** Apply token object to :root (nested or flat keys like "color.primary.500") */
function applyTokensToRoot(obj: Record<string, unknown>, prefix = ""): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === "object" && !Array.isArray(value) && typeof (value as Record<string, unknown>).value === "string") {
      const tokenValue = (value as { value: string }).value;
      const varName = prefix ? `${prefix}-${key}` : key;
      root.style.setProperty("--" + toCSSVarName(varName), tokenValue);
    } else if (typeof value === "string") {
      const varName = prefix ? `${prefix}-${key}` : key;
      root.style.setProperty("--" + toCSSVarName(varName), value);
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      applyTokensToRoot(value as Record<string, unknown>, prefix ? `${prefix}-${key}` : key);
    }
  }
}

/**
 * ScaleProvider - Provides scale context and optional runtime assets (fonts, icons, tokens)
 */
export function ScaleProvider({
  children,
  defaultScale = "nisaaulia",
  assetBaseUrl,
  fontsManifestUrl,
  iconSelectionUrl,
  tokensUrl,
  onAssetsLoadError,
}: ScaleProviderProps) {
  const [scale, setCurrentScale] = useState<ScaleName>(defaultScale);
  const [assetsLoadError, setAssetsLoadError] = useState<{ tokens?: boolean; fonts?: boolean; icons?: boolean } | undefined>();
  const [iconAssets, setIconAssets] = useState<IconAssetsContextType>({ nameToCode: null, nameToSvgPaths: null, loaded: false });
  const warnedRef = useRef(false);

  useEffect(() => {
    if (defaultScale) {
      setScale(defaultScale);
      setCurrentScale(defaultScale);
    } else {
      initScale();
      setCurrentScale(getCurrentScale());
    }
  }, [defaultScale]);

  // Fetch and apply runtime assets
  useEffect(() => {
    const base = assetBaseUrl ?? "";
    const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";

    const reportError = (which: "tokens" | "fonts" | "icons") => {
      if (!isDev || warnedRef.current) return;
      setAssetsLoadError((prev) => ({ ...prev, [which]: true }));
      onAssetsLoadError?.({ [which]: true });
      console.warn(
        `[supr-design-system] ${which}Url could not be loaded. To generate example files, run: npx @supriyadies-work/supr-design-system init. See README.`
      );
      warnedRef.current = true;
    };

    let cancelled = false;

    // 1. Fonts manifest
    if (fontsManifestUrl && typeof document !== "undefined") {
      const url = resolveUrl(base, fontsManifestUrl);
      fetch(url)
        .then((res) => {
          if (cancelled || !res.ok) throw new Error("Fonts manifest fetch failed");
          return res.json();
        })
        .then((manifest: Record<string, string | { url?: string; family?: string }>) => {
          if (cancelled) return;
          const fontBase = base;
          const style = document.createElement("style");
          style.setAttribute("data-supr-design-system", "fonts");
          let css = "";
          const familyMap: Record<string, string> = {};
          for (const [role, entry] of Object.entries(manifest)) {
            const rawUrl = typeof entry === "string" ? "fonts/" + entry : (entry as { url?: string }).url || "";
            const urlVal = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : resolveUrl(fontBase, rawUrl);
            const family = typeof entry === "object" && entry && (entry as { family?: string }).family
              ? (entry as { family: string }).family
              : (typeof entry === "string" ? entry.replace(/\.[^.]+$/, "") : "font-" + role);
            familyMap[role] = family;
            css += `@font-face{font-family:"${family}";src:url("${urlVal}") format("woff2"),url("${urlVal}") format("woff");}\n`;
          }
          style.textContent = css;
          document.head.appendChild(style);
          const root = document.documentElement;
          if (familyMap.primary) root.style.setProperty("--font-family-primary", `"${familyMap.primary}", sans-serif`);
          if (familyMap.mono) root.style.setProperty("--font-family-mono", `"${familyMap.mono}", monospace`);
          if (familyMap.heading) root.style.setProperty("--font-family-heading", `"${familyMap.heading}", serif`);
          if (familyMap.icon) root.style.setProperty("--icon-font-family", `"${familyMap.icon}"`);
        })
        .catch(() => {
          if (!cancelled) reportError("fonts");
        });
    }

    // 2. IcoMoon selection.json
    if (iconSelectionUrl && typeof document !== "undefined") {
      const url = resolveUrl(base, iconSelectionUrl);
      fetch(url)
        .then((res) => {
          if (cancelled || !res.ok) throw new Error("Icon selection fetch failed");
          return res.json();
        })
        .then((json) => {
          if (cancelled) return;
          const nameToCode = parseIcoMoonSelection(json);
          const nameToSvgPaths = parseIcoMoonSelectionToSvgPaths(json);
          setIconAssets({ nameToCode, nameToSvgPaths: Object.keys(nameToSvgPaths).length > 0 ? nameToSvgPaths : null, loaded: true });
        })
        .catch(() => {
          if (!cancelled) {
            reportError("icons");
            setIconAssets({ nameToCode: null, nameToSvgPaths: null, loaded: true });
          }
        });
    } else {
      setIconAssets((prev) => (prev.loaded ? prev : { nameToCode: null, nameToSvgPaths: null, loaded: true }));
    }

    // 3. Tokens URL (theme override)
    if (tokensUrl && typeof document !== "undefined") {
      const url = resolveUrl(base, tokensUrl);
      fetch(url)
        .then((res) => {
          if (cancelled || !res.ok) throw new Error("Tokens fetch failed");
          return res.json();
        })
        .then((json) => {
          if (cancelled) return;
          applyTokensToRoot(json as Record<string, unknown>);
        })
        .catch(() => {
          if (!cancelled) reportError("tokens");
        });
    }

    return () => {
      cancelled = true;
    };
  }, [assetBaseUrl, fontsManifestUrl, iconSelectionUrl, tokensUrl, onAssetsLoadError]);

  const handleSetScale = (newScale: ScaleName) => {
    setScale(newScale);
    setCurrentScale(newScale);
  };

  return (
    <ScaleContext.Provider
      value={{
        scale,
        setScale: handleSetScale,
        config: getScaleConfig(),
        assetsLoadError,
      }}
    >
      <IconAssetsContext.Provider value={iconAssets}>
        {children}
      </IconAssetsContext.Provider>
    </ScaleContext.Provider>
  );
}

export function useScale() {
  const context = useContext(ScaleContext);
  if (context === undefined) {
    throw new Error("useScale must be used within a ScaleProvider");
  }
  return context;
}

export function useIconAssets(): IconAssetsContextType {
  return useContext(IconAssetsContext);
}
