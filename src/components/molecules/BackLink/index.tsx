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
  testId?: string;
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
  testId,
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-8 transition-colors",
        className
      )}
      testId={testId}
    >
      <Icon name="arrowLeft" size="md" className={iconClassName} testId={testId ? `${testId}.icon` : undefined} />
      <Text variant="body" className="font-medium" testId={testId ? `${testId}.label` : undefined}>
        {label}
      </Text>
    </Link>
  );
};

export default BackLink;
