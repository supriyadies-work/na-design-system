"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@na-design-system/utils/cn";

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string | ReactNode;
  path: string;
  exact?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
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
}) => {
  // #region agent log
  if(typeof window!=='undefined'){console.log('[Sidebar] Received props:',{footerItemsCount:footerItems.length,footerItemsIds:footerItems.map(i=>i.id),sidebarOpen});}
  // #endregion
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
          const content = (
            <div
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive(item.path, item.exact)
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

          // If item has path, use Link; otherwise use button
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

          // Button for items without path
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
      {(() => {
        // #region agent log
        if(typeof window!=='undefined'){console.log('[Sidebar] Footer render check:',{footerItemsLength:footerItems.length,willRender:footerItems.length>0,items:footerItems.map(i=>({id:i.id,label:i.label,hasOnClick:!!i.onClick,hasPath:!!i.path}))});}
        // #endregion
        return null;
      })()}
      {footerItems.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 space-y-2">
          {footerItems.map((item) => {
            // #region agent log
            if(typeof window!=='undefined'){console.log('[Sidebar] Rendering footer item:',{id:item.id,label:item.label,icon:item.icon,hasOnClick:!!item.onClick,hasPath:!!item.path});}
            // #endregion
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
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
