"use client";

import { useState } from "react";
import { X, GitCompare, History } from "lucide-react";
import type { PageBlock } from "@/lib/actions/pages";

interface RevisionItem {
  id: string;
  title: string;
  savedAt: string;
  blocksCount: number;
  blocks?: PageBlock[];
}

interface VersionDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  currentBlocks: PageBlock[];
  revision: RevisionItem | null;
  onRestore: (revisionId: string) => void;
}

export function VersionDiffModal({
  isOpen,
  onClose,
  currentTitle,
  currentBlocks,
  revision,
  onRestore,
}: VersionDiffModalProps) {
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");

  if (!isOpen || !revision) return null;

  const pastBlocks = revision.blocks || [];

  // Compute diff items
  const diffItems = computeDiff(currentBlocks, pastBlocks);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-background border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/10 bg-foreground/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <GitCompare className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Version Diff Comparison</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ({new Date(revision.savedAt).toLocaleString()})
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Comparing current version with revision snapshot
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-lg border border-foreground/10 bg-foreground/5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewMode === "split" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Split View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("unified")}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewMode === "unified" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Unified Diff
              </button>
            </div>

            <button
              type="button"
              onClick={() => onRestore(revision.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
            >
              <History className="h-3.5 w-3.5" />
              <span>Restore This Version</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Diff Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
          {viewMode === "split" ? (
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Past Revision Column */}
              <div className="border border-foreground/10 rounded-xl p-4 bg-red-500/[0.02] dark:bg-red-500/[0.04]">
                <div className="text-xs font-semibold text-red-500 mb-3 pb-2 border-b border-red-500/20 flex items-center justify-between">
                  <span>Past Revision ({pastBlocks.length} blocks)</span>
                  <span className="text-[10px] font-mono">{revision.title}</span>
                </div>
                <div className="space-y-2">
                  {pastBlocks.map((b) => (
                    <div key={b.id} className="p-2 rounded bg-background border border-foreground/10 text-foreground">
                      <span className="text-[10px] text-muted-foreground block uppercase font-sans font-bold">{b.type}</span>
                      <p className="font-sans leading-relaxed">{b.properties?.text || <span className="italic text-muted-foreground">Empty</span>}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Version Column */}
              <div className="border border-foreground/10 rounded-xl p-4 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]">
                <div className="text-xs font-semibold text-emerald-500 mb-3 pb-2 border-b border-emerald-500/20 flex items-center justify-between">
                  <span>Current Version ({currentBlocks.length} blocks)</span>
                  <span className="text-[10px] font-mono">{currentTitle}</span>
                </div>
                <div className="space-y-2">
                  {currentBlocks.map((b) => (
                    <div key={b.id} className="p-2 rounded bg-background border border-foreground/10 text-foreground">
                      <span className="text-[10px] text-muted-foreground block uppercase font-sans font-bold">{b.type}</span>
                      <p className="font-sans leading-relaxed">{b.properties?.text || <span className="italic text-muted-foreground">Empty</span>}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Unified Diff Mode */
            <div className="space-y-2 border border-foreground/10 rounded-xl p-4 bg-background">
              {diffItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border font-sans text-xs flex items-start gap-3 ${
                    item.status === "added"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : item.status === "removed"
                      ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 line-through opacity-80"
                      : "bg-foreground/[0.02] border-foreground/10 text-foreground"
                  }`}
                >
                  <span className="font-mono font-bold text-sm select-none shrink-0 w-4 text-center">
                    {item.status === "added" ? "+" : item.status === "removed" ? "-" : " "}
                  </span>
                  <div className="flex-1">
                    <span className="text-[9px] uppercase tracking-wider font-bold block opacity-60 mb-0.5">{item.type}</span>
                    <p>{item.text || <span className="italic opacity-50">Empty block</span>}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-foreground/10 bg-foreground/[0.02] flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Added in Current</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Removed / Modified</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-foreground/10 hover:bg-foreground/15 text-foreground font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function computeDiff(currentBlocks: PageBlock[], pastBlocks: PageBlock[]) {
  const result: { status: "added" | "removed" | "unchanged"; type: string; text: string }[] = [];

  const pastMap = new Map(pastBlocks.map((b) => [b.id, b]));
  const currentMap = new Map(currentBlocks.map((b) => [b.id, b]));

  pastBlocks.forEach((b) => {
    if (!currentMap.has(b.id)) {
      result.push({ status: "removed", type: b.type, text: b.properties?.text || "" });
    }
  });

  currentBlocks.forEach((b) => {
    if (!pastMap.has(b.id)) {
      result.push({ status: "added", type: b.type, text: b.properties?.text || "" });
    } else {
      const past = pastMap.get(b.id)!;
      if (past.properties?.text !== b.properties?.text) {
        result.push({ status: "removed", type: past.type, text: past.properties?.text || "" });
        result.push({ status: "added", type: b.type, text: b.properties?.text || "" });
      } else {
        result.push({ status: "unchanged", type: b.type, text: b.properties?.text || "" });
      }
    }
  });

  return result;
}
