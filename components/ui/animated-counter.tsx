"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number; // duration in ms
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1800,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = performance.now();
          const startVal = 0;
          const endVal = value;

          const updateCounter = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out expo curve for a smooth deceleration feel
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentVal = startVal + (endVal - startVal) * easeProgress;

            setDisplayValue(currentVal);

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              setDisplayValue(endVal);
            }
          };

          requestAnimationFrame(updateCounter);
        }
      },
      { threshold: 0.15 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [value, duration, hasAnimated]);

  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.floor(displayValue).toLocaleString();

  const isDirectUnit =
    suffix.startsWith("%") ||
    suffix.startsWith(")") ||
    suffix.startsWith("+") ||
    suffix.startsWith("ms");

  return (
    <span ref={elementRef} className={`inline-flex items-baseline whitespace-nowrap ${className}`}>
      {prefix && <span>{prefix}</span>}
      <span className="tabular-nums font-semibold">{formattedValue}</span>
      {suffix && (
        <span className={isDirectUnit ? "" : "ml-1"}>
          {suffix.trimStart()}
        </span>
      )}
    </span>
  );
}
