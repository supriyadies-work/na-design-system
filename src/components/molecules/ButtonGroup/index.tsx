import React from "react";
import { cn } from "@na-design-system/utils/cn";

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
  spacing?: "sm" | "md" | "lg";
  testId?: string;
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
  testId,
}) => {
  return (
    <div
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        spacingStyles[spacing],
        className,
      )}
      role="group"
      data-testid={testId}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            testId: testId ? `${testId}.button.${index}` : undefined,
          });
        }
        return child;
      })}
    </div>
  );
};

export default ButtonGroup;
