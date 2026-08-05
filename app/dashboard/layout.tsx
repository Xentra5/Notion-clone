"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { NotionAiPanel } from "@/components/dashboard/notion-ai-panel";
import { SearchModal } from "@/components/dashboard/modals/search-modal";
import { CalendarModal } from "@/components/dashboard/modals/calendar-modal";
import { SettingsModal } from "@/components/dashboard/modals/settings-modal";
import { TrashModal } from "@/components/dashboard/modals/trash-modal";
import { AiChatModal } from "@/components/dashboard/modals/ai-chat-modal";
import { getPage } from "@/lib/actions/pages";
import { UtilityPage } from "@/components/dashboard/utility-page";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const params = useParams();
  // pageId is present when the URL is /dashboard/[pageId], absent on /dashboard
  const pageId = params?.pageId as string | undefined;

  const [activeTitle, setActiveTitle] = useState("Getting Started with Notion");
  const [lastEditedAt, setLastEditedAt] = useState<string | Date | undefined>(undefined);
  const [isAiOpen, setIsAiOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isQuickAiOpen, setIsQuickAiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [utilityPage, setUtilityPage] = useState<"Library" | "My Tasks" | "Marketplace" | "Help" | null>(null);

  useEffect(() => {
    const openQuickAi = () => setIsQuickAiOpen(true);
    const openSettings = () => setIsSettingsOpen(true);
    const syncPageTitle = (event: Event) => {
      const title = (event as CustomEvent<{ title?: string }>).detail?.title;
      if (title) setActiveTitle(title);
    };
    window.addEventListener("open-quick-ai", openQuickAi);
    window.addEventListener("open-settings", openSettings);
    window.addEventListener("page-updated", syncPageTitle);
    return () => {
      window.removeEventListener("open-quick-ai", openQuickAi);
      window.removeEventListener("open-settings", openSettings);
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
      .catch(() => setActiveTitle("Untitled"));
  }, [pageId]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground animate-pulse">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs text-muted-foreground font-medium tracking-wide">
            Loading Notion workspace...
          </span>
        </div>
      </div>
    );
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
          onSelectPage={(title) => setActiveTitle(title)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleAi={() => setIsAiOpen(!isAiOpen)}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTrash={() => setIsTrashOpen(true)}
          onOpenUtility={(page) => { setUtilityPage(page); setActiveTitle(page); }}
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
          onDeletePage={async (id) => {
            if (confirm("Are you sure you want to delete this page?")) {
              const { deletePage } = await import("@/lib/actions/pages");
              await deletePage(id);
              window.location.href = "/dashboard";
            }
          }}
        />
        {/* Page content (dashboard/page.tsx or dashboard/[pageId]/page.tsx) */}
        {utilityPage ? <UtilityPage type={utilityPage} onBack={() => { setUtilityPage(null); setActiveTitle("Getting Started with Notion"); }} /> : children}
      </div>

      {/* Right Notion AI Panel */}
      <NotionAiPanel
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        currentPageTitle={activeTitle}
      />

      {/* Overlay Modals */}
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

    </div>
  );
}
