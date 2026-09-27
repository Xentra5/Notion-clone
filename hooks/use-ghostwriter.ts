"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseGhostwriterProps {
  pageTitle: string;
  focusedBlockId: string | null;
  focusedBlockText: string;
  precedingText?: string;
  onApplyGhostText: (blockId: string, updatedText: string) => void;
}

export function useGhostwriter({
  pageTitle,
  focusedBlockId,
  focusedBlockText,
  precedingText = "",
  onApplyGhostText,
}: UseGhostwriterProps) {
  const [ghostText, setGhostText] = useState<string>("");
  const [targetBlockId, setTargetBlockId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notion_ghostwriter_enabled");
      return stored !== null ? stored === "true" : true;
    }
    return true;
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchedTextRef = useRef<string>("");

  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("notion_ghostwriter_enabled", String(next));
      }
      if (!next) {
        setGhostText("");
        setTargetBlockId(null);
      }
      return next;
    });
  }, []);

  const dismissGhost = useCallback(() => {
    setGhostText("");
    setTargetBlockId(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const acceptGhost = useCallback(() => {
    if (!ghostText || !targetBlockId || targetBlockId !== focusedBlockId) return;
    const combined = (focusedBlockText ? focusedBlockText.trimEnd() + " " : "") + ghostText;
    onApplyGhostText(targetBlockId, combined);
    setGhostText("");
    setTargetBlockId(null);
  }, [ghostText, targetBlockId, focusedBlockId, focusedBlockText, onApplyGhostText]);

  // Request ghostwriter suggestion on debounce
  useEffect(() => {
    if (!isEnabled || !focusedBlockId) {
      dismissGhost();
      return;
    }

    const trimmed = focusedBlockText.trim();
    // Only suggest when user has typed a meaningful partial sentence (> 6 chars) and not a markdown command like "/" or "#"
    if (trimmed.length < 6 || trimmed.startsWith("/") || trimmed === "#" || trimmed === "##") {
      dismissGhost();
      return;
    }

    // If text hasn't changed since last fetch, don't re-trigger
    if (trimmed === lastFetchedTextRef.current) {
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsLoading(true);
      lastFetchedTextRef.current = trimmed;

      try {
        const res = await fetch("/api/ai/inline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "autocomplete",
            currentText: trimmed,
            precedingText,
            pageTitle,
          }),
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.completion && typeof data.completion === "string") {
            setGhostText(data.completion);
            setTargetBlockId(focusedBlockId);
          } else {
            setGhostText("");
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("[Ghostwriter fetch error]", err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 700); // 700ms typing pause

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [focusedBlockId, focusedBlockText, precedingText, pageTitle, isEnabled, dismissGhost]);

  return {
    ghostText: targetBlockId === focusedBlockId ? ghostText : "",
    isLoading,
    isEnabled,
    toggleEnabled,
    acceptGhost,
    dismissGhost,
  };
}
