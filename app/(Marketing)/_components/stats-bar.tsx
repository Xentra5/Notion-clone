"use client";

import React, { useEffect, useRef, useState } from "react";

interface StatItem {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

const stats: StatItem[] = [
  { target: 100, prefix: "", suffix: "M+", label: "Users worldwide" },
  { target: 50, prefix: "", suffix: "%+", label: "of YC companies" },
  { target: 1.4, decimals: 1, prefix: "", suffix: "M+", label: "Community members" },
  { target: 62, prefix: "", suffix: "%", label: "of Fortune 100" },
  { target: 1, prefix: "#", suffix: "", label: "G2 Knowledge Base" }
];

function AnimatedCounter({
  target,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1800,
  inView
}: {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  inView: boolean;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) {
      setCurrent(0);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quart: 1 - (1 - progress)^4
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const val = easeOut * target;

      setCurrent(val);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [inView, target, duration]);

  const formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export const StatsBar = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="mx-auto mt-28 max-w-[1120px] px-5">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-12 md:px-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-[36px] font-[850] tracking-tight text-black sm:text-[44px]">
                <AnimatedCounter
                  target={stat.target}
                  decimals={stat.decimals}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  inView={isVisible}
                />
              </span>
              <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

