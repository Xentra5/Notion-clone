"use client";

import React from "react";
import { EmojiDropdown } from "./EmojiPicker";
import { SquarePen } from "lucide-react";

export interface EditorHeaderProps {
  pageEmoji: string;
  showEmojiPicker: boolean;
  coverUrl?: string;
  currentTitle: string;
  titleRef: React.RefObject<HTMLTextAreaElement | null>;
  onEmojiClick: (e: React.MouseEvent) => void;
  onEmojiSelect: (emoji: string) => void;
  onEmojiClose: () => void;
  onAddCover: () => void;
  onAddSubPage: () => void;
  onTitleChange: (newTitle: string) => void;
  onTitleBlur: () => void;
  onTitleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function EditorHeader({
  pageEmoji,
  showEmojiPicker,
  coverUrl,
  currentTitle,
  titleRef,
  onEmojiClick,
  onEmojiSelect,
  onEmojiClose,
  onAddCover,
  onAddSubPage,
  onTitleChange,
  onTitleBlur,
  onTitleKeyDown,
}: EditorHeaderProps) {
  return (
    <>
      {/* Cover & Quick Actions Header */}
      <div className="mb-2 flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
        {!coverUrl && (
          <button
            type="button"
            onClick={onAddCover}
            className="text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 rounded-md hover:bg-foreground/5 transition cursor-pointer"
          >
            🖼️ Add cover
          </button>
        )}
        <button
          type="button"
          onClick={onAddSubPage}
          className="text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 rounded-md hover:bg-foreground/5 transition cursor-pointer"
        >
          📄 Add sub-page
        </button>
      </div>

      {/* Emoji */}
      <div className="relative mb-3">
        <button
          type="button"
          onClick={onEmojiClick}
          className="text-5xl rounded-xl p-1.5 hover:bg-foreground/5 hover:scale-105 active:scale-95 transition select-none inline-block cursor-pointer"
          title="Change icon"
        >
          {pageEmoji}
        </button>
        {showEmojiPicker && (
          <EmojiDropdown onSelect={onEmojiSelect} onClose={onEmojiClose} />
        )}
      </div>

      {/* Title */}
      <div className="relative group/title-container mb-6 flex items-start gap-2">
        <textarea
          ref={titleRef}
          value={currentTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={onTitleBlur}
          onKeyDown={onTitleKeyDown}
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
          className="opacity-0 group-hover/title-container:opacity-100 p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition shrink-0 mt-2 cursor-pointer"
          title="Click to edit title"
        >
          <SquarePen className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
