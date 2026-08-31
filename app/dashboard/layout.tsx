"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { getPage, deletePage } from "@/lib/actions/pages";
import { UtilityPage } from "@/components/dashboard/utility-page";

// Lazy-load heavy modals on demand to eliminate initial workspace bundle bloat
const NotionAiPanel = dynamic(
  () => import("@/components/dashboard/notion-ai-panel").then((mod) => mod.NotionAiPanel),
  { ssr: false }
);
const SearchModal = dynamic(
  () => import("@/components/dashboard/modals/search-modal").then((mod) => mod.SearchModal),
  { ssr: false }
);
const CalendarModal = dynamic(
  () => import("@/components/dashboard/modals/calendar-modal").then((mod) => mod.CalendarModal),
  { ssr: false }
);
const SettingsModal = dynamic(
  () => import("@/components/dashboard/modals/settings-modal").then((mod) => mod.SettingsModal),
  { ssr: false }
);
const TrashModal = dynamic(
  () => import("@/components/dashboard/modals/trash-modal").then((mod) => mod.TrashModal),
  { ssr: false }
);
const AiChatModal = dynamic(
  () => import("@/components/dashboard/modals/ai-chat-modal").then((mod) => mod.AiChatModal),
  { ssr: false }
);
const CommandPalette = dynamic(
  () => import("@/components/dashboard/command-palette").then((mod) => mod.CommandPalette),
  { ssr: false }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status } = useSession();
  const params = useParams();
  // pageId is present when the URL is /dashboard/[pageId], absent on /dashboard
  const pageId = params?.pageId as string | undefined;

  const [activeTitle, setActiveTitle] = useState("Getting Started with Notion");
  const [lastEditedAt, setLastEditedAt] = useState<string | Date | undefined>(undefined);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAiSplitView, setIsAiSplitView] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isQuickAiOpen, setIsQuickAiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [utilityPage, setUtilityPage] = useState<"Library" | "My Tasks" | "Marketplace" | "Help" | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Auto-collapse sidebar when 50/50 split view is toggled
  const handleToggleSplitView = () => {
    setIsAiSplitView((prev) => {
      const next = !prev;
      if (next && window.innerWidth < 1280) {
        setSidebarOpen(false);
      }
      return next;
    });
  };

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const openQuickAi = () => setIsQuickAiOpen(true);
    const openSettings = () => setIsSettingsOpen(true);
    const openAiPanel = () => setIsAiOpen(true);
    const syncPageTitle = (event: Event) => {
      const title = (event as CustomEvent<{ title?: string }>).detail?.title;
      if (title) {
        setActiveTitle((prev) => (prev !== title ? title : prev));
      }
    };
    window.addEventListener("open-quick-ai", openQuickAi);
    window.addEventListener("open-settings", openSettings);
    window.addEventListener("trigger-ai-command", openAiPanel);
    window.addEventListener("open-ai-summary", openAiPanel);
    window.addEventListener("page-updated", syncPageTitle);
    return () => {
      window.removeEventListener("open-quick-ai", openQuickAi);
      window.removeEventListener("open-settings", openSettings);
      window.removeEventListener("trigger-ai-command", openAiPanel);
      window.removeEventListener("open-ai-summary", openAiPanel);
      window.removeEventListener("page-updated", syncPageTitle);
    };
  }, []);

  // When navigating to a real page URL, sync the TopBar title & updatedAt from the DB
  useEffect(() => {
    if (!pageId) return;
    getPage(pageId)
      .then((p) => {
        setActiveTitle(p.title);
        setLastEditedAt(p.updatedAt);
      })
      .catch(() => setActiveTitle("Page Not Found"));
  }, [pageId]);

  async function handleConfirmDelete() {
    if (!deleteTargetId) return;
    try {
      await deletePage(deleteTargetId);
      toast.success("Page moved to Trash");
      window.dispatchEvent(new Event("page-updated"));
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete page");
    } finally {
      setDeleteTargetId(null);
    }
  }



  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans antialiased text-foreground">
      {/* Left Sidebar */}
      <div
        className={`${
          sidebarOpen ? "flex" : "hidden"
        } md:flex h-full shrink-0 z-30`}
      >
        <Sidebar
          // Pass pageId when on a real page route so the sidebar can highlight it.
          // Fall back to activeTitle for special sentinel pages (AI Meeting Note, Home).
          activePage={pageId ?? activeTitle}
          onSelectPage={(title: string) => setActiveTitle(title)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleAi={() => setIsAiOpen(!isAiOpen)}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTrash={() => setIsTrashOpen(true)}
          onOpenUtility={(page: "Library" | "My Tasks" | "Marketplace" | "Help") => { setUtilityPage(page); setActiveTitle(page); }}
        />
      </div>

      {/* Center Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopBar
          activeTitle={activeTitle}
          pageId={pageId}
          updatedAt={lastEditedAt}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleAi={() => setIsAiOpen(!isAiOpen)}
          isAiOpen={isAiOpen}
          onDeletePage={(id) => setDeleteTargetId(id)}
        />
        {/* Page content (dashboard/page.tsx or dashboard/[pageId]/page.tsx) */}
        {utilityPage ? <UtilityPage type={utilityPage} onBack={() => { setUtilityPage(null); setActiveTitle("Getting Started with Notion"); }} /> : children}
      </div>

      {/* Right Notion AI Panel */}
      <NotionAiPanel
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        currentPageTitle={activeTitle}
        currentPageId={pageId}
        isSplitView={isAiSplitView}
        onToggleSplitView={handleToggleSplitView}
      />

      {/* Overlay Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenAi={() => setIsQuickAiOpen(true)}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPage={(title) => setActiveTitle(title)}
      />
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <TrashModal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} />
      <AiChatModal isOpen={isQuickAiOpen} onClose={() => setIsQuickAiOpen(false)} />
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete page?"
        description="This page will be moved to your Trash. You can restore it anytime."
        confirmText="Delete"
      />

    </div>
  );
}
