"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { updatePage, getPages, type Page, type PageBlock } from "@/lib/actions/pages";
import {
  Lock,
  ChevronDown,
  Link as LinkIcon,
  Star,
  MoreHorizontal,
  Check,
  Sidebar as SidebarIcon,
  Sparkles,
  Globe,
  Users,
  Trash2,
  SquarePen,
  FileDown,
  Printer,
  Upload,
  History as HistoryIcon,
  MessageSquare,
} from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { ImportModal } from "@/components/dashboard/modals/import-modal";
import { HistoryModal } from "@/components/dashboard/modals/history-modal";
import { ShareModal } from "@/components/dashboard/modals/share-modal";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";
import { CommentsPanel } from "@/components/dashboard/editor/CommentsPanel";
import { LivePresenceBar } from "@/components/dashboard/editor/LivePresenceBar";
import { blocksToMarkdown, downloadMarkdownFile, exportToPdfPrint } from "@/lib/export-import";
import { Bell } from "lucide-react";

function formatRelativeTime(dateInput?: string | Date | null): string {
  if (!dateInput) return "Edited just now";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Edited just now";
  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 30) return "Edited just now";
  if (diffInSeconds < 60) return `Edited ${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Edited ${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Edited ${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `Edited ${diffInDays}d ago`;
  if (diffInDays < 365) {
    const diffInMonths = Math.floor(diffInDays / 30);
    return `Edited ${diffInMonths}mo ago`;
  }
  const diffInYears = Math.floor(diffInDays / 365);
  return `Edited ${diffInYears}y ago`;
}

interface TopBarProps {
  activeTitle: string;
  pageId?: string;
  updatedAt?: string | Date;
  blocks?: PageBlock[];
  onToggleSidebar?: () => void;
  onToggleAi: () => void;
  isAiOpen?: boolean;
  onDeletePage?: (pageId: string) => void;
}

export function TopBar({
  activeTitle,
  pageId,
  updatedAt,
  blocks = [],
  onToggleSidebar,
  onToggleAi,
  isAiOpen,
  onDeletePage,
}: TopBarProps) {
  const [isStarred, setIsStarred] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [permission, setPermission] = useState("Private");
  const [showPermissionDropdown, setShowPermissionDropdown] = useState(false);
  const [lastEdited, setLastEdited] = useState<string | Date | null>(updatedAt || null);
  const [isRenamingTitle, setIsRenamingTitle] = useState(false);
  const [renameTitleValue, setRenameTitleValue] = useState(activeTitle);

  // Modals state
  const [showImportModal, setShowImportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);

  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    queueMicrotask(() => setLastEdited(updatedAt || null));
  }, [updatedAt]);

  useEffect(() => {
    queueMicrotask(() => setRenameTitleValue(activeTitle));
  }, [activeTitle]);

  useEffect(() => {
    if (!pageId) {
      queueMicrotask(() => setBreadcrumbs([]));
      return;
    }
    let cancelled = false;
    getPages()
      .then((allPages) => {
        if (cancelled) return;
        const chain: { id: string; title: string }[] = [];
        const current = allPages.find((p) => p._id === pageId);
        let parentId = current?.parentPageId;
        while (parentId) {
          const parentDoc: Page | undefined = allPages.find((p) => p._id === parentId);
          if (parentDoc) {
            chain.unshift({ id: parentDoc._id, title: parentDoc.title });
            parentId = parentDoc.parentPageId;
          } else {
            break;
          }
        }
        setBreadcrumbs(chain);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pageId, activeTitle]);

  useEffect(() => {
    function handlePageUpdate(e: Event) {
      const customEvent = e as CustomEvent<{ title?: string; updatedAt?: Date | string }>;
      if (customEvent.detail?.title) setRenameTitleValue(customEvent.detail.title);
      setLastEdited(customEvent.detail?.updatedAt || new Date());
    }
    window.addEventListener("page-updated", handlePageUpdate);
    return () => {
      window.removeEventListener("page-updated", handlePageUpdate);
    };
  }, []);

  async function handleFinishTitleRename() {
    setIsRenamingTitle(false);
    if (!pageId) return;
    const title = renameTitleValue.trim() || "Untitled";
    try {
      await updatePage(pageId, { title });
      window.dispatchEvent(new CustomEvent("page-updated", { detail: { title, updatedAt: new Date() } }));
      toast.success("Page title updated");
    } catch (err) {
      toast.error("Failed to update page title");
      console.error(err);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Page link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExportMarkdown() {
    setShowMoreMenu(false);
    const md = blocksToMarkdown(activeTitle, blocks);
    downloadMarkdownFile(activeTitle || "notion-export", md);
    toast.success("Exported page as Markdown");
  }

  function handleExportPdf() {
    setShowMoreMenu(false);
    exportToPdfPrint(activeTitle, blocks);
  }

  return (
    <>
      <header className="h-11 border-b border-border bg-background px-3 flex items-center justify-between text-xs text-muted-foreground select-none shrink-0 font-sans">
        {/* Left section: Sidebar toggle & Breadcrumbs */}
        <div className="flex items-center gap-2 overflow-hidden">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-[#252525] text-neutral-600 dark:text-[#9b9b9b] hover:text-neutral-900 dark:hover:text-white transition md:hidden"
              title="Toggle Sidebar"
            >
              <SidebarIcon className="h-4 w-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
            {breadcrumbs.map((crumb) => (
              <div key={crumb.id} className="flex items-center gap-1 shrink-0">
                <Link
                  href={`/dashboard/${crumb.id}`}
                  className="text-muted-foreground hover:text-foreground transition truncate max-w-[110px] font-normal"
                >
                  {crumb.title}
                </Link>
                <span className="text-muted-foreground/30 font-normal">/</span>
              </div>
            ))}
            {isRenamingTitle ? (
              <input
                autoFocus
                value={renameTitleValue}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setRenameTitleValue(e.target.value)}
                onBlur={() => void handleFinishTitleRename()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                  if (e.key === "Escape") {
                    setIsRenamingTitle(false);
                    setRenameTitleValue(activeTitle);
                  }
                }}
                className="min-w-[120px] max-w-[200px] bg-background border border-primary rounded px-1.5 py-0.5 text-xs outline-none font-semibold text-foreground shadow-sm"
              />
            ) : (
              <div className="flex items-center gap-1 group/title">
                <span
                  className="hover:text-foreground/80 transition cursor-pointer truncate font-semibold"
                  onDoubleClick={() => {
                    if (pageId) {
                      setRenameTitleValue(activeTitle);
                      setIsRenamingTitle(true);
                    }
                  }}
                  title="Double-click to rename"
                >
                  {activeTitle}
                </span>
                {pageId && (
                  <button
                    onClick={() => {
                      setRenameTitleValue(activeTitle);
                      setIsRenamingTitle(true);
                    }}
                    className="opacity-0 group-hover/title:opacity-100 p-0.5 hover:bg-accent rounded text-muted-foreground transition"
                    title="Rename page"
                  >
                    <SquarePen className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {/* Permission Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPermissionDropdown(!showPermissionDropdown)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:bg-neutral-200 dark:hover:bg-[#252525] hover:text-foreground px-1.5 py-0.5 rounded transition"
              >
                <Lock className="h-3 w-3" />
                <span>{permission}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showPermissionDropdown && (
                <div className="absolute left-0 top-full mt-1 w-44 bg-popover border border-border rounded-xl shadow-2xl p-1 z-50 text-xs text-popover-foreground">
                  <button
                    onClick={() => {
                      setPermission("Private");
                      setShowPermissionDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] text-left"
                  >
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Private</span>
                  </button>
                  <button
                    onClick={() => {
                      setPermission("Workspace");
                      setShowPermissionDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] text-left"
                  >
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Workspace</span>
                  </button>
                  <button
                    onClick={() => {
                      setPermission("Public");
                      setShowPermissionDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] text-left"
                  >
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Public Web</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right section: Metadata & Page Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Live Collaboration Presence Bar */}
          <LivePresenceBar pageId={pageId} />

          <span className="hidden sm:inline-block text-[11px] text-muted-foreground mr-1">
            {formatRelativeTime(lastEdited)}
          </span>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-[#252525] transition relative ${
                showNotifications ? "text-primary bg-primary/10" : "text-muted-foreground"
              }`}
              title="Notifications & Activity"
            >
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            </button>
            <NotificationsPopover
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          {/* Comments Panel Button */}
          <button
            onClick={() => setShowCommentsPanel(!showCommentsPanel)}
            className={`p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-[#252525] transition ${
              showCommentsPanel ? "text-primary bg-primary/10" : "text-muted-foreground"
            }`}
            title="Comments & Mentions"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </button>

          {/* Version History Button */}
          {pageId && (
            <button
              onClick={() => setShowHistoryModal(true)}
              className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-[#252525] hover:text-foreground transition text-muted-foreground"
              title="Page Revision History"
            >
              <HistoryIcon className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#2383e2] hover:bg-[#1a73d8] text-white transition text-xs font-semibold shadow-xs"
          >
            <Users className="h-3 w-3" />
            <span>Share</span>
          </button>

          {/* Link Button */}
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-[#252525] hover:text-foreground transition text-muted-foreground"
            title="Copy link"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <LinkIcon className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Favorite / Star */}
          <button
            onClick={() => setIsStarred(!isStarred)}
            className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-[#252525] hover:text-foreground transition text-muted-foreground"
            title="Favorite page"
          >
            <Star
              className={`h-3.5 w-3.5 transition-colors ${
                isStarred ? "fill-amber-500 text-amber-500 font-bold" : ""
              }`}
            />
          </button>

          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-[#252525] hover:text-foreground transition text-muted-foreground"
              title="More options"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-xl shadow-2xl p-1 z-50 text-xs text-popover-foreground">
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    setShowImportModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-accent text-left transition"
                >
                  <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Import Markdown</span>
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-accent text-left transition"
                >
                  <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Export as Markdown</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-accent text-left transition"
                >
                  <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Export / Print PDF</span>
                </button>
                <div className="h-[1px] bg-border my-1" />
                {pageId && onDeletePage ? (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onDeletePage(pageId);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition text-left"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete page</span>
                  </button>
                ) : null}
              </div>
            )}
          </div>

          {/* Theme Toggle option */}
          <div className="h-7 w-[1px] bg-border mx-1" />
          <ThemeToggle />
          <div className="h-7 w-[1px] bg-border mx-1" />

          {/* Notion AI Toggle Button */}
          <button
            onClick={onToggleAi}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition ml-1 ${
              isAiOpen
                ? "bg-purple-900/30 border border-purple-800/50 text-purple-600 dark:text-purple-300"
                : "hover:bg-neutral-200 dark:hover:bg-[#252525] text-purple-500 dark:text-purple-400"
            }`}
            title="Toggle Notion AI Side Panel"
          >
            <Sparkles className="h-3.5 w-3.5 fill-purple-500/20" />
            <span className="hidden sm:inline">Notion AI</span>
          </button>
        </div>
      </header>

      {/* Modals & Slideouts */}
      <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
      <HistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} pageId={pageId} />
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} pageId={pageId} activeTitle={activeTitle} />
      {showCommentsPanel && (
        <div className="fixed right-0 top-11 bottom-0 z-40">
          <CommentsPanel isOpen={showCommentsPanel} onClose={() => setShowCommentsPanel(false)} pageId={pageId} />
        </div>
      )}
    </>
  );
}
