import React from "react";
import { cn } from "@na-design-system/utils/cn";

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
  testId?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  className,
  testId,
}) => {
  if (orientation === "vertical") {
    return (
      <div
        className={cn(
          "w-px h-full bg-neutral-200 dark:bg-neutral-700",
          className,
        )}
        role="separator"
        aria-orientation="vertical"
        data-testid={testId}
      />
    );
  }

  return (
    <hr
      className={cn(
        "border-0 border-t border-neutral-200 dark:border-neutral-700",
        className,
      )}
      role="separator"
      aria-orientation="horizontal"
      data-testid={testId}
    />
  );
};

export default Divider;
