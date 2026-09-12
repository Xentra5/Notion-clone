"use client";

import React from "react";
import { Check, CircleAlert, Cloud, ImagePlus, Plus, SquarePen } from "lucide-react";
import { EmojiDropdown } from "./EmojiPicker";

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
  saveStatus: "saved" | "saving" | "idle" | "error";
  blockCount: number;
}

export function EditorHeader({
  pageEmoji, showEmojiPicker, coverUrl, currentTitle, titleRef,
  onEmojiClick, onEmojiSelect, onEmojiClose, onAddCover, onAddSubPage,
  onTitleChange, onTitleBlur, onTitleKeyDown, saveStatus, blockCount,
}: EditorHeaderProps) {
  const status = saveStatus === "saving"
    ? { label: "Saving changes", icon: <Cloud className="h-3 w-3 animate-pulse" />, className: "text-muted-foreground" }
    : saveStatus === "saved"
      ? { label: "Saved", icon: <Check className="h-3 w-3" />, className: "text-emerald-600 dark:text-emerald-400" }
      : saveStatus === "error"
        ? { label: "Could not save", icon: <CircleAlert className="h-3 w-3" />, className: "text-red-500" }
        : { label: "All changes saved", icon: <Cloud className="h-3 w-3" />, className: "text-muted-foreground" };

  return <>
    <div className="mb-3 flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:hover:opacity-100">
      {!coverUrl && <button type="button" onClick={onAddCover} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"><ImagePlus className="h-3.5 w-3.5" />Add cover</button>}
      <button type="button" onClick={onAddSubPage} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"><Plus className="h-3.5 w-3.5" />Add sub-page</button>
    </div>

    <div className="relative mb-3">
      <button type="button" onClick={onEmojiClick} className="inline-block rounded-xl p-1.5 text-5xl transition hover:scale-105 hover:bg-foreground/5 active:scale-95" title="Change icon">{pageEmoji}</button>
      {showEmojiPicker && <EmojiDropdown onSelect={onEmojiSelect} onClose={onEmojiClose} />}
    </div>

    <div className="group/title-container relative mb-2 flex items-start gap-2">
      <textarea ref={titleRef} value={currentTitle} onChange={(event) => onTitleChange(event.target.value)} onBlur={onTitleBlur} onKeyDown={onTitleKeyDown} placeholder="Untitled" rows={1} className="w-full resize-none overflow-hidden bg-transparent text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-foreground outline-none placeholder:text-foreground/20 sm:text-5xl" style={{ height: "auto" }} />
      <button type="button" onClick={(event) => { event.stopPropagation(); titleRef.current?.focus(); titleRef.current?.select(); }} className="mt-2 shrink-0 rounded-xl p-2 text-muted-foreground opacity-0 transition hover:bg-accent hover:text-foreground group-hover/title-container:opacity-100" title="Edit title"><SquarePen className="h-5 w-5" /></button>
    </div>
    <div className="mb-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className={`inline-flex items-center gap-1 font-medium ${status.className}`}>{status.icon}{status.label}</span>
      <span className="hidden h-3 w-px bg-border sm:block" />
      <span>{blockCount} {blockCount === 1 ? "block" : "blocks"}</span>
      <span className="hidden h-3 w-px bg-border sm:block" />
      <span className="hidden sm:inline">Type <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">/</kbd> for commands</span>
    </div>
  </>;
}
