import React, { ReactNode } from "react";
import { Button } from "@na-design-system/components/atoms/Button";
import { Text } from "@na-design-system/components/atoms/Text";
import { Breadcrumbs } from "@na-design-system/components/organisms/Breadcrumbs";
import { Card } from "@na-design-system/components/atoms/Card";
import { cn } from "@na-design-system/utils/cn";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Action {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
}

interface DetailPageProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: Action[];
  children: ReactNode;
  className?: string;
}

export const DetailPage: React.FC<DetailPageProps> = ({
  title,
  breadcrumbs,
  actions,
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
          {actions && actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "primary"}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Content */}
      <Card padding="lg">{children}</Card>
    </div>
  );
};

export default DetailPage;
