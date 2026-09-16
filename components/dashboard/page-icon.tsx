"use client";

import React from "react";
import { ICON_MAP } from "./icon-registry";

export interface PageIconProps {
  icon?: string | null;
  className?: string;
  fallback?: string;
}

export function PageIcon({
  icon,
  className = "w-4 h-4 text-base",
  fallback = "📄",
}: PageIconProps) {
  const currentIcon = (icon && icon.trim()) ? icon : fallback;

  if (currentIcon.startsWith("logo:") || currentIcon.startsWith("icon:")) {
    const def = ICON_MAP.get(currentIcon);
    if (def) {
      return (
        <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
          {def.render({ className: "w-full h-full object-contain" })}
        </span>
      );
    }
  }

  if (
    currentIcon.startsWith("http://") ||
    currentIcon.startsWith("https://") ||
    currentIcon.startsWith("data:image/")
  ) {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
        <img src={currentIcon} alt="Page icon" className="w-full h-full object-contain" />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center shrink-0 leading-none select-none ${className}`}>
      {currentIcon}
    </span>
  );
}
