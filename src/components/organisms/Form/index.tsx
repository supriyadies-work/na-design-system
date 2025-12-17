import React, { FormEvent } from "react";
import { FormGroup } from "@na-design-system/components/molecules/FormGroup";
import { Button } from "@na-design-system/components/atoms/Button";
import { Alert } from "@na-design-system/components/molecules/Alert";
import { validateForm, ValidationSchema } from "@na-design-system/utils/validation";
import { cn } from "@na-design-system/utils/cn";

interface FormField {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio";
  required?: boolean;
  error?: string;
  value: any;
  onChange: (value: any) => void;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface FormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  success?: string;
  className?: string;
  validation?:
    | ValidationSchema
    | ((data: Record<string, any>) => Record<string, string>);
}

export const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel,
  loading = false,
  error,
  success,
  className,
  validation,
}) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData: Record<string, any> = {};
    fields.forEach((field) => {
      formData[field.name] = field.value;
    });

    // Run validation if provided
    if (validation) {
      let validationErrors: Record<string, string> = {};

      if (typeof validation === "function") {
        // Custom validation function
        validationErrors = validation(formData);
      } else {
        // Validation schema
        const result = validateForm(formData, validation);
        if (!result.isValid) {
          validationErrors = result.errors;
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        // Mark all fields as touched
        const touchedFields: Record<string, boolean> = {};
        fields.forEach((field) => {
          touchedFields[field.name] = true;
        });
        setTouched(touchedFields);
        return;
      }
    }

    setErrors({});
    await onSubmit(formData);
  };

  const handleFieldChange = (name: string, value: any) => {
    const field = fields.find((f) => f.name === name);
    if (field) {
      field.onChange(value);
      setTouched({ ...touched, [name]: true });
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors({ ...errors, [name]: "" });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      {error && <Alert variant="error" message={error} className="mb-4" />}
      {success && (
        <Alert variant="success" message={success} className="mb-4" />
      )}

      <FormGroup spacing="md">
        {fields.map((field) => {
          const fieldError = errors[field.name] || field.error;
          const isTouched = touched[field.name];

          // This is a simplified version - in practice, you'd use the actual form field components
          return (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                {field.label}
                {field.required && (
                  <span className="text-error-500 ml-1">*</span>
                )}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={field.value || ""}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  required={field.required}
                  placeholder={field.placeholder}
                  aria-invalid={!!fieldError}
                  aria-describedby={
                    fieldError && isTouched ? `${field.name}-error` : undefined
                  }
                  className={cn(
                    "w-full px-4 py-2 border-2 rounded-lg",
                    "bg-white dark:bg-neutral-700",
                    "text-neutral-900 dark:text-white",
                    "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                    fieldError && "border-error-500"
                  )}
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={field.value || ""}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  required={field.required}
                  aria-invalid={!!fieldError}
                  aria-describedby={
                    fieldError && isTouched ? `${field.name}-error` : undefined
                  }
                  className={cn(
                    "w-full px-4 py-2 border-2 rounded-lg",
                    "bg-white dark:bg-neutral-700",
                    "text-neutral-900 dark:text-white",
                    "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                    fieldError && "border-error-500"
                  )}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  id={field.name}
                  name={field.name}
                  value={field.value || ""}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  required={field.required}
                  placeholder={field.placeholder}
                  aria-invalid={!!fieldError}
                  aria-describedby={
                    fieldError && isTouched ? `${field.name}-error` : undefined
                  }
                  className={cn(
                    "w-full px-4 py-2 border-2 rounded-lg",
                    "bg-white dark:bg-neutral-700",
                    "text-neutral-900 dark:text-white",
                    "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                    fieldError && "border-error-500"
                  )}
                />
              )}
              {fieldError && isTouched && (
                <p
                  id={`${field.name}-error`}
                  className="mt-1 text-sm text-error-600 dark:text-error-400"
                  role="alert"
                >
                  {fieldError}
                </p>
              )}
            </div>
          );
        })}
      </FormGroup>

      <div className="flex gap-2 mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
      </div>
    </form>
  );
};

export default Form;
