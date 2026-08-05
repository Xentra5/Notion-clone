"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { NotionAiPanel } from "@/components/dashboard/notion-ai-panel";
import { SearchModal } from "@/components/dashboard/modals/search-modal";
import { CalendarModal } from "@/components/dashboard/modals/calendar-modal";
import { getPage } from "@/lib/actions/pages";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const params = useParams();
  // pageId is present when the URL is /dashboard/[pageId], absent on /dashboard
  const pageId = params?.pageId as string | undefined;

  const [activeTitle, setActiveTitle] = useState("Getting Started on Mobile");
  const [lastEditedAt, setLastEditedAt] = useState<string | Date | undefined>(undefined);
  const [isAiOpen, setIsAiOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans antialiased text-foreground select-none">
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
        />
      </div>

      {/* Center Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopBar
          activeTitle={activeTitle}
          updatedAt={lastEditedAt}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleAi={() => setIsAiOpen(!isAiOpen)}
          isAiOpen={isAiOpen}
        />
        {/* Page content (dashboard/page.tsx or dashboard/[pageId]/page.tsx) */}
        {children}
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
    </div>
  );
}
