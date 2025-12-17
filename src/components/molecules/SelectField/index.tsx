import React from "react";
import { Select } from "@na-design-system/components/atoms/Select";
import { Label } from "@na-design-system/components/atoms/Label";
import { Text } from "@na-design-system/components/atoms/Text";

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  error,
  className = "",
}) => {
  const selectOptions = placeholder
    ? [{ value: "", label: placeholder }, ...options]
    : options;

  return (
    <div className={`mb-4 ${className}`}>
      <Label htmlFor={name} required={required} error={!!error}>
        {label}
      </Label>
      <Select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        options={selectOptions}
        error={error}
      />
      {error && (
        <Text variant="small" className="text-error-500 mt-1">
          {error}
        </Text>
      )}
    </div>
  );
};

export default SelectField;
