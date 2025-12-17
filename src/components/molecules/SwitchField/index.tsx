import React from "react";
import { Switch } from "@na-design-system/components/atoms/Switch";
import { Text } from "@na-design-system/components/atoms/Text";

interface SwitchFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export const SwitchField: React.FC<SwitchFieldProps> = ({
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
      <Switch
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

export default SwitchField;
