import React from "react";
import { cn } from "@na-design-system/utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeStyles = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-b-2",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className,
  label,
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-neutral-900 dark:border-white",
          sizeStyles[size],
          className
        )}
        role="status"
        aria-label={label || "Loading"}
      >
        <span className="sr-only">{label || "Loading..."}</span>
      </div>
      {label && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {label}
        </p>
      )}
    </div>
  );
};

export default Spinner;
