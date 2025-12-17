import React from "react";
import { cn } from "@na-design-system/utils/cn";

interface InputGroupProps {
  children: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  children,
  prefix,
  suffix,
  className,
}) => {
  return (
    <div className={cn("flex items-center", className)}>
      {prefix && (
        <span className="px-3 py-2 border border-r-0 border-neutral-300 dark:border-neutral-600 rounded-l-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
          {prefix}
        </span>
      )}
      <div className="flex-1">{children}</div>
      {suffix && (
        <span className="px-3 py-2 border border-l-0 border-neutral-300 dark:border-neutral-600 rounded-r-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
          {suffix}
        </span>
      )}
    </div>
  );
};

export default InputGroup;
