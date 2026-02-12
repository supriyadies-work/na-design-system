"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@na-design-system/utils/cn";

interface ToastProps {
  message: string;
  variant?: "success" | "info";
  duration?: number;
  onClose?: () => void;
  className?: string;
}

const variantStyles = {
  success:
    "bg-success-50 dark:bg-success-900/30 border-success-200 dark:border-success-800 text-success-800 dark:text-success-200",
  info: "bg-info-50 dark:bg-info-900/30 border-info-200 dark:border-info-800 text-info-800 dark:text-info-200",
};

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = "success",
  duration = 3000,
  onClose,
  className,
}) => {
  useEffect(() => {
    if (!onClose || duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  const toastContent = (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[100] px-4 py-3 rounded-lg border shadow-lg text-sm font-medium",
        variantStyles[variant],
        className
      )}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );

  if (typeof document !== "undefined" && document.body) {
    return createPortal(toastContent, document.body);
  }

  return toastContent;
};

export default Toast;
