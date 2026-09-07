"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  HelpCircle,
  X,
  Search,
  Keyboard,
  Sparkles,
  LifeBuoy,
  Activity,
  ArrowRight,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";

export function FloatingHelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const { setUtilityPage, setActivePage, openCommandPalette, openQuickAi } =
    useWorkspaceStore();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function handleOpenFullHelp() {
    setIsOpen(false);
    setUtilityPage("Help");
    setActivePage({ title: "Help" });
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Popover Panel */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute bottom-12 right-0 mb-2 w-80 sm:w-96 rounded-2xl border border-border bg-card/95 backdrop-blur-md p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-foreground"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <HelpCircle className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-foreground">Help & Resources</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition"
              aria-label="Close help popover"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick Search Bar */}
          <div className="mt-3">
            <div
              onClick={() => {
                setIsOpen(false);
                handleOpenFullHelp();
              }}
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-border bg-accent/40 px-3 py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:bg-accent transition"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                <span>Search help guides...</span>
              </div>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shadow-2xs">
                ⌘ /
              </kbd>
            </div>
          </div>

          {/* Quick Links List */}
          <div className="mt-3 space-y-1">
            <button
              onClick={handleOpenFullHelp}
              className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left hover:bg-accent transition"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                <div>
                  <div className="font-medium text-foreground">Browse Help Center</div>
                  <div className="text-[10px] text-muted-foreground">Articles, block docs & tutorials</div>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                handleOpenFullHelp();
              }}
              className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left hover:bg-accent transition"
            >
              <div className="flex items-center gap-2.5">
                <Keyboard className="h-3.5 w-3.5 text-purple-500" />
                <div>
                  <div className="font-medium text-foreground">Keyboard Shortcuts</div>
                  <div className="text-[10px] text-muted-foreground">Master quick editing commands</div>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">⌘ /</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                openQuickAi();
              }}
              className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left hover:bg-accent transition"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <div>
                  <div className="font-medium text-foreground">Ask Notion AI</div>
                  <div className="text-[10px] text-muted-foreground">Instant workspace search & write</div>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">⌘ J</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                handleOpenFullHelp();
              }}
              className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left hover:bg-accent transition"
            >
              <div className="flex items-center gap-2.5">
                <LifeBuoy className="h-3.5 w-3.5 text-emerald-500" />
                <div>
                  <div className="font-medium text-foreground">Contact Support</div>
                  <div className="text-[10px] text-muted-foreground">Submit a ticket with 2h SLA</div>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>

          {/* Footer Status */}
          <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>All Systems Normal</span>
            </div>
            <button
              onClick={handleOpenFullHelp}
              className="font-medium text-foreground hover:underline"
            >
              Full Documentation →
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Help & Resources"
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-border shadow-md transition-all hover:scale-105 active:scale-95 ${
          isOpen
            ? "bg-foreground text-background"
            : "bg-card text-foreground hover:bg-accent"
        }`}
      >
        {isOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <HelpCircle className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
