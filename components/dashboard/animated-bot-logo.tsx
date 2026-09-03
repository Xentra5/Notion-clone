"use client";

import React from "react";

export type BotCharacterState = "idle" | "typing" | "fast" | "thinking" | "deepsearch" | "error";

interface AnimatedBotLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  state?: BotCharacterState;
  isThinking?: boolean;
  isTyping?: boolean;
  isDeepSearch?: boolean;
  isError?: boolean;
  activeMode?: "fast" | "think" | "deepsearch";
  showStatusBadge?: boolean;
  className?: string;
}

export function AnimatedBotLogo({
  size = "md",
  state,
  isThinking = false,
  isTyping = false,
  isDeepSearch = false,
  isError = false,
  activeMode,
  showStatusBadge = false,
  className = "",
}: AnimatedBotLogoProps) {
  // Resolve unified state with backwards compatibility
  let resolvedState: BotCharacterState = state || "idle";
  if (isError) resolvedState = "error";
  else if (isDeepSearch) resolvedState = "deepsearch";
  else if (isThinking) {
    if (activeMode === "deepsearch") resolvedState = "deepsearch";
    else if (activeMode === "think") resolvedState = "thinking";
    else resolvedState = "fast";
  } else if (isTyping) resolvedState = "typing";

  const sizeConfig = {
    xs: {
      wrapper: "h-5 w-5",
      botWidth: 20,
      botHeight: 20,
      ringPad: "p-0.5",
      eyeWidth: 3,
      eyeHeight: 2,
      eyeGap: 2.5,
      orbitOffset: 8,
      dotSize: "h-1 w-1",
      badgeSize: "h-1.5 w-1.5",
    },
    sm: {
      wrapper: "h-7 w-7",
      botWidth: 28,
      botHeight: 28,
      ringPad: "p-0.5",
      eyeWidth: 4,
      eyeHeight: 2.5,
      eyeGap: 3,
      orbitOffset: 12,
      dotSize: "h-1 w-1",
      badgeSize: "h-2 w-2",
    },
    md: {
      wrapper: "h-9 w-9",
      botWidth: 36,
      botHeight: 36,
      ringPad: "p-[3px]",
      eyeWidth: 5,
      eyeHeight: 3,
      eyeGap: 4,
      orbitOffset: 16,
      dotSize: "h-1.5 w-1.5",
      badgeSize: "h-2.5 w-2.5",
    },
    lg: {
      wrapper: "h-20 w-20",
      botWidth: 80,
      botHeight: 80,
      ringPad: "p-1.5",
      eyeWidth: 12,
      eyeHeight: 6,
      eyeGap: 8,
      orbitOffset: 36,
      dotSize: "h-2 w-2",
      badgeSize: "h-4 w-4",
    },
    xl: {
      wrapper: "h-24 w-24",
      botWidth: 96,
      botHeight: 96,
      ringPad: "p-2",
      eyeWidth: 14,
      eyeHeight: 7,
      eyeGap: 10,
      orbitOffset: 44,
      dotSize: "h-2.5 w-2.5",
      badgeSize: "h-5 w-5",
    },
  }[size];

  // Professional, subtle ambient aura (Linear / Vercel dark mode palette)
  const ambientGlowClass = {
    idle: "bg-white/[0.06] opacity-60 scale-105",
    typing: "bg-cyan-500/[0.18] opacity-85 scale-115 animate-pulse",
    fast: "bg-sky-400/[0.22] opacity-95 scale-120 animate-pulse",
    thinking: "bg-indigo-500/[0.25] opacity-95 scale-120 animate-pulse",
    deepsearch: "bg-blue-500/[0.28] opacity-100 scale-125 animate-pulse",
    error: "bg-rose-500/[0.20] opacity-90 scale-110 animate-pulse",
  }[resolvedState];

  // Clean, monochromatic & subtle conic ring gradients
  const isFastSpin = resolvedState === "thinking" || resolvedState === "fast" || resolvedState === "deepsearch";
  const conicGradient = {
    idle: "conic-gradient(from 0deg, rgba(255,255,255,0.6), rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.05))",
    typing: "conic-gradient(from 0deg, rgba(56,189,248,0.7), rgba(255,255,255,0.1) 40%, rgba(56,189,248,0.5) 75%, rgba(255,255,255,0.05))",
    fast: "conic-gradient(from 0deg, rgba(56,189,248,0.95), rgba(255,255,255,0.8) 30%, rgba(56,189,248,0.2) 60%, rgba(56,189,248,0.95))",
    thinking: "conic-gradient(from 0deg, rgba(129,140,248,0.95), rgba(99,102,241,0.6) 35%, rgba(255,255,255,0.2) 70%, rgba(129,140,248,0.95))",
    deepsearch: "conic-gradient(from 0deg, rgba(59,130,246,1), rgba(147,197,253,0.8) 35%, rgba(255,255,255,0.2) 70%, rgba(59,130,246,1))",
    error: "conic-gradient(from 0deg, rgba(244,63,94,0.8), rgba(255,255,255,0.1) 40%, rgba(251,113,133,0.5) 75%, rgba(255,255,255,0.05))",
  }[resolvedState];

  // Satellite particle
  const satelliteColor = {
    idle: "bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.8)]",
    typing: "bg-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.9)]",
    fast: "bg-sky-300 shadow-[0_0_10px_rgba(56,189,248,1)]",
    thinking: "bg-indigo-300 shadow-[0_0_10px_rgba(165,180,252,1)]",
    deepsearch: "bg-blue-300 shadow-[0_0_12px_rgba(147,197,253,1)]",
    error: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.9)]",
  }[resolvedState];

  // Subtle chassis border
  const chassisBorder = {
    idle: "border-white/15 animate-bot-float",
    typing: "border-sky-400/30 animate-bot-float",
    fast: "border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]",
    thinking: "border-indigo-400/45 shadow-[0_0_15px_rgba(129,140,248,0.25)]",
    deepsearch: "border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    error: "border-rose-500/40 animate-bot-shake",
  }[resolvedState];

  // Professional status badge
  const badgeColor = {
    idle: "bg-emerald-400 border border-black shadow-[0_0_6px_rgba(52,211,153,0.8)]",
    typing: "bg-sky-400 border border-black shadow-[0_0_6px_rgba(56,189,248,0.8)] animate-pulse",
    fast: "bg-sky-400 border border-black shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse",
    thinking: "bg-indigo-400 border border-black shadow-[0_0_8px_rgba(129,140,248,0.9)] animate-pulse",
    deepsearch: "bg-blue-500 border border-black shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse",
    error: "bg-rose-500 border border-black shadow-[0_0_6px_rgba(244,63,94,0.8)] animate-pulse",
  }[resolvedState];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeConfig.wrapper} ${className}`}
    >
      {/* Outer Ambient Glow */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-500 blur-sm pointer-events-none ${ambientGlowClass}`}
      />

      {/* Rotating Outer Conic Ring */}
      <div
        className={`absolute inset-0 rounded-full pointer-events-none transition-all duration-500 ${
          isFastSpin ? "animate-bot-spin-fast" : "animate-bot-spin-slow"
        }`}
        style={{
          background: conicGradient,
          padding: "1px",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #fff calc(100% - 1.5px))",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #fff calc(100% - 1.5px))",
        }}
      />

      {/* Primary Orbiting Satellite Particle */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
          isFastSpin ? "animate-bot-spin-fast" : "animate-bot-spin-slow"
        }`}
      >
        <div
          className={`rounded-full transition-colors duration-300 ${satelliteColor} ${sizeConfig.dotSize}`}
          style={{
            transform: `translateX(${sizeConfig.orbitOffset}px)`,
          }}
        />
      </div>

      {/* Inner Circular Bot Chassis - Obsidian Glass */}
      <div
        className={`relative z-10 w-full h-full rounded-full flex items-center justify-center overflow-hidden border bg-gradient-to-b from-zinc-800 via-zinc-950 to-black shadow-inner shadow-white/5 transition-all duration-300 ${sizeConfig.ringPad} ${chassisBorder}`}
      >
        {/* Subtle Glass Highlight Arc */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[35%] rounded-full bg-gradient-to-b from-white/25 to-transparent pointer-events-none z-10" />

        {/* DeepSearch Visor Laser Scanline Sweep - Minimal Slate/Blue */}
        {resolvedState === "deepsearch" && (
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300 to-transparent shadow-[0_0_6px_rgba(147,197,253,0.8)] pointer-events-none animate-bot-scanline z-20 opacity-80" />
        )}

        {/* Optical Sensor Core / Expressive Character Eyes */}
        <div className="relative flex items-center justify-center gap-1 z-10">
          {resolvedState === "error" && (size === "md" || size === "lg" || size === "xl") ? (
            /* Error Subtle 'X X' Eyes */
            <div className="flex items-center justify-center gap-1">
              <div
                className="relative flex items-center justify-center"
                style={{ width: sizeConfig.eyeWidth, height: sizeConfig.eyeHeight }}
              >
                <svg
                  viewBox="0 0 10 10"
                  className="w-full h-full stroke-rose-400 stroke-[2] drop-shadow-[0_0_4px_rgba(244,63,94,0.7)]"
                >
                  <line x1="2" y1="2" x2="8" y2="8" strokeLinecap="round" />
                  <line x1="8" y1="2" x2="2" y2="8" strokeLinecap="round" />
                </svg>
              </div>

              {/* Center Sensor Bridge Dot */}
              <div
                className="rounded-full bg-rose-400/50"
                style={{
                  width: `${Math.max(2, sizeConfig.eyeWidth / 2.5)}px`,
                  height: `${Math.max(2, sizeConfig.eyeHeight / 2.5)}px`,
                }}
              />

              <div
                className="relative flex items-center justify-center"
                style={{ width: sizeConfig.eyeWidth, height: sizeConfig.eyeHeight }}
              >
                <svg
                  viewBox="0 0 10 10"
                  className="w-full h-full stroke-rose-400 stroke-[2] drop-shadow-[0_0_4px_rgba(244,63,94,0.7)]"
                >
                  <line x1="2" y1="2" x2="8" y2="8" strokeLinecap="round" />
                  <line x1="8" y1="2" x2="2" y2="8" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          ) : (
            /* Standard / State-aware Clean Eyes */
            <>
              {/* Left Eye */}
              <div
                className={`rounded-full transition-all duration-300 ${
                  resolvedState === "deepsearch"
                    ? "bg-blue-200 shadow-[0_0_8px_rgba(147,197,253,0.9)]"
                    : resolvedState === "thinking"
                    ? "bg-indigo-200 shadow-[0_0_8px_rgba(165,180,252,0.9)] animate-bot-think-look"
                    : resolvedState === "fast"
                    ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse"
                    : resolvedState === "typing"
                    ? "bg-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-bot-typing-look"
                    : resolvedState === "error"
                    ? "bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                    : "bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)] animate-bot-eye-blink"
                }`}
                style={{
                  width: `${sizeConfig.eyeWidth}px`,
                  height: `${
                    resolvedState === "typing"
                      ? sizeConfig.eyeHeight * 1.15
                      : sizeConfig.eyeHeight
                  }px`,
                }}
              />

              {/* Center Sensor / Bridge Dot */}
              {(size === "md" || size === "lg" || size === "xl") && (
                <div
                  className={`rounded-full transition-colors duration-300 ${
                    resolvedState === "deepsearch"
                      ? "bg-blue-300/80"
                      : resolvedState === "thinking"
                      ? "bg-indigo-300/80"
                      : resolvedState === "fast"
                      ? "bg-white/70"
                      : resolvedState === "typing"
                      ? "bg-sky-300/70"
                      : resolvedState === "error"
                      ? "bg-rose-400/50"
                      : "bg-white/40"
                  }`}
                  style={{
                    width: `${Math.max(2, sizeConfig.eyeWidth / 2.5)}px`,
                    height: `${Math.max(2, sizeConfig.eyeHeight / 2.5)}px`,
                  }}
                />
              )}

              {/* Right Eye */}
              <div
                className={`rounded-full transition-all duration-300 ${
                  resolvedState === "deepsearch"
                    ? "bg-blue-200 shadow-[0_0_8px_rgba(147,197,253,0.9)]"
                    : resolvedState === "thinking"
                    ? "bg-indigo-200 shadow-[0_0_8px_rgba(165,180,252,0.9)] animate-bot-think-look"
                    : resolvedState === "fast"
                    ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse"
                    : resolvedState === "typing"
                    ? "bg-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-bot-typing-look"
                    : resolvedState === "error"
                    ? "bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                    : "bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)] animate-bot-eye-blink"
                }`}
                style={{
                  width: `${sizeConfig.eyeWidth}px`,
                  height: `${
                    resolvedState === "typing"
                      ? sizeConfig.eyeHeight * 1.15
                      : sizeConfig.eyeHeight
                  }px`,
                }}
              />
            </>
          )}
        </div>

        {/* Lower Mouth Waveform (for lg/xl) - Clean, Minimal Lines */}
        {(size === "lg" || size === "xl") && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-70 z-10">
            {resolvedState === "error" ? (
              <div className="flex items-center gap-0.5">
                <span className="w-1.5 h-0.5 rounded-full bg-rose-400/80" />
                <span className="w-2.5 h-0.5 rounded-full bg-rose-400" />
                <span className="w-1.5 h-0.5 rounded-full bg-rose-400/80" />
              </div>
            ) : resolvedState === "deepsearch" ? (
              <>
                <span
                  className="w-1 rounded-full bg-blue-300 h-2.5 animate-pulse"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1 rounded-full bg-blue-200 h-4 animate-pulse"
                  style={{ animationDelay: "100ms" }}
                />
                <span
                  className="w-1 rounded-full bg-blue-300 h-2.5 animate-pulse"
                  style={{ animationDelay: "200ms" }}
                />
              </>
            ) : resolvedState === "thinking" ? (
              <>
                <span
                  className="w-1 rounded-full bg-indigo-300 h-2 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1 rounded-full bg-indigo-200 h-3.5 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1 rounded-full bg-indigo-300 h-2 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </>
            ) : resolvedState === "typing" ? (
              <>
                <span
                  className="w-1 rounded-full bg-sky-300 h-1.5 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1 rounded-full bg-sky-200 h-3 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1 rounded-full bg-sky-300 h-1.5 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </>
            ) : (
              <>
                <span className="w-1 rounded-full bg-white/40 h-1" />
                <span className="w-1 rounded-full bg-white/60 h-1.5" />
                <span className="w-1 rounded-full bg-white/40 h-1" />
              </>
            )}
          </div>
        )}
      </div>

      {/* Integrated Character Status LED Dot */}
      {showStatusBadge && (
        <div
          className={`absolute -bottom-1 -right-1 rounded-full transition-all duration-300 z-20 ${sizeConfig.badgeSize} ${badgeColor}`}
          title={`Status: ${resolvedState}`}
        />
      )}
    </div>
  );
}
