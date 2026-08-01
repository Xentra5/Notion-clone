"use client";

import { useState, useEffect } from "react";
import { Search, X, FileText, Calendar, User, Sparkles, Command } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (title: string) => void;
}

export function SearchModal({ isOpen, onClose, onSelectPage }: SearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onSelectPage("Getting Started on Mobile"); // or trigger search modal open
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onSelectPage]);

  const items = [
    { title: "Getting Started on Mobile", category: "Private", icon: FileText },
    { title: "Personal Website", category: "Private", icon: User },
    { title: "Example sub page", category: "Getting Started on Mobile", icon: FileText },
    { title: "Connect your calendar", category: "Meetings", icon: Calendar },
    { title: "Notion AI Assistant", category: "Tools", icon: Sparkles },
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#202020] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#2d2d2d] bg-[#191919]">
          <Search className="h-4 w-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to a page..."
            className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 outline-none"
          />
          <div className="flex items-center gap-1.5">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-neutral-400 bg-[#262626] border border-[#333] px-1.5 py-0.5 rounded font-mono">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#2c2c2c] transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectPage(item.title);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm hover:bg-[#2c2c2c] text-neutral-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-[#191919] border border-[#2d2d2d] group-hover:border-[#444] transition">
                      <Icon className="h-4 w-4 text-neutral-400 group-hover:text-white" />
                    </div>
                    <span className="font-semibold text-neutral-200 group-hover:text-white">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 bg-[#191919] px-2.5 py-0.5 rounded-full border border-[#2d2d2d] font-medium">
                    {item.category}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="py-10 text-center text-xs text-neutral-500">
              No matching pages found for &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
