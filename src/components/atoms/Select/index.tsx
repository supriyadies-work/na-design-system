"use client";

import React, { useId } from "react";
import { cn } from "@na-design-system/utils/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  required = false,
  className,
  id,
  options,
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const hasError = !!error;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
        >
          {label}
          {required && (
            <span className="text-error-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "w-full px-4 py-2 border-2 rounded-lg",
          "bg-white dark:bg-neutral-700",
          "text-neutral-900 dark:text-white",
          "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
          "transition-all",
          "aria-invalid:border-error-500",
          hasError
            ? "border-error-500 dark:border-error-500"
            : "border-neutral-300 dark:border-neutral-600",
          className
        )}
        aria-invalid={hasError}
        aria-describedby={
          hasError
            ? `${selectId}-error`
            : helperText
              ? `${selectId}-helper`
              : undefined
        }
        required={required}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          id={`${selectId}-error`}
          className="mt-1 text-sm text-error-600 dark:text-error-400"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={`${selectId}-helper`}
          className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Select;
