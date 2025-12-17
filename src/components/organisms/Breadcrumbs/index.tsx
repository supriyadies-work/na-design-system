import React from "react";
import Link from "next/link";
import { Text } from "@na-design-system/components/atoms/Text";
import { Icon } from "@na-design-system/components/atoms/Icon";
import { cn } from "@na-design-system/utils/cn";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
}) => {
  return (
    <nav
      className={cn("flex items-center gap-2", className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2" role="list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && (
                <Icon
                  size="sm"
                  className="text-neutral-400 dark:text-neutral-500"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Icon>
              )}
              {isLast ? (
                <Text
                  variant="small"
                  className="text-neutral-900 dark:text-white font-medium"
                  aria-current="page"
                >
                  {item.label}
                </Text>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <Text variant="small">{item.label}</Text>
                </Link>
              ) : (
                <Text
                  variant="small"
                  className="text-neutral-600 dark:text-neutral-400"
                >
                  {item.label}
                </Text>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
