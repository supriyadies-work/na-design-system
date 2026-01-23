import { useEffect, useRef, useState } from "react";

interface AnimatedBackgroundProps {
  className?: string;
  testId?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className = "",
  testId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Detect theme from DOM
  useEffect(() => {
    setMounted(true);
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mounted) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let canvasWidth = 0;
    let canvasHeight = 0;
    let dpr = 1;

    // Set canvas size with device pixel ratio for crisp rendering
    const resizeCanvas = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvasWidth = rect.width;
      canvasHeight = rect.height;

      // Set display size first (CSS pixels)
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      // Set actual size in memory (scaled for DPR)
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;

      // Reset transform to identity matrix first
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Scale the context to match device pixel ratio
      // This ensures 1 CSS pixel = 1 coordinate unit
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resizeCanvas);

    // Mouse position tracking - use custom cursor position from Cursor component
    const mousePos = { x: -1000, y: -1000 };
    let isMouseOverCanvas = false;

    // Listen to custom cursor position event (smooth interpolated position)
    const handleCursorPosition = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number }>;
      const rect = canvas.getBoundingClientRect();
      // Convert cursor position (screen coordinates) to canvas coordinates
      mousePos.x = customEvent.detail.x - rect.left;
      mousePos.y = customEvent.detail.y - rect.top;
    };

    // Fallback: use mouse events if custom cursor event is not available
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Only update if custom cursor event hasn't been received recently
      // This is a fallback for when custom cursor is not active
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
      isMouseOverCanvas = true;
    };

    const handleMouseEnter = () => {
      isMouseOverCanvas = true;
    };

    const handleMouseLeave = () => {
      isMouseOverCanvas = false;
    };

    // Listen to custom cursor position event (primary source)
    window.addEventListener(
      "cursorPosition",
      handleCursorPosition as EventListener,
      { passive: true },
    );

    // Fallback: use window events if custom cursor is not available
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Listen on canvas for enter/leave events
    canvas.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    canvas.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    // Also listen on canvas for mousemove as backup
    canvas.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Theme-based colors
    const getParticleColors = () => {
      if (isDark) {
        // Dark mode: subtle colors that work on black background
        return [
          "rgba(248, 107, 223, 0.4)", // Pink - more subtle
          "rgba(107, 107, 248, 0.4)", // Blue - more subtle
          "rgba(255, 255, 255, 0.15)", // White - very subtle
        ];
      } else {
        // Light mode: soft pastel colors that work on white background
        return [
          "rgba(248, 107, 223, 0.25)", // Pink - soft
          "rgba(107, 107, 248, 0.25)", // Blue - soft
          "rgba(0, 0, 0, 0.08)", // Black - very subtle
        ];
      }
    };

    const getGradientColors = () => {
      if (isDark) {
        // Dark mode: subtle gradient
        return [
          "rgba(248, 107, 223, 0.08)",
          "rgba(107, 107, 248, 0.08)",
          "rgba(248, 107, 223, 0.08)",
        ];
      } else {
        // Light mode: very subtle gradient
        return [
          "rgba(248, 107, 223, 0.05)",
          "rgba(107, 107, 248, 0.05)",
          "rgba(248, 107, 223, 0.05)",
        ];
      }
    };

    const particleColors = getParticleColors();
    const gradientColors = getGradientColors();

    // Particle system
    interface Particle {
      x: number;
      y: number;
      radius: number;
      originalRadius?: number;
      vx: number;
      vy: number;
      opacity: number;
      color: string;
      isMutated?: boolean; // Flag for particles created by mutation
      mutationTimer?: number; // Timer to track how long particle has been mutated
    }

    const particles: Particle[] = [];
    const particleCount = 30; // Reduced from 50 to 30 for better performance
    const mutationRadius = 200; // Reduced from 250
    const mutationInterval = 150; // Increased from 100 (less frequent mutations)
    let mutationCounter = 0;

    // Create particles with theme-based colors
    // Wait for canvas to be resized first
    resizeCanvas();

    for (let i = 0; i < particleCount; i++) {
      const colorIndex = i % 3;
      const baseOpacity = isDark ? 0.3 : 0.2;
      particles.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        radius: Math.random() * 3 + 2.5, // Increased size: 2.5-5.5px
        vx: (Math.random() - 0.5) * 1.5, // Increased velocity: -0.75 to 0.75
        vy: (Math.random() - 0.5) * 1.5,
        opacity: Math.random() * 0.3 + baseOpacity,
        color: particleColors[colorIndex],
      });
    }

    // Animation loop
    const animate = () => {
      // Ensure transform is correct before drawing - reset every frame to prevent distortion
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Clear with correct dimensions (accounting for DPR scaling)
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Mutation system - create new particles near mouse
      if (isMouseOverCanvas && mousePos.x >= 0 && mousePos.y >= 0) {
        mutationCounter++;
        if (mutationCounter >= mutationInterval) {
          mutationCounter = 0;

          // Count particles in mutation radius
          const particlesInRadius = particles.filter((p) => {
            const dx = mousePos.x - p.x;
            const dy = mousePos.y - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < mutationRadius;
          });

          // Create new particles if there are particles in radius and not too many
          if (particlesInRadius.length > 0 && particles.length < 80) {
            const baseParticle =
              particlesInRadius[
                Math.floor(Math.random() * particlesInRadius.length)
              ];

            // Create 2-3 new particles near the base particle
            const newParticleCount = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < newParticleCount; i++) {
              const angle =
                (Math.PI * 2 * i) / newParticleCount + Math.random() * 0.5;
              const distance = 20 + Math.random() * 30;
              const colorIndex = Math.floor(Math.random() * 3);

              particles.push({
                x: baseParticle.x + Math.cos(angle) * distance,
                y: baseParticle.y + Math.sin(angle) * distance,
                radius: Math.random() * 2 + 1.5,
                originalRadius: Math.random() * 2 + 1.5,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                opacity: isDark ? 0.4 : 0.25,
                color: particleColors[colorIndex],
                isMutated: true,
                mutationTimer: 0,
              });
            }
          }
        }
      }

      // Remove mutated particles that are far from mouse
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        if (particle.isMutated) {
          if (particle.mutationTimer !== undefined) {
            particle.mutationTimer++;
          }

          const dx = mousePos.x - particle.x;
          const dy = mousePos.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Remove if too far from mouse or timer expired
          if (
            distance > mutationRadius * 1.5 ||
            (particle.mutationTimer && particle.mutationTimer > 300)
          ) {
            particles.splice(i, 1);
          }
        }
      }

      // Update and draw particles
      // Use for loop instead of forEach for better performance
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        // Mouse interaction - magnetic effect
        const dx = mousePos.x - particle.x;
        const dy = mousePos.y - particle.y;
        const distanceSquared = dx * dx + dy * dy;
        const maxDistance = mutationRadius; // Maximum interaction distance
        const maxDistanceSquared = maxDistance * maxDistance;
        const strongDistance = 100; // Increased strong magnetic field distance for more sensitivity
        const strongDistanceSquared = strongDistance * strongDistance;

        // Only apply magnetic effect if mouse is over canvas or nearby
        if (
          distanceSquared < maxDistanceSquared &&
          isMouseOverCanvas &&
          mousePos.x >= 0 &&
          mousePos.y >= 0
        ) {
          const distance = Math.sqrt(distanceSquared);
          // Strong magnetic attraction - exponential force (more sensitive)
          const normalizedDistance = distance / maxDistance;
          const forceMultiplier =
            distanceSquared < strongDistanceSquared
              ? Math.pow(1 - distance / strongDistance, 2) * 5 // Much stronger when close
              : Math.pow(1 - normalizedDistance, 1.8); // Stronger exponential decay

          const force = forceMultiplier * 0.6; // Increased base force for better sensitivity
          const angle = Math.atan2(dy, dx);

          // Strong magnetic pull towards mouse with more responsive interpolation
          const smoothForce = force * 0.9; // Less reduction for more responsive movement
          particle.vx += Math.cos(angle) * smoothForce;
          particle.vy += Math.sin(angle) * smoothForce;

          // Add direct position adjustment for more responsive effect
          const directPull = (1 - normalizedDistance) * 0.25; // Increased for more sensitivity
          particle.x += Math.cos(angle) * directPull;
          particle.y += Math.sin(angle) * directPull;

          // Magnetic field effect - optimized with early exit
          // Only check nearby particles (skip if too far)
          for (let j = 0; j < particles.length; j++) {
            const other = particles[j];
            if (other === particle) continue;

            const otherDx = other.x - particle.x;
            const otherDy = other.y - particle.y;
            const otherDistanceSquared = otherDx * otherDx + otherDy * otherDy;

            // Early exit if too far
            if (otherDistanceSquared > 6400) continue; // 80^2

            const otherDistance = Math.sqrt(otherDistanceSquared);
            const otherDxToMouse = mousePos.x - other.x;
            const otherDyToMouse = mousePos.y - other.y;
            const otherDistToMouseSquared =
              otherDxToMouse * otherDxToMouse + otherDyToMouse * otherDyToMouse;
            const maxDistanceSquared = maxDistance * maxDistance;

            if (otherDistToMouseSquared < maxDistanceSquared) {
              // Particles attract each other (magnetic bonding)
              const bondForce = (1 - otherDistance / 80) * 0.05;
              const bondAngle = Math.atan2(otherDy, otherDx);
              particle.vx += Math.cos(bondAngle) * bondForce;
              particle.vy += Math.sin(bondAngle) * bondForce;
            }
          }

          // Increase opacity and size when in magnetic field
          const sizeMultiplier =
            distance < strongDistance
              ? 1.8
              : 1 + (1 - normalizedDistance) * 0.5;
          particle.opacity = Math.min(
            particle.opacity + force * 4,
            isDark ? 0.9 : 0.7,
          );

          // Store original radius for size animation
          if (!particle.originalRadius) {
            particle.originalRadius = particle.radius;
          }
          particle.radius = (particle.originalRadius || 2.5) * sizeMultiplier;
        } else {
          // Gradually return to normal when leaving magnetic field
          const baseOpacity = isDark ? 0.3 : 0.2;
          particle.opacity += (baseOpacity - particle.opacity) * 0.08;

          if (particle.originalRadius) {
            particle.radius +=
              ((particle.originalRadius || 2.5) - particle.radius) * 0.15;
          }
        }

        // Apply minimal friction to keep particles moving
        particle.vx *= 0.995; // Reduced friction
        particle.vy *= 0.995;

        // Ensure minimum velocity to keep particles moving
        const minVelocity = 0.1;
        if (
          Math.abs(particle.vx) < minVelocity &&
          Math.abs(particle.vy) < minVelocity
        ) {
          // Add small random velocity if particle is too slow
          particle.vx += (Math.random() - 0.5) * 0.2;
          particle.vy += (Math.random() - 0.5) * 0.2;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvasWidth) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvasHeight) particle.vy *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvasWidth, particle.x));
        particle.y = Math.max(0, Math.min(canvasHeight, particle.y));

        // Draw particle with perfect circle
        // Ensure no transform distortion by using clean context state
        ctx.beginPath();
        // Use full 2π for complete circle
        ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = particle.color.replace(
          /[\d\.]+\)$/g,
          `${particle.opacity})`,
        );
        ctx.fill();

        // Draw connections to other particles - optimized to reduce nested loops
        // Only check particles after current index to avoid duplicate checks
        const particleIndex = particles.indexOf(particle);
        for (let j = particleIndex + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distanceSquared = dx * dx + dy * dy; // Use squared distance to avoid sqrt
          const connectionDistance = 150;
          const connectionDistanceSquared =
            connectionDistance * connectionDistance;

          if (distanceSquared < connectionDistanceSquared) {
            const distance = Math.sqrt(distanceSquared);
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            const lineOpacity = (1 - distance / connectionDistance) * 0.2;
            ctx.strokeStyle = particle.color.replace(
              /[\d\.]+\)$/g,
              `${lineOpacity})`,
            );
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Draw connection to mouse if close (only for some particles to reduce overhead)
        if (
          i % 3 === 0 &&
          isMouseOverCanvas &&
          mousePos.x >= 0 &&
          mousePos.y >= 0
        ) {
          const dx = mousePos.x - particle.x;
          const dy = mousePos.y - particle.y;
          const distanceSquared = dx * dx + dy * dy;
          const maxDistance = 200;
          const maxDistanceSquared = maxDistance * maxDistance;

          if (distanceSquared < maxDistanceSquared) {
            const distance = Math.sqrt(distanceSquared);
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(mousePos.x, mousePos.y);
            const opacity = (1 - distance / maxDistance) * 0.15;
            ctx.strokeStyle = particle.color.replace(
              /[\d\.]+\)$/g,
              `${opacity})`,
            );
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw gradient overlay with theme-based colors
      ctx.save();
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvasWidth,
        canvasHeight,
      );
      gradient.addColorStop(0, gradientColors[0]);
      gradient.addColorStop(0.5, gradientColors[1]);
      gradient.addColorStop(1, gradientColors[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener(
        "cursorPosition",
        handleCursorPosition as EventListener,
      );
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mounted, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ zIndex: 0, pointerEvents: "auto" }}
      data-testid={testId}
    />
  );
};

export default AnimatedBackground;
