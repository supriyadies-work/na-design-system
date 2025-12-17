import React from "react";
import { cn } from "@na-design-system/utils/cn";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  required = false,
  error = false,
  className,
  ...props
}) => {
  return (
    <label
      className={cn(
        "block text-sm font-medium",
        error
          ? "text-error-600 dark:text-error-400"
          : "text-neutral-700 dark:text-neutral-300",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-error-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  );
};

export default Label;
