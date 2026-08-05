"use client";

import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  SlidersHorizontal,
  Plus,
  Atom,
  Terminal,
  FileCode,
  Settings,
  ChevronDown,
} from "lucide-react";

import { getPages, type Page } from "@/lib/actions/pages";
import { useRouter } from "next/navigation";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (title: string) => void;
}

export function SearchModal({ isOpen, onClose, onSelectPage }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [titleOnly, setTitleOnly] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getPages()
      .then((data) => setPages(data))
      .catch((err) => console.error("Error fetching pages for search:", err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPages = pages.filter((page) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const titleMatch = page.title.toLowerCase().includes(q);
    if (titleOnly) return titleMatch;

    const blockTextMatch = page.blocks?.some((b) =>
      b.properties?.text?.toLowerCase().includes(q)
    );
    return titleMatch || blockTextMatch;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[580px] bg-[#202020] border border-[#2d2d2d] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden text-[#d4d4d4] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Input Header */}
        <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
          <Search className="h-4 w-4 text-[#888888] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or ask a question in Workspace..."
            className="flex-1 bg-transparent text-sm text-[#e5e5e5] placeholder:text-[#666666] outline-none font-normal"
          />
          <button
            type="button"
            className="p-1 rounded-full text-[#3596ff] hover:bg-[#282828] transition"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-2 px-4 pb-3 border-b border-[#282828] text-[12px] text-[#999999]">
          <button
            type="button"
            onClick={() => setTitleOnly(!titleOnly)}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 font-medium ${
              titleOnly
                ? "bg-[#2c2c2c] text-white border border-[#3a3a3a]"
                : "hover:bg-[#282828] hover:text-[#d4d4d4]"
            }`}
          >
            <span className="font-serif italic font-normal text-xs">Aa</span> Title only
          </button>

          <button
            type="button"
            className="px-2.5 py-1 rounded-md hover:bg-[#282828] hover:text-[#d4d4d4] transition flex items-center gap-1 font-medium"
          >
            Created by <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
          </button>

          <button
            type="button"
            className="px-2.5 py-1 rounded-md hover:bg-[#282828] hover:text-[#d4d4d4] transition flex items-center gap-1 font-medium"
          >
            In <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
          </button>

          <button
            type="button"
            className="px-2.5 py-1 rounded-md hover:bg-[#282828] hover:text-[#d4d4d4] transition flex items-center gap-1 font-medium"
          >
            <Plus className="h-3 w-3" /> Filter
          </button>
        </div>

        {/* Scrollable Results */}
        <div className="max-h-[420px] overflow-y-auto p-2 space-y-4 text-xs custom-scrollbar">
          {loading ? (
            <div className="py-8 text-center text-[#777777]">Loading pages...</div>
          ) : filteredPages.length > 0 ? (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-[#777777] uppercase tracking-wider">
                Workspace Pages ({filteredPages.length})
              </div>
              <div className="mt-1 space-y-0.5">
                {filteredPages.map((page) => (
                  <button
                    key={page._id}
                    onClick={() => {
                      onSelectPage(page.title);
                      onClose();
                      router.push(`/dashboard/${page._id}`);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-[#292929] transition group"
                  >
                    <span className="shrink-0 text-base">{page.icon || "📄"}</span>
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                      <span className="font-medium text-[#d4d4d4] group-hover:text-white truncate">
                        {page.title}
                      </span>
                      <span className="text-[#666666] text-[11px] truncate">
                        — {page.category || "Private"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-[#777777]">
              {query ? `No pages matching "${query}"` : "No pages found in database"}
            </div>
          )}
        </div>

        {/* Bottom Status Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#262626] bg-[#1c1c1c] text-[11px] text-[#777777]">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] bg-[#262626] px-1.5 py-0.5 rounded text-[#999999] border border-[#333333]">
              Ctrl+↵
            </span>
            <span>Open in new tab</span>
          </div>
          <button
            type="button"
            className="p-1 hover:text-[#d4d4d4] transition rounded"
            title="Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
