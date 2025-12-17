import React from "react";
import Link from "next/link";
import { Button } from "@na-design-system/components/atoms/Button";
import { cn } from "@na-design-system/utils/cn";

interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

interface NavigationProps {
  items: NavItem[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  items,
  orientation = "horizontal",
  className,
}) => {
  return (
    <nav
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        "gap-2",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {items.map((item, index) => {
        const isActive = item.active;
        const content = (
          <span
            className={cn(
              "px-4 py-2 rounded-lg transition-colors",
              isActive
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            {item.label}
          </span>
        );

        if (item.href) {
          return (
            <Link
              key={index}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
            >
              {content}
            </Link>
          );
        }

        if (item.onClick) {
          return (
            <button
              key={index}
              onClick={item.onClick}
              aria-current={isActive ? "page" : undefined}
              className="text-left"
            >
              {content}
            </button>
          );
        }

        return <div key={index}>{content}</div>;
      })}
    </nav>
  );
};

export default Navigation;
