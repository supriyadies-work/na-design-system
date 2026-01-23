import React from "react";
import { cn } from "@na-design-system/utils/cn";
import { iconPaths, type IconName } from "./icons";

interface IconProps {
  name?: IconName;
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
  const iconPath = name ? iconPaths[name] : children;

  if (!iconPath) {
    return null;
  }

  // Determine if icon uses fill or stroke based on name
  const isFillIcon = name && ["instagram", "whatsapp"].includes(name);
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
