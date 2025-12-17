import React from "react";
import { cn } from "@na-design-system/utils/cn";

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
  spacing?: "sm" | "md" | "lg";
}

const spacingStyles = {
  sm: "gap-1",
  md: "gap-2",
  lg: "gap-4",
};

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  orientation = "horizontal",
  spacing = "md",
}) => {
  return (
    <div
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        spacingStyles[spacing],
        className
      )}
      role="group"
    >
      {children}
    </div>
  );
};

export default ButtonGroup;
