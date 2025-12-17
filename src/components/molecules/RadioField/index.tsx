import React from "react";
import { Radio } from "@na-design-system/components/atoms/Radio";
import { Text } from "@na-design-system/components/atoms/Text";

interface RadioFieldProps {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export const RadioField: React.FC<RadioFieldProps> = ({
  label,
  name,
  value,
  checked,
  onChange,
  required = false,
  error,
  className = "",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <Radio
        id={`${name}-${value}`}
        name={name}
        value={value}
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

export default RadioField;
