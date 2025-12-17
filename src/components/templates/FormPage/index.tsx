import React, { ReactNode } from "react";
import { Button } from "@na-design-system/components/atoms/Button";
import { Text } from "@na-design-system/components/atoms/Text";
import { Card } from "@na-design-system/components/atoms/Card";
import { Breadcrumbs } from "@na-design-system/components/organisms/Breadcrumbs";
import { cn } from "@na-design-system/utils/cn";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface FormPageProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  className?: string;
}

export const FormPage: React.FC<FormPageProps> = ({
  title,
  breadcrumbs,
  children,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="mb-6">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} className="mb-4" />
        )}
        <div className="flex items-center justify-between">
          <Text variant="h1">{title}</Text>
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                {cancelLabel}
              </Button>
            )}
            {onSubmit && (
              <Button variant="primary" onClick={onSubmit} disabled={loading}>
                {loading ? "Saving..." : submitLabel}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <Card padding="lg">{children}</Card>
    </div>
  );
};

export default FormPage;
