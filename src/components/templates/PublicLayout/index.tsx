import React, { ReactNode } from "react";
import { PageContainer } from "@na-design-system/components/organisms/PageContainer";

interface PublicLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showAnimatedBackground?: boolean;
  className?: string;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  showAnimatedBackground = false,
  className,
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Animated Background */}
      {showAnimatedBackground && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* AnimatedBackground component would go here */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 dark:from-transparent dark:via-black/40 dark:to-black/60" />
        </div>
      )}

      <div className="relative z-10">
        {showHeader && (
          <div className="container mx-auto mt-10">
            {/* Header component would go here */}
          </div>
        )}
        <PageContainer className={className}>{children}</PageContainer>
        {showFooter && (
          <div className="container mx-auto">
            {/* Footer component would go here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicLayout;
