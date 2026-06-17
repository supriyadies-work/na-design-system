"use client";

import React, { ReactNode, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { cn } from "@supriyadies-work/supr-design-system/utils/cn";

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string | ReactNode;
  /** Path for direct link; omit when using children (collapsible group) */
  path?: string;
  exact?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  /** Child items: renders as collapsible accordion section */
  children?: SidebarMenuItem[];
}

export interface SidebarFooterItem {
  id: string;
  label: string;
  icon: string | ReactNode;
  path?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  variant?: "default" | "error";
}

function SidebarCollapsedGroupFlyout({
  item,
  isActive,
}: {
  item: SidebarMenuItem;
  isActive: (path: string, exact?: boolean) => boolean;
}) {
  const children = item.children ?? [];
  const hasActiveChild = children.some((c) => c.path && isActive(c.path, c.exact));
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.top, left: rect.right + 8 });
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePosition();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        flyoutRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  const icon =
    typeof item.icon === "string" ? (
      <span className="text-xl">{item.icon}</span>
    ) : (
      item.icon
    );

  return (
    <div key={item.id} className="flex justify-center py-2">
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "p-2 rounded-lg transition-colors",
          hasActiveChild || open
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        )}
        aria-label={item.label}
        aria-haspopup="menu"
        aria-expanded={open}
        title={item.label}
        onClick={() => {
          updatePosition();
          setOpen((prev) => !prev);
        }}
        onMouseEnter={item.onMouseEnter}
        onFocus={item.onFocus}
      >
        {icon}
      </button>
      {open && (
        <div
          ref={flyoutRef}
          role="menu"
          aria-label={item.label}
          className="fixed z-[200] min-w-[12rem] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1"
          style={{ top: position.top, left: position.left }}
        >
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            {item.label}
          </div>
          {children.map((child) => {
            if (!child.path) return null;
            const active = isActive(child.path, child.exact);
            return (
              <Link
                key={child.id}
                href={child.path}
                role="menuitem"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                onClick={() => {
                  child.onClick?.();
                  setOpen(false);
                }}
                onMouseEnter={child.onMouseEnter}
                onFocus={child.onFocus}
              >
                {typeof child.icon === "string" ? (
                  <span className="text-base">{child.icon}</span>
                ) : (
                  child.icon
                )}
                <span className="font-medium">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SidebarCollapsibleGroup({
  item,
  currentPath,
  sidebarOpen,
  isActive,
}: {
  item: SidebarMenuItem;
  currentPath: string;
  sidebarOpen: boolean;
  isActive: (path: string, exact?: boolean) => boolean;
}) {
  const children = item.children ?? [];
  const hasActiveChild = children.some((c) => c.path && isActive(c.path, c.exact));
  const [open, setOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) setOpen(true);
  }, [currentPath, hasActiveChild]);

  const trigger = (
    <div
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer",
        hasActiveChild
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      )}
    >
      {typeof item.icon === "string" ? (
        <span className="text-xl">{item.icon}</span>
      ) : (
        item.icon
      )}
      {sidebarOpen && (
        <>
          <span className="font-medium flex-1">{item.label}</span>
          <span
            className={cn(
              "inline-block transition-transform",
              open ? "rotate-180" : "rotate-0"
            )}
            aria-hidden
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </>
      )}
    </div>
  );

  if (!sidebarOpen) {
    return (
      <SidebarCollapsedGroupFlyout item={item} isActive={isActive} />
    );
  }

  return (
    <div key={item.id} className="space-y-0.5">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setOpen(!open)}
        onMouseEnter={item.onMouseEnter}
        onFocus={item.onFocus}
        aria-expanded={open}
        aria-controls={`sidebar-group-${item.id}`}
      >
        {trigger}
      </button>
      <div
        id={`sidebar-group-${item.id}`}
        role="region"
        aria-label={item.label}
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pl-4 pt-0.5 space-y-0.5 border-l-2 border-gray-200 dark:border-gray-600 ml-5">
          {children.map((child) => {
            if (!child.path) return null;
            const childContent = (
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm",
                  isActive(child.path, child.exact)
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                {typeof child.icon === "string" ? (
                  <span className="text-lg">{child.icon}</span>
                ) : (
                  child.icon
                )}
                <span className="font-medium">{child.label}</span>
              </div>
            );
            return (
              <Link
                key={child.id}
                href={child.path}
                onClick={child.onClick}
                onMouseEnter={child.onMouseEnter}
                onFocus={child.onFocus}
              >
                {childContent}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export interface SidebarProps {
  /** Menu items to display in the sidebar */
  menuItems: SidebarMenuItem[];
  /** Footer items (e.g., Storage Settings, View Site, Logout) */
  footerItems?: SidebarFooterItem[];
  /** Current pathname for active state detection */
  currentPath: string;
  /** Whether sidebar is open (expanded) or closed (collapsed) */
  sidebarOpen?: boolean;
  /** Callback when sidebar toggle button is clicked */
  onSidebarToggle?: () => void;
  /** Custom header content (replaces default header) */
  headerContent?: ReactNode;
  /** Custom header title (used if headerContent is not provided) */
  headerTitle?: string;
  /** Custom className for sidebar */
  className?: string;
  /** Custom className for main content wrapper */
  mainContentClassName?: string;
  /** Width when sidebar is open (default: 200px) */
  openWidth?: string;
  /** Width when sidebar is closed (default: 80px) */
  closedWidth?: string;
  /** Optional content below footer items (e.g. version text) */
  footerExtra?: ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  footerItems = [],
  currentPath,
  sidebarOpen = true,
  onSidebarToggle,
  headerContent,
  headerTitle = "CMS Admin",
  className,
  mainContentClassName,
  openWidth = "200px",
  closedWidth = "80px",
  footerExtra,
}) => {
  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath?.startsWith(path) || false;
  };

  const sidebarWidth = sidebarOpen ? openWidth : closedWidth;

  return (
    <aside
      className={cn(
        "h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col",
        className
      )}
      style={{
        width: sidebarWidth,
      }}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
        {headerContent ? (
          headerContent
        ) : (
          <>
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {headerTitle}
              </h1>
            )}
            {onSidebarToggle && (
              <button
                onClick={onSidebarToggle}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      sidebarOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          // Collapsible group (accordion): item with children
          if (item.children && item.children.length > 0) {
            return (
              <SidebarCollapsibleGroup
                key={item.id}
                item={item}
                currentPath={currentPath}
                sidebarOpen={sidebarOpen}
                isActive={isActive}
              />
            );
          }

          const content = (
            <div
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                item.path && isActive(item.path, item.exact)
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              {typeof item.icon === "string" ? (
                <span className="text-xl">{item.icon}</span>
              ) : (
                item.icon
              )}
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </div>
          );

          if (item.path) {
            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={item.onClick}
                onMouseEnter={item.onMouseEnter}
                onFocus={item.onFocus}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              onMouseEnter={item.onMouseEnter}
              onFocus={item.onFocus}
              className="w-full text-left"
            >
              {content}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {footerItems.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 space-y-2">
          {footerItems.map((item) => {
            const content = (
              <div
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  item.variant === "error"
                    ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    : isActive(item.path || "")
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                {typeof item.icon === "string" ? (
                  <span className="text-xl">{item.icon}</span>
                ) : (
                  item.icon
                )}
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </div>
            );

            if (item.onClick) {
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  onMouseEnter={item.onMouseEnter}
                  onFocus={item.onFocus}
                  className={item.path ? "w-full text-left" : "w-full"}
                >
                  {content}
                </button>
              );
            }

            if (item.path) {
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  onMouseEnter={item.onMouseEnter}
                  onFocus={item.onFocus}
                >
                  {content}
                </Link>
              );
            }

            return <div key={item.id}>{content}</div>;
          })}
          {footerExtra && (
            <div className="pt-2 text-center text-[12pt] text-gray-500 dark:text-gray-400">
              {footerExtra}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
