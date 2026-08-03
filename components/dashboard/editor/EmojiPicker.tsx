"use client";

interface EmojiPickerProps {
  emoji: string;
  onSelect: (emoji: string) => void;
}

const EMOJIS = ["📱", "📄", "🚀", "⚡", "💡", "🎨", "📝", "✨", "📌", "🌐"];

export function EmojiPicker({ emoji, onSelect }: EmojiPickerProps) {
  return (
    <div className="relative group/emoji">
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Toggle handled by parent via showEmojiPicker state
        }}
        className="text-4xl p-1.5 rounded-xl hover:bg-accent transition inline-block select-none"
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
  return (
    <div className="absolute left-0 top-full mt-2 p-2 bg-popover border border-border rounded-2xl shadow-2xl z-40 flex items-center gap-2 animate-in fade-in duration-100">
      {EMOJIS.map((em) => (
        <button
          key={em}
          onClick={() => {
            onSelect(em);
            onClose();
          }}
          className="text-2xl p-1.5 rounded-lg hover:bg-accent transition"
        >
          {em}
        </button>
      ))}
    </div>
  );
}
