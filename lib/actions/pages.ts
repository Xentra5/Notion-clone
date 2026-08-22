/**
 * lib/actions/pages.ts
 *
 * Client-side fetch wrappers for the /api/pages endpoints.
 * Components import these helpers instead of inlining fetch() calls,
 * so the API contract is defined in one place.
 */

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

// In-flight request deduplication & dual-layer client caches
let inFlightPagesPromise: Promise<Page[]> | null = null;
const inFlightPageMap = new Map<string, Promise<Page>>();
let cachedPagesList: { data: Page[]; timestamp: number } | null = null;
const pageDocCache = new Map<string, { data: Page; timestamp: number }>();

const LIST_CACHE_TTL_MS = 30_000; // 30s for sidebar pages list
const DOC_CACHE_TTL_MS = 60_000;  // 60s for individual document bodies

export function invalidatePagesCache(pageId?: string) {
  inFlightPagesPromise = null;
  cachedPagesList = null;
  inFlightPageMap.clear();
  if (pageId) {
    pageDocCache.delete(pageId);
  } else {
    pageDocCache.clear();
  }
}

// GET /api/pages — list all pages for the logged-in user with request deduplication
export async function getPages(forceRefresh = false): Promise<Page[]> {
  const now = Date.now();
  if (!forceRefresh && cachedPagesList && now - cachedPagesList.timestamp < LIST_CACHE_TTL_MS) {
    return cachedPagesList.data;
  }

  if (inFlightPagesPromise) {
    return inFlightPagesPromise;
  }

  inFlightPagesPromise = (async () => {
    try {
      const res = await fetch("/api/pages", { cache: "no-store" });
      // 401 = session not yet established or expired — return empty silently.
      if (res.status === 401) return [];
      if (!res.ok) {
        console.warn(`Failed to fetch pages: HTTP ${res.status}`);
        return cachedPagesList?.data || [];
      }
      const data = await res.json();
      const pages = (data.pages || []) as Page[];
      cachedPagesList = { data: pages, timestamp: Date.now() };
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

// GET /api/pages/[id] — fetch a single page with in-memory 0ms cache & deduplication
export async function getPage(id: string, forceRefresh = false): Promise<Page> {
  if (!id) throw new Error("Page ID is required");

  const now = Date.now();
  const cached = pageDocCache.get(id);

  // 1. Instant Client-Side Cache Hit (0ms)
  if (!forceRefresh && cached && now - cached.timestamp < DOC_CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Request deduplication for simultaneous calls
  if (inFlightPageMap.has(id)) {
    return inFlightPageMap.get(id)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch(`/api/pages/${id}`, { cache: "no-store" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error(`Failed to fetch page ${id} (${res.status})`);
      const data = await res.json();
      const page = data.page as Page;
      pageDocCache.set(id, { data: page, timestamp: Date.now() });
      return page;
    } finally {
      inFlightPageMap.delete(id);
    }
  })();

  inFlightPageMap.set(id, promise);
  return promise;
}

// POST /api/pages — create a new page and return it (with _id)
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
  pageDocCache.set(page._id, { data: page, timestamp: Date.now() });
  cachedPagesList = null; // Invalidate list cache so sidebar updates
  return page;
}

// PATCH /api/pages/[id] — update one or more fields on an existing page
export async function updatePage(
  id: string,
  data: Partial<Pick<Page, "title" | "blocks" | "category" | "icon" | "coverImage" | "isStarred" | "permission">> & {
    parentPageId?: string;
  }
): Promise<Page> {
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
  
  // Write-through update: immediately update client cache
  pageDocCache.set(id, { data: updatedPage, timestamp: Date.now() });
  cachedPagesList = null; // Invalidate sidebar list
  
  return updatedPage;
}

// DELETE /api/pages/[id] — permanently delete a page
export async function deletePage(id: string): Promise<void> {
  const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete page ${id}`);
  invalidatePagesCache(id);
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

