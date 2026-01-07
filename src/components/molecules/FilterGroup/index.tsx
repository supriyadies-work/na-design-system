import React from "react";
import { Text } from "@na-design-system/components/atoms/Text";
import { Button } from "@na-design-system/components/atoms/Button";
import { cn } from "@na-design-system/utils/cn";

interface FilterGroupProps {
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  formatOption?: (option: string) => string;
  allLabel?: string;
  className?: string;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
  formatOption,
  allLabel = "All",
  className,
}) => {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Text variant="label" className="text-sm font-medium whitespace-nowrap">
        {label}:
      </Text>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="filter"
          size="md"
          onClick={() => onSelect("all")}
          isActive={selectedValue === "all"}
          className="px-4 py-2 h-10"
        >
          {allLabel}
        </Button>
        {options.map((option) => (
          <Button
            key={option}
            variant="filter"
            size="md"
            onClick={() => onSelect(option)}
            isActive={selectedValue === option}
            className="px-4 py-2 h-10"
          >
            {formatOption ? formatOption(option) : option}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FilterGroup;

