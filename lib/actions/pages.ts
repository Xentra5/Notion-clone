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

// In-flight request deduplication & short-lived cache
let inFlightPagesPromise: Promise<Page[]> | null = null;
const inFlightPageMap = new Map<string, Promise<Page>>();
let cachedPages: { data: Page[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 2500; // 2.5s stale-while-revalidate window

export function invalidatePagesCache() {
  inFlightPagesPromise = null;
  cachedPages = null;
  inFlightPageMap.clear();
}

// GET /api/pages — list all pages for the logged-in user with request deduplication
export async function getPages(forceRefresh = false): Promise<Page[]> {
  const now = Date.now();
  if (!forceRefresh && cachedPages && now - cachedPages.timestamp < CACHE_TTL_MS) {
    return cachedPages.data;
  }

  if (inFlightPagesPromise) {
    return inFlightPagesPromise;
  }

  inFlightPagesPromise = (async () => {
    try {
      const res = await fetch("/api/pages", { cache: "no-store" });
      // 401 = session not yet established or expired — return empty silently.
      // The dashboard layout already redirects unauthenticated users to /login.
      if (res.status === 401) return [];
      if (!res.ok) {
        console.warn(`Failed to fetch pages: HTTP ${res.status}`);
        return cachedPages?.data || [];
      }
      const data = await res.json();
      const pages = (data.pages || []) as Page[];
      cachedPages = { data: pages, timestamp: Date.now() };
      return pages;
    } catch (err) {
      console.warn("Failed to fetch pages (network/server error):", err);
      return cachedPages?.data || [];
    } finally {
      inFlightPagesPromise = null;
    }
  })();

  return inFlightPagesPromise;
}

// GET /api/pages/[id] — fetch a single page by id with request deduplication
export async function getPage(id: string): Promise<Page> {
  if (!id) throw new Error("Page ID is required");

  if (inFlightPageMap.has(id)) {
    return inFlightPageMap.get(id)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch(`/api/pages/${id}`, { cache: "no-store" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error(`Failed to fetch page ${id} (${res.status})`);
      const data = await res.json();
      return data.page as Page;
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
  invalidatePagesCache();
  return result.page as Page;
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
  invalidatePagesCache();
  return result.page as Page;
}

// DELETE /api/pages/[id] — permanently delete a page
export async function deletePage(id: string): Promise<void> {
  const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete page ${id}`);
  invalidatePagesCache();
}


export async function getTrashPages(): Promise<Page[]> {
  const res = await fetch("/api/pages/trash", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch trash");
  return (await res.json()).pages as Page[];
}

export async function restorePage(id: string): Promise<void> {
  const res = await fetch(`/api/pages/${id}/restore`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to restore page");
  invalidatePagesCache();
}

export async function permanentlyDeletePage(id: string): Promise<void> {
  const res = await fetch(`/api/pages/${id}?permanent=true`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to permanently delete page");
  invalidatePagesCache();
}
