"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@supriyadies-work/supr-design-system/utils/cn";

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

// -------------------------
// ToastProvider + useToast
// -------------------------

type ToastVariant = "success" | "error" | "info";

export type ToastOptions = {
  id?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number; // default 5000
};

type ToastItem = Required<Pick<ToastOptions, "id" | "message">> & {
  variant: ToastVariant;
  durationMs: number;
  createdAt: number;
};

type ToastContextValue = {
  pushToast: (options: ToastOptions) => string;
  closeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function makeId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Record<string, number>>({});

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timeoutsRef.current[id];
    if (t) window.clearTimeout(t);
    delete timeoutsRef.current[id];
  }, []);

  const pushToast = useCallback(
    (options: ToastOptions) => {
      const id = options.id || makeId();
      const toast: ToastItem = {
        id,
        message: options.message,
        variant: options.variant || "info",
        durationMs: options.durationMs ?? 5000,
        createdAt: Date.now(),
      };

      setToasts((prev) => [toast, ...prev].slice(0, 4));

      const timeout = window.setTimeout(() => {
        closeToast(id);
      }, toast.durationMs);
      timeoutsRef.current[id] = timeout;

      return id;
    },
    [closeToast]
  );

  useEffect(() => {
    return () => {
      for (const id of Object.keys(timeoutsRef.current)) {
        window.clearTimeout(timeoutsRef.current[id]);
      }
      timeoutsRef.current = {};
    };
  }, []);

  const value = useMemo(
    () => ({ pushToast, closeToast }),
    [pushToast, closeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={closeToast} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onClose,
}: {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  const viewport = (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-[320px] max-w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );

  if (typeof document !== "undefined" && document.body) {
    return createPortal(viewport, document.body);
  }
  return viewport;
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  const startXRef = useRef<number | null>(null);
  const [dx, setDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || startXRef.current == null) return;
    setDx(e.clientX - startXRef.current);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    startXRef.current = null;
    if (Math.abs(dx) > 80) {
      onClose();
      return;
    }
    setDx(0);
  };

  const styles: React.CSSProperties = {
    transform: dx ? `translateX(${dx}px)` : undefined,
    transition: isDragging ? "none" : "transform 150ms ease",
  };

  const variantClasses =
    toast.variant === "success"
      ? "border-success-200 dark:border-success-800 bg-success-50/95 dark:bg-success-900/30 text-success-800 dark:text-success-200"
      : toast.variant === "error"
        ? "border-error-200 dark:border-error-800 bg-error-50/95 dark:bg-error-900/30 text-error-800 dark:text-error-200"
        : "border-neutral-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-900/70 text-neutral-900 dark:text-white";

  return (
    <div
      className={cn(
        "pointer-events-auto select-none rounded-xl border shadow-lg backdrop-blur px-4 py-3",
        variantClasses
      )}
      style={styles}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="text-sm font-medium flex-1">{toast.message}</div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 -mt-1 -mr-1 p-1 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Close notification"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
