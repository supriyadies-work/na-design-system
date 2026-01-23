import React from "react";
import { Input } from "@na-design-system/components/atoms/Input";
import { Icon } from "@na-design-system/components/atoms/Icon";
import { cn } from "@na-design-system/utils/cn";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  testId?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className,
  testId,
}) => {
  return (
    <div className={cn("relative", className)} data-testid={testId}>
      <Icon
        size="md"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
        testId={testId ? `${testId}.icon` : undefined}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </Icon>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
        testId={testId ? `${testId}.input` : undefined}
      />
    </div>
  );
};

export default SearchInput;
