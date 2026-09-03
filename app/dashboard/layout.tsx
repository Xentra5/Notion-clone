"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { deletePage, getPage } from "@/lib/actions/pages";
import { UtilityPage } from "@/components/dashboard/utility-page";
import { useWorkspaceStore } from "@/store/workspace-store";

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();
  const params = useParams();
  const pathname = usePathname();
  const pageId = params?.pageId as string | undefined;
  const isAgentPage = pathname === "/dashboard/agent" || pathname?.startsWith("/dashboard/agent");

  const {
    activePage, setActivePage,
    isAiOpen, closeAi, isAiSplitView, toggleSplitView,
    isSearchOpen, closeSearch,
    isCommandPaletteOpen, closeCommandPalette, toggleCommandPalette,
    isCalendarOpen, closeCalendar,
    isSettingsOpen, closeSettings,
    isTrashOpen, closeTrash,
    isQuickAiOpen, closeQuickAi,
    sidebarOpen,
    utilityPage, setUtilityPage,
    deleteTargetId, setDeleteTargetId,
  } = useWorkspaceStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommandPalette]);

  // Bridge legacy window custom events from deeply nested components to the store
  useEffect(() => {
    const openQuickAi = () => useWorkspaceStore.getState().openQuickAi();
    const openSettingsEvt = () => useWorkspaceStore.getState().openSettings();
    const openAiPanel = () => useWorkspaceStore.getState().openAi();
    window.addEventListener("open-quick-ai", openQuickAi);
    window.addEventListener("open-settings", openSettingsEvt);
    window.addEventListener("trigger-ai-command", openAiPanel);
    window.addEventListener("open-ai-summary", openAiPanel);
    return () => {
      window.removeEventListener("open-quick-ai", openQuickAi);
      window.removeEventListener("open-settings", openSettingsEvt);
      window.removeEventListener("trigger-ai-command", openAiPanel);
      window.removeEventListener("open-ai-summary", openAiPanel);
    };
  }, []);

  // Sync active page info when navigating to a page URL
  useEffect(() => {
    if (!pageId) return;
    setActivePage({ pageId });
    getPage(pageId)
      .then((p) => setActivePage({ pageId, title: p.title, updatedAt: p.updatedAt }))
      .catch(() => setActivePage({ title: "Page Not Found" }));
  }, [pageId, setActivePage]);

  async function handleConfirmDelete() {
    if (!deleteTargetId) return;
    try {
      await deletePage(deleteTargetId);
      toast.success("Page moved to Trash");
      useWorkspaceStore.getState().refreshPages();
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
      <div className={`${sidebarOpen ? "flex" : "hidden"} md:flex h-full shrink-0 z-30`}>
        <Sidebar activePage={pageId ?? activePage.title} />
      </div>

      {/* Center Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {!isAgentPage && <TopBar pageId={pageId} />}
        {utilityPage
          ? <UtilityPage type={utilityPage} onBack={() => { setUtilityPage(null); setActivePage({ title: "Getting Started with Notion" }); }} />
          : children}
      </div>

      {/* Right Notion AI Panel */}
      <NotionAiPanel
        isOpen={isAiOpen}
        onClose={closeAi}
        currentPageTitle={activePage.title}
        currentPageId={pageId}
        isSplitView={isAiSplitView}
        onToggleSplitView={toggleSplitView}
      />

      {/* Overlay Modals */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} onOpenAi={() => useWorkspaceStore.getState().openQuickAi()} />
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} onSelectPage={(title) => setActivePage({ title })} />
      <CalendarModal isOpen={isCalendarOpen} onClose={closeCalendar} />
      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
      <TrashModal isOpen={isTrashOpen} onClose={closeTrash} />
      <AiChatModal isOpen={isQuickAiOpen} onClose={closeQuickAi} />
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
