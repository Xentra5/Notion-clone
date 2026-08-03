"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MeetingNoteView } from "./MeetingNoteView";
import { BlockRenderer } from "./BlockRenderer";
import { Toolbar } from "./Toolbar";
import { EmojiDropdown } from "./EmojiPicker";
import { useAutosave } from "@/hooks/use-autosave";
import { DEFAULT_ITEMS, type ChecklistItem } from "@/hooks/use-pages";
import type { BlockType } from "./Toolbar";

export interface EditorProps {
  activeTitle: string;
  pageId?: string;
  /** Pre-loaded blocks from the DB. When provided, seeds the editor instead of DEFAULT_ITEMS. */
  initialBlocks?: ChecklistItem[];
  onOpenAi: () => void;
  onSelectSubPage: (title: string) => void;
}

export function Editor({ activeTitle, pageId, initialBlocks, onOpenAi, onSelectSubPage }: EditorProps) {
  const { data: session } = useSession();
  const [pageEmoji, setPageEmoji] = useState("📱");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(activeTitle);
  // Use initialBlocks from DB when navigating to a real page; fall back to defaults otherwise
  const [items, setItems] = useState<ChecklistItem[]>(() => initialBlocks ?? DEFAULT_ITEMS);
  const [newItemText, setNewItemText] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");

  const hasMounted = useRef(false);

  const { scheduleAutosave, cancelAutosave } = useAutosave({
    pageId,
    onStatusChange: setSaveStatus,
  });

  // When activeTitle or initialBlocks change from router/sidebar, update the canvas
  useEffect(() => {
    setCurrentTitle(activeTitle);
    if (initialBlocks !== undefined) {
      setItems(initialBlocks.length > 0 ? initialBlocks : DEFAULT_ITEMS);
    } else {
      setItems(DEFAULT_ITEMS);
    }
    setShowEmojiPicker(false);
    setShowSlashMenu(false);
    setNewItemText("");
    hasMounted.current = false;
  }, [activeTitle, initialBlocks]);

  // Trigger debounced autosave whenever content changes (skip on first render/page switch)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    scheduleAutosave(currentTitle, items);
    return cancelAutosave;
  }, [currentTitle, items, scheduleAutosave, cancelAutosave]);

  function toggleCheck(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  }

  function handleAddItem(type: BlockType = "todo") {
    const textToAdd = newItemText.replace(/^\//, "").trim() || "New block item";
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), type, text: textToAdd, checked: false },
    ]);
    setNewItemText("");
    setShowSlashMenu(false);
  }

  function handleTextChange(val: string) {
    setNewItemText(val);
    if (val.startsWith("/")) setShowSlashMenu(true);
    else setShowSlashMenu(false);
  }

  // Render the AI Meeting Note view when that page is active
  if (activeTitle === "AI Meeting Note") {
    return (
      <MeetingNoteView
        currentTitle={currentTitle}
        onTitleChange={setCurrentTitle}
      />
    );
  }

  return (
    <div
      className="flex-1 bg-background text-foreground overflow-y-auto relative selection:bg-primary/30 selection:text-foreground font-sans"
      onClick={() => setShowEmojiPicker(false)}
    >
      <div className="max-w-3xl mx-auto px-6 sm:px-12 py-12 sm:py-16 space-y-6">
        {/* Page Emoji Icon Picker Header */}
        <div className="relative group/emoji">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEmojiPicker(!showEmojiPicker);
            }}
            className="text-4xl p-1.5 rounded-xl hover:bg-accent transition inline-block select-none"
            title="Change icon"
          >
            {pageEmoji}
          </button>

          {showEmojiPicker && (
            <EmojiDropdown
              onSelect={setPageEmoji}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        {/* Document Title Header (Editable) */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            placeholder="Untitled Page"
            className="flex-1 text-3xl sm:text-4xl font-bold tracking-tight text-foreground bg-transparent outline-none border-b border-transparent focus:border-border transition"
          />
          {saveStatus === "saving" && (
            <span className="text-[10px] text-muted-foreground animate-pulse shrink-0">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-[10px] text-emerald-500 shrink-0">✓ Saved</span>
          )}
        </div>

        {/* Welcome Callout Banner */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border text-sm text-foreground">
          <span className="text-base">👋</span>
          <span className="font-semibold">Welcome to Notion!</span>
        </div>

        {/* Section Subtext */}
        <div className="text-xs sm:text-sm font-medium text-muted-foreground pt-1">
          Here are the basics:
        </div>

        {/* Interactive Checklist & Block Items */}
        <BlockRenderer
          items={items}
          onToggleCheck={toggleCheck}
          onOpenAi={onOpenAi}
          onSelectSubPage={onSelectSubPage}
        />

        {/* Add block input with '/' popup command menu */}
        <Toolbar
          newItemText={newItemText}
          showSlashMenu={showSlashMenu}
          onTextChange={handleTextChange}
          onAddItem={handleAddItem}
          onToggleSlashMenu={() => setShowSlashMenu(!showSlashMenu)}
        />
      </div>

      {/* Floating Bottom-Right Avatar Badge */}
      <div className="fixed bottom-5 right-5 z-20">
        <button
          onClick={onOpenAi}
          className="h-8 w-8 rounded-full bg-card border border-border hover:border-purple-500 shadow-xl flex items-center justify-center text-xs font-serif font-bold text-foreground hover:scale-110 active:scale-95 transition"
          title="Notion User Avatar"
        >
          {session?.user?.name ? session.user.name.charAt(0).toLowerCase() : "u"}
        </button>
      </div>
    </div>
  );
}
