import React from "react";
import { Button } from "@na-design-system/components/atoms/Button";
import { Text } from "@na-design-system/components/atoms/Text";
import { cn } from "@na-design-system/utils/cn";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onRowClick,
  actions,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-white mb-4"></div>
          <Text
            variant="body"
            className="text-neutral-600 dark:text-neutral-400"
          >
            Loading...
          </Text>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <Text variant="body" className="text-neutral-600 dark:text-neutral-400">
          No data available
        </Text>
      </div>
    );
  }

  return (
    <div
      className={cn("overflow-x-auto", className)}
      role="region"
      aria-label="Data table"
    >
      <table className="w-full border-collapse" role="table">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-700">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >
                {column.header}
              </th>
            ))}
            {actions && (
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(item)}
              onKeyDown={(e) => {
                if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onRowClick(item);
                }
              }}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "button" : "row"}
              aria-label={`Row ${index + 1}`}
              className={cn(
                "border-b border-neutral-200 dark:border-neutral-700",
                onRowClick &&
                  "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-4 py-3 text-sm text-neutral-900 dark:text-white"
                >
                  {column.render
                    ? column.render(item)
                    : item[column.key]?.toString() || "-"}
                </td>
              ))}
              {actions && (
                <td
                  className="px-4 py-3"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  {actions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
