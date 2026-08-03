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

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (title: string) => void;
}

export function SearchModal({ isOpen, onClose, onSelectPage }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [titleOnly, setTitleOnly] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const todayItems = [
    { title: "LangChain", path: "", icon: FileText },
    { title: "Text Splitter", path: "— LangChain", icon: FileText },
    { title: "New page", path: "", icon: FileText },
    { title: "Project Whole readme", path: "", icon: FileText },
    { title: "Retriever", path: "— LangChain", icon: FileText },
  ];

  const pastWeekItems = [
    {
      title: "ALL OF COMPONENT IN CPP",
      path: "— LangChain / C++ Knowledge and Progress",
      icon: FileText,
      active: true,
    },
    {
      title: "C++ Knowledge and Progress",
      path: "— LangChain",
      icon: FileText,
    },
    { title: "DSA Hub", path: "", icon: Atom },
    { title: "Physics Concepts", path: "", icon: Atom },
    { title: "Python Knowledge", path: "", icon: Terminal },
    { title: "FASTAPI", path: "", icon: FileCode },
    { title: "MACHING Learning", path: "", icon: FileText },
    {
      title: "Interview asked Question",
      path: "— DSA Hub / ... / Hashing",
      icon: FileText,
    },
  ];

  if (!isOpen) return null;

  const filterFn = (item: { title: string; path?: string }) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    (item.path && item.path.toLowerCase().includes(query.toLowerCase()));

  const filteredToday = todayItems.filter(filterFn);
  const filteredPastWeek = pastWeekItems.filter(filterFn);

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
          {/* Today Section */}
          {filteredToday.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-[#777777] uppercase tracking-wider">
                Today
              </div>
              <div className="mt-1 space-y-0.5">
                {filteredToday.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={`today-${idx}`}
                      onClick={() => {
                        onSelectPage(item.title);
                        onClose();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-[#292929] transition group"
                    >
                      <Icon className="h-4 w-4 text-[#888888] shrink-0 group-hover:text-white" />
                      <span className="font-medium text-[#d4d4d4] group-hover:text-white truncate">
                        {item.title}
                      </span>
                      {item.path && (
                        <span className="text-[#666666] text-[11px] truncate">
                          {item.path}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Week Section */}
          {filteredPastWeek.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-[#777777] uppercase tracking-wider">
                Past week
              </div>
              <div className="mt-1 space-y-0.5">
                {filteredPastWeek.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={`past-${idx}`}
                      onClick={() => {
                        onSelectPage(item.title);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition group ${
                        item.active
                          ? "bg-[#2a2a2a] text-white border border-[#383838]"
                          : "hover:bg-[#292929] text-[#d4d4d4]"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-[#888888] shrink-0 group-hover:text-white" />
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                        <span className="font-medium truncate group-hover:text-white">
                          {item.title}
                        </span>
                        {item.path && (
                          <span className="text-[#666666] text-[11px] truncate">
                            {item.path}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredToday.length === 0 && filteredPastWeek.length === 0 && (
            <div className="py-12 text-center text-[#777777]">
              No pages matching &quot;{query}&quot;
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
