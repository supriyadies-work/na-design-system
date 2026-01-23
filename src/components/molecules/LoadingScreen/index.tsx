import React from "react";
import { Spinner } from "@na-design-system/components/atoms/Spinner";
import { cn } from "@na-design-system/utils/cn";

export interface LoadingScreenProps {
  /** Message shown below the spinner. Default: "Loading..." */
  message?: string;
  /** Optional class name for the outer wrapper */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * Full-page loading screen with centered spinner and message.
 * Use in route loading.tsx, suspense fallbacks, or inline loading states.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  className,
  testId,
}) => {
  return (
    <div
      className={cn(
        "min-h-screen bg-white dark:bg-black flex items-center justify-center",
        className
      )}
      data-testid={testId}
    >
      <div className="text-center">
        <Spinner size="lg" label={message} testId={testId ? `${testId}.spinner` : undefined} />
      </div>
    </div>
  );
};

export default LoadingScreen;
