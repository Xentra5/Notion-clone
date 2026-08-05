"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { DocumentCanvas } from "@/components/dashboard/document-canvas";
import { getPage, type Page, type PageBlock } from "@/lib/actions/pages";
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
  else type = "paragraph";

  return {
    id: block.id,
    type,
    text: block.properties?.text ?? "",
    checked: block.properties?.checked ?? false,
  };
}

// Individual page route — /dashboard/[pageId]
// The layout.tsx above provides the Sidebar, TopBar, AI panel, and modals.
export default function PageRoute({ params }: PageRouteProps) {
  const { pageId } = use(params);
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
      initialBlocks={page.blocks ? page.blocks.map(toChecklistItem) : []}
      onOpenAi={() => window.dispatchEvent(new Event("open-quick-ai"))}
      onSelectSubPage={() => {}}
    />
  );
}
