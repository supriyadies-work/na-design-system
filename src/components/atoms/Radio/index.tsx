"use client";

import React, { useId } from "react";
import { cn } from "@na-design-system/utils/cn";

interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  error?: string;
  required?: boolean;
  testId?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  error,
  required = false,
  className,
  id,
  testId,
  ...props
}) => {
  const generatedId = useId();
  const radioId = id || generatedId;
  const hasError = !!error;

  return (
    <div className="w-full">
      <div className="flex items-center">
        <input
          type="radio"
          id={radioId}
          className={cn(
            "w-4 h-4 border-2",
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
          aria-describedby={hasError ? `${radioId}-error` : undefined}
          required={required}
          data-testid={testId}
          {...props}
        />
        {label && (
          <label
            htmlFor={radioId}
            className={cn(
              "ml-2 text-sm font-medium",
              hasError
                ? "text-error-600 dark:text-error-400"
                : "text-neutral-700 dark:text-neutral-300"
            )}
            data-testid={testId ? `${testId}.label` : undefined}
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
          id={`${radioId}-error`}
          className="mt-1 text-sm text-error-600 dark:text-error-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Radio;
