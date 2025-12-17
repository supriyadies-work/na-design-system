"use client";

import React, { useId } from "react";
import { cn } from "@na-design-system/utils/cn";

interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  required = false,
  className,
  id,
  ...props
}) => {
  const generatedId = useId();
  const checkboxId = id || generatedId;
  const hasError = !!error;

  return (
    <div className="w-full">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={checkboxId}
          className={cn(
            "w-4 h-4 rounded border-2",
            "bg-white dark:bg-neutral-700",
            "text-primary-600 focus:ring-2 focus:ring-primary-500",
            "transition-all",
            "aria-invalid:border-error-500",
            hasError
              ? "border-error-500 dark:border-error-500"
              : "border-neutral-300 dark:border-neutral-600",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${checkboxId}-error` : undefined}
          required={required}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className={cn(
              "ml-2 text-sm font-medium",
              hasError
                ? "text-error-600 dark:text-error-400"
                : "text-neutral-700 dark:text-neutral-300"
            )}
          >
            {label}
            {required && (
              <span className="text-error-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
      </div>
      {error && (
        <p
          id={`${checkboxId}-error`}
          className="mt-1 text-sm text-error-600 dark:text-error-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Checkbox;
