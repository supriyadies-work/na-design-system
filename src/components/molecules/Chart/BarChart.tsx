"use client";

import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@supriyadies-work/supr-design-system/utils/cn";
import type { ChartDataItem } from "./types";

const DEFAULT_BAR_COLOR = "#404040";

export interface BarChartProps {
  data: ChartDataItem[];
  title?: string;
  barColor?: string;
  colors?: string[];
  className?: string;
  ariaLabel?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  barColor = DEFAULT_BAR_COLOR,
  colors,
  className,
  ariaLabel,
  height = 280,
}) => {
  const safeData = Array.isArray(data) ? data : [];
  const description =
    ariaLabel ||
    (title ? `${title}: ${safeData.length} kategori` : "Grafik batang");

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
        <RechartsBarChart
          data={safeData}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          layout="vertical"
          accessibilityLayer
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-neutral-200, #e5e5e5)"
            horizontal={false}
          />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [value, "Jumlah"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid var(--color-neutral-200, #e5e5e5)",
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} fill={barColor}>
            {colors &&
              colors.length > 0 &&
              safeData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
