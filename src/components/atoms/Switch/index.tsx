"use client";

import React, { useId } from "react";
import { cn } from "@na-design-system/utils/cn";

interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  error?: string;
  required?: boolean;
  testId?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  error,
  required = false,
  className,
  id,
  testId,
  ...props
}) => {
  const generatedId = useId();
  const switchId = id || generatedId;
  const hasError = !!error;

  return (
    <div className="w-full">
      <div className="flex items-center">
        <label
          htmlFor={switchId}
          className="relative inline-flex items-center cursor-pointer"
        >
          <input
            type="checkbox"
            id={switchId}
            className="sr-only peer"
            aria-invalid={hasError}
            aria-describedby={hasError ? `${switchId}-error` : undefined}
            required={required}
            data-testid={testId}
            {...props}
          />
          <div
            className={cn(
              "w-11 h-6 bg-neutral-300 dark:bg-neutral-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600",
              hasError && "ring-2 ring-error-500",
              className
            )}
            role="switch"
            aria-checked={props.checked}
          />
        </label>
        {label && (
          <label
            htmlFor={switchId}
            className={cn(
              "ml-3 text-sm font-medium",
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
          id={`${switchId}-error`}
          className="mt-1 text-sm text-error-600 dark:text-error-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Switch;
