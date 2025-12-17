"use client";

import React from "react";
import Link from "next/link";
import { Text } from "@na-design-system/components/atoms/Text";
import { Icon } from "@na-design-system/components/atoms/Icon";
import { cn } from "@na-design-system/utils/cn";

interface BackLinkProps {
  href: string;
  label?: string;
  className?: string;
  iconClassName?: string;
}

/**
 * Back Link Molecule Component
 * Reusable back navigation link with arrow icon
 */
export const BackLink: React.FC<BackLinkProps> = ({
  href,
  label = "Back",
  className,
  iconClassName,
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-8 transition-colors",
        className
      )}
    >
      <Icon name="arrowLeft" size="md" className={iconClassName} />
      <Text variant="body" className="font-medium">
        {label}
      </Text>
    </Link>
  );
};

export default BackLink;
