/**
 * lib/actions/pages.ts
 *
 * Client-side fetch wrappers with Local-First IndexedDB persistence,
 * 0ms instant Stale-While-Revalidate (SWR), Multi-tab sync, and Optimistic mutations.
 */

import { localStore } from "@/lib/storage/local-store";

export interface PageBlock {
  id: string;
  type: string;
  properties: {
    text?: string;
    title?: string;
    checked?: boolean;
    language?: string;
    subPageId?: string;
    kanbanColumns?: unknown[];
    url?: string;
    fileName?: string;
    fileSize?: string;
    toggleChildren?: string;
    calloutIcon?: string;
    tableData?: string[][];
  };
  content?: string[];
  parent?: string;
}

export interface Page {
  _id: string;
  userId: string;
  title: string;
  icon: string;
  coverImage?: string;
  category: "Private" | "Shared" | "Meetings";
  parentPageId?: string;
  isAiMeetingNote: boolean;
  isStarred?: boolean;
  permission?: "Private" | "Workspace" | "Public";
  blocks: PageBlock[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// In-flight request deduplication
let inFlightPagesPromise: Promise<Page[]> | null = null;
const inFlightPageMap = new Map<string, Promise<Page>>();
let cachedPagesList: { data: Page[]; timestamp: number } | null = null;
const pageDocCache = new Map<string, { data: Page; timestamp: number }>();

const LIST_CACHE_TTL_MS = 30_000; // 30s for memory list cache
const DOC_CACHE_TTL_MS = 60_000;  // 60s for memory doc cache

export function invalidatePagesCache(pageId?: string) {
  inFlightPagesPromise = null;
  cachedPagesList = null;
  inFlightPageMap.clear();
  if (pageId) {
    pageDocCache.delete(pageId);
    void localStore.removePageLocal(pageId);
  } else {
    pageDocCache.clear();
  }
}

// GET /api/pages — list all pages with 0ms Local-First read & background SWR
export async function getPages(forceRefresh = false): Promise<Page[]> {
  const now = Date.now();

  // 1. Fast Memory Cache
  if (!forceRefresh && cachedPagesList && now - cachedPagesList.timestamp < LIST_CACHE_TTL_MS) {
    return cachedPagesList.data;
  }

  // 2. Fast IndexedDB Persistence Cache (0ms instant render)
  if (!forceRefresh) {
    const localPages = await localStore.getPagesListLocal();
    if (localPages && localPages.length > 0) {
      cachedPagesList = { data: localPages, timestamp: now };
      // Background revalidation
      void revalidatePagesList();
      return localPages;
    }
  }

  // 3. Deduplicated Network Request
  if (inFlightPagesPromise) {
    return inFlightPagesPromise;
  }

  return revalidatePagesList();
}

async function revalidatePagesList(): Promise<Page[]> {
  inFlightPagesPromise = (async () => {
    try {
      const res = await fetch("/api/pages", { cache: "no-store" });
      if (res.status === 401) return [];
      if (!res.ok) {
        console.warn(`Failed to fetch pages: HTTP ${res.status}`);
        return cachedPagesList?.data || [];
      }
      const data = await res.json();
      const pages = (data.pages || []) as Page[];
      cachedPagesList = { data: pages, timestamp: Date.now() };
      
      // Update IndexedDB persistent store asynchronously
      void localStore.setPagesListLocal(pages);
      return pages;
    } catch (err) {
      console.warn("Failed to fetch pages (network/server error):", err);
      return cachedPagesList?.data || [];
    } finally {
      inFlightPagesPromise = null;
    }
  })();

  return inFlightPagesPromise;
}

// GET /api/pages/[id] — 0ms Local-First document read with SWR
export async function getPage(id: string, forceRefresh = false): Promise<Page> {
  if (!id) throw new Error("Page ID is required");

  const now = Date.now();
  const cached = pageDocCache.get(id);

  // 1. Instant In-Memory Cache Hit (0ms)
  if (!forceRefresh && cached && now - cached.timestamp < DOC_CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Instant IndexedDB Local Persistence Hit (0ms)
  if (!forceRefresh) {
    const localDoc = await localStore.getPageLocal(id);
    if (localDoc) {
      pageDocCache.set(id, { data: localDoc, timestamp: now });
      // Asynchronously revalidate in background without blocking UI
      void revalidatePage(id);
      return localDoc;
    }
  }

  // 3. Deduplicated Network Fetch
  if (inFlightPageMap.has(id)) {
    return inFlightPageMap.get(id)!;
  }

  return revalidatePage(id);
}

async function revalidatePage(id: string): Promise<Page> {
  const promise = (async () => {
    try {
      const res = await fetch(`/api/pages/${id}`, { cache: "no-store" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error(`Failed to fetch page ${id} (${res.status})`);
      const data = await res.json();
      const page = data.page as Page;
      
      // Persist in Memory and IndexedDB
      pageDocCache.set(id, { data: page, timestamp: Date.now() });
      void localStore.setPageLocal(page);
      return page;
    } finally {
      inFlightPageMap.delete(id);
    }
  })();

  inFlightPageMap.set(id, promise);
  return promise;
}

// POST /api/pages — create a new page and return it
export async function createPage(data?: {
  title?: string;
  icon?: string;
  coverImage?: string;
  category?: "Private" | "Shared" | "Meetings";
  parentPageId?: string;
  isAiMeetingNote?: boolean;
  isStarred?: boolean;
  permission?: "Private" | "Workspace" | "Public";
  blocks?: PageBlock[];
}): Promise<Page> {
  const res = await fetch("/api/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data || {}),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({} as { detail?: string; error?: string }));
    const reason = errorData.detail || errorData.error || `HTTP ${res.status}`;
    throw new Error(`Failed to create page: ${reason}`);
  }
  const result = await res.json();
  const page = result.page as Page;

  // Persist locally across memory and IndexedDB
  pageDocCache.set(page._id, { data: page, timestamp: Date.now() });
  void localStore.setPageLocal(page);
  cachedPagesList = null;

  return page;
}

// PATCH /api/pages/[id] — optimistic local update + write-through network sync
export async function updatePage(
  id: string,
  data: Partial<Pick<Page, "title" | "blocks" | "category" | "icon" | "coverImage" | "isStarred" | "permission">> & {
    parentPageId?: string;
  }
): Promise<Page> {
  // 1. Optimistically apply change to local cache immediately
  const existing = pageDocCache.get(id)?.data || (await localStore.getPageLocal(id));
  if (existing) {
    const optimisticPage: Page = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    pageDocCache.set(id, { data: optimisticPage, timestamp: Date.now() });
    void localStore.setPageLocal(optimisticPage);
  }

  // 2. Dispatch network update with background retry queue fallback
  try {
    const res = await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({} as { detail?: string; error?: string }));
      throw new Error(errorData.detail || errorData.error || `Failed to update page ${id}`);
    }

    const result = await res.json();
    const updatedPage = result.page as Page;

    // Write-through update
    pageDocCache.set(id, { data: updatedPage, timestamp: Date.now() });
    void localStore.setPageLocal(updatedPage);
    cachedPagesList = null;

    return updatedPage;
  } catch (err) {
    console.warn("Network update failed, enqueued for background sync:", err);
    // Queue mutation for offline/background execution
    void localStore.enqueueMutation({
      type: "update",
      pageId: id,
      payload: data,
    });

    // Return optimistic page so user experience remains uninterrupted
    if (existing) {
      return { ...existing, ...data, updatedAt: new Date().toISOString() };
    }
    throw err;
  }
}

// DELETE /api/pages/[id] — optimistic delete
export async function deletePage(id: string): Promise<void> {
  // Optimistically remove locally
  invalidatePagesCache(id);

  try {
    const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete page ${id}`);
  } catch (err) {
    console.warn("Network delete failed, enqueued for background sync:", err);
    void localStore.enqueueMutation({
      type: "delete",
      pageId: id,
    });
  }
}

export async function getTrashPages(): Promise<Page[]> {
  const res = await fetch("/api/pages/trash", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch trash");
  return (await res.json()).pages as Page[];
}

export async function restorePage(id: string): Promise<void> {
  const res = await fetch(`/api/pages/${id}/restore`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to restore page");
  invalidatePagesCache(id);
}

export async function permanentlyDeletePage(id: string): Promise<void> {
  const res = await fetch(`/api/pages/${id}?permanent=true`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to permanently delete page");
  invalidatePagesCache(id);
}
