"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { DocumentCanvas } from "@/components/dashboard/document-canvas";
import { NotionAiPanel } from "@/components/dashboard/notion-ai-panel";
import { SearchModal } from "@/components/dashboard/search-modal";
import { CalendarModal } from "@/components/dashboard/calendar-modal";

export default function DashboardPage() {
  const { status } = useSession();
  const [activeTitle, setActiveTitle] = useState("Getting Started on Mobile");
  const [isAiOpen, setIsAiOpen] = useState(true); // Open Notion AI panel by default to show off matching Screenshot 2!
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#191919] text-[#d4d4d4]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#0078df] border-t-transparent animate-spin" />
          <span className="text-xs text-[#737373] font-medium tracking-wide">
            Loading Notion workspace...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#191919] font-sans antialiased text-[#d4d4d4] select-none">
      {/* Left Sidebar */}
      <div
        className={`${
          sidebarOpen ? "flex" : "hidden"
        } md:flex h-full shrink-0 z-30`}
      >
        <Sidebar
          activePage={activeTitle}
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
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleAi={() => setIsAiOpen(!isAiOpen)}
          isAiOpen={isAiOpen}
        />
        <DocumentCanvas
          activeTitle={activeTitle}
          onOpenAi={() => setIsAiOpen(true)}
          onSelectSubPage={(title) => setActiveTitle(title)}
        />
      </div>

      {/* Right Notion AI Panel (Matching Screenshot 2) */}
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
