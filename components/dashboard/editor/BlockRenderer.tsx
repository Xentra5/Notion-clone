"use client";

import { Check, FileText, GripVertical, Sparkles } from "lucide-react";
import type { ChecklistItem } from "@/hooks/use-pages";

interface BlockRendererProps {
  items: ChecklistItem[];
  onToggleCheck: (id: string) => void;
  onOpenAi: () => void;
  onSelectSubPage: (title: string) => void;
}

export function BlockRenderer({
  items,
  onToggleCheck,
  onOpenAi,
  onSelectSubPage,
}: BlockRendererProps) {
  return (
    <div className="space-y-3.5 pt-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="group flex items-start gap-2 -ml-6 pl-1 rounded-lg hover:bg-accent/40 py-1 transition"
        >
          {/* Drag Handle Icon on Hover */}
          <div className="opacity-0 group-hover:opacity-100 transition text-muted-foreground cursor-grab pt-1 shrink-0">
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="flex-1 space-y-2">
            {item.type === "todo" && (
              <div className="flex items-start gap-3 text-sm text-foreground leading-relaxed">
                <button
                  type="button"
                  onClick={() => onToggleCheck(item.id)}
                  className={`mt-0.5 h-4 w-4 rounded border transition flex items-center justify-center shrink-0 ${
                    item.checked
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border bg-transparent hover:border-muted-foreground"
                  }`}
                  aria-label="Toggle checkbox"
                >
                  {item.checked && <Check className="h-3 w-3 stroke-[2.5]" />}
                </button>

                <span
                  className={`flex-1 ${
                    item.checked ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {item.hasAiSparkle ? (
                    <>
                      Tap anywhere and select{" "}
                      <button
                        onClick={onOpenAi}
                        className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-medium hover:underline mx-0.5"
                      >
                        <Sparkles className="h-3.5 w-3.5 inline fill-purple-500/20" />
                      </button>{" "}
                      in the bar above your keyboard to check out{" "}
                      <button
                        onClick={onOpenAi}
                        className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                      >
                        Notion AI
                      </button>
                    </>
                  ) : (
                    item.text
                  )}
                </span>
              </div>
            )}

            {item.type === "heading" && (
              <h2 className="text-xl font-bold text-foreground pt-1">{item.text}</h2>
            )}

            {item.type === "quote" && (
              <blockquote className="border-l-2 border-primary pl-3 py-1 text-sm text-muted-foreground italic bg-accent/30 rounded-r-lg">
                {item.text}
              </blockquote>
            )}

            {item.type === "bullet" && (
              <div className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-muted-foreground font-bold">•</span>
                <span>{item.text}</span>
              </div>
            )}

            {/* Sub page link if present */}
            {item.hasSubPage && (
              <div className="pl-7 pt-0.5">
                <button
                  onClick={() => onSelectSubPage("Example sub page")}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card hover:bg-accent border border-border hover:border-border/80 text-xs font-medium text-foreground transition group/sub shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground group-hover/sub:text-foreground transition" />
                  <span className="underline underline-offset-2 decoration-neutral-400 dark:decoration-[#555] group-hover/sub:decoration-foreground">
                    Example sub page
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
