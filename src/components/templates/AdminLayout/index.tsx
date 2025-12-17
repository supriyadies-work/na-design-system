import React, { ReactNode } from "react";
import Link from "next/link";
import { Navigation } from "@na-design-system/components/organisms/Navigation";
import { cn } from "@na-design-system/utils/cn";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  exact?: boolean;
}

interface AdminLayoutProps {
  children: ReactNode;
  menuItems: MenuItem[];
  currentPath: string;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
  onLogout?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  menuItems,
  currentPath,
  sidebarOpen = true,
  onSidebarToggle,
  onLogout,
}) => {
  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath?.startsWith(path) || false;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 transition-all duration-300 flex flex-col z-50",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between flex-shrink-0">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              CMS Admin
            </h1>
          )}
          {onSidebarToggle && (
            <button
              onClick={onSidebarToggle}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg
                className="w-5 h-5 text-neutral-600 dark:text-neutral-400"
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive(item.path, item.exact)
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0 space-y-2">
          <Link
            href="/admin/storage"
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
              isActive("/admin/storage")
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            )}
          >
            <span className="text-xl">💾</span>
            {sidebarOpen && (
              <span className="font-medium">Storage Settings</span>
            )}
          </Link>
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <span className="text-xl">🏠</span>
            {sidebarOpen && <span className="font-medium">View Site</span>}
          </Link>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
            >
              <span className="text-xl">🚪</span>
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        <div className="container mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
