import React, { useContext } from "react";
import { cn } from "@na-design-system/utils/cn";
import { getIconPaths, iconPaths, type IconName } from "./icons";
import { ScaleContext, useIconAssets } from "../../../utils/ScaleProvider";
import type { ScaleName } from "../../../utils/scale";

export type { IconName };
/** Daftar semua nama icon yang tersedia (untuk docs / icon directory) */
export const ICON_NAMES: IconName[] = Object.keys(iconPaths) as IconName[];

interface IconProps {
  name?: IconName | string;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  stroke?: boolean;
  fill?: boolean;
  testId?: string;
}

const sizeStyles = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

export const Icon: React.FC<IconProps> = ({
  name,
  children,
  size = "md",
  className,
  stroke = true,
  fill = false,
  testId,
}) => {
  const scaleContext = useContext(ScaleContext);
  const scale: ScaleName = scaleContext?.scale ?? "nisaaulia";
  const iconAssets = useIconAssets();
  const svgPaths = getIconPaths(scale);

  // 1. Runtime custom icon SVG from IcoMoon selection.json (nameToSvgPaths)
  // ViewBox dengan padding agar ikon (termasuk yang path-nya sampai tepi) tidak kepotong — aman untuk icon tambahan user
  if (name && iconAssets.nameToSvgPaths && name in iconAssets.nameToSvgPaths) {
    const paths = iconAssets.nameToSvgPaths[name as string];
    const VIEWBOX_PADDING = 64; // padding (unit IcoMoon 1024) supaya tepi tidak terpotong
    const VIEWBOX_SIZE = 1024 + VIEWBOX_PADDING * 2;
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-visible",
          sizeStyles[size],
          className
        )}
        role="img"
        aria-hidden="true"
        data-testid={testId}
      >
        <svg
          className={cn(sizeStyles[size], "shrink-0 min-w-0 min-h-0")}
          fill="currentColor"
          viewBox={`${-VIEWBOX_PADDING} ${-VIEWBOX_PADDING} ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: "visible" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {paths.map((d, i) => (
            <path key={i} d={d} fill="currentColor" />
          ))}
        </svg>
      </span>
    );
  }

  // 2. Runtime icon font (IcoMoon selection.json with code, no SVG paths)
  if (name && iconAssets.nameToCode && name in iconAssets.nameToCode) {
    const code = iconAssets.nameToCode[name as string];
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center",
          sizeStyles[size],
          className
        )}
        role="img"
        aria-hidden="true"
        style={{ fontFamily: "var(--icon-font-family)" }}
        data-testid={testId}
      >
        {String.fromCodePoint(code)}
      </span>
    );
  }

  // 3. SVG from registry (package icons or children)
  const iconPath = name ? svgPaths[name as IconName] ?? svgPaths[name as string] : children;
  if (!iconPath) {
    return null;
  }

  const isFillIcon =
    name &&
    ["instagram", "whatsapp", "facebook", "twitter", "linkedin"].includes(name as string);
  const useFill = fill || isFillIcon;
  const useStroke = stroke && !isFillIcon;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        sizeStyles[size],
        className
      )}
      role="img"
      aria-hidden="true"
    >
      <svg
        className={cn(sizeStyles[size])}
        fill={useFill ? "currentColor" : "none"}
        stroke={useStroke ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        data-testid={testId}
      >
        {iconPath}
      </svg>
    </span>
  );
};

export default Icon;
