"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { MeetingNoteView } from "./MeetingNoteView";
import { PageCoverBanner } from "./PageCoverBanner";
import { RemoteCursorOverlay } from "./RemoteCursorOverlay";
import { BlockItem } from "./BlockItem";
import {
  SlashCommandMenu,
  SLASH_ITEMS,
  getDefaultText,
  type SlashMenuItem,
} from "./SlashCommandMenu";
import { EditorHeader } from "./EditorHeader";
import { useAutosave } from "@/hooks/use-autosave";
import { useCollaboration } from "@/hooks/use-collaboration";
import { useWorkspaceStore } from "@/store/workspace-store";
import { updatePage, deletePage, type Page } from "@/lib/actions/pages";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ChecklistItem, BlockType, KanbanColumn } from "@/hooks/use-pages";
import { parseMarkdownToBlocks } from "@/lib/markdown-blocks";
import {
  Plus,
  FileText,
  ChevronRight,
  Trash2,
} from "lucide-react";

export interface EditorProps {
  activeTitle: string;
  pageId?: string;
  initialBlocks?: ChecklistItem[];
  initialCoverImage?: string;
  initialIcon?: string;
  isAiMeetingNote?: boolean;
  childPages?: Page[];
  onSelectSubPage: (blockId: string, subPageId?: string, title?: string) => void;
}

function makeBlock(type: BlockType = "paragraph", text = ""): ChecklistItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    text,
    checked: false,
  };
}

// ── Main Editor ───────────────────────────────────────────────────────────────
export function Editor({ activeTitle, pageId, initialBlocks, initialCoverImage, initialIcon, isAiMeetingNote, childPages, onSelectSubPage }: EditorProps) {
  const router = useRouter();
  const [pageEmoji, setPageEmoji] = useState(initialIcon || "📄");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(activeTitle);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(initialCoverImage);
  const [items, setItems] = useState<ChecklistItem[]>(() =>
    initialBlocks && initialBlocks.length > 0 ? initialBlocks : [makeBlock("paragraph")]
  );
  const itemsRef = useRef<ChecklistItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle" | "error">("idle");

  const { collaborators, remoteCursors, broadcastBlockFocus } = useCollaboration({ pageId });

  // Sync real-time collaborators to the central workspace store for LivePresenceBar
  const setStoreCollaborators = useWorkspaceStore((s) => s.setCollaborators);
  useEffect(() => {
    setStoreCollaborators(collaborators);
  }, [collaborators, setStoreCollaborators]);

  const { scheduleAutosave, immediatelySave, cancelAutosave, retryAutosave, markDirty } = useAutosave({
    pageId,
    onStatusChange: setSaveStatus,
  });

  useEffect(() => {
    if (initialIcon) setPageEmoji(initialIcon);
  }, [initialIcon]);

  const handleEmojiChange = useCallback(
    async (newEmoji: string) => {
      setPageEmoji(newEmoji);
      setShowEmojiPicker(false);
      if (!pageId) return;
      try {
        await updatePage(pageId, { icon: newEmoji });
        window.dispatchEvent(
          new CustomEvent("page-updated", { detail: { icon: newEmoji, updatedAt: new Date() } })
        );
      } catch (err) {
        console.error("Failed to update page icon:", err);
      }
    },
    [pageId]
  );

  // Slash command menu
  const [slash, setSlash] = useState<{ blockId: string; query: string; open: boolean }>({ blockId: "", query: "", open: false });
  const [slashIdx, setSlashIdx] = useState(0);

  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const titleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasMounted = useRef(false);
  // Keep a ref in sync with currentTitle so event handlers always see the latest value
  const currentTitleRef = useRef(activeTitle);
  useEffect(() => { currentTitleRef.current = currentTitle; }, [currentTitle]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setCurrentTitle(newTitle);
    markDirty();
    if (!pageId) return;

    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      const finalTitle = newTitle.trim() || "Untitled";
      try {
        await updatePage(pageId, { title: finalTitle });
        window.dispatchEvent(
          new CustomEvent("page-updated", { detail: { title: finalTitle, updatedAt: new Date() } })
        );
      } catch (err) {
        console.error("Title save error:", err);
      }
    }, 300);
  }, [pageId]);

  const handleTitleBlur = useCallback(async () => {
    if (!pageId) return;
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    cancelAutosave();
    const title = currentTitle.trim() || "Untitled";
    try {
      immediatelySave(title, items);
      window.dispatchEvent(
        new CustomEvent("page-updated", { detail: { title, updatedAt: new Date() } })
      );
    } catch (error) {
      console.error("Title save failed:", error);
    }
  }, [pageId, cancelAutosave, currentTitle, immediatelySave, items]);

  // Helper to extract clean plain-text representation of all blocks in the editor
  const getPagePlainText = useCallback(() => {
    const lines: string[] = [];
    if (currentTitle && currentTitle.trim()) {
      lines.push(`# ${currentTitle.trim()}`);
    }
    for (const item of items) {
      if (!item) continue;
      if (item.type === "heading1") {
        if (item.text?.trim()) lines.push(`\n# ${item.text.trim()}`);
      } else if (item.type === "heading2") {
        if (item.text?.trim()) lines.push(`\n## ${item.text.trim()}`);
      } else if (item.type === "heading3" || item.type === "heading4" || item.type === "heading") {
        if (item.text?.trim()) lines.push(`\n### ${item.text.trim()}`);
      } else if (item.type === "bullet") {
        if (item.text?.trim()) lines.push(`• ${item.text.trim()}`);
      } else if (item.type === "numbered") {
        if (item.text?.trim()) lines.push(`- ${item.text.trim()}`);
      } else if (item.type === "todo") {
        if (item.text?.trim()) lines.push(`[${item.checked ? "x" : " "}] ${item.text.trim()}`);
      } else if (item.type === "quote") {
        if (item.text?.trim()) lines.push(`> ${item.text.trim()}`);
      } else if (item.type === "callout") {
        if (item.text?.trim()) lines.push(`💡 ${item.text.trim()}`);
      } else if (item.type === "toggle") {
        if (item.text?.trim()) lines.push(`▶ ${item.text.trim()}${item.toggleChildren ? `\n  ${item.toggleChildren}` : ""}`);
      } else if (item.type === "code") {
        if (item.text?.trim()) lines.push(`\`\`\`${item.codeLanguage || ""}\n${item.text.trim()}\n\`\`\``);
      } else if (item.type === "table" && item.tableData && item.tableData.length > 0) {
        const tableStr = item.tableData.map(row => row.join(" | ")).join("\n");
        if (tableStr.trim()) lines.push(`\n[Table]\n${tableStr}`);
      } else if (item.type === "page" || item.type === "link_to_page") {
        if (item.text?.trim()) lines.push(`📄 Sub-page: ${item.text.trim()}`);
      } else {
        if (item.text?.trim()) lines.push(item.text.trim());
      }
    }
    return lines.join("\n").trim();
  }, [currentTitle, items]);

  // Debounced active page context generation — avoids document-wide string loops on every keystroke
  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      (window as any).__ACTIVE_PAGE_CONTEXT__ = {
        pageId: pageId || "workspace-home",
        title: currentTitle || "Untitled",
        content: getPagePlainText(),
        updatedAt: Date.now(),
      };
    }, 1000);
    return () => clearTimeout(timer);
  }, [pageId, currentTitle, items, getPagePlainText]);

  useEffect(() => {
    const handleAiAppend = (e: Event) => {
      const detail = (e as CustomEvent<{ text: string; type?: BlockType; language?: string }>).detail;
      if (detail && detail.text) {
        let newBlocks: ChecklistItem[] = [];

        if (detail.type === "code") {
          const codeBlock = makeBlock("code", detail.text);
          if (detail.language) codeBlock.codeLanguage = detail.language;
          newBlocks = [codeBlock];
        } else if (detail.type === "kanban") {
          newBlocks = [makeBlock("kanban", detail.text)];
        } else if (detail.type === "table") {
          newBlocks = [makeBlock("table", detail.text)];
        } else {
          // Parse rich markdown (headings, bullets, numbered lists, todos, code, quotes, paragraphs)
          newBlocks = parseMarkdownToBlocks(detail.text, detail.type, detail.language);
        }

        if (newBlocks.length === 0) {
          newBlocks = [makeBlock(detail.type || "paragraph", detail.text)];
        }

        const currentItems = itemsRef.current;
        const isInitialEmpty =
          currentItems.length === 1 &&
          (!currentItems[0].text || !currentItems[0].text.trim()) &&
          (currentItems[0].type === "paragraph" || !currentItems[0].type);
        const nextItems = isInitialEmpty ? newBlocks : [...currentItems, ...newBlocks];

        setItems(nextItems);
        itemsRef.current = nextItems;

        markDirty();
        const activeTitleToSave = currentTitleRef.current || "Untitled";
        immediatelySave(activeTitleToSave, nextItems);
      }
    };
    window.addEventListener("ai-append-block", handleAiAppend);
    return () => window.removeEventListener("ai-append-block", handleAiAppend);
  }, [immediatelySave, markDirty]);

  const handleCoverChange = useCallback(
    async (newCoverUrl?: string) => {
      setCoverUrl(newCoverUrl);
      if (!pageId) return;
      try {
        await updatePage(pageId, { coverImage: newCoverUrl || "" });
      } catch (err) {
        console.error("Failed to update cover image:", err);
      }
    },
    [pageId]
  );

  // Active block focus clears on unmount or blur
  useEffect(() => {
    return () => {
      broadcastBlockFocus(undefined);
    };
  }, [broadcastBlockFocus]);

  // Sync when navigating to a new page — only fires on pageId change.
  // activeTitle, initialBlocks, initialCoverImage are intentionally omitted:
  // they are *seed* values that should only apply on navigation, not on every
  // autosave cycle (which would reset the entire editor and cause a blink).
  useEffect(() => {
    setCurrentTitle(activeTitle);
    setCoverUrl(initialCoverImage);
    setItems(initialBlocks && initialBlocks.length > 0 ? initialBlocks : [makeBlock("paragraph")]);
    setShowEmojiPicker(false);
    setSlash({ blockId: "", query: "", open: false });
    setFocusedId(null);
    hasMounted.current = false;
  }, [pageId]);

  // Auto-resize title textarea
  useEffect(() => {
    const ta = titleRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [currentTitle]);

  // Autosave
  useEffect(() => {
    if (!hasMounted.current) { hasMounted.current = true; return; }
    scheduleAutosave(currentTitle, items);
    return cancelAutosave;
  }, [currentTitle, items, scheduleAutosave, cancelAutosave]);

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) blockRefs.current.set(id, el);
    else blockRefs.current.delete(id);
  }, []);

  const focusBlock = useCallback((id: string, atEnd = false) => {
    setFocusedId(id);
    broadcastBlockFocus(id);
    requestAnimationFrame(() => {
      const el = blockRefs.current.get(id);
      if (!el) return;
      el.focus();
      if (atEnd) {
        const r = document.createRange();
        r.selectNodeContents(el);
        r.collapse(false);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      }
    });
  }, [broadcastBlockFocus]);

  const updateText = useCallback((id: string, text: string) => {
    markDirty();
    setItems((prev) => {
      const block = prev.find((b) => b.id === id);
      if (!block) return prev;

      // Handle sub-page title sync
      if ((block.type === "page" || block.type === "link_to_page") && block.subPageId) {
        updatePage(block.subPageId, { title: text.trim() || "Untitled" })
          .then((updated) => {
            window.dispatchEvent(new CustomEvent("page-updated", { detail: updated }));
          })
          .catch(() => {});
      }

      // Auto-formatting markdown shortcuts when typing in a paragraph block
      if (block.type === "paragraph" || !block.type) {
        // Heading 1 (# )
        if (text === "# " || text.startsWith("# ")) {
          return prev.map((b) =>
            b.id === id ? { ...b, type: "heading1", text: text.replace(/^#\s*/, "") } : b
          );
        }
        // Heading 2 (## )
        if (text === "## " || text.startsWith("## ")) {
          return prev.map((b) =>
            b.id === id ? { ...b, type: "heading2", text: text.replace(/^##\s*/, "") } : b
          );
        }
        // Heading 3 (### )
        if (text === "### " || text.startsWith("### ")) {
          return prev.map((b) =>
            b.id === id ? { ...b, type: "heading3", text: text.replace(/^###\s*/, "") } : b
          );
        }
        // Bullet (- , * , + )
        if (text === "- " || text === "* " || text === "+ " || text.startsWith("- ") || text.startsWith("* ") || text.startsWith("+ ")) {
          return prev.map((b) =>
            b.id === id ? { ...b, type: "bullet", text: text.replace(/^[-*+]\s*/, "") } : b
          );
        }
        // Numbered (1. )
        if (/^\d+[\.\)]\s+/.test(text)) {
          return prev.map((b) =>
            b.id === id ? { ...b, type: "numbered", text: text.replace(/^\d+[\.\)]\s*/, "") } : b
          );
        }
        // To-do ([] or [ ])
        if (text === "[] " || text === "[ ] " || text.startsWith("[] ") || text.startsWith("[ ] ")) {
          return prev.map((b) =>
            b.id === id ? { ...b, type: "todo", text: text.replace(/^\[ ?\]\s*/, ""), checked: false } : b
          );
        }
        // Quote (> )
        if (text === "> " || text.startsWith("> ")) {
          return prev.map((b) =>
            b.id === id ? { ...b, type: "quote", text: text.replace(/^>\s*/, "") } : b
          );
        }
        // Divider (--- or ***)
        if (text === "---" || text === "***") {
          const nextBlock = makeBlock("paragraph", "");
          const idx = prev.findIndex((b) => b.id === id);
          const next = [...prev];
          next.splice(idx, 1, { ...block, type: "divider", text: "" }, nextBlock);
          setTimeout(() => focusBlock(nextBlock.id), 50);
          return next;
        }
        // Code (```)
        if (text === "```") {
          return prev.map((b) =>
            b.id === id ? { ...b, type: "code", text: "", codeLanguage: "javascript" } : b
          );
        }
      }

      return prev.map((b) => (b.id === id ? { ...b, text } : b));
    });
  }, [focusBlock]);

  const handlePaste = useCallback((e: React.ClipboardEvent, id: string) => {
    const text = e.clipboardData.getData("text/plain");
    if (!text) return;

    // Check if the pasted text has multiple lines or markdown structures
    const hasMultipleLines = text.includes("\n");
    const hasMarkdown = /^#+\s+|^\s*[-*+•]\s+|^\s*\d+[\.\)]\s+|^\s*```|^\s*>\s+|^\s*\[[ xX]\]/m.test(text);

    if (hasMultipleLines || hasMarkdown) {
      e.preventDefault();
      const parsedBlocks = parseMarkdownToBlocks(text);
      if (parsedBlocks.length === 0) return;

      setItems((prev) => {
        const idx = prev.findIndex((b) => b.id === id);
        if (idx < 0) return [...prev, ...parsedBlocks];

        const currentBlock = prev[idx];
        const next = [...prev];

        // If the current block is an empty paragraph, replace it
        if ((currentBlock.type === "paragraph" || !currentBlock.type) && !currentBlock.text.trim()) {
          next.splice(idx, 1, ...parsedBlocks);
        } else {
          next.splice(idx + 1, 0, ...parsedBlocks);
        }

        const activeTitleToSave = currentTitleRef.current || "Untitled";
        immediatelySave(activeTitleToSave, next);
        return next;
      });

      const lastParsed = parsedBlocks[parsedBlocks.length - 1];
      if (lastParsed) {
        setTimeout(() => focusBlock(lastParsed.id, true), 50);
      }
    }
  }, [immediatelySave, focusBlock]);

  const updateLanguage = useCallback((id: string, codeLanguage: string) => {
    setItems(prev => prev.map(b => b.id === id ? { ...b, codeLanguage } : b));
  }, []);

  const toggleCheck = useCallback((id: string) => {
    setItems(prev => prev.map(b => b.id === id ? { ...b, checked: !b.checked } : b));
  }, []);

  const updateCalloutIcon = useCallback((id: string, calloutIcon: string) => {
    setItems(prev => prev.map(b => b.id === id ? { ...b, calloutIcon } : b));
  }, []);

  const updateToggleChildren = useCallback((id: string, toggleChildren: string) => {
    setItems(prev => prev.map(b => b.id === id ? { ...b, toggleChildren } : b));
  }, []);

  const updateTableData = useCallback((id: string, tableData: string[][]) => {
    setItems(prev => prev.map(b => b.id === id ? { ...b, tableData } : b));
  }, []);

  const updateKanbanColumns = useCallback((id: string, kanbanColumns: KanbanColumn[]) => {
    setItems(prev => prev.map(b => b.id === id ? { ...b, kanbanColumns } : b));
  }, []);

  const updateFile = useCallback((id: string, url: string, fileName: string, fileSize?: string) => {
    setItems(prev => prev.map(b => b.id === id ? { ...b, url, fileName, fileSize } : b));
  }, []);

  const updateUrl = useCallback((id: string, url: string) => {
    setItems(prev => prev.map(b => b.id === id ? { ...b, url } : b));
  }, []);

  const handleAddAfter = useCallback((id: string) => {
    const newBlock = makeBlock("paragraph");
    setItems((p) => {
      const idx = p.findIndex((b) => b.id === id);
      const next = [...p];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    setTimeout(() => focusBlock(newBlock.id), 0);
  }, [focusBlock]);

  const handleDeleteBlock = useCallback((id: string) => {
    setItems((p) => {
      if (p.length > 1) {
        const idx = p.findIndex((b) => b.id === id);
        const prev = p[idx - 1] ?? p[idx + 1];
        if (prev) setTimeout(() => focusBlock(prev.id, true), 0);
        return p.filter((b) => b.id !== id);
      } else {
        return [makeBlock("paragraph")];
      }
    });
  }, [focusBlock]);

  const handleDeleteSubPage = useCallback(async (subPageId: string) => {
    try {
      await deletePage(subPageId);
      toast.success("Sub-page deleted");
      setItems((prev) => prev.filter((b) => b.subPageId !== subPageId));
      window.dispatchEvent(new CustomEvent("page-deleted", { detail: { pageId: subPageId } }));
    } catch (err) {
      console.error("Failed to delete sub-page:", err);
      toast.error("Failed to delete sub-page");
    }
  }, []);

  // Precomputed O(N) sequence number map for numbered lists
  const seqNumbers = useMemo(() => {
    const map = new Map<string, number>();
    let currentCount = 0;
    for (const b of items) {
      if (b.type === "numbered") {
        currentCount++;
        map.set(b.id, currentCount);
      } else {
        currentCount = 0;
      }
    }
    return map;
  }, [items]);

  const slashFiltered = slash.query
    ? SLASH_ITEMS.filter((s) => {
        const q = slash.query.toLowerCase().trim();
        return (
          s.label.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q) ||
          (s.aliases && s.aliases.some((a) => a.toLowerCase().includes(q)))
        );
      })
    : SLASH_ITEMS;

  const applySlash = useCallback((itemOrType: BlockType | SlashMenuItem) => {
    const targetItem: SlashMenuItem | undefined =
      typeof itemOrType === "object"
        ? itemOrType
        : SLASH_ITEMS.find((s) => s.type === itemOrType);
    const type = typeof itemOrType === "string" ? itemOrType : itemOrType.type;
    const bid = slash.blockId;
    setSlash({ blockId: "", query: "", open: false });

    if (targetItem?.action === "ai_summary") {
      setItems((prev) => prev.map((b) => (b.id === bid ? { ...b, text: "" } : b)));
      window.dispatchEvent(new CustomEvent("open-ai-summary"));
      window.dispatchEvent(
        new CustomEvent("trigger-ai-command", { detail: { prompt: "/summary" } })
      );
      return;
    }

    setItems(prev => {
      const idx = prev.findIndex(b => b.id === bid);
      if (idx < 0) return prev;
      const next = [...prev];
      if (type === "divider") {
        next.splice(idx, 1, { ...prev[idx], type: "divider", text: "" }, makeBlock("paragraph"));
      } else {
        next[idx] = { ...prev[idx], type, text: getDefaultText(type) };
      }
      return next;
    });

    if (type === "page" || type === "link_to_page") {
      setTimeout(() => {
        onSelectSubPage(bid, undefined, "Untitled");
      }, 100);
    } else {
      setTimeout(() => focusBlock(bid, true), 0);
    }
  }, [slash.blockId, focusBlock, onSelectSubPage]);

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    const el = blockRefs.current.get(id);
    const text = el?.innerText ?? "";
    const itemsSnap = items; // closure
    const idx = itemsSnap.findIndex(b => b.id === id);

    // Slash menu controls
    if (slash.open && slash.blockId === id) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSlashIdx(i => Math.min(i + 1, slashFiltered.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setSlashIdx(i => Math.max(i - 1, 0)); return; }
      if (e.key === "Enter") {
        e.preventDefault();
        const selected = slashFiltered[slashIdx] || slashFiltered[0];
        if (selected) applySlash(selected);
        return;
      }
      if (e.key === "Escape") { e.preventDefault(); setSlash({ blockId: "", query: "", open: false }); return; }
    }

    // Open slash menu on "/"
    if (e.key === "/" && text.trim() === "") {
      setTimeout(() => {
        if ((el?.innerText ?? "").startsWith("/")) {
          setSlash({ blockId: id, query: "", open: true });
          setSlashIdx(0);
        }
      }, 0);
      return;
    }

    // Update slash query while typing
    if (slash.open && slash.blockId === id) {
      setTimeout(() => {
        const t = el?.innerText ?? "";
        if (t.startsWith("/")) {
          setSlash(s => ({ ...s, query: t.slice(1) }));
          setSlashIdx(0);
        } else {
          setSlash({ blockId: "", query: "", open: false });
        }
      }, 0);
    }

    // Enter → split block (code blocks handle Enter internally via CodeBlock component)
    if (e.key === "Enter" && !e.shiftKey) {
      const curType = itemsSnap[idx]?.type;

      // Code blocks: let the CodeBlock component handle Enter (insert newline)
      if (curType === "code") return;

      // Page / Link to Page blocks: insert a new empty paragraph directly below
      if (curType === "page" || curType === "link_to_page") {
        e.preventDefault();
        const nb = makeBlock("paragraph", "");
        setItems((prev) => {
          const next = [...prev];
          next.splice(idx + 1, 0, nb);
          return next;
        });
        setTimeout(() => focusBlock(nb.id), 0);
        return;
      }

      e.preventDefault();
      const sel = window.getSelection();
      let before = text;
      let after = "";
      if (sel && el && sel.rangeCount > 0) {
        try {
          const range = sel.getRangeAt(0);
          const bRange = document.createRange();
          bRange.setStart(el, 0);
          bRange.setEnd(range.startContainer, range.startOffset);
          before = bRange.toString();
          const aRange = document.createRange();
          aRange.setStart(range.endContainer, range.endOffset);
          if (el.childNodes.length > 0) aRange.setEnd(el, el.childNodes.length);
          after = aRange.toString();
        } catch { /* ignore */ }
      }

      // Empty bullet/numbered/todo → convert to paragraph (like Notion)
      if ((curType === "bullet" || curType === "numbered" || curType === "todo") && text.trim() === "") {
        setItems(prev => prev.map(b => b.id === id ? { ...b, type: "paragraph", text: "" } : b));
        setTimeout(() => focusBlock(id), 0);
        return;
      }

      const newType: BlockType = curType === "bullet" || curType === "numbered" || curType === "todo" ? curType : "paragraph";
      const nb = makeBlock(newType, after);
      setItems(prev => {
        const next = [...prev];
        next[idx] = { ...next[idx], text: before };
        next.splice(idx + 1, 0, nb);
        return next;
      });
      setTimeout(() => focusBlock(nb.id), 0);
      return;
    }

    // Backspace / Delete → handle multi-block selection or empty block deletion
    if (e.key === "Backspace" || e.key === "Delete") {
      const sel = window.getSelection();
      // If user selected text across multiple blocks or the entire page
      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const editorContainer = document.getElementById("editor-page-container");

        // Check if selection covers multiple blocks or elements
        const isMultiBlockSelection =
          !el ||
          !range.commonAncestorContainer ||
          (range.commonAncestorContainer !== el && !el.contains(range.commonAncestorContainer));

        if (isMultiBlockSelection) {
          e.preventDefault();

          const allBlockElements = editorContainer
            ? Array.from(editorContainer.querySelectorAll("[data-block-id]"))
            : [];

          // Find which blocks are included in the selection
          let selectedBlockElements = allBlockElements.filter((blockEl) => {
            try {
              return sel.containsNode(blockEl, true) || range.intersectsNode(blockEl);
            } catch {
              return true;
            }
          });

          // Fallback if container selection returned 0 via containsNode/intersectsNode
          if (selectedBlockElements.length === 0 && allBlockElements.length > 0) {
            selectedBlockElements = allBlockElements;
          }

          const selectedIds = new Set(
            selectedBlockElements.map((bEl) => bEl.getAttribute("data-block-id")).filter(Boolean)
          );

          if (selectedIds.size > 0) {
            setItems((prev) => {
              const remaining = prev.filter((b) => !selectedIds.has(b.id));
              if (remaining.length === 0) {
                const fresh = makeBlock("paragraph", "");
                setTimeout(() => focusBlock(fresh.id), 0);
                return [fresh];
              }
              setTimeout(() => focusBlock(remaining[0].id), 0);
              return remaining;
            });
            sel.removeAllRanges();
            return;
          }
        }
      }

      // Backspace at the beginning merges with the previous block; Delete at
      // the end merges with the next block. This makes long notes feel like
      // one continuous document instead of a collection of isolated inputs.
      const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
      const atStart = !!(range && el && range.collapsed && (() => {
        const start = range.cloneRange();
        start.selectNodeContents(el);
        start.setEnd(range.startContainer, range.startOffset);
        return start.toString() === "";
      })());
      const atEnd = !!(range && el && range.collapsed && (() => {
        const end = range.cloneRange();
        end.selectNodeContents(el);
        end.setStart(range.endContainer, range.endOffset);
        return end.toString() === "";
      })());

      if (e.key === "Backspace" && atStart && idx > 0) {
        e.preventDefault();
        const previous = itemsSnap[idx - 1];
        setItems((prev) => prev.filter((b) => b.id !== id).map((b) =>
          b.id === previous.id ? { ...b, text: b.text + text } : b
        ));
        setTimeout(() => focusBlock(previous.id, true), 0);
        return;
      }
      if (e.key === "Delete" && atEnd && idx < itemsSnap.length - 1) {
        e.preventDefault();
        const next = itemsSnap[idx + 1];
        setItems((prev) => prev.filter((b) => b.id !== next.id).map((b) =>
          b.id === id ? { ...b, text: text + next.text } : b
        ));
        setTimeout(() => focusBlock(id), 0);
        return;
      }

      // Single block backspace on empty → delete block & move focus
      if (text === "" && itemsSnap.length > 1) {
        e.preventDefault();
        const prev = itemsSnap[idx - 1] ?? itemsSnap[idx + 1];
        setItems((p) => p.filter((b) => b.id !== id));
        if (prev) setTimeout(() => focusBlock(prev.id, true), 0);
        return;
      }
    }

    // Ctrl+A / Cmd+A → Select block text first, then all blocks on second press
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
      const sel = window.getSelection();
      const editorContainer = document.getElementById("editor-page-container");

      if (sel && el && editorContainer) {
        const textLen = (el.innerText || "").length;
        const selectedLen = sel.toString().length;

        // If current block text is already selected (or empty), select entire page container
        if (textLen === 0 || selectedLen >= textLen) {
          e.preventDefault();
          const range = document.createRange();
          range.selectNodeContents(editorContainer);
          sel.removeAllRanges();
          sel.addRange(range);
          return;
        }
      }
    }

    // Arrow up/down between blocks
    if (e.key === "ArrowUp" && idx > 0) {
      const sel = window.getSelection();
      if (sel && sel.anchorOffset === 0) {
        e.preventDefault();
        focusBlock(itemsSnap[idx - 1].id, true);
      }
    }
    if (e.key === "ArrowDown" && idx < itemsSnap.length - 1) {
      const sel = window.getSelection();
      const atEnd = sel && sel.anchorOffset === (sel.anchorNode?.textContent?.length ?? 0);
      if (atEnd) {
        e.preventDefault();
        focusBlock(itemsSnap[idx + 1].id);
      }
    }
  }, [items, slash, slashFiltered, slashIdx, applySlash, focusBlock]);

  if (isAiMeetingNote || activeTitle === "AI Meeting Note") {
    return (
      <MeetingNoteView
        currentTitle={currentTitle}
        pageId={pageId}
        initialBlocks={initialBlocks}
        onTitleChange={handleTitleChange}
      />
    );
  }


  return (
    <div
      className="flex-1 bg-background text-foreground overflow-y-auto relative font-sans"
      onClick={e => {
        setShowEmojiPicker(false);
        const target = e.target as HTMLElement;
        // Don't intercept clicks on any block, form element, or button
        if (
          target.closest("[data-block-id]") ||
          target.closest("textarea") ||
          target.closest("input") ||
          target.closest("button") ||
          target.closest("select")
        ) return;

        // Click in the blank area below all content → add a new paragraph at end
        const last = items[items.length - 1];
        if (!last) return;

        // If last block has text, add a new empty block below it
        if (last.text && last.type !== "divider") {
          const newBlock = makeBlock("paragraph");
          setItems(prev => [...prev, newBlock]);
          setTimeout(() => focusBlock(newBlock.id), 0);
        } else {
          // Just focus the last empty block
          focusBlock(last.id, false);
        }
      }}
    >
      {/* Save indicator */}
      {saveStatus === "error" && (
        <button type="button" onClick={retryAutosave} className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 rounded-full border border-red-500/20 bg-background px-3 py-1.5 text-xs font-medium text-red-500 shadow-lg hover:bg-red-500/10">
          Save failed — retry now
        </button>
      )}

      {/* Remote Multi-Cursor Overlay */}
      <RemoteCursorOverlay cursors={remoteCursors} />

      {/* Full-width Page Cover Banner */}
      <PageCoverBanner url={coverUrl} onUpdateCover={handleCoverChange} />

      <div id="editor-page-container" className="mx-auto max-w-[880px] px-5 pb-60 pt-8 select-text sm:px-10 sm:pt-12 lg:px-16">
        {/* Editor Header: Cover, Icon, Title */}
        <EditorHeader
          pageEmoji={pageEmoji}
          showEmojiPicker={showEmojiPicker}
          coverUrl={coverUrl}
          currentTitle={currentTitle}
          titleRef={titleRef}
          onEmojiClick={(e) => {
            e.stopPropagation();
            setShowEmojiPicker(!showEmojiPicker);
          }}
          onEmojiSelect={handleEmojiChange}
          onEmojiClose={() => setShowEmojiPicker(false)}
          onAddCover={() =>
            handleCoverChange(
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop"
            )
          }
          onAddSubPage={() => {
            const newBlock = makeBlock("page", "Untitled");
            setItems((prev) => [...prev, newBlock]);
            setTimeout(() => onSelectSubPage(newBlock.id, undefined, "Untitled"), 50);
          }}
          onTitleChange={handleTitleChange}
          onTitleBlur={handleTitleBlur}
          onTitleKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (items[0]) focusBlock(items[0].id);
            }
          }}
          saveStatus={saveStatus}
          blockCount={items.filter((item) => item.text.trim() || item.type !== "paragraph").length}
        />

        {/* Blocks */}
        <div className="space-y-px">
          {items.map((item) => {
            const seqNumber = item.type === "numbered" ? (seqNumbers.get(item.id) ?? 1) : 1;

            return (
              <div key={item.id} className="relative">
                <BlockItem
                  item={item}
                  seqNumber={seqNumber}
                  isFocused={focusedId === item.id}
                  onFocus={setFocusedId}
                  onUpdateText={updateText}
                  onUpdateLanguage={updateLanguage}
                  onUpdateCalloutIcon={updateCalloutIcon}
                  onUpdateToggleChildren={updateToggleChildren}
                  onUpdateTableData={updateTableData}
                  onUpdateKanbanColumns={updateKanbanColumns}
                  onUpdateFile={updateFile}
                  onUpdateUrl={updateUrl}
                  onToggleCheck={toggleCheck}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  onAddAfter={handleAddAfter}
                  onDelete={handleDeleteBlock}
                  onDeleteSubPage={handleDeleteSubPage}
                  onSelectSubPage={onSelectSubPage}
                  registerRef={registerRef}
                />

                {/* Slash menu attached to this block */}
                {slash.open && slash.blockId === item.id && (
                  <SlashCommandMenu
                    filteredItems={slashFiltered}
                    selectedIndex={slashIdx}
                    onSelect={applySlash}
                  />
                )}
              </div>
            );
          })}

          {/* Empty state hint */}
          {items.length === 1 && !items[0].text && focusedId !== items[0].id && (
            <p
              className="cursor-text select-none rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-muted/40"
              onClick={() => focusBlock(items[0].id)}
            >
              Press <kbd className="font-mono text-[11px] border border-foreground/10 rounded px-1 py-0.5">/</kbd> for commands…
            </p>
          )}

          {/* Sub-pages / Child pages shelf */}
          {(() => {
            const unlinkedChildPages = (childPages || []).filter(
              (child) => !items.some((item) => item.subPageId === child._id)
            );
            if (unlinkedChildPages.length === 0) return null;
            return (
              <div className="mt-10 pt-6 border-t border-foreground/10 space-y-3 select-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>Nested Subpages ({unlinkedChildPages.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newBlock = makeBlock("page", "Untitled");
                      setItems((prev) => [...prev, newBlock]);
                      setTimeout(() => onSelectSubPage(newBlock.id, undefined, "Untitled"), 50);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>New subpage</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {unlinkedChildPages.map((child) => (
                    <div
                      key={child._id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.05] hover:border-foreground/20 transition-all cursor-pointer group shadow-2xs"
                      onClick={() => router.push(`/dashboard/${child._id}`)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-base shrink-0">{child.icon || "📄"}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[13px] text-foreground truncate group-hover:text-primary transition-colors">
                            {child.title || "Untitled"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {child.updatedAt ? `Edited ${new Date(child.updatedAt).toLocaleDateString()}` : "Subpage"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition shrink-0" />
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await deletePage(child._id);
                              toast.success("Sub-page deleted");
                              setItems((prev) => prev.filter((b) => b.subPageId !== child._id));
                              window.dispatchEvent(new CustomEvent("page-deleted", { detail: { pageId: child._id } }));
                            } catch (err) {
                              console.error("Failed to delete sub-page:", err);
                              toast.error("Failed to delete sub-page");
                            }
                          }}
                          title="Delete sub-page"
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 text-foreground/40 hover:text-red-500 transition shrink-0 ml-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Click-to-add area below all blocks — ensures user can always write after page/media blocks */}
          <div
            className="min-h-40 cursor-text py-4"
            onClick={() => {
              const last = items[items.length - 1];
              if (!last || last.text !== "" || last.type !== "paragraph") {
                const newBlock = makeBlock("paragraph");
                setItems((prev) => [...prev, newBlock]);
                setTimeout(() => focusBlock(newBlock.id), 0);
              } else {
                focusBlock(last.id, true);
              }
            }}
          />
        </div>
      </div>

    </div>
  );
}
