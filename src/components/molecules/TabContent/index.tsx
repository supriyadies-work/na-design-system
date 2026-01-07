"use client";

import React from "react";
import { GlassRadioGroup } from "../GlassRadioGroup";
import { Button, Icon } from "@na-design-system/components/atoms";

interface TabOption {
  id: string;
  label: string;
  value: number;
}

interface TabContentProps {
  tabsRef?: React.RefObject<HTMLDivElement>;
  tabContentRef?: React.RefObject<HTMLDivElement>;
  options: TabOption[];
  currentTabIndex: number;
  pendingTabIndex?: number | null;
  isTransitioning?: boolean;
  onChange: (value: number) => void;
  name?: string;
  children: (tabIndex: number) => React.ReactNode;
  className?: string;
  contentClassName?: string;
  onViewAllClick?: () => void;
}

/**
 * Tab Content Molecule Component
 * Generic tab component that combines tab navigation with conditional content rendering
 * Uses render prop pattern for flexible content rendering
 */
export const TabContent: React.FC<TabContentProps> = ({
  tabsRef,
  tabContentRef,
  options,
  currentTabIndex,
  pendingTabIndex = null,
  isTransitioning = false,
  onChange,
  name = "tabs",
  children,
  className = "",
  contentClassName = "mt-10",
  onViewAllClick,
}) => {
  return (
    <div className={className}>
      <div
        ref={tabsRef}
        style={{
          flexDirection: "row",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <GlassRadioGroup
          name={name}
          options={options}
          selectedValue={currentTabIndex}
          onChange={onChange}
        />
        {onViewAllClick && (
          <Button variant="outline" onClick={onViewAllClick}>
            View All
            <Icon name="chevronRight" className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div
        ref={tabContentRef}
        className={contentClassName}
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        {children(pendingTabIndex ?? currentTabIndex)}
      </div>
    </div>
  );
};

export default TabContent;
