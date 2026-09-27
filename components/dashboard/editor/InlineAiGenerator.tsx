"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  X,
  Check,
  RotateCcw,
  Scissors,
  Plus,
  Lightbulb,
  FileSpreadsheet,
  CheckSquare,
  Mail,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { parseMarkdownToBlocks } from "@/lib/markdown-blocks";
import type { ChecklistItem } from "@/hooks/use-pages";

interface InlineAiGeneratorProps {
  blockId: string;
  pageTitle: string;
  pageContext?: string;
  onApplyBlocks: (blockId: string, blocks: ChecklistItem[]) => void;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  { label: "Draft project roadmap", icon: Compass, prompt: "Draft a clear, structured project roadmap with phases, milestones, and deliverables." },
  { label: "Brainstorm 5 ideas", icon: Lightbulb, prompt: "Brainstorm 5 creative, high-impact ideas with brief descriptions and pros/cons." },
  { label: "Launch checklist", icon: CheckSquare, prompt: "Create a thorough release and launch checklist with to-do items organized by category." },
  { label: "Meeting follow-up email", icon: Mail, prompt: "Write a professional meeting follow-up email summarizing key decisions and next steps." },
  { label: "Pros & cons matrix", icon: FileSpreadsheet, prompt: "Create a balanced pros and cons table comparing key alternatives." },
];

export function InlineAiGenerator({
  blockId,
  pageTitle,
  pageContext = "",
  onApplyBlocks,
  onClose,
}: InlineAiGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleGenerate = async (targetPrompt: string) => {
    if (!targetPrompt.trim() || isLoading) return;
    setIsLoading(true);
    setGeneratedMarkdown(null);

    try {
      const res = await fetch("/api/ai/inline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          prompt: targetPrompt,
          pageTitle,
          pageContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.quotaExceeded) {
          toast.error(data.error || "AI query quota exceeded.");
        } else {
          toast.error(data.error || "Failed to generate content.");
        }
        return;
      }

      if (data.output) {
        setGeneratedMarkdown(data.output);
      }
    } catch (err) {
      console.error("Inline AI generate error:", err);
      toast.error("Failed to connect to Notion AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedMarkdown) return;
    const blocks = parseMarkdownToBlocks(generatedMarkdown);
    if (blocks.length > 0) {
      onApplyBlocks(blockId, blocks);
      toast.success("AI content inserted into canvas");
      onClose();
    }
  };

  const handleRefine = async (refinementType: "longer" | "shorter" | "retry") => {
    if (!generatedMarkdown || isLoading) return;
    let refinePrompt = "";
    if (refinementType === "longer") {
      refinePrompt = `Expand this content with more detail and rich sections:\n\n${generatedMarkdown}`;
    } else if (refinementType === "shorter") {
      refinePrompt = `Make this content more concise and punchy without losing key points:\n\n${generatedMarkdown}`;
    } else {
      refinePrompt = prompt || "Regenerate this with fresh perspective.";
    }
    await handleGenerate(refinePrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
    if (e.key === "Enter" && !e.shiftKey && prompt.trim() && !isLoading) {
      e.preventDefault();
      handleGenerate(prompt);
    }
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className="my-3 rounded-2xl bg-popover/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-purple-500/30 dark:border-purple-500/20 shadow-xl shadow-purple-500/5 overflow-hidden text-xs text-foreground font-sans animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Top Input Bar */}
      <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent border-b border-border/40">
        <div className="p-1.5 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-xs shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Notion AI to write anything, draft plans, brainstorm..."
          disabled={isLoading}
          className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/70"
        />
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={!prompt.trim() || isLoading}
            onClick={() => handleGenerate(prompt)}
            className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-xs"
            title="Generate"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition cursor-pointer"
            title="Dismiss (Esc)"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3">
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <div className="relative">
              <div className="h-8 w-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              <Sparkles className="h-4 w-4 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <span className="text-[11px] font-medium animate-pulse text-purple-600 dark:text-purple-400">
              Generating with Notion AI...
            </span>
          </div>
        ) : generatedMarkdown ? (
          <div className="space-y-3">
            {/* Preview Box */}
            <div className="p-3.5 rounded-xl bg-foreground/[0.02] border border-border/60 max-h-56 overflow-y-auto text-[12px] leading-relaxed select-text font-sans whitespace-pre-wrap">
              {generatedMarkdown}
            </div>

            {/* Insertion & Refinement Controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-[11px] flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Insert into Page</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRefine("longer")}
                  className="px-2.5 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground font-medium text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Longer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRefine("shorter")}
                  className="px-2.5 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground font-medium text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  <Scissors className="h-3 w-3" />
                  <span>Shorter</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleRefine("retry")}
                  title="Try again"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/5 text-[11px] font-medium transition cursor-pointer"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Suggestion Quick Chips */
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-1">
              Suggested Prompts
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((qp, idx) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(qp.prompt);
                      handleGenerate(qp.prompt);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-foreground/[0.03] hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 border border-border/50 hover:border-purple-500/30 transition text-left cursor-pointer group"
                  >
                    <Icon className="h-3 w-3 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                    <span className="font-medium text-[11px]">{qp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
