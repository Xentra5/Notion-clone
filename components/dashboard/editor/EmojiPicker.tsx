"use client";

import { useEffect, useRef } from "react";

interface EmojiPickerProps {
  emoji: string;
  onSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = [
  { name: "Documents", emojis: ["📄", "📝", "📋", "📁", "📂", "📑", "📊", "📈", "📉", "📌"] },
  { name: "Productivity", emojis: ["🚀", "⚡", "💡", "🎯", "🔥", "✨", "⭐", "🏆", "📅", "⏱️"] },
  { name: "Design & Tech", emojis: ["🎨", "💻", "📱", "🌐", "🤖", "⚙️", "🛠️", "🔒", "🔑", "🔍"] },
  { name: "Work & Life", emojis: ["☕", "💼", "🏢", "👥", "💬", "📣", "🎓", "🌱", "🌍", "🎉"] },
];

export function EmojiPicker({ emoji }: EmojiPickerProps) {
  return (
    <div className="relative group/emoji">
      <button
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="text-4xl p-1.5 rounded-xl hover:bg-accent transition inline-block select-none cursor-pointer"
        title="Change icon"
      >
        {emoji}
      </button>
    </div>
  );
}

interface EmojiDropdownProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiDropdown({ onSelect, onClose }: EmojiDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-full mt-2 w-72 p-3 bg-popover border border-border rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-100 space-y-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Choose Page Icon
      </div>
      <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
        {EMOJI_CATEGORIES.map((cat) => (
          <div key={cat.name} className="space-y-1">
            <div className="text-[10px] font-medium text-muted-foreground px-1">{cat.name}</div>
            <div className="grid grid-cols-5 gap-1">
              {cat.emojis.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => {
                    onSelect(em);
                    onClose();
                  }}
                  className="text-2xl p-1.5 rounded-lg hover:bg-accent hover:scale-110 active:scale-95 transition flex items-center justify-center cursor-pointer select-none"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
