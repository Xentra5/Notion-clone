/**
 * workspace-store.ts
 *
 * Centralized Zustand store for all dashboard workspace state.
 * Replaces the scattered window.dispatchEvent / window.addEventListener event bus.
 *
 * Usage (React):
 *   import { useWorkspaceStore } from "@/store/workspace-store";
 *   const { isAiOpen, toggleAi } = useWorkspaceStore();
 *
 * Usage (plain TS, e.g. use-autosave.ts):
 *   import { workspaceStore } from "@/store/workspace-store";
 *   workspaceStore.getState().setActivePage({ title: "My Page" });
 */

import { create } from "zustand";

// --- Types --------------------------------------------------------------------

type UtilityPage = "Library" | "My Tasks" | "Marketplace" | "Help";

interface ActivePageInfo {
  title: string;
  updatedAt?: Date | string;
  pageId?: string;
}

interface WorkspaceState {
  // -- Active page ----------------------------------------------------------
  activePage: ActivePageInfo;
  setActivePage: (info: Partial<ActivePageInfo>) => void;

  // -- Modals ----------------------------------------------------------------
  isAiOpen: boolean;
  isAiSplitView: boolean;
  isSearchOpen: boolean;
  isCommandPaletteOpen: boolean;
  isCalendarOpen: boolean;
  isSettingsOpen: boolean;
  isTrashOpen: boolean;
  isQuickAiOpen: boolean;

  openAi: () => void;
  closeAi: () => void;
  toggleAi: () => void;
  toggleSplitView: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  openCalendar: () => void;
  closeCalendar: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openTrash: () => void;
  closeTrash: () => void;
  openQuickAi: () => void;
  closeQuickAi: () => void;

  // -- Sidebar ---------------------------------------------------------------
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;

  utilityPage: UtilityPage | null;
  setUtilityPage: (page: UtilityPage | null) => void;

  deleteTargetId: string | null;
  setDeleteTargetId: (id: string | null) => void;

  // -- Page list refresh -----------------------------------------------------
  /** Incrementing counter — Sidebar watches this to re-fetch the page list */
  pagesVersion: number;
  refreshPages: () => void;
}

// --- Store --------------------------------------------------------------------

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  // -- Active page ----------------------------------------------------------
  activePage: { title: "Getting Started with Notion" },
  setActivePage: (info) =>
    set((s) => ({ activePage: { ...s.activePage, ...info } })),

  // -- Modals ----------------------------------------------------------------
  isAiOpen: false,
  isAiSplitView: false,
  isSearchOpen: false,
  isCommandPaletteOpen: false,
  isCalendarOpen: false,
  isSettingsOpen: false,
  isTrashOpen: false,
  isQuickAiOpen: false,

  openAi: () => set({ isAiOpen: true }),
  closeAi: () => set({ isAiOpen: false }),
  toggleAi: () => set((s) => ({ isAiOpen: !s.isAiOpen })),

  toggleSplitView: () =>
    set((s) => {
      const next = !s.isAiSplitView;
      if (next && typeof window !== "undefined" && window.innerWidth < 1280) {
        return { isAiSplitView: next, sidebarOpen: false };
      }
      return { isAiSplitView: next };
    }),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  toggleCommandPalette: () =>
    set((s) => ({ isCommandPaletteOpen: !s.isCommandPaletteOpen })),

  openCalendar: () => set({ isCalendarOpen: true }),
  closeCalendar: () => set({ isCalendarOpen: false }),

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  openTrash: () => set({ isTrashOpen: true }),
  closeTrash: () => set({ isTrashOpen: false }),

  openQuickAi: () => set({ isQuickAiOpen: true }),
  closeQuickAi: () => set({ isQuickAiOpen: false }),

  // -- Sidebar ---------------------------------------------------------------
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),

  utilityPage: null,
  setUtilityPage: (page) => set({ utilityPage: page }),

  deleteTargetId: null,
  setDeleteTargetId: (id) => set({ deleteTargetId: id }),

  // -- Page list refresh -----------------------------------------------------
  pagesVersion: 0,
  refreshPages: () => set((s) => ({ pagesVersion: s.pagesVersion + 1 })),
}));

/**
 * Non-hook accessor for plain TS files (e.g. use-autosave.ts, pages.ts).
 */
export const workspaceStore = useWorkspaceStore;
