"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { useSession } from "next-auth/react";
import { MeetingNoteView } from "./MeetingNoteView";
import { EmojiDropdown } from "./EmojiPicker";
import { useAutosave } from "@/hooks/use-autosave";
import { updatePage } from "@/lib/actions/pages";
import type { ChecklistItem, BlockType } from "@/hooks/use-pages";
import {
  Check,
  ChevronDown,
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
  Image,
  Video,
  Volume2,
  Paperclip,
  Bookmark,
  Table,
  Link,
  Trash2,
  Sparkles,
} from "lucide-react";

export interface EditorProps {
  activeTitle: string;
  pageId?: string;
  initialBlocks?: ChecklistItem[];
  onOpenAi: () => void;
  onSelectSubPage: (title: string) => void;
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
  { type: "image",        label: "Image",         description: "Upload or embed an image",      icon: Image,         iconColor: "text-indigo-400",   category: "Media" },
  { type: "video",        label: "Video",         description: "Embed YouTube, Vimeo...",       icon: Video,         iconColor: "text-red-400",      category: "Media" },
  { type: "audio",        label: "Audio",         description: "Audio recording or file",       icon: Volume2,       iconColor: "text-purple-400",   category: "Media" },
  { type: "file",         label: "File",          description: "Upload a file",                 icon: Paperclip,     iconColor: "text-neutral-400",  category: "Media" },
  { type: "web_bookmark", label: "Web bookmark",  description: "Save a visual web link",        icon: Bookmark,      iconColor: "text-orange-400",   category: "Media" },
  { type: "table",        label: "Table",         description: "Simple table",                  icon: Table,         iconColor: "text-cyan-400",     category: "Media" },
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
  index: number;
  isFocused: boolean;
  onFocus: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onToggleCheck: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onDelete?: (id: string) => void;
  onAddAfter?: (id: string) => void;
  onSelectSubPage: (title: string) => void;
  registerRef: (id: string, el: HTMLElement | null) => void;
}

function Block({
  item, index, isFocused, onFocus, onUpdateText,
  onToggleCheck, onKeyDown, onDelete, onAddAfter, onSelectSubPage, registerRef,
}: BlockProps) {
  const elRef = useRef<HTMLElement | null>(null);
  const [toggleOpen, setToggleOpen] = useState(false);

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
      className="group/b relative flex items-start -mx-8 px-8 rounded-sm hover:bg-[#f7f7f5] dark:hover:bg-white/[0.03] transition-colors"
      data-block-id={item.id}
    >
      {/* Drag handle & Delete button */}
      <div className="absolute left-0 top-[5px] flex items-center gap-0.5 opacity-0 group-hover/b:opacity-100 transition-opacity z-10">
        <button type="button" className="p-0.5 rounded text-[#ccc] dark:text-[#444] hover:text-[#555] dark:hover:text-[#aaa] hover:bg-[#eee] dark:hover:bg-[#2a2a2a] transition" title="Drag">
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button type="button" className="p-0.5 rounded text-[#ccc] dark:text-[#444] hover:text-[#555] dark:hover:text-[#aaa] hover:bg-[#eee] dark:hover:bg-[#2a2a2a] transition" title="Add block below" onClick={() => onAddAfter?.(item.id)}>
          <Plus className="h-3.5 w-3.5" />
        </button>
        {onDelete && (
          <button type="button" className="p-0.5 rounded text-[#ccc] dark:text-[#444] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition" title="Delete block" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

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
          <div className="flex items-start gap-2">
            <span className="shrink-0 select-none text-foreground/40 font-bold text-[9px] mt-[7px]">●</span>
            <div {...ce} ref={setRef} className={textCls} />
          </div>
        )}

        {/* ── Numbered ── */}
        {item.type === "numbered" && (
          <div className="flex items-start gap-2">
            <span className="shrink-0 select-none text-foreground/40 tabular-nums text-[13px] mt-[3px] min-w-[1.4rem] text-right">{index + 1}.</span>
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
              <button type="button" onClick={() => setToggleOpen(v => !v)}
                className="shrink-0 mt-[4px] p-0.5 rounded text-foreground/30 hover:text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5 transition">
                {toggleOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <div {...ce} ref={setRef} className={`${textCls} font-medium`} />
            </div>
            {toggleOpen && (
              <div className="ml-6 pl-3 border-l-2 border-foreground/10 mt-1 py-1 text-[14px] text-foreground/50">
                Toggle content — click inside to add blocks
              </div>
            )}
          </div>
        )}

        {/* ── Quote ── */}
        {item.type === "quote" && (
          <div className="pl-4 border-l-[3px] border-foreground/15 dark:border-foreground/10 py-0.5">
            <div {...ce} ref={setRef}
              className={`${textCls} text-foreground/75 italic`} />
          </div>
        )}

        {/* ── Callout ── */}
        {item.type === "callout" && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#f5f5f4] dark:bg-[#1e1e1e] border border-[#e9e9e8] dark:border-[#2a2a2a] my-1">
            <span className="shrink-0 text-xl select-none mt-0.5">💡</span>
            <div {...ce} ref={setRef} className={textCls} />
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
          <div className="my-2 rounded-lg overflow-hidden border border-[#30363d] bg-[#0d1117]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
              <span className="text-[11px] font-semibold text-[#7d8590] font-mono tracking-wide">CODE</span>
              <button type="button"
                onClick={() => navigator.clipboard.writeText(item.text)}
                className="text-[11px] text-[#7d8590] hover:text-[#e6edf3] px-2 py-0.5 rounded hover:bg-[#21262d] transition">
                Copy
              </button>
            </div>
            <div {...ce} ref={setRef} spellCheck={false}
              data-placeholder="// Write or paste code..."
              className="px-4 py-4 font-mono text-[13px] leading-[1.8] text-[#e6edf3] outline-none whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:text-[#3d444e] empty:before:pointer-events-none" />
          </div>
        )}

        {/* ── Page / Link to page ── */}
        {(item.type === "page" || item.type === "link_to_page") && (
          <button type="button" onClick={() => onSelectSubPage(item.text || "Untitled")}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-foreground/10 hover:bg-[#f5f5f4] dark:hover:bg-[#1e1e1e] transition text-sm font-medium w-full text-left group my-0.5">
            <FileText className="h-4 w-4 text-foreground/40 shrink-0 group-hover:text-foreground/70 transition" />
            <span className="underline underline-offset-2 decoration-foreground/20">{item.text || "Untitled Page"}</span>
          </button>
        )}

        {/* ── Image ── */}
        {item.type === "image" && (
          <div className="my-2 p-8 rounded-lg border-2 border-dashed border-foreground/10 flex flex-col items-center gap-2 text-foreground/40 hover:border-foreground/20 hover:bg-foreground/[0.02] transition cursor-pointer">
            <Image className="h-6 w-6" />
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

        {/* ── File ── */}
        {item.type === "file" && (
          <div className="my-1 px-4 py-3 rounded-lg border border-foreground/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Paperclip className="h-4 w-4 text-foreground/40" />
              <span className="text-sm font-medium">{item.text || "Attached file"}</span>
            </div>
            <span className="text-xs text-foreground/40 border border-foreground/10 px-2 py-0.5 rounded cursor-pointer hover:bg-foreground/5 transition">Choose</span>
          </div>
        )}

        {/* ── Web Bookmark ── */}
        {item.type === "web_bookmark" && (
          <div className="my-1 px-4 py-3 rounded-lg border border-foreground/10 flex items-center gap-3 hover:bg-foreground/[0.02] transition cursor-pointer">
            <Bookmark className="h-4 w-4 text-orange-400 shrink-0" />
            <span className="text-sm font-medium">{item.text || "Web Bookmark"}</span>
          </div>
        )}

        {/* ── Table ── */}
        {item.type === "table" && (
          <div className="my-2 overflow-x-auto rounded-lg border border-foreground/10">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-foreground/10">
                  {["Column 1", "Column 2", "Column 3"].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-foreground/40 uppercase tracking-wide bg-foreground/[0.02]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0, 1].map(r => (
                  <tr key={r} className="border-b border-foreground/5 last:border-0">
                    {[0, 1, 2].map(c => (
                      <td key={c} contentEditable suppressContentEditableWarning className="px-4 py-2 outline-none text-foreground focus:bg-blue-50/50 dark:focus:bg-blue-950/10" />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Editor ───────────────────────────────────────────────────────────────
export function Editor({ activeTitle, pageId, initialBlocks, onOpenAi, onSelectSubPage }: EditorProps) {
  const { data: session } = useSession();
  const [pageEmoji, setPageEmoji] = useState("📄");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(activeTitle);
  const [items, setItems] = useState<ChecklistItem[]>(() =>
    initialBlocks && initialBlocks.length > 0 ? initialBlocks : [makeBlock("paragraph")]
  );
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");

  // Slash command menu
  const [slash, setSlash] = useState<{ blockId: string; query: string; open: boolean }>({ blockId: "", query: "", open: false });
  const [slashIdx, setSlashIdx] = useState(0);

  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const hasMounted = useRef(false);

  const { scheduleAutosave, cancelAutosave } = useAutosave({ pageId, onStatusChange: setSaveStatus });

  // Sync when navigating pages
  useEffect(() => {
    setCurrentTitle(activeTitle);
    setItems(initialBlocks && initialBlocks.length > 0 ? initialBlocks : [makeBlock("paragraph")]);
    setShowEmojiPicker(false);
    setSlash({ blockId: "", query: "", open: false });
    setFocusedId(null);
    hasMounted.current = false;
  }, [activeTitle, initialBlocks]);

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
    setItems(prev => prev.map(b => b.id === id ? { ...b, text } : b));
  }, []);

  const toggleCheck = useCallback((id: string) => {
    setItems(prev => prev.map(b => b.id === id ? { ...b, checked: !b.checked } : b));
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
    setTimeout(() => focusBlock(bid, true), 0);
  }, [slash.blockId, focusBlock]);

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

    // Enter → split block
    if (e.key === "Enter" && !e.shiftKey) {
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
      const curType = itemsSnap[idx]?.type;
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
        if (
          el &&
          range.commonAncestorContainer !== el &&
          !el.contains(range.commonAncestorContainer)
        ) {
          e.preventDefault();

          // Find which blocks are fully or partially included in the selection
          const selectedBlockElements = editorContainer
            ? Array.from(editorContainer.querySelectorAll("[data-block-id]")).filter((blockEl) =>
                sel.containsNode(blockEl, true)
              )
            : [];

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

    // Ctrl+A / Cmd+A → Select all content across entire page container
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
      const editorContainer = document.getElementById("editor-page-container");
      if (editorContainer) {
        e.preventDefault();
        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.selectNodeContents(editorContainer);
          sel.removeAllRanges();
          sel.addRange(range);
        }
        return;
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
        if (!(e.target as HTMLElement).closest("[data-block-id]")) {
          const last = items[items.length - 1];
          if (last) focusBlock(last.id, true);
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

      <div id="editor-page-container" className="max-w-[720px] mx-auto px-24 pt-[15vh] pb-60 select-text">

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
        <textarea
          ref={titleRef}
          value={currentTitle}
          onChange={e => setCurrentTitle(e.target.value)}
          onBlur={async () => {
            if (!pageId) return;
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
          className="w-full resize-none overflow-hidden bg-transparent text-[2.6rem] font-bold tracking-tight text-foreground outline-none placeholder:text-foreground/20 leading-tight mb-6"
          style={{ height: "auto" }}
        />

        {/* Blocks */}
        <div className="space-y-px">
          {items.map((item, index) => (
            <div key={item.id} className="relative">
              <Block
                item={item}
                index={index}
                isFocused={focusedId === item.id}
                onFocus={setFocusedId}
                onUpdateText={updateText}
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
          ))}

          {/* Empty state hint */}
          {items.length === 1 && !items[0].text && focusedId !== items[0].id && (
            <p
              className="text-[15px] text-foreground/20 leading-[1.75] cursor-text select-none"
              onClick={() => focusBlock(items[0].id)}
            >
              Press <kbd className="font-mono text-[11px] border border-foreground/10 rounded px-1 py-0.5">/</kbd> for commands…
            </p>
          )}
        </div>
      </div>

      {/* Quick AI control */}
      <div className="fixed bottom-5 right-5 z-20">
        <button onClick={onOpenAi}
          className="h-9 w-9 rounded-full bg-purple-600 hover:bg-purple-500 shadow-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition"
          title="Quick Notion AI">
          <Sparkles className="h-4 w-4" />
        </button>
      </div>   </div>
  );
}
