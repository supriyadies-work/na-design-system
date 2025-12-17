import React from "react";
import { cn } from "@na-design-system/utils/cn";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const maxWidthStyles = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-7xl",
  full: "max-w-full",
};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  maxWidth = "2xl",
}) => {
  return (
    <div
      className={cn(
        "w-full px-4 laptop:px-0 mx-auto py-8",
        maxWidthStyles[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageContainer;
