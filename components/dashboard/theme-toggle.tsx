"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Avoid hydration mismatch by rendering only after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-7 w-7 rounded-md bg-transparent border border-transparent" />
    );
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const currentThemeObj = themes.find((t) => t.value === theme) || themes[1];
  const Icon = currentThemeObj.icon;

  return (
    <div className="relative font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-neutral-200 dark:hover:bg-[#252525] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition duration-150"
        title="Change theme"
      >
        <Icon className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close on click outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1.5 w-36 rounded-lg border border-neutral-200 dark:border-[#333] bg-white dark:bg-[#202020] p-1 shadow-lg z-50 text-xs text-neutral-800 dark:text-[#d4d4d4] animate-in fade-in slide-in-from-top-1 duration-100">
            {themes.map((t) => {
              const TIcon = t.icon;
              const isSelected = theme === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => {
                    setTheme(t.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition ${
                    isSelected
                      ? "bg-neutral-100 dark:bg-[#2c2c2c] text-neutral-900 dark:text-white font-medium"
                      : "hover:bg-neutral-50 dark:hover:bg-[#252525] text-neutral-600 dark:text-[#9b9b9b]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TIcon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-blue-500" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
