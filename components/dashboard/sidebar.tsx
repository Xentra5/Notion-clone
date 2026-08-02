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
    <aside className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col h-full text-sidebar-foreground select-none text-xs font-sans shrink-0">
      {/* Workspace Switcher Header */}
      <div className="relative p-2 border-b border-sidebar-border">
        <button
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-neutral-200 dark:active:bg-[#2c2c2c] transition text-left group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-5 w-5 rounded bg-neutral-200 dark:bg-[#333333] text-neutral-800 dark:text-white font-bold flex items-center justify-center text-xs shrink-0 border border-border shadow-sm">
              {userInitial}
            </div>
            <span className="font-semibold text-foreground truncate">
              {userName}&apos;s Notion
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition" />
        </button>

        {/* Workspace Dropdown */}
        {showWorkspaceMenu && (
          <div className="absolute left-2 right-2 top-full mt-1 bg-popover border border-border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-100 text-popover-foreground">
            <div className="px-2.5 py-2 border-b border-border mb-1">
              <p className="font-bold text-foreground truncate">{session?.user?.name || "User"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{session?.user?.email || "user@notion.so"}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-accent text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition text-xs font-medium"
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
        <div className="flex items-center justify-between px-1 py-1 text-muted-foreground">
          <button
            onClick={() => onSelectPage("Home")}
            className="p-1.5 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
            title="Home"
          >
            <Home className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenSearch}
            className="p-1.5 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
            title="Search (Cmd+K)"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleAi}
            className="p-1.5 rounded-md hover:bg-sidebar-accent hover:text-purple-600 dark:hover:text-purple-300 transition"
            title="Notion AI"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowWorkspaceMenu(true)}
            className="p-1.5 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Meetings Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection("meetings")}
            className="w-full flex items-center justify-between px-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition text-left"
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
                className="cursor-pointer bg-card border border-border rounded-xl p-2.5 space-y-1 hover:border-border/80 hover:bg-neutral-100 dark:hover:bg-[#242424] transition group shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-[#0078df] flex items-center justify-center shrink-0">
                    <Calendar className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="font-semibold text-foreground text-[11px] group-hover:text-blue-500 transition">
                    Connect your calendar
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  See all your events and start meeting notes for them.
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectPage("AI Meeting Note");
                }}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px]">New AI meeting note</span>
              </button>
            </div>
          )}
        </div>

        {/* Recents Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection("recents")}
            className="w-full flex items-center justify-between px-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition text-left"
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
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition text-left font-medium ${activePage === "Getting Started on Mobile"
                  ? "bg-neutral-200 dark:bg-[#2c2c2c] text-foreground font-semibold shadow-sm"
                  : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                }`}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">Getting Started on Mobile</span>
            </button>
          )}
        </div>

        {/* Agents Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection("agents")}
            className="w-full flex items-center justify-between px-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition text-left"
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
              className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
            >
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px]">New agent</span>
            </button>
          )}
        </div>

        {/* Private Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection("private")}
            className="w-full flex items-center justify-between px-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition text-left"
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
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition text-left font-medium ${activePage === "Getting Started on Mobile"
                    ? "bg-neutral-200 dark:bg-[#2c2c2c] text-foreground font-semibold shadow-sm"
                    : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">Getting Started on Mobile</span>
              </button>

              <button
                onClick={() => onSelectPage("Personal Website")}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition text-left font-medium ${activePage === "Personal Website"
                    ? "bg-neutral-200 dark:bg-[#2c2c2c] text-foreground font-semibold shadow-sm"
                    : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  }`}
              >
                <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">Personal Website</span>
              </button>

              {/* Show dynamically created page in Private list */}
              {activePage !== "Getting Started on Mobile" &&
                activePage !== "Personal Website" &&
                activePage !== "Home" && (
                  <button
                    onClick={() => onSelectPage(activePage)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg bg-neutral-200 dark:bg-[#2c2c2c] text-foreground shadow-sm text-left font-semibold"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{activePage}</span>
                  </button>
                )}

              <button
                onClick={() => onSelectPage("Untitled")}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px]">Add new</span>
              </button>
            </div>
          )}
        </div>

        {/* Shared Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection("shared")}
            className="w-full flex items-center justify-between px-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition text-left"
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
              className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
            >
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px]">Start collaborating</span>
            </button>
          )}
        </div>

        {/* Notion apps Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection("apps")}
            className="w-full flex items-center justify-between px-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition text-left"
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
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
              >
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">Notion Calendar</span>
              </button>
              <button
                onClick={() => alert("Notion Desktop app")}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
              >
                <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">Notion Desktop</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Utility Items */}
        <div className="pt-3 border-t border-sidebar-border space-y-0.5">
          <button
            onClick={() => alert("Library")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
          >
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Library</span>
          </button>
          <button
            onClick={() => alert("My Tasks")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
          >
            <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <span>My Tasks</span>
          </button>
          <button
            onClick={() => alert("Marketplace")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Marketplace</span>
          </button>
          <button
            onClick={() => alert("Help")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
          >
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Help</span>
          </button>
          <button
            onClick={() => alert("Trash")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Trash</span>
          </button>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div ref={newMenuRef} className="relative p-2.5 border-t border-sidebar-border flex items-center justify-between gap-1.5">
        <button
          onClick={() => setNewMenuOpen(!newMenuOpen)}
          className="flex-1 flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-[#242424] dark:hover:bg-[#2d2d2d] border border-border text-foreground px-3 py-2 rounded-xl text-xs font-semibold transition shadow-sm group"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 fill-purple-500/20 group-hover:rotate-12 transition-transform" />
          <span className="truncate">New</span>
          <span className="text-[10px] text-muted-foreground ml-auto font-mono">ctrl+o</span>
        </button>

        {/* New Item Popup Menu */}
        {newMenuOpen && (
          <div className="absolute bottom-14 left-2.5 right-2.5 bg-popover border border-border rounded-xl shadow-2xl p-1.5 z-50 text-popover-foreground animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              onClick={() => {
                setNewMenuOpen(false);
                onSelectPage("Untitled");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition text-left font-medium"
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <div>Page</div>
                <div className="text-[10px] text-muted-foreground font-normal">Create a new blank page</div>
              </div>
            </button>
            <button
              onClick={() => {
                setNewMenuOpen(false);
                onToggleAi();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent hover:text-purple-600 dark:hover:text-purple-300 transition text-left font-medium"
            >
              <Sparkles className="h-4 w-4 text-purple-500" />
              <div>
                <div>Chat</div>
                <div className="text-[10px] text-muted-foreground font-normal">Open Notion AI assistant</div>
              </div>
            </button>
            <button
              onClick={() => {
                setNewMenuOpen(false);
                onSelectPage("AI Meeting Note");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent hover:text-blue-500 dark:hover:text-blue-300 transition text-left font-medium"
            >
              <Mic className="h-4 w-4 text-blue-500" />
              <div>
                <div>AI Meeting Note</div>
                <div className="text-[10px] text-muted-foreground font-normal">Record meeting with microphone</div>
              </div>
            </button>
          </div>
        )}

        <button
          onClick={() => onSelectPage("Untitled")}
          className="h-9 w-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-[#242424] dark:hover:bg-[#2d2d2d] border border-border flex items-center justify-center text-foreground transition shrink-0 shadow-sm"
          title="New page"
        >
          <SquarePen className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
