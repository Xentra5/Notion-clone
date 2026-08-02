"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Sparkles,
  Plus,
  Check,
  GripVertical,
  Heading,
  List,
  MessageSquareQuote,
  Smile,
} from "lucide-react";

interface DocumentCanvasProps {
  activeTitle: string;
  onOpenAi: () => void;
  onSelectSubPage: (title: string) => void;
}

interface ChecklistItem {
  id: string;
  type: "todo" | "heading" | "quote" | "bullet";
  text: string;
  checked?: boolean;
  hasSubPage?: boolean;
  hasAiSparkle?: boolean;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  {
    id: "1",
    type: "todo",
    text: "Tap anywhere and start typing",
    checked: false,
  },
  {
    id: "2",
    type: "todo",
    text: "Tap the + above your keyboard to add content — headers, sub pages, etc.",
    checked: false,
    hasSubPage: true,
  },
  {
    id: "3",
    type: "todo",
    text: "Highlight text and use the bar above your keyboard to format",
    checked: false,
  },
  {
    id: "4",
    type: "todo",
    text: "Tap and hold this line, then drag",
    checked: false,
  },
  {
    id: "5",
    type: "todo",
    text: "Tap the home tab button at the bottom left to see your pages",
    checked: false,
  },
  {
    id: "6",
    type: "todo",
    text: "Tap anywhere and select ✨ in the bar above your keyboard to check out Notion AI",
    checked: false,
    hasAiSparkle: true,
  },
];

export function DocumentCanvas({
  activeTitle,
  onOpenAi,
  onSelectSubPage,
}: DocumentCanvasProps) {
  const [pageEmoji, setPageEmoji] = useState("📱");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(activeTitle);
  const [items, setItems] = useState<ChecklistItem[]>(DEFAULT_ITEMS);
  const [newItemText, setNewItemText] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");

  // Track whether the user has actually made edits (don't save on first render)
  const hasMounted = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When activeTitle changes from sidebar, reset the canvas to a fresh page
  useEffect(() => {
    setCurrentTitle(activeTitle);
    setItems(DEFAULT_ITEMS);
    setShowEmojiPicker(false);
    setShowSlashMenu(false);
    setNewItemText("");
    hasMounted.current = false;
  }, [activeTitle]);

  // Debounced auto-save to MongoDB
  const savePage = useCallback(async (title: string, blocks: ChecklistItem[]) => {
    setSaveStatus("saving");
    try {
      await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category: "Private",
          blocks: blocks.map((item) => ({
            id: item.id,
            type: item.type === "todo" ? "to_do" : item.type === "bullet" ? "bulleted_list_item" : item.type,
            properties: { text: item.text, checked: !!item.checked },
          })),
        }),
      });
      setSaveStatus("saved");
    } catch (err) {
      console.error("Auto-save error:", err);
      setSaveStatus("idle");
    }
  }, []);

  useEffect(() => {
    // Skip auto-save on the very first render / page switch
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    // Clear any existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Debounce: wait 2s of inactivity before saving
    saveTimerRef.current = setTimeout(() => {
      savePage(currentTitle, items);
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [currentTitle, items, savePage]);

  const emojis = ["📱", "📄", "🚀", "⚡", "💡", "🎨", "📝", "✨", "📌", "🌐"];

  function toggleCheck(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }

  function handleAddItem(type: "todo" | "heading" | "quote" | "bullet" = "todo") {
    const textToAdd = newItemText.replace(/^\//, "").trim() || "New block item";
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        text: textToAdd,
        checked: false,
      },
    ]);
    setNewItemText("");
    setShowSlashMenu(false);
  }

  return (
    <div className="flex-1 bg-[#191919] text-[#d4d4d4] overflow-y-auto relative selection:bg-[#0078df]/30 selection:text-white font-sans">
      <div className="max-w-3xl mx-auto px-6 sm:px-12 py-12 sm:py-16 space-y-6">
        {/* Page Emoji Icon Picker Header */}
        <div className="relative group/emoji">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-4xl p-1.5 rounded-xl hover:bg-[#252525] transition inline-block select-none"
            title="Change icon"
          >
            {pageEmoji}
          </button>

          {showEmojiPicker && (
            <div className="absolute left-0 top-full mt-2 p-2 bg-[#202020] border border-[#333333] rounded-2xl shadow-2xl z-40 flex items-center gap-2 animate-in fade-in duration-100">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setPageEmoji(emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-2xl p-1.5 rounded-lg hover:bg-[#333] transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Document Title Header (Editable) */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            placeholder="Untitled Page"
            className="flex-1 text-3xl sm:text-4xl font-bold tracking-tight text-[#ffffff] bg-transparent outline-none border-b border-transparent focus:border-[#333333] transition"
          />
          {saveStatus === "saving" && (
            <span className="text-[10px] text-[#737373] animate-pulse shrink-0">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-[10px] text-emerald-500 shrink-0">✓ Saved</span>
          )}
        </div>

        {/* Welcome Callout Banner */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#202020] border border-[#2c2c2c] text-sm text-[#e6e6e6]">
          <span className="text-base">👋</span>
          <span className="font-semibold">Welcome to Notion!</span>
        </div>

        {/* Section Subtext */}
        <div className="text-xs sm:text-sm font-medium text-[#888888] pt-1">
          Here are the basics:
        </div>

        {/* Interactive Checklist & Block Items */}
        <div className="space-y-3.5 pt-1">
          {items.map((item) => (
            <div key={item.id} className="group flex items-start gap-2 -ml-6 pl-1 rounded-lg hover:bg-[#1e1e1e] py-1 transition">
              {/* Drag Handle Icon on Hover */}
              <div className="opacity-0 group-hover:opacity-100 transition text-[#555555] cursor-grab pt-1 shrink-0">
                <GripVertical className="h-4 w-4" />
              </div>

              <div className="flex-1 space-y-2">
                {item.type === "todo" && (
                  <div className="flex items-start gap-3 text-sm text-[#d4d4d4] leading-relaxed">
                    <button
                      type="button"
                      onClick={() => toggleCheck(item.id)}
                      className={`mt-0.5 h-4 w-4 rounded border transition flex items-center justify-center shrink-0 ${
                        item.checked
                          ? "bg-[#0078df] border-[#0078df] text-white"
                          : "border-[#4f4f4f] bg-transparent hover:border-[#888888]"
                      }`}
                      aria-label="Toggle checkbox"
                    >
                      {item.checked && <Check className="h-3 w-3 stroke-[2.5]" />}
                    </button>

                    <span
                      className={`flex-1 ${
                        item.checked ? "line-through text-[#666666]" : ""
                      }`}
                    >
                      {item.hasAiSparkle ? (
                        <>
                          Tap anywhere and select{" "}
                          <button
                            onClick={onOpenAi}
                            className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium hover:underline mx-0.5"
                          >
                            <Sparkles className="h-3.5 w-3.5 inline fill-purple-400/20" />
                          </button>{" "}
                          in the bar above your keyboard to check out{" "}
                          <button
                            onClick={onOpenAi}
                            className="text-purple-400 hover:underline font-semibold"
                          >
                            Notion AI
                          </button>
                        </>
                      ) : (
                        item.text
                      )}
                    </span>
                  </div>
                )}

                {item.type === "heading" && (
                  <h2 className="text-xl font-bold text-white pt-1">
                    {item.text}
                  </h2>
                )}

                {item.type === "quote" && (
                  <blockquote className="border-l-2 border-[#0078df] pl-3 py-1 text-sm text-[#bbbbbb] italic bg-[#202020]/50 rounded-r-lg">
                    {item.text}
                  </blockquote>
                )}

                {item.type === "bullet" && (
                  <div className="flex items-start gap-2 text-sm text-[#d4d4d4]">
                    <span className="text-[#888888] font-bold">•</span>
                    <span>{item.text}</span>
                  </div>
                )}

                {/* Sub page link if present */}
                {item.hasSubPage && (
                  <div className="pl-7 pt-0.5">
                    <button
                      onClick={() => onSelectSubPage("Example sub page")}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#2e2e2e] hover:border-[#3a3a3a] text-xs font-medium text-[#d4d4d4] transition group/sub shadow-sm"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#9b9b9b] group-hover/sub:text-white transition" />
                      <span className="underline underline-offset-2 decoration-[#555] group-hover/sub:decoration-white">
                        Example sub page
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add block input with '/' popup command menu */}
        <div className="relative pt-4">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setShowSlashMenu(!showSlashMenu)}
              className="p-1 rounded-md text-[#666666] hover:text-white hover:bg-[#252525] transition"
              title="Add block (/)"
            >
              <Plus className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => {
                const val = e.target.value;
                setNewItemText(val);
                if (val.startsWith("/")) setShowSlashMenu(true);
                else setShowSlashMenu(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddItem("todo");
                }
              }}
              placeholder="Type '/' for commands or press Enter to add a block..."
              className="flex-1 bg-transparent border-b border-transparent hover:border-[#333333] focus:border-[#0078df] px-1 py-1 text-sm text-[#d4d4d4] placeholder:text-[#555555] outline-none transition"
            />
          </div>

          {/* Slash Menu Popover */}
          {showSlashMenu && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-[#202020] border border-[#333333] rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in duration-100">
              <div className="px-2 py-1 text-[10px] font-bold text-[#737373] uppercase tracking-wider">
                Basic blocks
              </div>
              <button
                onClick={() => handleAddItem("todo")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#2c2c2c] text-left text-[#d4d4d4] hover:text-white transition"
              >
                <div className="p-1 rounded bg-[#191919] border border-[#333]">
                  <Check className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold">To-do list</div>
                  <div className="text-[10px] text-[#737373]">Track tasks with a checkbox</div>
                </div>
              </button>
              <button
                onClick={() => handleAddItem("heading")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#2c2c2c] text-left text-[#d4d4d4] hover:text-white transition"
              >
                <div className="p-1 rounded bg-[#191919] border border-[#333]">
                  <Heading className="h-3.5 w-3.5 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold">Heading</div>
                  <div className="text-[10px] text-[#737373]">Large section header</div>
                </div>
              </button>
              <button
                onClick={() => handleAddItem("quote")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#2c2c2c] text-left text-[#d4d4d4] hover:text-white transition"
              >
                <div className="p-1 rounded bg-[#191919] border border-[#333]">
                  <MessageSquareQuote className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold">Quote</div>
                  <div className="text-[10px] text-[#737373]">Capture quotes or highlights</div>
                </div>
              </button>
              <button
                onClick={() => handleAddItem("bullet")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#2c2c2c] text-left text-[#d4d4d4] hover:text-white transition"
              >
                <div className="p-1 rounded bg-[#191919] border border-[#333]">
                  <List className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div>
                  <div className="font-semibold">Bulleted list</div>
                  <div className="text-[10px] text-[#737373]">Create a simple bulleted list</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom-Right Avatar Badge */}
      <div className="fixed bottom-5 right-5 z-20">
        <button
          onClick={onOpenAi}
          className="h-8 w-8 rounded-full bg-[#242424] border border-[#3d3d3d] hover:border-purple-500 shadow-xl flex items-center justify-center text-xs font-serif font-bold text-neutral-200 hover:scale-110 active:scale-95 transition"
          title="Notion User Avatar"
        >
          z
        </button>
      </div>
    </div>
  );
}
