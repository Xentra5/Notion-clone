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
    checked?: boolean;
    language?: string;
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
  isAiMeetingNote: boolean;
  blocks: PageBlock[];
  createdAt: string;
  updatedAt: string;
}

// GET /api/pages — list all pages for the logged-in user
export async function getPages(): Promise<Page[]> {
  const res = await fetch("/api/pages", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch pages");
  const data = await res.json();
  return data.pages as Page[];
}

// GET /api/pages/[id] — fetch a single page by id
export async function getPage(id: string): Promise<Page> {
  const res = await fetch(`/api/pages/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch page ${id}`);
  const data = await res.json();
  return data.page as Page;
}

// POST /api/pages — create a new page and return it (with _id)
export async function createPage(data: {
  title?: string;
  category?: "Private" | "Shared" | "Meetings";
  isAiMeetingNote?: boolean;
  blocks?: PageBlock[];
}): Promise<Page> {
  const res = await fetch("/api/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create page");
  const result = await res.json();
  return result.page as Page;
}

// PATCH /api/pages/[id] — update one or more fields on an existing page
export async function updatePage(
  id: string,
  data: Partial<Pick<Page, "title" | "blocks" | "category" | "icon">>
): Promise<Page> {
  const res = await fetch(`/api/pages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update page ${id}`);
  const result = await res.json();
  return result.page as Page;
}

// DELETE /api/pages/[id] — permanently delete a page
export async function deletePage(id: string): Promise<void> {
  const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete page ${id}`);
}
