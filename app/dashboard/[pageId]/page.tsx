"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { DocumentCanvas } from "@/components/dashboard/document-canvas";
import { getPage, createPage, type Page, type PageBlock } from "@/lib/actions/pages";
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
    setPage(null);
    setNotFound(false);

    getPage(pageId)
      .then((p) => { if (!cancelled) setPage(p); })
      .catch(() => { if (!cancelled) setNotFound(true); });

    return () => { cancelled = true; };
  }, [pageId]);

  const initialBlocks = useMemo(
    () => (page?.blocks ? page.blocks.map(toChecklistItem) : []),
    [page?.blocks]
  );

  // Create a new sub-page and navigate into it
  const handleSelectSubPage = useCallback(async (title: string) => {
    try {
      const newPage = await createPage({
        title: title || "Untitled",
        category: "Private",
      });
      // Notify sidebar to refresh its page list
      window.dispatchEvent(new CustomEvent("page-created", { detail: { page: newPage } }));
      // Navigate to the new page
      router.push(`/dashboard/${newPage._id}`);
    } catch (err) {
      console.error("Failed to create sub-page:", err);
    }
  }, [router]);

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
