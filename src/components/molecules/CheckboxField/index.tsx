import React from "react";
import { Checkbox } from "@na-design-system/components/atoms/Checkbox";
import { Text } from "@na-design-system/components/atoms/Text";

interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  name,
  checked,
  onChange,
  required = false,
  error,
  className = "",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <Checkbox
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        label={label}
        required={required}
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

export default CheckboxField;
