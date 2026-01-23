"use client";

import { SearchInput } from "../SearchInput";
import { Button } from "@na-design-system/components/atoms/Button";

interface FilterOption {
  id: string;
  name: string;
  value: string;
}

interface SearchAndFilterProps {
  // Search props
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;

  // Category/Filter props (optional)
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  categories?: FilterOption[];
  categoryLabel?: string;

  // Layout toggle props (optional)
  layout?: "grid" | "list";
  onLayoutChange?: (layout: "grid" | "list") => void;
  showLayoutToggle?: boolean;

  // Active filters display
  showActiveFilters?: boolean;
  testId?: string;
}

export default function SearchAndFilter({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  selectedCategory,
  onCategoryChange,
  categories = [],
  categoryLabel = "All Categories",
  layout,
  onLayoutChange,
  showLayoutToggle = false,
  showActiveFilters = true,
  testId,
}: SearchAndFilterProps) {
  return (
    <div className="mb-8 space-y-4" data-testid={testId}>
      {/* Search Bar and Filters */}
      <div
        className="flex flex-col mob:flex-row gap-4 items-start mob:items-center"
        data-testid={testId ? `${testId}.controls` : undefined}
      >
        {/* Search Input */}
        <div className="flex-1 w-full mob:w-auto">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            testId={testId ? `${testId}.search` : undefined}
          />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && onCategoryChange && (
          <div className="w-full mob:w-auto">
            <select
              value={selectedCategory || ""}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full mob:w-auto px-4 py-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              data-testid={testId ? `${testId}.categoryFilter` : undefined}
            >
              <option value="">{categoryLabel}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.value}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Layout Toggle */}
        {showLayoutToggle && layout && onLayoutChange && (
          <div className="flex gap-2 w-full mob:w-auto">
            <Button
              variant={layout === "grid" ? "primary" : "outline"}
              size="sm"
              onClick={() => onLayoutChange("grid")}
              className="p-2"
              testId={testId ? `${testId}.layoutGrid` : undefined}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </Button>
            <Button
              variant={layout === "list" ? "primary" : "outline"}
              size="sm"
              onClick={() => onLayoutChange("list")}
              className="p-2"
              testId={testId ? `${testId}.layoutList` : undefined}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {showActiveFilters && (selectedCategory || searchQuery) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Active filters:
          </span>
          {selectedCategory && categories.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
              {categories.find((c) => (c.value || c.id) === selectedCategory)
                ?.name || "Category"}
              <button
                onClick={() => onCategoryChange?.("")}
                className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
              >
                ×
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200">
              Search: &quot;{searchQuery}&quot;
              <button
                onClick={() => onSearchChange("")}
                className="ml-2 text-success-600 dark:text-success-400 hover:text-success-800 dark:hover:text-success-200"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
