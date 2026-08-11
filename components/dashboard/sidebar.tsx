"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { PricingModal } from "./pricing-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { RenameModal } from "@/components/ui/rename-modal";
import { getPages, createPage, updatePage, deletePage, type Page, type PageBlock } from "@/lib/actions/pages";
import {
  Home,
  Search,
  Bell,
  Settings,
  Calendar,
  Sparkles,
  FileText,
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
  Users,
} from "lucide-react";

const GETTING_STARTED_BLOCKS: PageBlock[] = [
  { id: "getting-started-intro", type: "paragraph", properties: { text: "Welcome! This page shows you the basics. You can edit it, keep it as a reference, or delete it whenever you are ready." } },  { id: "getting-started-write", type: "heading", properties: { text: "Write naturally" } },  { id: "getting-started-write-text", type: "paragraph", properties: { text: "Click anywhere and start typing. Press Enter for a new block. Press Shift + Enter for a line break." } },  { id: "getting-started-blocks", type: "heading", properties: { text: "Use blocks" } },  { id: "getting-started-blocks-text", type: "paragraph", properties: { text: "Type / to open the block menu. Try /heading, /bullet, /todo, /quote, or /code." } },  { id: "getting-started-todo", type: "to_do", properties: { text: "Try checking off this task", checked: false } },  { id: "getting-started-shortcuts", type: "heading", properties: { text: "Useful shortcuts" } },  { id: "getting-started-shortcuts-text", type: "paragraph", properties: { text: "Use Ctrl/Cmd + A to select the page, Backspace or Delete to remove selected blocks, and Ctrl/Cmd + K to search." } },  { id: "getting-started-delete", type: "quote", properties: { text: "You can delete this page later from the trash icon beside its name in the sidebar." } },
];

interface PageTreeNodeProps {
  page: Page;
  allPages: Page[];
  depth?: number;
  pathname: string;
  renamingPageId: string | null;
  renameValue: string;
  onPageClick: (e: React.MouseEvent, page: Page) => void;
  onBeginRename: (e: React.MouseEvent, page: Page) => void;
  onFinishRename: (pageId: string) => void;
  onDeletePage: (e: React.MouseEvent, pageId: string) => void;
  setRenameValue: (val: string) => void;
  setRenamingPageId: (id: string | null) => void;
}

function PageTreeNode({
  page,
  allPages,
  depth = 0,
  pathname,
  renamingPageId,
  renameValue,
  onPageClick,
  onBeginRename,
  onFinishRename,
  onDeletePage,
  setRenameValue,
  setRenamingPageId,
}: PageTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const childPages = allPages.filter((c) => c.parentPageId === page._id);
  const hasChildren = childPages.length > 0;

  return (
    <div className="space-y-0.5">
      <div
        onClick={(e) => onPageClick(e, page)}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        className={`w-full flex items-center justify-between group py-1.5 pr-2 rounded-lg transition text-left font-medium cursor-pointer ${
          pathname === `/dashboard/${page._id}`
            ? "bg-neutral-200 dark:bg-[#2c2c2c] text-foreground font-semibold shadow-sm"
            : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-0.5 hover:bg-neutral-300 dark:hover:bg-[#383838] rounded text-muted-foreground transition shrink-0"
            >
              {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <span className="shrink-0 text-sm">{page.icon || "📄"}</span>
          {renamingPageId === page._id ? (
            <input
              autoFocus
              value={renameValue}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setRenameValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onBlur={() => void onFinishRename(page._id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setRenamingPageId(null);
                }
              }}
              className="min-w-0 w-full bg-background border border-primary rounded px-1.5 py-0.5 text-[11px] outline-none font-normal text-foreground shadow-sm"
            />
          ) : (
            <span
              className="truncate text-[11px] flex-1"
              onDoubleClick={(e) => onBeginRename(e, page)}
              title="Double-click to rename"
            >
              {page.title}
            </span>
          )}
        </div>
        {renamingPageId !== page._id && (
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => onBeginRename(e, page)}
              title="Rename page"
              className="p-1 hover:bg-neutral-300 dark:hover:bg-[#383838] rounded text-muted-foreground hover:text-foreground transition"
            >
              <SquarePen className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => onDeletePage(e, page._id)}
              title="Delete page"
              className="p-1 hover:bg-neutral-300 dark:hover:bg-[#383838] rounded text-muted-foreground hover:text-red-500 transition"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Recursive Children Sub-Tree */}
      {isOpen && hasChildren && (
        <div className="space-y-0.5 border-l border-border/30 ml-3">
          {childPages.map((child) => (
            <PageTreeNode
              key={child._id}
              page={child}
              allPages={allPages}
              depth={depth + 1}
              pathname={pathname}
              renamingPageId={renamingPageId}
              renameValue={renameValue}
              onPageClick={onPageClick}
              onBeginRename={onBeginRename}
              onFinishRename={onFinishRename}
              onDeletePage={onDeletePage}
              setRenameValue={setRenameValue}
              setRenamingPageId={setRenamingPageId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  activePage: string;
  onSelectPage: (title: string) => void;
  onOpenSearch: () => void;
  onToggleAi: () => void;
  onOpenCalendar: () => void;
  onOpenSettings: () => void;
  onOpenTrash: () => void;
  onOpenUtility: (page: "Library" | "My Tasks" | "Marketplace" | "Help") => void;
}

export function Sidebar({
  onSelectPage,
  onOpenSearch,
  onToggleAi,
  onOpenCalendar,
  onOpenSettings,
  onOpenTrash,
  onOpenUtility,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameModalPage, setRenameModalPage] = useState<Page | null>(null);
  const isSeedingOnboarding = useRef(false);
  const onboardingStorageKey = `notion-onboarding-created:${session?.user?.email || "workspace"}`;
  const [expandedSections, setExpandedSections] = useState({
    meetings: true,
    recents: true,
    agents: true,
    private: true,
    shared: true,
    apps: true,
  });

  const loadPages = useCallback(async () => {
    try {
      const data = await getPages();
      const onboardingAlreadyCreated = typeof window !== "undefined" && window.localStorage.getItem(onboardingStorageKey) === "1";
      if (data.length === 0 && !isSeedingOnboarding.current && !onboardingAlreadyCreated) {
        isSeedingOnboarding.current = true;
        const onboarding = await createPage({
          title: "Getting Started with Notion",
          blocks: GETTING_STARTED_BLOCKS,
        });
        window.localStorage.setItem(onboardingStorageKey, "1");
        setPages([onboarding]);
        if (pathname === "/dashboard") router.push(`/dashboard/${onboarding._id}`);
        return;
      }
      setPages(data);


    } catch (e) {
      console.error("Failed to load pages:", e);
    }
  }, [onboardingStorageKey, pathname, router]);

  useEffect(() => { const timer = window.setTimeout(() => { void loadPages(); }, 0); return () => window.clearTimeout(timer); }, [loadPages]);

  useEffect(() => {
    const refreshPages = () => { void loadPages(); };
    window.addEventListener("page-updated", refreshPages);
    window.addEventListener("page-created", refreshPages);
    return () => {
      window.removeEventListener("page-updated", refreshPages);
      window.removeEventListener("page-created", refreshPages);
    };
  }, [loadPages]);

  const userName = session?.user?.name || "o";
  const userInitial = userName.charAt(0).toUpperCase();

  async function handleNewMeetingNote() {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const meetingPage = await createPage({ title: "AI Meeting Note", isAiMeetingNote: true });
      await loadPages();
      toast.success("AI Meeting Note created");
      router.push(`/dashboard/${meetingPage._id}`);
    } catch (e) {
      toast.error("Failed to create meeting note");
      console.error("Failed to create meeting note:", e);
    } finally {
      setIsCreating(false);
    }
  }
  async function handleNewPage() {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const newPage = await createPage({ title: "Untitled" });
      await loadPages();
      toast.success("New page created");
      router.push(`/dashboard/${newPage._id}`);
    } catch (e) {
      toast.error("Failed to create page");
      console.error("Failed to create page:", e);
    } finally {
      setIsCreating(false);
    }
  }

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function beginRename(e: React.MouseEvent, page: Page) {
    e.stopPropagation();
    e.preventDefault();
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    setRenameModalPage(page);
    setRenamingPageId(page._id);
    setRenameValue(page.title);
  }

  function handlePageClick(e: React.MouseEvent, page: Page) {
    if (renamingPageId === page._id) return;

    if (e.detail === 2) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      e.stopPropagation();
      e.preventDefault();
      setRenameModalPage(page);
      setRenamingPageId(page._id);
      setRenameValue(page.title);
      return;
    }

    if (e.detail === 1) {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      const targetPath = `/dashboard/${page._id}`;
      clickTimeoutRef.current = setTimeout(() => {
        if (pathname !== targetPath) {
          router.push(targetPath);
        }
        clickTimeoutRef.current = null;
      }, 230);
    }
  }

  async function finishRename(pageId: string) {
    if (!renamingPageId) return;
    const title = renameValue.trim() || "Untitled";
    setRenamingPageId(null);
    try {
      await updatePage(pageId, { title });
      await loadPages();
      window.dispatchEvent(new CustomEvent("page-updated", { detail: { title, updatedAt: new Date() } }));
      toast.success("Page renamed");
    } catch (error) {
      toast.error("Failed to rename page");
      console.error("Failed to rename page:", error);
    }
  }
  function handleDeletePage(e: React.MouseEvent, pageId: string) {
    e.stopPropagation();
    setDeleteTargetId(pageId);
  }

  async function performDeletePage() {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      if (pathname === `/dashboard/${id}`) {
        router.push("/dashboard");
      }
      await deletePage(id);
      await loadPages();
      toast.success("Page moved to Trash");
      window.dispatchEvent(new Event("page-updated"));
    } catch (err) {
      toast.error("Failed to delete page");
      console.error("Failed to delete page:", err);
    }
  }

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
            onClick={onOpenSettings}
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
                onClick={handleNewMeetingNote}
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
            <div className="space-y-0.5">
              {pages.slice(0, 3).map((page) => (
                <div
                  key={page._id}
                  onClick={(e) => handlePageClick(e, page)}
                  className={`w-full flex items-center justify-between group px-2 py-1.5 rounded-lg transition text-left font-medium cursor-pointer ${
                    pathname === `/dashboard/${page._id}`
                      ? "bg-neutral-200 dark:bg-[#2c2c2c] text-foreground font-semibold shadow-sm"
                      : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="shrink-0 text-sm">{page.icon}</span>
                    {renamingPageId === page._id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onBlur={() => void finishRename(page._id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                          if (e.key === "Escape") {
                            e.preventDefault();
                            setRenamingPageId(null);
                          }
                        }}
                        className="min-w-0 w-full bg-background border border-primary rounded px-1.5 py-0.5 text-[11px] outline-none font-normal text-foreground shadow-sm"
                      />
                    ) : (
                      <span
                        className="truncate text-[11px] flex-1"
                        onDoubleClick={(e) => beginRename(e, page)}
                        title="Double-click to rename"
                      >
                        {page.title}
                      </span>
                    )}
                  </div>
                  {renamingPageId !== page._id && (
                    <button
                      onClick={(e) => beginRename(e, page)}
                      title="Rename page"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-300 dark:hover:bg-[#383838] rounded text-muted-foreground hover:text-foreground transition shrink-0"
                    >
                      <SquarePen className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              {pages.length === 0 && (
                <p className="px-2 py-1 text-[11px] text-muted-foreground">No recent pages</p>
              )}
            </div>
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
              {pages
                .filter((p) => !p.parentPageId)
                .map((page) => (
                  <PageTreeNode
                    key={page._id}
                    page={page}
                    allPages={pages}
                    depth={0}
                    pathname={pathname}
                    renamingPageId={renamingPageId}
                    renameValue={renameValue}
                    onPageClick={handlePageClick}
                    onBeginRename={beginRename}
                    onFinishRename={finishRename}
                    onDeletePage={handleDeletePage}
                    setRenameValue={setRenameValue}
                    setRenamingPageId={setRenamingPageId}
                  />
                ))}
              {pages.length === 0 && (
                <p className="px-2 py-1 text-[11px] text-muted-foreground">No pages yet</p>
              )}
              <button
                onClick={handleNewPage}
                disabled={isCreating}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px]">{isCreating ? "Creating..." : "Add new"}</span>
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
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("page-updated"));
                  toast.info("Shared pages synced with collaborators");
                }}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
              >
                <Users className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[11px] truncate">Q3 Product Roadmap</span>
              </button>
              <button
                onClick={() => toast.info("Use the top bar 'Share' button to invite members to any page")}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left text-muted-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="text-[11px]">Invite collaborator</span>
              </button>
            </div>
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
                onClick={() => router.push("/dashboard/calendar")}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left ${
                  pathname === "/dashboard/calendar" ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""
                }`}
              >
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">Notion Calendar</span>
              </button>
              <button
                onClick={() => toast.info("Notion Desktop app launcher initialized")}
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
            onClick={() => onOpenUtility("Library")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
          >
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Library</span>
          </button>
          <button
            onClick={() => onOpenUtility("My Tasks")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
          >
            <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <span>My Tasks</span>
          </button>
          <button
            onClick={() => onOpenUtility("Marketplace")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Marketplace</span>
          </button>
          <button
            onClick={() => onOpenUtility("Help")}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
          >
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Help</span>
          </button>
          <button
            onClick={onOpenTrash}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition text-left"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Trash</span>
          </button>
        </div>
      </div>

      {/* Upgrade Banner for Free Users */}
      {session?.user?.plan !== "pro" && (
        <div className="mx-2 mb-2 p-3 bg-purple-950/20 hover:bg-purple-950/30 border border-purple-900/30 rounded-xl text-xs text-purple-300 transition flex flex-col gap-2">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Sparkles className="h-3.5 w-3.5 fill-purple-400/20 text-purple-400" />
            <span>Notion Pro Upgrade</span>
          </div>
          <p className="text-[10px] text-neutral-400 leading-normal">
            Unlock unlimited AI capabilities, advanced document features, and priority support.
          </p>
          <button
            onClick={() => setShowPricing(true)}
            className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition active:scale-95 text-center block"
          >
            Upgrade Now
          </button>
        </div>
      )}

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
                handleNewPage();
              }}
              disabled={isCreating}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition text-left font-medium disabled:opacity-50"
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
              onClick={() => { setNewMenuOpen(false); handleNewMeetingNote(); }}
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
          onClick={handleNewPage}
          disabled={isCreating}
          className="h-9 w-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-[#242424] dark:hover:bg-[#2d2d2d] border border-border flex items-center justify-center text-foreground transition shrink-0 shadow-sm disabled:opacity-50"
          title="New page"
        >
          <SquarePen className="h-4 w-4" />
        </button>
      </div>

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={performDeletePage}
        title="Delete page?"
        description="This page will be moved to Trash. You can restore it anytime."
        confirmText="Delete"
      />

      <RenameModal
        isOpen={!!renameModalPage}
        onClose={() => setRenameModalPage(null)}
        currentTitle={renameModalPage?.title || ""}
        onSave={async (newTitle) => {
          if (!renameModalPage) return;
          try {
            await updatePage(renameModalPage._id, { title: newTitle });
            await loadPages();
            window.dispatchEvent(
              new CustomEvent("page-updated", { detail: { title: newTitle, updatedAt: new Date() } })
            );
            toast.success("Page renamed");
          } catch (err) {
            toast.error("Failed to rename page");
            console.error(err);
          }
        }}
      />
    </aside>
  );
}
