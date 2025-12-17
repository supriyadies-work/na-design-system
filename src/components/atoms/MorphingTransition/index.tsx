"use client";

import React from "react";

interface MorphingTransitionProps {
  wrapRef?: React.RefObject<HTMLDivElement>;
  svgRef?: React.RefObject<SVGSVGElement>;
  pathRef?: React.RefObject<SVGPathElement>;
  gradientId?: string;
  gradientColors?: {
    start: string;
    end: string;
  };
  initialPath?: string;
  className?: string;
}

/**
 * Morphing Transition Atom Component
 * SVG wrapper for morphing animations using GSAP MorphSVGPlugin
 * Provides refs for animation control
 */
export const MorphingTransition: React.FC<MorphingTransitionProps> = ({
  wrapRef,
  svgRef,
  pathRef,
  gradientId = "morphin-gradient",
  gradientColors = {
    start: "#F86BDF",
    end: "#6B6BF8",
  },
  initialPath = "M0-18.1c0,0,117.3,6.1,221,0s190.7,3.5,264.3,0c53.4-2.6,145-0.1,271.4,0c59.3,0.1,208.2,0,332.5,0 c76.2,0,120.1-3,226.6,0c74.1,2.1,150.4,0,243.5,0c96.8,0,175.8,8.5,230.8,0c55.7-8.6,129.8,0,129.8,0V0H0V-18.1z",
  className = "morphin-wrap",
}) => {
  return (
    <div ref={wrapRef} className={className}>
      <svg
        ref={svgRef}
        className="morphin-svg"
        width="100%"
        height="100vh"
        preserveAspectRatio="none"
        viewBox="0 0 1920 1080"
      >
        <path ref={pathRef} fill={`url(#${gradientId})`} d={initialPath} />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor={gradientColors.start}
              stopOpacity="0.95"
            />
            <stop
              offset="100%"
              stopColor={gradientColors.end}
              stopOpacity="0.95"
            />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default MorphingTransition;
