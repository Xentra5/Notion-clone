"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  Wand2,
  Check,
  Languages,
  Scissors,
  Plus,
  RotateCcw,
  X,
  ArrowRight,
  SlidersHorizontal,
  FileText,
  Copy,
  CheckCheck,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface InlineAiSelectionMenuProps {
  selectedText: string;
  selectionRect: DOMRect | null;
  onReplaceSelection: (newText: string) => void;
  onInsertBelow: (newText: string) => void;
  onClose: () => void;
}

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "direct", label: "Direct & Concise" },
  { id: "persuasive", label: "Persuasive" },
  { id: "technical", label: "Technical" },
  { id: "friendly", label: "Friendly" },
];

const LANGUAGES = [
  { id: "Spanish", label: "Spanish" },
  { id: "French", label: "French" },
  { id: "German", label: "German" },
  { id: "Japanese", label: "Japanese" },
  { id: "Chinese", label: "Chinese" },
  { id: "Hindi", label: "Hindi" },
  { id: "Portuguese", label: "Portuguese" },
  { id: "Italian", label: "Italian" },
];

export function InlineAiSelectionMenu({
  selectedText,
  selectionRect,
  onReplaceSelection,
  onInsertBelow,
  onClose,
}: InlineAiSelectionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"menu" | "tone" | "translate">("menu");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Position the floating menu safely within viewport bounds
  useEffect(() => {
    if (!selectionRect) return;
    const padding = 12;
    const menuWidth = isOpen ? 380 : 150;
    const menuHeight = isOpen ? 320 : 44;

    let left = selectionRect.left + selectionRect.width / 2 - menuWidth / 2;
    let top = selectionRect.top - menuHeight - 10;

    // Viewport edge guards
    if (left < padding) left = padding;
    if (left + menuWidth > window.innerWidth - padding) {
      left = window.innerWidth - menuWidth - padding;
    }
    if (top < padding) {
      top = selectionRect.bottom + 10;
    }

    setMenuPosition({ top, left });
  }, [selectionRect, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  const handleExecute = useCallback(
    async (
      transformation:
        | "improve"
        | "fix_spelling"
        | "shorter"
        | "longer"
        | "summarize"
        | "tone"
        | "translate"
        | "custom",
      extraOptions?: { tone?: string; language?: string; customPrompt?: string }
    ) => {
      if (!selectedText.trim()) return;
      setIsLoading(true);
      setResult(null);

      try {
        const res = await fetch("/api/ai/inline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "transform",
            text: selectedText,
            transformation,
            customPrompt: extraOptions?.customPrompt || prompt,
            tone: extraOptions?.tone,
            language: extraOptions?.language,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          if (data.quotaExceeded) {
            toast.error(data.error || "AI query quota exceeded.");
          } else {
            toast.error(data.error || "Failed to transform text.");
          }
          return;
        }

        if (data.output) {
          setResult(data.output);
        }
      } catch (err) {
        console.error("AI Transform Error:", err);
        toast.error("Failed to connect to Notion AI.");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedText, prompt]
  );

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setHasCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setHasCopied(false), 2000);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
    if (e.key === "Enter" && !e.shiftKey && prompt.trim() && !isLoading) {
      e.preventDefault();
      handleExecute("custom", { customPrompt: prompt });
    }
  };

  if (!selectionRect) return null;

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      style={{
        position: "fixed",
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        zIndex: 9999,
      }}
      className="animate-in fade-in zoom-in-95 duration-150 select-none font-sans"
    >
      {!isOpen ? (
        /* Compact Floating Pill */
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-popover/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-border/80 shadow-xl shadow-black/10">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-sm hover:shadow transition-all duration-150 cursor-pointer group"
          >
            <Sparkles className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform duration-200" />
            <span>Ask AI</span>
          </button>
          <div className="h-4 w-px bg-border/60 mx-0.5" />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition"
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Expanded AI Canvas Copilot Panel */
        <div className="w-[380px] rounded-2xl bg-popover/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-purple-500/30 dark:border-purple-500/20 shadow-2xl shadow-purple-500/10 overflow-hidden text-xs text-foreground">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-foreground text-[13px] tracking-tight">
                Notion AI Copilot
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Prompt Input */}
          <div className="p-3 border-b border-border/40">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask AI to edit, summarize, write..."
                disabled={isLoading}
                className="w-full pl-3 pr-8 py-2 rounded-xl bg-foreground/[0.04] dark:bg-foreground/[0.06] border border-border/60 focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 outline-none text-xs text-foreground placeholder:text-muted-foreground/70 transition"
              />
              <button
                type="button"
                disabled={!prompt.trim() || isLoading}
                onClick={() => handleExecute("custom", { customPrompt: prompt })}
                className="absolute right-1.5 p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Result or Action Chips */}
          <div className="p-3 max-h-[280px] overflow-y-auto">
            {isLoading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                  <Sparkles className="h-4 w-4 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[11px] font-medium animate-pulse text-purple-600 dark:text-purple-400">
                  Refining with Notion AI...
                </span>
              </div>
            ) : result !== null ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-500/[0.05] border border-purple-500/20 text-foreground text-[12px] leading-relaxed max-h-44 overflow-y-auto whitespace-pre-wrap select-text">
                  {result}
                </div>

                {/* Actions on Result */}
                <div className="flex items-center justify-between pt-1 gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onReplaceSelection(result);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-[11px] hover:opacity-90 flex items-center gap-1 transition shadow-xs cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onInsertBelow(result);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                    >
                      <ArrowRight className="h-3 w-3" />
                      <span>Insert below</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleCopy}
                      title="Copy"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition cursor-pointer"
                    >
                      {hasCopied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setResult(null)}
                      title="Try another transformation"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === "tone" ? (
              /* Submenu: Change Tone */
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-1.5 text-muted-foreground font-medium">
                  <span>Select tone</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("menu")}
                    className="hover:text-foreground cursor-pointer text-[10px]"
                  >
                    ← Back
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleExecute("tone", { tone: t.id })}
                      className="px-2.5 py-2 rounded-xl text-left font-medium hover:bg-foreground/5 transition flex items-center justify-between cursor-pointer"
                    >
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : activeTab === "translate" ? (
              /* Submenu: Translate */
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-1.5 text-muted-foreground font-medium">
                  <span>Translate to</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("menu")}
                    className="hover:text-foreground cursor-pointer text-[10px]"
                  >
                    ← Back
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => handleExecute("translate", { language: l.id })}
                      className="px-2.5 py-2 rounded-xl text-left font-medium hover:bg-foreground/5 transition flex items-center justify-between cursor-pointer"
                    >
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Main Presets Menu */
              <div className="space-y-0.5">
                <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2 py-1">
                  Quick Edits
                </div>
                <button
                  type="button"
                  onClick={() => handleExecute("improve")}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-foreground/5 text-foreground transition text-left cursor-pointer group"
                >
                  <Wand2 className="h-3.5 w-3.5 text-purple-500 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 font-medium">Improve writing</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleExecute("fix_spelling")}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-foreground/5 text-foreground transition text-left cursor-pointer group"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 font-medium">Fix spelling & grammar</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleExecute("shorter")}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-foreground/5 text-foreground transition text-left cursor-pointer group"
                >
                  <Scissors className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 font-medium">Make shorter</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleExecute("longer")}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-foreground/5 text-foreground transition text-left cursor-pointer group"
                >
                  <Plus className="h-3.5 w-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 font-medium">Make longer / Expand</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleExecute("summarize")}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-foreground/5 text-foreground transition text-left cursor-pointer group"
                >
                  <FileText className="h-3.5 w-3.5 text-cyan-500 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 font-medium">Summarize selection</div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tone")}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-foreground/5 text-foreground transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 font-medium">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span>Change tone</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("translate")}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-foreground/5 text-foreground transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 font-medium">
                    <Languages className="h-3.5 w-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
                    <span>Translate</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
