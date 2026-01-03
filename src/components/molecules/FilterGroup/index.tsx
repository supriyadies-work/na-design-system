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
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Text variant="label" className="text-sm font-medium self-center">
        {label}:
      </Text>
      <Button
        variant="filter"
        size="sm"
        onClick={() => onSelect("all")}
        isActive={selectedValue === "all"}
      >
        {allLabel}
      </Button>
      {options.map((option) => (
        <Button
          key={option}
          variant="filter"
          size="sm"
          onClick={() => onSelect(option)}
          isActive={selectedValue === option}
        >
          {formatOption ? formatOption(option) : option}
        </Button>
      ))}
    </div>
  );
};

export default FilterGroup;

