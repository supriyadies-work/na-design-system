import React from "react";
import { cn } from "@na-design-system/utils/cn";

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
}

const spacingStyles = {
  sm: "space-y-2",
  md: "space-y-4",
  lg: "space-y-6",
};

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className,
  spacing = "md",
}) => {
  return (
    <div className={cn(spacingStyles[spacing], className)}>{children}</div>
  );
};

export default FormGroup;
