import React, { ReactNode } from "react";
import { Button } from "@na-design-system/components/atoms/Button";
import { Text } from "@na-design-system/components/atoms/Text";
import { Breadcrumbs } from "@na-design-system/components/organisms/Breadcrumbs";
import { cn } from "@na-design-system/utils/cn";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ListPageProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  onAddNew?: () => void;
  addNewLabel?: string;
  filters?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const ListPage: React.FC<ListPageProps> = ({
  title,
  breadcrumbs,
  onAddNew,
  addNewLabel = "Add New",
  filters,
  children,
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="mb-6">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} className="mb-4" />
        )}
        <div className="flex items-center justify-between mb-4">
          <Text variant="h1">{title}</Text>
          {onAddNew && (
            <Button variant="primary" onClick={onAddNew}>
              {addNewLabel}
            </Button>
          )}
        </div>
        {filters && <div className="mt-4">{filters}</div>}
      </div>

      {/* List Content */}
      <div>{children}</div>
    </div>
  );
};

export default ListPage;
