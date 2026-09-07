"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { DocumentCanvas } from "@/components/dashboard/document-canvas";
import { getPage, getPages, createPage, updatePage, type Page, type PageBlock } from "@/lib/actions/pages";
import { localStore } from "@/lib/storage/local-store";
import type { ChecklistItem } from "@/hooks/use-pages";

interface PageRouteProps {
  params: Promise<{ pageId: string }>;
}

/** Convert a DB PageBlock into the editor's ChecklistItem shape. */
function toChecklistItem(block: PageBlock): ChecklistItem {
  let type: ChecklistItem["type"] = "paragraph";
  if (block.type === "heading1" || block.type === "heading_1") type = "heading1";
  else if (block.type === "heading2" || block.type === "heading_2") type = "heading2";
  else if (block.type === "heading3" || block.type === "heading_3") type = "heading3";
  else if (block.type === "heading4" || block.type === "heading_4" || block.type === "heading") type = "heading";
  else if (block.type === "bullet" || block.type === "bulleted_list_item") type = "bullet";
  else if (block.type === "numbered" || block.type === "numbered_list_item") type = "numbered";
  else if (block.type === "to_do" || block.type === "todo") type = "todo";
  else if (block.type === "quote") type = "quote";
  else if (block.type === "callout") type = "callout";
  else if (block.type === "divider") type = "divider";
  else if (block.type === "toggle") type = "toggle";
  else if (
    block.type === "code" ||
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

  let text = block.properties?.text ?? block.properties?.title ?? "";
  let checked = block.properties?.checked ?? false;
  let calloutIcon = (block.properties as { calloutIcon?: string })?.calloutIcon || "💡";

  // Auto-detect and parse raw markdown text if saved as a generic paragraph
  if ((type === "paragraph" || !type) && text) {
    const trimmed = text.trim();
    if (/^####\s+/.test(trimmed)) {
      type = "heading4";
      text = trimmed.replace(/^####\s+/, "");
    } else if (/^###\s+/.test(trimmed)) {
      type = "heading3";
      text = trimmed.replace(/^###\s+/, "");
    } else if (/^##\s+/.test(trimmed)) {
      type = "heading2";
      text = trimmed.replace(/^##\s+/, "");
    } else if (/^#\s+/.test(trimmed)) {
      type = "heading1";
      text = trimmed.replace(/^#\s+/, "");
    } else if (/^[-*+•]\s*\[\s*\]\s+/.test(trimmed)) {
      type = "todo";
      checked = false;
      text = trimmed.replace(/^[-*+•]\s*\[\s*\]\s+/, "");
    } else if (/^[-*+•]\s*\[[xX]\]\s+/.test(trimmed)) {
      type = "todo";
      checked = true;
      text = trimmed.replace(/^[-*+•]\s*\[[xX]\]\s+/, "");
    } else if (/^[-*+•]\s+/.test(trimmed)) {
      type = "bullet";
      text = trimmed.replace(/^[-*+•]\s+/, "");
    } else if (/^\d+[\.\)]\s+/.test(trimmed)) {
      type = "numbered";
      text = trimmed.replace(/^\d+[\.\)]\s+/, "");
    } else if (/^>\s*\[![A-Z]+\]\s*/i.test(trimmed) || /^>\s*💡\s*/.test(trimmed) || /^💡\s*/.test(trimmed)) {
      type = "callout";
      if (/NOTE|IMPORTANT/i.test(trimmed)) calloutIcon = "📌";
      else if (/WARNING/i.test(trimmed)) calloutIcon = "⚠️";
      else if (/TIP/i.test(trimmed)) calloutIcon = "💡";
      text = trimmed.replace(/^(>\s*\[![A-Z]+\]\s*|>\s*💡\s*|💡\s*)/i, "");
    } else if (/^>\s+/.test(trimmed)) {
      type = "quote";
      text = trimmed.replace(/^>\s+/, "");
    } else if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      type = "divider";
      text = "";
    }
  }

  return {
    id: block.id,
    type,
    text,
    checked,
    calloutIcon,
    toggleChildren: (block.properties as { toggleChildren?: string })?.toggleChildren ?? "",
    tableData: (block.properties as { tableData?: string[][] })?.tableData,
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
  // Track whether we've ever loaded content so we can avoid flashing a spinner
  // when navigating between pages (show stale content until new data arrives).
  const hasLoadedOnce = useRef(false);

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

    getPage(
      pageId,
      false,
      // Called when IndexedDB had stale data and background revalidation fetched fresh data.
      // Only update the page if the user hasn't already started editing (no dirty state).
      (fresh) => {
        if (!cancelled) {
          setPage(fresh);
          hasLoadedOnce.current = true;
        }
      }
    )
      .then((p) => { if (!cancelled) { setPage(p); setNotFound(false); hasLoadedOnce.current = true; } })
      .catch(() => { if (!cancelled) { setPage(null); setNotFound(true); } });

    fetchChildPages();

    const handleRefresh = () => {
      fetchChildPages();
    };

    window.addEventListener("page-created", handleRefresh);
    window.addEventListener("page-deleted", handleRefresh);

    // Subscribe to local store for cross-tab updates ONLY.
    // We MUST NOT react to same-tab `page_updated` events (fromSameTab: true)
    // because those are fired by the editor's own autosave and the AI insert logic.
    // Reacting to them would cause: AI inserts blocks → optimistic write → setPage()
    // → initialBlocks recomputes → editor re-renders with stale DB data → inserted
    // blocks disappear visually.
    const unsubscribe = localStore.subscribe((evt) => {
      if (evt.pageId === pageId && evt.data && !cancelled && !evt.fromSameTab) {
        setPage(evt.data as Page);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("page-created", handleRefresh);
      window.removeEventListener("page-deleted", handleRefresh);
    };
  }, [pageId, fetchChildPages]);

  const initialBlocks = useMemo(
    () => (page?.blocks ? page.blocks.map(toChecklistItem) : []),
    [page]
  );

  // Tracks how many times fresh server data has replaced stale local data.
  // Used as part of the Editor key so it remounts when real blocks arrive
  // after the page initially rendered with a stale empty cache hit.
  const [dataVersion, setDataVersion] = useState(0);
  const prevBlocksWereEmptyRef = useRef(false);

  useEffect(() => {
    const isEmpty =
      initialBlocks.length === 0 ||
      (initialBlocks.length === 1 && !initialBlocks[0].text?.trim());

    if (isEmpty) {
      prevBlocksWereEmptyRef.current = true;
    } else if (prevBlocksWereEmptyRef.current) {
      prevBlocksWereEmptyRef.current = false;
      setDataVersion((v) => v + 1);
    }
  }, [initialBlocks]);

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
      key={`${pageId}-v${dataVersion}`}
      activeTitle={page.title}
      pageId={pageId}
      initialBlocks={initialBlocks}
      initialCoverImage={page.coverImage}
      initialIcon={page.icon || "📄"}
      isAiMeetingNote={Boolean(page.isAiMeetingNote)}
      childPages={childPages}
      onSelectSubPage={handleSelectSubPage}
    />
  );
}
