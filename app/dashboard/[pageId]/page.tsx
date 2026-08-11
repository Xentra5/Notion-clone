"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { DocumentCanvas } from "@/components/dashboard/document-canvas";
import { getPage, createPage, updatePage, type Page, type PageBlock } from "@/lib/actions/pages";
import type { ChecklistItem } from "@/hooks/use-pages";

interface PageRouteProps {
  params: Promise<{ pageId: string }>;
}

/** Convert a DB PageBlock into the editor's ChecklistItem shape. */
function toChecklistItem(block: PageBlock): ChecklistItem {
  let type: ChecklistItem["type"] = "paragraph";
  if (block.type === "heading") type = "heading";
  else if (block.type === "quote") type = "quote";
  else if (block.type === "bullet" || block.type === "bulleted_list_item") type = "bullet";
  else if (block.type === "to_do" || block.type === "todo") type = "todo";
  else if (
    block.type === "code" ||
    block.type === "callout" ||
    block.type === "divider" ||
    block.type === "toggle" ||
    block.type === "page" ||
    block.type === "image" ||
    block.type === "video" ||
    block.type === "audio" ||
    block.type === "file" ||
    block.type === "table" ||
    block.type === "kanban" ||
    block.type === "web_bookmark" ||
    block.type === "link_to_page"
  ) {
    type = block.type as ChecklistItem["type"];
  } else {
    type = "paragraph";
  }

  return {
    id: block.id,
    type,
    text: block.properties?.text ?? "",
    checked: block.properties?.checked ?? false,
    codeLanguage: block.properties?.language ?? "javascript",
    subPageId: block.properties?.subPageId ?? "",
    kanbanColumns: (block.properties?.kanbanColumns as never) ?? [],
  };
}

// Individual page route — /dashboard/[pageId]
export default function PageRoute({ params }: PageRouteProps) {
  const { pageId } = use(params);
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getPage(pageId)
      .then((p) => { if (!cancelled) { setPage(p); setNotFound(false); } })
      .catch(() => { if (!cancelled) { setPage(null); setNotFound(true); } });

    return () => { cancelled = true; };
  }, [pageId]);

  const initialBlocks = useMemo(
    () => (page?.blocks ? page.blocks.map(toChecklistItem) : []),
    [page]
  );

  // Handle sub-page click / creation
  const handleSelectSubPage = useCallback(
    async (blockId: string, subPageId?: string, title?: string) => {
      // If the sub-page already exists, open it directly!
      if (subPageId && subPageId.length > 0) {
        router.push(`/dashboard/${subPageId}`);
        return;
      }

      if (!page) return;

      try {
        // 1. Create the child page with parentPageId linking to current page
        const newPage = await createPage({
          title: title || "Untitled",
          parentPageId: pageId,
          category: "Private",
        });

        // 2. Build updated blocks with the subPageId link
        const updatedBlocks = page.blocks.map((b) =>
          b.id === blockId
            ? { ...b, properties: { ...b.properties, subPageId: newPage._id } }
            : b
        );

        // 3. AWAIT save to DB before navigating — prevents autosave race condition
        await updatePage(pageId, { blocks: updatedBlocks as never });

        // 4. Update local state so if autosave fires it won't lose subPageId
        setPage((prev) => prev ? { ...prev, blocks: updatedBlocks } : prev);

        // 5. Notify sidebar to refresh its page list
        window.dispatchEvent(new CustomEvent("page-created", { detail: { page: newPage } }));

        // 6. Navigate AFTER everything is saved
        router.push(`/dashboard/${newPage._id}`);
      } catch (err) {
        console.error("Failed to create sub-page:", err);
      }
    },
    [pageId, page, router]
  );

  if (notFound) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm select-none">
        Page not found or you don&apos;t have access.
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <DocumentCanvas
      key={pageId}
      activeTitle={page.title}
      pageId={pageId}
      initialBlocks={initialBlocks}
      onOpenAi={() => window.dispatchEvent(new Event("open-quick-ai"))}
      onSelectSubPage={handleSelectSubPage}
    />
  );
}
