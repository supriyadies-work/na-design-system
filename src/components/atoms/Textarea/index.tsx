"use client";

import React, { useId } from "react";
import { cn } from "@na-design-system/utils/cn";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  testId?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  required = false,
  className,
  id,
  testId,
  ...props
}) => {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const hasError = !!error;
  const { children: _unused, ...textareaProps } = props;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
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
      <textarea
        id={textareaId}
        className={cn(
          "w-full px-4 py-2 border-2 rounded-lg",
          "bg-white dark:bg-neutral-700",
          "text-neutral-900 dark:text-white",
          "placeholder-neutral-400 dark:placeholder-neutral-500",
          "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
          "transition-all resize-none",
          "aria-invalid:border-error-500",
          hasError
            ? "border-error-500 dark:border-error-500"
            : "border-neutral-300 dark:border-neutral-600",
          className
        )}
        aria-invalid={hasError}
        aria-describedby={
          hasError
            ? `${textareaId}-error`
            : helperText
              ? `${textareaId}-helper`
              : undefined
        }
        required={required}
        data-testid={testId}
        {...textareaProps}
      />
      {error && (
        <p
          id={`${textareaId}-error`}
          className="mt-1 text-sm text-error-600 dark:text-error-400"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={`${textareaId}-helper`}
          className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Textarea;
