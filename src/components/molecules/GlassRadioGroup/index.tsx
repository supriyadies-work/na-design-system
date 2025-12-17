"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@na-design-system/utils/cn";

interface TabOption {
  id: string;
  label: string;
  value: number;
}

interface GlassRadioGroupProps {
  name: string;
  options: TabOption[];
  selectedValue: number;
  onChange: (value: number) => void;
  className?: string;
}

export const GlassRadioGroup: React.FC<GlassRadioGroupProps> = ({
  name,
  options,
  selectedValue,
  onChange,
  className,
}) => {
  const gliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gliderRef.current || !containerRef.current) return;

    const selectedIndex = options.findIndex(
      (opt) => opt.value === selectedValue
    );
    if (selectedIndex === -1) return;

    const container = containerRef.current;
    const glider = gliderRef.current;
    const labels = container.querySelectorAll("label");
    const selectedLabel = labels[selectedIndex] as HTMLElement;

    if (!selectedLabel) return;

    const containerRect = container.getBoundingClientRect();
    const labelRect = selectedLabel.getBoundingClientRect();

    const left = labelRect.left - containerRect.left;
    const width = labelRect.width;

    glider.style.transform = `translateX(${left}px)`;
    glider.style.width = `${width}px`;
  }, [selectedValue, options]);

  return (
    <div
      ref={containerRef}
      className={cn("glass-radio-group", className)}
      role="radiogroup"
    >
      <div className="glass-glider" ref={gliderRef} />
      {options.map((option) => (
        <React.Fragment key={option.id}>
          <input
            type="radio"
            id={option.id}
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          <label htmlFor={option.id}>{option.label}</label>
        </React.Fragment>
      ))}
    </div>
  );
};

export default GlassRadioGroup;
