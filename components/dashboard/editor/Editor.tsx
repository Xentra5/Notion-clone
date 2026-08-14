"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { MeetingNoteView } from "./MeetingNoteView";
import { EmojiDropdown } from "./EmojiPicker";
import { CodeBlock } from "./CodeBlock";
import { DatabaseBlock } from "./DatabaseBlock";
import { WebBookmarkBlock } from "./WebBookmarkBlock";
import { FileUploadBlock } from "./FileUploadBlock";
import { PageCoverBanner } from "./PageCoverBanner";
import { RemoteCursorOverlay } from "./RemoteCursorOverlay";
import { useAutosave } from "@/hooks/use-autosave";
import { updatePage, deletePage, type Page } from "@/lib/actions/pages";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ChecklistItem, BlockType, KanbanColumn } from "@/hooks/use-pages";
import {
  Check,
  ChevronRight,
  GripVertical,
  Plus,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Video,
  Volume2,
  Paperclip,
  Bookmark,
  Table,
  Link,
  Trash2,
  SquarePen,
} from "lucide-react";

export interface EditorProps {
  activeTitle: string;
  pageId?: string;
  initialBlocks?: ChecklistItem[];
  initialCoverImage?: string;
  childPages?: Page[];
  onSelectSubPage: (blockId: string, subPageId?: string, title?: string) => void;
}

// ── Slash menu items ─────────────────────────────────────────────────────────
const SLASH_ITEMS: {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  category: "Basic" | "Media";
}[] = [
  { type: "paragraph",    label: "Text",          description: "Plain paragraph text",         icon: Type,          iconColor: "text-neutral-400",  category: "Basic" },
  { type: "heading1",     label: "Heading 1",     description: "Large section heading",         icon: Heading1,      iconColor: "text-purple-400",   category: "Basic" },
  { type: "heading2",     label: "Heading 2",     description: "Medium section heading",        icon: Heading2,      iconColor: "text-purple-400",   category: "Basic" },
  { type: "heading3",     label: "Heading 3",     description: "Small section heading",         icon: Heading3,      iconColor: "text-purple-400",   category: "Basic" },
  { type: "bullet",       label: "Bulleted list", description: "Simple bulleted list",          icon: List,          iconColor: "text-amber-400",    category: "Basic" },
  { type: "numbered",     label: "Numbered list", description: "Numbered list",                 icon: ListOrdered,   iconColor: "text-amber-400",    category: "Basic" },
  { type: "todo",         label: "To-do",         description: "Track tasks with a checkbox",   icon: CheckSquare,   iconColor: "text-blue-400",     category: "Basic" },
  { type: "quote",        label: "Quote",         description: "Capture a quote",               icon: Quote,         iconColor: "text-emerald-400",  category: "Basic" },
  { type: "callout",      label: "Callout",       description: "Highlighted callout box",       icon: MessageSquare, iconColor: "text-rose-400",     category: "Basic" },
  { type: "divider",      label: "Divider",       description: "Visual horizontal line",        icon: Minus,         iconColor: "text-neutral-400",  category: "Basic" },
  { type: "toggle",       label: "Toggle",        description: "Collapsible section",           icon: ChevronRight,  iconColor: "text-neutral-400",  category: "Basic" },
  { type: "page",         label: "Page",          description: "Embed a sub-page link",         icon: FileText,      iconColor: "text-neutral-400",  category: "Basic" },
  { type: "code",         label: "Code",          description: "Code snippet with copy",        icon: Code,          iconColor: "text-emerald-400",  category: "Media" },
  { type: "image",        label: "Image",         description: "Upload or embed an image",      icon: ImageIcon,     iconColor: "text-indigo-400",   category: "Media" },
  { type: "video",        label: "Video",         description: "Embed YouTube, Vimeo...",       icon: Video,         iconColor: "text-red-400",      category: "Media" },
  { type: "audio",        label: "Audio",         description: "Audio recording or file",       icon: Volume2,       iconColor: "text-purple-400",   category: "Media" },
  { type: "file",         label: "File",          description: "Upload a file",                 icon: Paperclip,     iconColor: "text-neutral-400",  category: "Media" },
  { type: "web_bookmark", label: "Web bookmark",  description: "Save a visual web link",        icon: Bookmark,      iconColor: "text-orange-400",   category: "Media" },
  { type: "table",        label: "Table",         description: "Simple table",                  icon: Table,         iconColor: "text-cyan-400",     category: "Media" },
  { type: "kanban",       label: "Board view",    description: "Kanban board for task tracking",icon: Table,         iconColor: "text-blue-500",     category: "Media" },
  { type: "link_to_page", label: "Link to page",  description: "Link to an existing page",      icon: Link,          iconColor: "text-blue-400",     category: "Media" },
];

function makeBlock(type: BlockType = "paragraph", text = ""): ChecklistItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    text,
    checked: false,
  };
}

function getDefaultText(type: BlockType): string {
  const m: Partial<Record<BlockType, string>> = {
    // New blocks start empty. Placeholders guide the user without becoming content.
    heading1: "", heading2: "", heading3: "",
    heading4: "", heading: "",
    todo: "", bullet: "", numbered: "",
    quote: "", callout: "", toggle: "",
    code: "", page: "",
    link_to_page: "", image: "", video: "",
    audio: "", file: "", web_bookmark: "",
    paragraph: "",
  };
  return m[type] ?? "";
}

function getPlaceholder(type: BlockType | undefined): string {
  const m: Partial<Record<BlockType, string>> = {
    heading1: "Heading 1", heading2: "Heading 2", heading3: "Heading 3",
    heading4: "Heading 4", heading: "Heading",
    bullet: "List", numbered: "List", todo: "To-do", toggle: "Toggle",
    quote: "Empty quote", callout: "Callout text", code: "// Write code here",
    paragraph: "",
  };
  return m[type as BlockType] ?? "";
}

// ── Single Block ─────────────────────────────────────────────────────────────
interface BlockProps {
  item: ChecklistItem;
  seqNumber?: number;
  isFocused: boolean;
  onFocus: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onUpdateLanguage?: (id: string, language: string) => void;
  onUpdateCalloutIcon?: (id: string, icon: string) => void;
  onUpdateToggleChildren?: (id: string, childrenText: string) => void;
  onUpdateTableData?: (id: string, data: string[][]) => void;
  onUpdateKanbanColumns?: (id: string, columns: KanbanColumn[]) => void;
  onUpdateFile?: (id: string, url: string, fileName: string, fileSize?: string) => void;
  onUpdateUrl?: (id: string, url: string) => void;
  onToggleCheck: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onDelete?: (id: string) => void;
  onDeleteSubPage?: (subPageId: string) => void;
  onAddAfter?: (id: string) => void;
  onSelectSubPage: (blockId: string, subPageId?: string, title?: string) => void;
  registerRef: (id: string, el: HTMLElement | null) => void;
}

function Block({
  item, seqNumber = 1, isFocused, onFocus, onUpdateText, onUpdateLanguage,
  onUpdateCalloutIcon, onUpdateToggleChildren, onUpdateTableData, onUpdateKanbanColumns,
  onUpdateFile, onUpdateUrl,
  onToggleCheck, onKeyDown, onDelete, onDeleteSubPage, onAddAfter, onSelectSubPage, registerRef,
}: BlockProps) {
  const elRef = useRef<HTMLElement | null>(null);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [showCalloutPicker, setShowCalloutPicker] = useState(false);

  // Keep contentEditable text in sync without losing caret
  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (el.innerText === item.text) return;
    const sel = window.getSelection();
    let anchor = 0;
    if (sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
      anchor = sel.anchorOffset;
    }
    el.innerText = item.text;
    if (isFocused && el.firstChild) {
      try {
        const r = document.createRange();
        r.setStart(el.firstChild, Math.min(anchor, el.firstChild.textContent?.length ?? 0));
        r.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(r);
      } catch { /* ignore */ }
    }
  });

  useEffect(() => {
    if (isFocused) elRef.current?.focus();
  }, [isFocused]);

  const setRef = useCallback((el: HTMLElement | null) => {
    elRef.current = el;
    registerRef(item.id, el);
  }, [item.id, registerRef]);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    onUpdateText(item.id, (e.target as HTMLElement).innerText);
  };

  const handleKD = (e: React.KeyboardEvent<HTMLElement>) => onKeyDown(e, item.id);
  const handleFocus = () => onFocus(item.id);

  const ce = {
    contentEditable: true as const,
    suppressContentEditableWarning: true,
    onInput: handleInput,
    onKeyDown: handleKD,
    onFocus: handleFocus,
    "data-placeholder": item.text ? undefined : getPlaceholder(item.type),
  };

  const textCls = "w-full text-[15px] leading-[1.75] text-foreground outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[#aaa] dark:empty:before:text-[#3d3d3d] empty:before:pointer-events-none empty:before:select-none";

  return (
    <div
      className="group/b relative flex items-start -ml-4 -mr-16 pl-4 pr-16 rounded-md hover:bg-[#f7f7f5] dark:hover:bg-white/[0.03] transition-colors overflow-visible"
      data-block-id={item.id}
    >
      {/* Drag handle, Add & Delete — hidden for code blocks (they have their own header) */}
      {item.type !== "code" && (
      <div className="absolute right-1 top-[4px] flex items-center gap-0.5 opacity-0 group-hover/b:opacity-100 transition-opacity z-10">
        <button type="button" className="p-0.5 rounded text-[#888] dark:text-[#666] hover:text-foreground hover:bg-[#eee] dark:hover:bg-[#2a2a2a] transition" title="Add block below" onClick={() => onAddAfter?.(item.id)}>
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button type="button" className="p-0.5 rounded text-[#888] dark:text-[#666] hover:text-foreground hover:bg-[#eee] dark:hover:bg-[#2a2a2a] transition" title="Drag">
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        {onDelete && (
          <button type="button" className="p-0.5 rounded text-[#888] dark:text-[#666] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition" title="Delete block" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      )}

      <div className="flex-1 min-w-0 py-[1.5px]">

        {/* ── Paragraph ── */}
        {(item.type === "paragraph" || !item.type) && (
          <div {...ce} ref={setRef} className={textCls} />
        )}

        {/* ── Headings ── */}
        {item.type === "heading1" && (
          <div {...ce} ref={setRef}
            className="w-full text-[2rem] font-bold leading-tight tracking-tight text-foreground outline-none mt-8 mb-1 empty:before:content-[attr(data-placeholder)] empty:before:text-[#ccc] dark:empty:before:text-[#3a3a3a] empty:before:pointer-events-none" />
        )}
        {item.type === "heading2" && (
          <div {...ce} ref={setRef}
            className="w-full text-[1.5rem] font-bold leading-tight tracking-tight text-foreground outline-none mt-6 mb-0.5 empty:before:content-[attr(data-placeholder)] empty:before:text-[#ccc] dark:empty:before:text-[#3a3a3a] empty:before:pointer-events-none" />
        )}
        {item.type === "heading3" && (
          <div {...ce} ref={setRef}
            className="w-full text-[1.125rem] font-semibold leading-snug text-foreground outline-none mt-4 mb-0.5 empty:before:content-[attr(data-placeholder)] empty:before:text-[#ccc] dark:empty:before:text-[#3a3a3a] empty:before:pointer-events-none" />
        )}
        {(item.type === "heading4" || item.type === "heading") && (
          <div {...ce} ref={setRef}
            className="w-full text-[1rem] font-semibold leading-snug text-foreground outline-none mt-3 mb-0.5 empty:before:content-[attr(data-placeholder)] empty:before:text-[#ccc] dark:empty:before:text-[#3a3a3a] empty:before:pointer-events-none" />
        )}

        {/* ── Bullet ── */}
        {item.type === "bullet" && (
          <div className="flex items-start gap-2.5 py-px">
            <span className="shrink-0 select-none text-foreground/50 font-bold text-[8px] mt-[9px] leading-none">•</span>
            <div {...ce} ref={setRef} className={textCls} />
          </div>
        )}

        {/* ── Numbered ── */}
        {item.type === "numbered" && (
          <div className="flex items-start gap-2.5 py-px">
            <span className="shrink-0 select-none text-foreground/50 tabular-nums text-[13px] mt-[2px] min-w-[1.2rem] text-right font-medium">{seqNumber}.</span>
            <div {...ce} ref={setRef} className={textCls} />
          </div>
        )}

        {/* ── To-do ── */}
        {item.type === "todo" && (
          <div className="flex items-start gap-2">
            <button type="button" onClick={() => onToggleCheck(item.id)}
              className={`shrink-0 mt-[4px] h-[17px] w-[17px] rounded-[3px] border-[1.5px] flex items-center justify-center transition-all ${
                item.checked ? "bg-[#2383e2] border-[#2383e2]" : "border-[#c0c0c0] dark:border-[#444] hover:border-[#2383e2]"
              }`}>
              {item.checked && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
            </button>
            <div {...ce} ref={setRef}
              className={`${textCls} ${item.checked ? "line-through text-foreground/40" : ""}`} />
          </div>
        )}

        {/* ── Toggle ── */}
        {item.type === "toggle" && (
          <div>
            <div className="flex items-start gap-1">
              <button
                type="button"
                onClick={() => setToggleOpen(v => !v)}
                className={`shrink-0 mt-[3px] p-0.5 rounded text-foreground/40 hover:text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 ${toggleOpen ? "rotate-90" : ""}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div {...ce} ref={setRef} className={`${textCls} font-medium`} />
            </div>
            {toggleOpen && (
              <div className="ml-[22px] pl-3.5 border-l-2 border-foreground/[0.08] dark:border-foreground/10 mt-1.5 pb-1">
                <textarea
                  value={item.toggleChildren || ""}
                  onChange={(e) => onUpdateToggleChildren?.(item.id, e.target.value)}
                  placeholder="Type something inside the toggle..."
                  rows={Math.max(2, (item.toggleChildren || "").split("\n").length)}
                  className="w-full bg-transparent text-[14px] text-foreground/70 outline-none resize-none placeholder:text-foreground/25 leading-relaxed font-sans"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Quote ── */}
        {item.type === "quote" && (
          <div className="flex items-start gap-0 py-1">
            <div className="w-[3px] shrink-0 self-stretch bg-foreground/20 dark:bg-foreground/15 rounded-full mr-4" />
            <div {...ce} ref={setRef}
              className={`${textCls} text-foreground/80 italic`} />
          </div>
        )}

        {/* ── Callout ── */}
        {item.type === "callout" && (
          <div className="relative flex items-start gap-3 px-3.5 py-2.5 rounded-lg bg-[#f3f3f2] dark:bg-[#1c1c1c] border border-transparent dark:border-white/[0.05] my-1 transition-colors hover:bg-[#eeeeed] dark:hover:bg-[#1f1f1f]">
            <button
              type="button"
              onClick={() => setShowCalloutPicker(!showCalloutPicker)}
              className="shrink-0 text-[18px] select-none mt-[2px] hover:scale-110 transition-transform cursor-pointer p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
              title="Change callout icon"
            >
              {item.calloutIcon || "💡"}
            </button>
            {showCalloutPicker && (
              <div className="absolute left-4 top-12 z-50">
                <EmojiDropdown
                  onSelect={(emoji) => {
                    onUpdateCalloutIcon?.(item.id, emoji);
                    setShowCalloutPicker(false);
                  }}
                  onClose={() => setShowCalloutPicker(false)}
                />
              </div>
            )}
            <div {...ce} ref={setRef} className={`${textCls} text-[14px]`} />
          </div>
        )}

        {/* ── Divider ── */}
        {item.type === "divider" && (
          <div className="py-3">
            <hr className="border-t border-foreground/10" />
          </div>
        )}

        {/* ── Code ── */}
        {item.type === "code" && (
          <CodeBlock
            id={item.id}
            code={item.text}
            language={item.codeLanguage || "javascript"}
            onChangeCode={(id, code) => onUpdateText(id, code)}
            onChangeLang={(id, lang) => onUpdateLanguage?.(id, lang)}
            isFocused={isFocused}
            onFocus={handleFocus}
            onExitToNewBlock={() => onAddAfter?.(item.id)}
          />
        )}

        {/* ── Page / Link to page ── */}
        {(item.type === "page" || item.type === "link_to_page") && (
          <div
            className="flex items-center justify-between gap-3 my-1.5 px-2.5 py-2 rounded-xl bg-foreground/[0.02] hover:bg-foreground/[0.06] border border-foreground/[0.06] hover:border-foreground/15 transition-all group/page cursor-pointer w-full shadow-xs"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              // If not clicking inside the contentEditable or delete button, open the subpage
              if (!target.isContentEditable && !target.closest("button")) {
                onSelectSubPage(item.id, item.subPageId, item.text || "Untitled");
              }
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className="h-6 w-6 rounded-md bg-foreground/5 flex items-center justify-center text-foreground/80 shrink-0 group-hover/page:text-primary transition"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSubPage(item.id, item.subPageId, item.text || "Untitled");
                }}
                title="Open sub-page"
              >
                <FileText className="h-4 w-4 stroke-[1.8]" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  {...ce}
                  ref={setRef}
                  className="font-bold text-[14px] text-foreground hover:text-primary outline-none w-full cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-foreground/30 empty:before:pointer-events-none transition-colors"
                  data-placeholder="Untitled page"
                />
              </div>
            </div>

            {item.subPageId ? (
              <div className="flex items-center gap-1.5 opacity-0 group-hover/page:opacity-100 transition shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSubPage(item.id, item.subPageId, item.text || "Untitled");
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-foreground/10 hover:bg-primary hover:text-primary-foreground text-foreground transition shadow-2xs"
                  title="Open this sub-page"
                >
                  <span>Open</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
                {onDeleteSubPage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSubPage(item.subPageId!);
                    }}
                    title="Delete sub-page"
                    className="p-1 rounded-lg hover:bg-red-500/10 text-foreground/40 hover:text-red-500 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSubPage(item.id, undefined, item.text || "Untitled");
                }}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition shadow-xs shrink-0"
              >
                <Plus className="h-3 w-3" />
                <span>Create page</span>
              </button>
            )}
          </div>
        )}

        {/* ── Image ── */}
        {item.type === "image" && (
          <div className="my-2 p-8 rounded-lg border-2 border-dashed border-foreground/10 flex flex-col items-center gap-2 text-foreground/40 hover:border-foreground/20 hover:bg-foreground/[0.02] transition cursor-pointer">
            <ImageIcon className="h-6 w-6" />
            <span className="text-sm">Click to add an image</span>
          </div>
        )}

        {/* ── Video ── */}
        {item.type === "video" && (
          <div className="my-2 p-8 rounded-lg border-2 border-dashed border-foreground/10 flex flex-col items-center gap-2 text-foreground/40 hover:border-foreground/20 hover:bg-foreground/[0.02] transition cursor-pointer">
            <Video className="h-6 w-6" />
            <span className="text-sm">Add video URL (YouTube, Vimeo…)</span>
          </div>
        )}

        {/* ── Audio ── */}
        {item.type === "audio" && (
          <div className="my-1 p-4 rounded-lg border border-foreground/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10"><Volume2 className="h-4 w-4 text-purple-500" /></div>
            <span className="text-sm text-foreground/60">{item.text || "Audio block"}</span>
          </div>
        )}

        {/* ── File Upload ── */}
        {item.type === "file" && (
          <FileUploadBlock
            url={item.url}
            fileName={item.fileName}
            fileSize={item.fileSize}
            onUpdateFile={(fileUrl, name, size) => onUpdateFile?.(item.id, fileUrl, name, size)}
          />
        )}

        {/* ── Web Bookmark ── */}
        {item.type === "web_bookmark" && (
          <WebBookmarkBlock
            url={item.url}
            onUpdateUrl={(bookmarkUrl) => onUpdateUrl?.(item.id, bookmarkUrl)}
          />
        )}

        {/* ── Table ── */}
        {item.type === "table" && (() => {
          const table = item.tableData || [
            ["Header 1", "Header 2", "Header 3"],
            ["Row 1, Cell 1", "Row 1, Cell 2", "Row 1, Cell 3"],
            ["Row 2, Cell 1", "Row 2, Cell 2", "Row 2, Cell 3"],
          ];
          return (
            <div className="my-2 overflow-x-auto rounded-lg border border-foreground/10 p-2 space-y-2">
              <table className="w-full text-sm border-collapse border border-foreground/10">
                <tbody>
                  {table.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-foreground/10 last:border-0">
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`p-0 border-r border-foreground/10 last:border-r-0 ${
                            rIdx === 0 ? "bg-foreground/[0.03] font-semibold" : ""
                          }`}
                        >
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => {
                              const nextData = table.map((r, ri) =>
                                ri === rIdx
                                  ? r.map((c, ci) => (ci === cIdx ? e.target.value : c))
                                  : r
                              );
                              onUpdateTableData?.(item.id, nextData);
                            }}
                            placeholder={rIdx === 0 ? `Column ${cIdx + 1}` : ""}
                            className="w-full px-3 py-1.5 bg-transparent text-xs text-foreground outline-none placeholder:text-foreground/20"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const cols = table[0]?.length || 3;
                    const nextData = [...table, Array(cols).fill("")];
                    onUpdateTableData?.(item.id, nextData);
                  }}
                  className="px-2.5 py-1 rounded bg-foreground/5 hover:bg-foreground/10 text-foreground/70 font-medium transition cursor-pointer"
                >
                  + Add Row
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextData = table.map((row) => [...row, ""]);
                    onUpdateTableData?.(item.id, nextData);
                  }}
                  className="px-2.5 py-1 rounded bg-[#2383e2]/10 hover:bg-[#2383e2]/20 text-[#2383e2] font-medium transition cursor-pointer"
                >
                  + Add Column
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── Database Block (Multi-View) ── */}
        {item.type === "kanban" && (
          <DatabaseBlock
            blockId={item.id}
            columns={item.kanbanColumns}
            onColumnsChange={(id, cols) => onUpdateKanbanColumns?.(id, cols)}
          />
        )}
      </div>

    </div>
  );
}

// ── Main Editor ───────────────────────────────────────────────────────────────
export function Editor({ activeTitle, pageId, initialBlocks, initialCoverImage, childPages, onSelectSubPage }: EditorProps) {
  const router = useRouter();
  const [pageEmoji, setPageEmoji] = useState("📄");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(activeTitle);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(initialCoverImage);
  const [items, setItems] = useState<ChecklistItem[]>(() =>
    initialBlocks && initialBlocks.length > 0 ? initialBlocks : [makeBlock("paragraph")]
  );
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [remoteCursors, setRemoteCursors] = useState<{ id: string; name: string; color: string; x: number; y: number }[]>([]);

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

  const { scheduleAutosave, immediatelySave, cancelAutosave } = useAutosave({ pageId, onStatusChange: setSaveStatus });

  useEffect(() => {
    const handleAiAppend = (e: Event) => {
      const detail = (e as CustomEvent<{ text: string; type?: BlockType; language?: string }>).detail;
      if (detail && detail.text) {
        const newBlock = makeBlock(detail.type || "paragraph");
        newBlock.text = detail.text;
        if (detail.language) {
          newBlock.codeLanguage = detail.language;
        }
        setItems((prev) => {
          const nextItems = [...prev, newBlock];
          // Use immediatelySave (no debounce) so AI content is persisted right away
          immediatelySave(currentTitleRef.current, nextItems);
          return nextItems;
        });
      }
    };
    window.addEventListener("ai-append-block", handleAiAppend);
    return () => window.removeEventListener("ai-append-block", handleAiAppend);
  }, [immediatelySave]);

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

  // BroadcastChannel multi-cursor collaboration listener
  useEffect(() => {
    if (!pageId) return;
    const channel = new BroadcastChannel(`notion-cursor-${pageId}`);

    const handleMouseMove = (e: MouseEvent) => {
      channel.postMessage({
        type: "cursor-move",
        id: "tab-session",
        name: "Collaborator",
        color: "#2383e2",
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "cursor-move") {
        setRemoteCursors([e.data]);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    channel.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [pageId]);

  // Sync when navigating to a new page
  useEffect(() => {
    queueMicrotask(() => {
      setCurrentTitle(activeTitle);
      setCoverUrl(initialCoverImage);
      setItems(initialBlocks && initialBlocks.length > 0 ? initialBlocks : [makeBlock("paragraph")]);
      setShowEmojiPicker(false);
      setSlash({ blockId: "", query: "", open: false });
      setFocusedId(null);
      hasMounted.current = false;
    });
  }, [pageId, activeTitle, initialBlocks, initialCoverImage]);

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
  }, []);

  const updateText = useCallback((id: string, text: string) => {
    setItems(prev => {
      const block = prev.find(b => b.id === id);
      if (block && (block.type === "page" || block.type === "link_to_page") && block.subPageId) {
        updatePage(block.subPageId, { title: text.trim() || "Untitled" })
          .then((updated) => {
            window.dispatchEvent(new CustomEvent("page-updated", { detail: updated }));
          })
          .catch(() => {
            // Ignore if sub-page was already deleted or not found
          });
      }
      return prev.map(b => b.id === id ? { ...b, text } : b);
    });
  }, []);

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

  const slashFiltered = slash.query
    ? SLASH_ITEMS.filter(s =>
        s.label.toLowerCase().includes(slash.query.toLowerCase()) ||
        s.description.toLowerCase().includes(slash.query.toLowerCase())
      )
    : SLASH_ITEMS;

  const applySlash = useCallback((type: BlockType) => {
    const bid = slash.blockId;
    setSlash({ blockId: "", query: "", open: false });

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
      if (e.key === "Enter") { e.preventDefault(); applySlash(slashFiltered[slashIdx]?.type ?? "paragraph"); return; }
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

  if (activeTitle === "AI Meeting Note") {
    return <MeetingNoteView currentTitle={currentTitle} onTitleChange={setCurrentTitle} />;
  }

  const basicItems = slashFiltered.filter(s => s.category === "Basic");
  const mediaItems = slashFiltered.filter(s => s.category === "Media");

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
      {saveStatus === "saving" && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 text-[11px] text-foreground/40 animate-pulse">Saving…</div>
      )}
      {saveStatus === "saved" && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 text-[11px] text-emerald-500">✓ Saved</div>
      )}

      {/* Remote Multi-Cursor Overlay */}
      <RemoteCursorOverlay cursors={remoteCursors} />

      {/* Full-width Page Cover Banner */}
      <PageCoverBanner url={coverUrl} onUpdateCover={handleCoverChange} />

      <div id="editor-page-container" className="max-w-[720px] mx-auto px-24 pt-12 pb-60 select-text">
        {/* Cover & Quick Actions Header */}
        <div className="mb-2 flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
          {!coverUrl && (
            <button
              type="button"
              onClick={() => handleCoverChange("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop")}
              className="text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 rounded-md hover:bg-foreground/5 transition cursor-pointer"
            >
              🖼️ Add cover
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const newBlock = makeBlock("page", "Untitled");
              setItems((prev) => [...prev, newBlock]);
              setTimeout(() => onSelectSubPage(newBlock.id, undefined, "Untitled"), 50);
            }}
            className="text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 rounded-md hover:bg-foreground/5 transition cursor-pointer"
          >
            📄 Add sub-page
          </button>
        </div>

        {/* Emoji */}
        <div className="relative mb-3">
          <button
            onClick={e => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }}
            className="text-5xl rounded-lg p-1 hover:bg-foreground/5 transition select-none inline-block"
            title="Change icon"
          >
            {pageEmoji}
          </button>
          {showEmojiPicker && (
            <EmojiDropdown onSelect={setPageEmoji} onClose={() => setShowEmojiPicker(false)} />
          )}
        </div>

        {/* Title */}
        <div className="relative group/title-container mb-6 flex items-start gap-2">
          <textarea
            ref={titleRef}
            value={currentTitle}
            onChange={e => handleTitleChange(e.target.value)}
            onBlur={async () => {
              if (!pageId) return;
              if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
              cancelAutosave();
              const title = currentTitle.trim() || "Untitled";
              try {
                await updatePage(pageId, { title });
                window.dispatchEvent(new CustomEvent("page-updated", { detail: { title, updatedAt: new Date() } }));
              } catch (error) {
                console.error("Title save failed:", error);
              }
            }}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (items[0]) focusBlock(items[0].id);
              }
            }}
            placeholder="Untitled"
            rows={1}
            className="w-full resize-none overflow-hidden bg-transparent text-[2.6rem] font-bold tracking-tight text-foreground outline-none placeholder:text-foreground/20 leading-tight select-text cursor-text"
            style={{ height: "auto" }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              titleRef.current?.focus();
              titleRef.current?.select();
            }}
            className="opacity-0 group-hover/title-container:opacity-100 p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition shrink-0 mt-2"
            title="Click to edit title"
          >
            <SquarePen className="h-5 w-5" />
          </button>
        </div>

        {/* Blocks */}
        <div className="space-y-px">
          {(() => {
            return items.map((item, index) => {
              let seqNumber = 1;
              if (item.type === "numbered") {
                let count = 0;
                for (let i = 0; i <= index; i++) {
                  if (items[i].type === "numbered") count++;
                  else count = 0;
                }
                seqNumber = count;
              }

              return (
                <div key={item.id} className="relative">
                  <Block
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
                    onAddAfter={(id) => {
                      const newBlock = makeBlock("paragraph");
                      const idx = items.findIndex((b) => b.id === id);
                      setItems((p) => { const next = [...p]; next.splice(idx + 1, 0, newBlock); return next; });
                      setTimeout(() => focusBlock(newBlock.id), 0);
                    }}
                    onDelete={(id) => {
                      if (items.length > 1) {
                        const idx = items.findIndex((b) => b.id === id);
                        const prev = items[idx - 1] ?? items[idx + 1];
                        setItems((p) => p.filter((b) => b.id !== id));
                        if (prev) setTimeout(() => focusBlock(prev.id, true), 0);
                      } else {
                        setItems([makeBlock("paragraph")]);
                      }
                    }}
                    onDeleteSubPage={async (subPageId) => {
                      try {
                        await deletePage(subPageId);
                        toast.success("Sub-page deleted");
                        setItems((prev) => prev.filter((b) => b.subPageId !== subPageId));
                        window.dispatchEvent(new CustomEvent("page-deleted", { detail: { pageId: subPageId } }));
                      } catch (err) {
                        console.error("Failed to delete sub-page:", err);
                        toast.error("Failed to delete sub-page");
                      }
                    }}
                    onSelectSubPage={onSelectSubPage}
                    registerRef={registerRef}
                  />

                  {/* Slash menu attached to this block */}
                  {slash.open && slash.blockId === item.id && (
                    <div
                      className="absolute left-0 top-full z-50 mt-1 w-80 max-h-96 overflow-y-auto bg-white dark:bg-[#1c1c1c] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-1.5"
                      onMouseDown={e => e.preventDefault()}
                    >
                      {slashFiltered.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-foreground/40">No results</p>
                      ) : (
                        <>
                          {basicItems.length > 0 && (
                            <>
                              <p className="px-2 pt-2 pb-0.5 text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">Basic blocks</p>
                              {basicItems.map(s => {
                                const Icon = s.icon;
                                const gi = slashFiltered.indexOf(s);
                                return (
                                  <button key={s.type} onMouseDown={() => applySlash(s.type)}
                                    className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-left transition ${slashIdx === gi ? "bg-[#f0f0ef] dark:bg-white/[0.06]" : "hover:bg-[#f0f0ef] dark:hover:bg-white/[0.06]"}`}>
                                    <div className="p-1.5 rounded-md bg-white dark:bg-[#2a2a2a] border border-black/[0.07] dark:border-white/[0.07] shrink-0 shadow-sm">
                                      <Icon className={`h-3.5 w-3.5 ${s.iconColor}`} />
                                    </div>
                                    <div>
                                      <div className="text-[13px] font-medium text-foreground">{s.label}</div>
                                      <div className="text-[11px] text-foreground/40">{s.description}</div>
                                    </div>
                                  </button>
                                );
                              })}
                            </>
                          )}
                          {mediaItems.length > 0 && (
                            <>
                              <p className="px-2 pt-2 pb-0.5 text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">Media</p>
                              {mediaItems.map(s => {
                                const Icon = s.icon;
                                const gi = slashFiltered.indexOf(s);
                                return (
                                  <button key={s.type} onMouseDown={() => applySlash(s.type)}
                                    className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-left transition ${slashIdx === gi ? "bg-[#f0f0ef] dark:bg-white/[0.06]" : "hover:bg-[#f0f0ef] dark:hover:bg-white/[0.06]"}`}>
                                    <div className="p-1.5 rounded-md bg-white dark:bg-[#2a2a2a] border border-black/[0.07] dark:border-white/[0.07] shrink-0 shadow-sm">
                                      <Icon className={`h-3.5 w-3.5 ${s.iconColor}`} />
                                    </div>
                                    <div>
                                      <div className="text-[13px] font-medium text-foreground">{s.label}</div>
                                      <div className="text-[11px] text-foreground/40">{s.description}</div>
                                    </div>
                                  </button>
                                );
                              })}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            });
          })()}

          {/* Empty state hint */}
          {items.length === 1 && !items[0].text && focusedId !== items[0].id && (
            <p
              className="text-[15px] text-foreground/20 leading-[1.75] cursor-text select-none"
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
