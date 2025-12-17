import React from "react";
import { cn } from "@na-design-system/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "md",
  hover = false,
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700",
        paddingStyles[padding],
        hover && "hover:shadow-lg transition-shadow",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
