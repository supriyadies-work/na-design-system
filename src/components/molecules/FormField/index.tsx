import React from "react";
import { Input, Textarea, Text } from "@na-design-system/components/atoms";
import { validateField, ValidationRule } from "@na-design-system/utils/validation";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "textarea";
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  validation?: ValidationRule;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error: externalError,
  validation,
  className = "",
}) => {
  const [internalError, setInternalError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(e);
    setTouched(true);

    // Clear error when user starts typing
    if (internalError) {
      setInternalError(null);
    }

    // Run validation if provided
    if (validation && touched) {
      const validationError = validateField(e.target.value, validation, label);
      setInternalError(validationError);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (validation) {
      const validationError = validateField(value, validation, label);
      setInternalError(validationError);
    }
  };

  const error = externalError || internalError;

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block mb-2">
        <Text variant="body" className="font-medium">
          {label}
          {required && (
            <span className="text-error-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </Text>
      </label>
      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          error={error || undefined}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          error={error || undefined}
        />
      )}
      {error && touched && (
        <span role="alert" className="text-error-500 mt-1 text-sm">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormField;
