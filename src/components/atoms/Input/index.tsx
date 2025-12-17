"use client";

import React, { useId } from "react";
import { cn } from "@na-design-system/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required = false,
  className,
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const hasError = !!error;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
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
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-2 border-2 rounded-lg",
          "bg-white dark:bg-neutral-700",
          "text-neutral-900 dark:text-white",
          "placeholder-neutral-400 dark:placeholder-neutral-500",
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
            ? `${inputId}-error`
            : helperText
              ? `${inputId}-helper`
              : undefined
        }
        required={required}
        {...props}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-error-600 dark:text-error-400"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
