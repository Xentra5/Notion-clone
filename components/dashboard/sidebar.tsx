"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  Search,
  Bell,
  Settings,
  Calendar,
  Sparkles,
  FileText,
  User,
  Plus,
  Monitor,
  BookOpen,
  CheckSquare,
  ShoppingBag,
  HelpCircle,
  Trash2,
  SquarePen,
  ChevronDown,
  ChevronRight,
  LogOut,
  Mic,
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  onSelectPage: (title: string) => void;
  onOpenSearch: () => void;
  onToggleAi: () => void;
  onOpenCalendar: () => void;
}

export function Sidebar({
  activePage,
  onSelectPage,
  onOpenSearch,
  onToggleAi,
  onOpenCalendar,
}: SidebarProps) {
  const { data: session } = useSession();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState({
    meetings: true,
    recents: true,
    agents: true,
    private: true,
    shared: true,
    apps: true,
  });

  const userName = session?.user?.name || "o";
  const userInitial = userName.charAt(0).toUpperCase();

  function toggleSection(sec: keyof typeof expandedSections) {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  }

  // Close the "New" popup when clicking outside of it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setNewMenuOpen(false);
      }
    }
    if (newMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [newMenuOpen]);

  return (
    <aside className="w-60 bg-[#191919] border-r border-[#262626] flex flex-col h-full text-[#9b9b9b] select-none text-xs font-sans shrink-0">
      {/* Workspace Switcher Header */}
      <div className="relative p-2 border-b border-[#222222]">
        <button
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-[#252525] active:bg-[#2c2c2c] transition text-left group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-5 w-5 rounded bg-[#333333] text-white font-bold flex items-center justify-center text-xs shrink-0 border border-[#444444] shadow-sm">
              {userInitial}
            </div>
            <span className="font-semibold text-[#e0e0e0] group-hover:text-white truncate">
              {userName}&apos;s Notion
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-[#737373] group-hover:text-[#a0a0a0] shrink-0 transition" />
        </button>

        {/* Workspace Dropdown */}
        {showWorkspaceMenu && (
          <div className="absolute left-2 right-2 top-full mt-1 bg-[#202020] border border-[#333333] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-100 text-[#d4d4d4]">
            <div className="px-2.5 py-2 border-b border-[#2d2d2d] mb-1">
              <p className="font-bold text-white truncate">{session?.user?.name || "User"}</p>
              <p className="text-[11px] text-[#737373] truncate">{session?.user?.email || "user@notion.so"}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#2c2c2c] text-red-400 hover:text-red-300 transition text-xs font-medium"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 no-scrollbar">
        {/* Top Quick Actions Row */}
        <div className="flex items-center justify-between px-1 py-1 text-[#888888]">
          <button
            onClick={() => onSelectPage("Home")}
            className="p-1.5 rounded-md hover:bg-[#252525] hover:text-white transition"
            title="Home"
          >
            <Home className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenSearch}
            className="p-1.5 rounded-md hover:bg-[#252525] hover:text-white transition"
            title="Search (Cmd+K)"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleAi}
            className="p-1.5 rounded-md hover:bg-[#252525] hover:text-purple-300 transition"
            title="Notion AI"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowWorkspaceMenu(true)}
            className="p-1.5 rounded-md hover:bg-[#252525] hover:text-white transition"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Meetings Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection("meetings")}
            className="w-full flex items-center justify-between px-1 text-[11px] font-semibold text-[#666666] hover:text-[#888888] transition text-left"
          >
            <span>Meetings</span>
            {expandedSections.meetings ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {expandedSections.meetings && (
            <div className="space-y-1.5 pt-0.5">
              <div
                onClick={onOpenCalendar}
                className="cursor-pointer bg-[#202020] border border-[#2a2a2a] rounded-xl p-2.5 space-y-1 hover:border-[#3a3a3a] hover:bg-[#242424] transition group shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-[#0078df] flex items-center justify-center shrink-0">
                    <Calendar className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="font-semibold text-white text-[11px] group-hover:text-blue-400 transition">
                    Connect your calendar
                  </span>
                </div>
                <p className="text-[10px] text-[#888888] leading-snug">
                  See all your events and start meeting notes for them.
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectPage("AI Meeting Note");
                }}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#252525] text-[#9b9b9b] hover:text-white transition text-left"
              >
                <Plus className="h-3.5 w-3.5 text-[#737373]" />
                <span className="text-[11px]">New AI meeting note</span>
              </button>
            </div>
          )}
        </div>

        {/* Recents Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection("recents")}
            className="w-full flex items-center justify-between px-1 text-[11px] font-semibold text-[#666666] hover:text-[#888888] transition text-left"
          >
            <span>Recents</span>
            {expandedSections.recents ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {expandedSections.recents && (
            <button
              onClick={() => onSelectPage("Getting Started on Mobile")}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition text-left font-medium ${
                activePage === "Getting Started on Mobile"
                  ? "bg-[#2c2c2c] text-white shadow-sm"
                  : "hover:bg-[#222222] text-[#9b9b9b] hover:text-[#d4d4d4]"
              }`}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-[#888]" />
              <span className="truncate">Getting Started on Mobile</span>
            </button>
          )}
        </div>

        {/* Agents Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection("agents")}
            className="w-full flex items-center justify-between px-1 text-[11px] font-semibold text-[#666666] hover:text-[#888888] transition text-left"
          >
            <span>Agents</span>
            {expandedSections.agents ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {expandedSections.agents && (
            <button
              onClick={onToggleAi}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#252525] text-[#9b9b9b] hover:text-white transition text-left"
            >
              <Plus className="h-3.5 w-3.5 text-[#737373]" />
              <span className="text-[11px]">New agent</span>
            </button>
          )}
        </div>

        {/* Private Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection("private")}
            className="w-full flex items-center justify-between px-1 text-[11px] font-semibold text-[#666666] hover:text-[#888888] transition text-left"
          >
            <span>Private</span>
            {expandedSections.private ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {expandedSections.private && (
            <div className="space-y-0.5">
              <button
                onClick={() => onSelectPage("Getting Started on Mobile")}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition text-left font-medium ${
                  activePage === "Getting Started on Mobile"
                    ? "bg-[#2c2c2c] text-white shadow-sm"
                    : "hover:bg-[#222222] text-[#9b9b9b] hover:text-[#d4d4d4]"
                }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-[#888]" />
                <span className="truncate">Getting Started on Mobile</span>
              </button>

              <button
                onClick={() => onSelectPage("Personal Website")}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition text-left font-medium ${
                  activePage === "Personal Website"
                    ? "bg-[#2c2c2c] text-white shadow-sm"
                    : "hover:bg-[#222222] text-[#9b9b9b] hover:text-[#d4d4d4]"
                }`}
              >
                <User className="h-3.5 w-3.5 shrink-0 text-[#888]" />
                <span className="truncate">Personal Website</span>
              </button>

              {/* Show dynamically created page in Private list */}
              {activePage !== "Getting Started on Mobile" &&
                activePage !== "Personal Website" &&
                activePage !== "Home" && (
                <button
                  onClick={() => onSelectPage(activePage)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#2c2c2c] text-white shadow-sm text-left font-medium"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-[#888]" />
                  <span className="truncate">{activePage}</span>
                </button>
              )}

              <button
                onClick={() => onSelectPage("Untitled")}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#252525] text-[#9b9b9b] hover:text-white transition text-left"
              >
                <Plus className="h-3.5 w-3.5 text-[#737373]" />
                <span className="text-[11px]">Add new</span>
              </button>
            </div>
          )}
        </div>

        {/* Shared Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection("shared")}
            className="w-full flex items-center justify-between px-1 text-[11px] font-semibold text-[#666666] hover:text-[#888888] transition text-left"
          >
            <span>Shared</span>
            {expandedSections.shared ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {expandedSections.shared && (
            <button
              onClick={() => alert("Start collaborating clicked")}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#252525] text-[#9b9b9b] hover:text-white transition text-left"
            >
              <Plus className="h-3.5 w-3.5 text-[#737373]" />
              <span className="text-[11px]">Start collaborating</span>
            </button>
          )}
        </div>

        {/* Notion apps Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection("apps")}
            className="w-full flex items-center justify-between px-1 text-[11px] font-semibold text-[#666666] hover:text-[#888888] transition text-left"
          >
            <span>Notion apps</span>
            {expandedSections.apps ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {expandedSections.apps && (
            <div className="space-y-0.5">
              <button
                onClick={onOpenCalendar}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#252525] text-[#9b9b9b] hover:text-white transition text-left"
              >
                <Calendar className="h-3.5 w-3.5 text-[#737373]" />
                <span className="truncate">Notion Calendar</span>
              </button>
              <button
                onClick={() => alert("Notion Desktop app")}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#252525] text-[#9b9b9b] hover:text-white transition text-left"
              >
                <Monitor className="h-3.5 w-3.5 text-[#737373]" />
                <span className="truncate">Notion Desktop</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Utility Items */}
        <div className="pt-3 border-t border-[#222222] space-y-0.5">
          <button
            onClick={() => alert("Library")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#252525] text-[#9b9b9b] hover:text-white transition text-left"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#737373]" />
            <span>Library</span>
          </button>
          <button
            onClick={() => alert("My Tasks")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#252525] text-[#9b9b9b] hover:text-white transition text-left"
          >
            <CheckSquare className="h-3.5 w-3.5 text-[#737373]" />
            <span>My Tasks</span>
          </button>
          <button
            onClick={() => alert("Marketplace")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#252525] text-[#9b9b9b] hover:text-white transition text-left"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-[#737373]" />
            <span>Marketplace</span>
          </button>
          <button
            onClick={() => alert("Help")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#252525] text-[#9b9b9b] hover:text-white transition text-left"
          >
            <HelpCircle className="h-3.5 w-3.5 text-[#737373]" />
            <span>Help</span>
          </button>
          <button
            onClick={() => alert("Trash")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#252525] text-[#9b9b9b] hover:text-white transition text-left"
          >
            <Trash2 className="h-3.5 w-3.5 text-[#737373]" />
            <span>Trash</span>
          </button>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div ref={newMenuRef} className="relative p-2.5 border-t border-[#222222] flex items-center justify-between gap-1.5">
        <button
          onClick={() => setNewMenuOpen(!newMenuOpen)}
          className="flex-1 flex items-center gap-2 bg-[#242424] hover:bg-[#2d2d2d] border border-[#333333] text-[#e0e0e0] px-3 py-2 rounded-xl text-xs font-semibold transition shadow-sm group"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-400 fill-purple-400/20 group-hover:rotate-12 transition-transform" />
          <span className="truncate">New</span>
          <span className="text-[10px] text-[#737373] ml-auto font-mono">ctrl+o</span>
        </button>

        {/* New Item Popup Menu */}
        {newMenuOpen && (
          <div className="absolute bottom-14 left-2.5 right-2.5 bg-[#202020] border border-[#333333] rounded-xl shadow-2xl p-1.5 z-50 text-[#d4d4d4] animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              onClick={() => {
                setNewMenuOpen(false);
                onSelectPage("Untitled");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#2c2c2c] hover:text-white transition text-left font-medium"
            >
              <FileText className="h-4 w-4 text-[#888]" />
              <div>
                <div>Page</div>
                <div className="text-[10px] text-[#666] font-normal">Create a new blank page</div>
              </div>
            </button>
            <button
              onClick={() => {
                setNewMenuOpen(false);
                onToggleAi();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#2c2c2c] hover:text-purple-300 transition text-left font-medium"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <div>
                <div>Chat</div>
                <div className="text-[10px] text-[#666] font-normal">Open Notion AI assistant</div>
              </div>
            </button>
            <button
              onClick={() => {
                setNewMenuOpen(false);
                onSelectPage("AI Meeting Note");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#2c2c2c] hover:text-blue-300 transition text-left font-medium"
            >
              <Mic className="h-4 w-4 text-blue-400" />
              <div>
                <div>AI Meeting Note</div>
                <div className="text-[10px] text-[#666] font-normal">Record meeting with microphone</div>
              </div>
            </button>
          </div>
        )}

        <button
          onClick={() => onSelectPage("Untitled")}
          className="h-9 w-9 rounded-xl bg-[#242424] hover:bg-[#2d2d2d] border border-[#333333] flex items-center justify-center text-[#d4d4d4] hover:text-white transition shrink-0 shadow-sm"
          title="New page"
        >
          <SquarePen className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
