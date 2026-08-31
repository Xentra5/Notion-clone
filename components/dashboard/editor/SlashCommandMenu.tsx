"use client";

import React from "react";
import type { BlockType } from "@/hooks/use-pages";
import {
  Sparkles,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  MessageSquare,
  Minus,
  ChevronRight,
  FileText,
  Code,
  Image as ImageIcon,
  Video,
  Volume2,
  Paperclip,
  Bookmark,
  Table,
  Link,
} from "lucide-react";

export interface SlashMenuItem {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  category: "Basic" | "Media" | "AI";
  action?: "ai_summary";
  aliases?: string[];
}

export const SLASH_ITEMS: SlashMenuItem[] = [
  { type: "paragraph",    label: "AI Summary",    description: "Summarize this page with Notion AI", icon: Sparkles,     iconColor: "text-purple-500", category: "AI", action: "ai_summary", aliases: ["summary", "summery", "summarize", "ai", "sum", "tldr"] },
  { type: "paragraph",    label: "Text",          description: "Plain paragraph text",         icon: Type,             iconColor: "text-neutral-400",  category: "Basic", aliases: ["p", "paragraph", "plain"] },
  { type: "heading1",     label: "Heading 1",     description: "Large section heading",         icon: Heading1,         iconColor: "text-purple-400",   category: "Basic", aliases: ["h1", "title", "heading"] },
  { type: "heading2",     label: "Heading 2",     description: "Medium section heading",        icon: Heading2,         iconColor: "text-purple-400",   category: "Basic", aliases: ["h2", "subtitle", "heading"] },
  { type: "heading3",     label: "Heading 3",     description: "Small section heading",         icon: Heading3,         iconColor: "text-purple-400",   category: "Basic", aliases: ["h3", "heading"] },
  { type: "bullet",       label: "Bulleted list", description: "Simple bulleted list",          icon: List,             iconColor: "text-amber-400",    category: "Basic", aliases: ["ul", "list", "bullet"] },
  { type: "numbered",     label: "Numbered list", description: "Numbered list",                 icon: ListOrdered,      iconColor: "text-amber-400",    category: "Basic", aliases: ["ol", "num", "number"] },
  { type: "todo",         label: "To-do",         description: "Track tasks with a checkbox",   icon: CheckSquare,      iconColor: "text-blue-400",     category: "Basic", aliases: ["check", "task", "checkbox", "todo"] },
  { type: "quote",        label: "Quote",         description: "Capture a quote",               icon: Quote,            iconColor: "text-emerald-400",  category: "Basic", aliases: ["blockquote", "quote"] },
  { type: "callout",      label: "Callout",       description: "Highlighted callout box",       icon: MessageSquare,    iconColor: "text-rose-400",     category: "Basic", aliases: ["note", "alert", "tip", "warning", "info"] },
  { type: "divider",      label: "Divider",       description: "Visual horizontal line",        icon: Minus,            iconColor: "text-neutral-400",  category: "Basic", aliases: ["hr", "line", "separator"] },
  { type: "toggle",       label: "Toggle",        description: "Collapsible section",           icon: ChevronRight,     iconColor: "text-neutral-400",  category: "Basic", aliases: ["accordion", "details"] },
  { type: "page",         label: "Page",          description: "Embed a sub-page link",         icon: FileText,         iconColor: "text-neutral-400",  category: "Basic", aliases: ["subpage", "doc"] },
  { type: "code",         label: "Code",          description: "Code snippet with copy",        icon: Code,             iconColor: "text-emerald-400",  category: "Media", aliases: ["js", "ts", "py", "snippet", "script"] },
  { type: "image",        label: "Image",         description: "Upload or embed an image",      icon: ImageIcon,        iconColor: "text-indigo-400",   category: "Media", aliases: ["img", "photo", "picture"] },
  { type: "video",        label: "Video",         description: "Embed YouTube, Vimeo...",       icon: Video,            iconColor: "text-red-400",      category: "Media", aliases: ["youtube", "mp4"] },
  { type: "audio",        label: "Audio",         description: "Audio recording or file",       icon: Volume2,          iconColor: "text-purple-400",   category: "Media", aliases: ["mp3", "voice", "sound"] },
  { type: "file",         label: "File",          description: "Upload a file",                 icon: Paperclip,        iconColor: "text-neutral-400",  category: "Media", aliases: ["attachment", "pdf"] },
  { type: "web_bookmark", label: "Web bookmark",  description: "Save a visual web link",        icon: Bookmark,         iconColor: "text-orange-400",   category: "Media", aliases: ["link", "url"] },
  { type: "table",        label: "Table",         description: "Simple table",                  icon: Table,            iconColor: "text-cyan-400",     category: "Media", aliases: ["grid", "sheet"] },
  { type: "kanban",       label: "Board view",    description: "Kanban board for task tracking",icon: Table,            iconColor: "text-blue-500",     category: "Media", aliases: ["board", "cards"] },
  { type: "link_to_page", label: "Link to page",  description: "Link to an existing page",      icon: Link,             iconColor: "text-blue-400",     category: "Media", aliases: ["reference"] },
];

export function getDefaultText(type: BlockType): string {
  const m: Partial<Record<BlockType, string>> = {
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

export function getPlaceholder(type: BlockType | undefined): string {
  const m: Partial<Record<BlockType, string>> = {
    heading1: "Heading 1", heading2: "Heading 2", heading3: "Heading 3",
    heading4: "Heading 4", heading: "Heading",
    bullet: "List", numbered: "List", todo: "To-do", toggle: "Toggle",
    quote: "Empty quote", callout: "Callout text", code: "// Write code here",
    paragraph: "",
  };
  return m[type as BlockType] ?? "";
}

interface SlashCommandMenuProps {
  filteredItems: SlashMenuItem[];
  selectedIndex: number;
  onSelect: (item: SlashMenuItem) => void;
}

export function SlashCommandMenu({
  filteredItems,
  selectedIndex,
  onSelect,
}: SlashCommandMenuProps) {
  if (filteredItems.length === 0) {
    return (
      <div
        className="absolute left-0 top-full z-50 mt-1 w-80 max-h-96 overflow-y-auto bg-white dark:bg-[#1c1c1c] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-1.5"
        onMouseDown={(e) => e.preventDefault()}
      >
        <p className="px-3 py-2 text-xs text-foreground/40">No results</p>
      </div>
    );
  }

  const aiItems = filteredItems.filter((i) => i.category === "AI");
  const basicItems = filteredItems.filter((i) => i.category === "Basic");
  const mediaItems = filteredItems.filter((i) => i.category === "Media");

  return (
    <div
      className="absolute left-0 top-full z-50 mt-1 w-80 max-h-96 overflow-y-auto bg-white dark:bg-[#1c1c1c] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-1.5"
      onMouseDown={(e) => e.preventDefault()}
    >
      {aiItems.length > 0 && (
        <>
          <p className="px-2 pt-2 pb-0.5 text-[10px] font-semibold text-purple-500 uppercase tracking-widest flex items-center gap-1">
            <span>✨ Notion AI</span>
          </p>
          {aiItems.map((s) => {
            const Icon = s.icon;
            const gi = filteredItems.indexOf(s);
            const isSelected = selectedIndex === gi;
            return (
              <button
                key={s.label}
                type="button"
                onMouseDown={() => onSelect(s)}
                className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-left transition ${
                  isSelected
                    ? "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-semibold"
                    : "hover:bg-[#f0f0ef] dark:hover:bg-white/[0.06]"
                }`}
              >
                <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-950/60 border border-purple-300/40 dark:border-purple-800/40 shrink-0 shadow-sm">
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

      {basicItems.length > 0 && (
        <>
          <p className="px-2 pt-2 pb-0.5 text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">
            Basic blocks
          </p>
          {basicItems.map((s) => {
            const Icon = s.icon;
            const gi = filteredItems.indexOf(s);
            const isSelected = selectedIndex === gi;
            return (
              <button
                key={s.label}
                type="button"
                onMouseDown={() => onSelect(s)}
                className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-left transition ${
                  isSelected
                    ? "bg-[#f0f0ef] dark:bg-white/[0.06] font-semibold"
                    : "hover:bg-[#f0f0ef] dark:hover:bg-white/[0.06]"
                }`}
              >
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
          <p className="px-2 pt-2 pb-0.5 text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">
            Media
          </p>
          {mediaItems.map((s) => {
            const Icon = s.icon;
            const gi = filteredItems.indexOf(s);
            const isSelected = selectedIndex === gi;
            return (
              <button
                key={s.label}
                type="button"
                onMouseDown={() => onSelect(s)}
                className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-left transition ${
                  isSelected
                    ? "bg-[#f0f0ef] dark:bg-white/[0.06] font-semibold"
                    : "hover:bg-[#f0f0ef] dark:hover:bg-white/[0.06]"
                }`}
              >
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
    </div>
  );
}
