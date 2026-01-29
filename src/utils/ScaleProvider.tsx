"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ScaleName, setScale, getCurrentScale, getScaleConfig, initScale } from "./scale";

interface ScaleContextType {
  scale: ScaleName;
  setScale: (scale: ScaleName) => void;
  config: ReturnType<typeof getScaleConfig>;
}

const ScaleContext = createContext<ScaleContextType | undefined>(undefined);

interface ScaleProviderProps {
  children: React.ReactNode;
  defaultScale?: ScaleName;
}

/**
 * ScaleProvider - Provides scale context to the application
 * 
 * @example
 * ```tsx
 * // For nisaaulia (default)
 * <ScaleProvider>
 *   <App />
 * </ScaleProvider>
 * 
 * // For supriyadies
 * <ScaleProvider defaultScale="supriyadies">
 *   <App />
 * </ScaleProvider>
 * ```
 */
export function ScaleProvider({ children, defaultScale = "nisaaulia" }: ScaleProviderProps) {
  const [scale, setCurrentScale] = useState<ScaleName>(defaultScale);

  useEffect(() => {
    // Initialize scale on mount
    if (defaultScale) {
      setScale(defaultScale);
      setCurrentScale(defaultScale);
    } else {
      initScale();
      setCurrentScale(getCurrentScale());
    }
  }, [defaultScale]);

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
      }}
    >
      {children}
    </ScaleContext.Provider>
  );
}

/**
 * Hook to access scale context
 */
export function useScale() {
  const context = useContext(ScaleContext);
  if (context === undefined) {
    throw new Error("useScale must be used within a ScaleProvider");
  }
  return context;
}
