"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { DocumentCanvas } from "@/components/dashboard/document-canvas";
import { getPage, getPages, createPage, updatePage, type Page, type PageBlock } from "@/lib/actions/pages";
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
    url: (block.properties as { url?: string })?.url ?? "",
    fileName: (block.properties as { fileName?: string })?.fileName ?? "",
    fileSize: (block.properties as { fileSize?: string })?.fileSize ?? "",
  };
}

// Individual page route — /dashboard/[pageId]
export default function PageRoute({ params }: PageRouteProps) {
  const { pageId } = use(params);
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [childPages, setChildPages] = useState<Page[]>([]);
  const [notFound, setNotFound] = useState(false);

  const fetchChildPages = useCallback(async () => {
    try {
      const all = await getPages();
      const children = all.filter((p) => p.parentPageId === pageId && !p.deletedAt);
      setChildPages(children);
    } catch (err) {
      console.error("Failed to load child pages:", err);
    }
  }, [pageId]);

  useEffect(() => {
    let cancelled = false;

    getPage(pageId)
      .then((p) => { if (!cancelled) { setPage(p); setNotFound(false); } })
      .catch(() => { if (!cancelled) { setPage(null); setNotFound(true); } });

    queueMicrotask(() => {
      fetchChildPages();
    });

    const handleRefresh = () => {
      fetchChildPages();
    };

    window.addEventListener("page-created", handleRefresh);
    window.addEventListener("page-updated", handleRefresh);
    window.addEventListener("page-deleted", handleRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener("page-created", handleRefresh);
      window.removeEventListener("page-updated", handleRefresh);
      window.removeEventListener("page-deleted", handleRefresh);
    };
  }, [pageId, fetchChildPages]);

  const initialBlocks = useMemo(
    () => (page?.blocks ? page.blocks.map(toChecklistItem) : []),
    [page]
  );

  // Handle sub-page click / creation
  const handleSelectSubPage = useCallback(
    async (blockId: string, subPageId?: string, title?: string) => {
      const pageTitle = title && title.trim() ? title.trim() : "Untitled";

      // If subPageId exists, verify it actually exists in DB before navigating!
      if (subPageId && subPageId.length > 0) {
        try {
          await getPage(subPageId);
          router.push(`/dashboard/${subPageId}`);
          return;
        } catch {
          console.warn(`Sub-page ${subPageId} not found in DB. Auto-creating...`);
        }
      }

      if (!page) return;

      try {
        // 1. Create the child page with parentPageId linking to current page
        const newPage = await createPage({
          title: pageTitle,
          parentPageId: pageId,
          category: "Private",
        });

        // 2. Build updated blocks with the subPageId link
        const updatedBlocks = page.blocks.map((b) =>
          b.id === blockId
            ? { ...b, properties: { ...b.properties, subPageId: newPage._id, text: pageTitle } }
            : b
        );

        // 3. AWAIT save to DB before navigating — prevents race condition
        await updatePage(pageId, { blocks: updatedBlocks as never });

        // 4. Update local state
        setPage((prev) => (prev ? { ...prev, blocks: updatedBlocks } : prev));

        // 5. Notify sidebar and components to refresh page lists
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none bg-background">
        <div className="p-4 rounded-2xl bg-foreground/5 text-muted-foreground mb-4">
          <span className="text-4xl">📄</span>
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">Page Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
          This page does not exist, was deleted, or you don&apos;t have access to view it.
        </p>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-sm"
        >
          Return to Workspace Home
        </button>
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
      initialCoverImage={page.coverImage}
      childPages={childPages}
      onSelectSubPage={handleSelectSubPage}
    />
  );
}
