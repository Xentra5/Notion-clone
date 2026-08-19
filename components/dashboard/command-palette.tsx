"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  Plus,
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
import { getPages, createPage, type Page } from "@/lib/actions/pages";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAi: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenAi }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(() => {
      setQuery("");
      setSelectedIndex(0);
    });

    let isCancelled = false;
    getPages()
      .then((data) => {
        if (!isCancelled) setPages(data);
      })
      .catch((err) => console.error(err));

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  const filteredPages = useMemo(() => {
    if (!query.trim()) return pages.slice(0, 8);
    const q = query.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.blocks?.some((b) => b.properties?.text?.toLowerCase().includes(q))
    );
  }, [pages, query]);

  // Combined selectable list (quick actions + pages)
  const totalQuickActions = !query ? 3 : 0;
  const totalItems = totalQuickActions + filteredPages.length;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelectPage = useCallback(
    (pageId: string) => {
      onClose();
      router.push(`/dashboard/${pageId}`);
    },
    [onClose, router]
  );

  const handleCreateNewPage = useCallback(async () => {
    onClose();
    try {
      const newPage = await createPage({ title: query.trim() || "Untitled" });
      window.dispatchEvent(new CustomEvent("page-created", { detail: { page: newPage } }));
      router.push(`/dashboard/${newPage._id}`);
    } catch (err) {
      console.error(err);
    }
  }, [query, onClose, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (totalItems > 0) {
        setSelectedIndex((prev) => (prev + 1) % totalItems);
      }
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (totalItems > 0) {
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (!query && selectedIndex === 0) {
        void handleCreateNewPage();
      } else if (!query && selectedIndex === 1) {
        onClose();
        onOpenAi();
      } else if (!query && selectedIndex === 2) {
        setTheme(theme === "dark" ? "light" : "dark");
        onClose();
      } else {
        const pageIdx = !query ? selectedIndex - 3 : selectedIndex;
        if (filteredPages[pageIdx]) {
          handleSelectPage(filteredPages[pageIdx]._id);
        } else if (query.trim()) {
          void handleCreateNewPage();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Click outside backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        onKeyDown={handleKeyDown}
        className="w-full max-w-xl bg-background border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] font-sans"
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-foreground/10">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search pages…"
            className="w-full text-base bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-foreground/15 rounded-md bg-foreground/5">
            ESC
          </kbd>
        </div>

        {/* Command & Search Results Container */}
        <div className="overflow-y-auto p-2 space-y-3">
          {/* Quick Actions */}
          {!query && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={handleCreateNewPage}
                  onMouseEnter={() => setSelectedIndex(0)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-left cursor-pointer ${
                    selectedIndex === 0
                      ? "bg-accent text-accent-foreground ring-1 ring-primary/30 shadow-xs"
                      : "text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span>Create new page</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAi();
                  }}
                  onMouseEnter={() => setSelectedIndex(1)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-left cursor-pointer ${
                    selectedIndex === 1
                      ? "bg-accent text-accent-foreground ring-1 ring-primary/30 shadow-xs"
                      : "text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span>Ask Notion AI</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTheme(theme === "dark" ? "light" : "dark");
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(2)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-left cursor-pointer ${
                    selectedIndex === 2
                      ? "bg-accent text-accent-foreground ring-1 ring-primary/30 shadow-xs"
                      : "text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </div>
                    <span>Toggle {theme === "dark" ? "Light" : "Dark"} Mode</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}

          {/* Pages Results */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {query ? "Matching Pages" : "Recent Pages"}
            </div>
            <div className="space-y-0.5">
              {filteredPages.map((page, idx) => {
                const itemIdx = !query ? idx + 3 : idx;
                const isSelected = selectedIndex === itemIdx;
                return (
                  <button
                    key={page._id}
                    type="button"
                    onClick={() => handleSelectPage(page._id)}
                    onMouseEnter={() => setSelectedIndex(itemIdx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-left group cursor-pointer ${
                      isSelected
                        ? "bg-accent text-accent-foreground ring-1 ring-primary/30 shadow-xs"
                        : "text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base select-none shrink-0">{page.icon || "📄"}</span>
                      <span className="truncate font-semibold">{page.title}</span>
                    </div>
                    <span className={`text-[10px] text-muted-foreground transition shrink-0 ml-2 ${
                      isSelected ? "opacity-100 text-primary font-bold" : "opacity-0 group-hover:opacity-100"
                    }`}>
                      Jump to page ↗
                    </span>
                  </button>
                );
              })}

              {filteredPages.length === 0 && query && (
                <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
                  <p>No pages matching &quot;{query}&quot;</p>
                  <button
                    type="button"
                    onClick={handleCreateNewPage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create page &quot;{query}&quot;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2 border-t border-foreground/10 bg-foreground/[0.02] flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>Navigation: Click or Enter</span>
          </div>
          <span className="font-mono">Cmd + K</span>
        </div>
      </div>
    </div>
  );
}
