"use client";

import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@supriyadies-work/supr-design-system/utils/cn";
import type { ChartDataItem } from "./types";

const DEFAULT_COLORS = [
  "#404040",
  "#737373",
  "#a3a3a3",
  "#d4d4d4",
  "#525252",
  "#262626",
];

export interface PieChartProps {
  data: ChartDataItem[];
  title?: string;
  colors?: string[];
  className?: string;
  ariaLabel?: string;
  height?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  colors = DEFAULT_COLORS,
  className,
  ariaLabel,
  height = 280,
}) => {
  const safeData = Array.isArray(data) ? data.filter((d) => d.value > 0) : [];
  const description =
    ariaLabel ||
    (title ? `${title}: ${safeData.length} kategori` : "Grafik lingkaran");

  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={description}
    >
      {title && (
        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          accessibilityLayer
        >
          <Pie
            data={safeData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            label={({ name, percent }) =>
              percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ""
            }
          >
            {safeData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value, "Jumlah responden"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid var(--color-neutral-200, #e5e5e5)",
            }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
