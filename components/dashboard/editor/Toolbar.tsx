"use client";

import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  CheckSquare,
  ChevronRight,
  FileText,
  MessageSquare,
  Quote,
  Table,
  Minus,
  Link,
  Image,
  Video,
  Volume2,
  Code,
  Paperclip,
  Bookmark,
  Plus,
} from "lucide-react";
import type { BlockType } from "@/hooks/use-pages";

export type { BlockType };

interface SlashMenuItem {
  type: BlockType;
  category: "Basic Blocks" | "Media";
  label: string;
  description?: string;
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

const MENU_ITEMS: SlashMenuItem[] = [
  // Basic Blocks
  {
    type: "paragraph",
    category: "Basic Blocks",
    label: "Text",
    description: "Just start writing plain paragraph text",
    icon: Type,
    iconColor: "text-neutral-500 dark:text-neutral-400",
  },
  {
    type: "heading1",
    category: "Basic Blocks",
    label: "Heading 1",
    shortcut: "#",
    icon: Heading1,
    iconColor: "text-purple-500 dark:text-purple-400",
  },
  {
    type: "heading2",
    category: "Basic Blocks",
    label: "Heading 2",
    shortcut: "##",
    icon: Heading2,
    iconColor: "text-purple-500 dark:text-purple-400",
  },
  {
    type: "heading3",
    category: "Basic Blocks",
    label: "Heading 3",
    shortcut: "###",
    icon: Heading3,
    iconColor: "text-purple-500 dark:text-purple-400",
  },
  {
    type: "heading4",
    category: "Basic Blocks",
    label: "Heading 4",
    shortcut: "####",
    icon: Heading4,
    iconColor: "text-purple-500 dark:text-purple-400",
  },
  {
    type: "bullet",
    category: "Basic Blocks",
    label: "Bulleted list",
    shortcut: "-",
    description: "Create a simple bulleted list",
    icon: List,
    iconColor: "text-amber-500 dark:text-amber-400",
  },
  {
    type: "numbered",
    category: "Basic Blocks",
    label: "Numbered list",
    shortcut: "1.",
    description: "Create a list with numbering",
    icon: ListOrdered,
    iconColor: "text-amber-500 dark:text-amber-400",
  },
  {
    type: "todo",
    category: "Basic Blocks",
    label: "To-do list",
    shortcut: "[]",
    description: "Track tasks with a checkbox",
    icon: CheckSquare,
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  {
    type: "toggle",
    category: "Basic Blocks",
    label: "Toggle list",
    shortcut: ">",
    description: "Toggles can hide and show content inside",
    icon: ChevronRight,
    iconColor: "text-neutral-500 dark:text-neutral-400",
  },
  {
    type: "page",
    category: "Basic Blocks",
    label: "Page",
    description: "Embed a sub-page inside this page",
    icon: FileText,
    iconColor: "text-neutral-500 dark:text-neutral-400",
  },
  {
    type: "callout",
    category: "Basic Blocks",
    label: "Callout",
    description: "Make text stand out with an icon container",
    icon: MessageSquare,
    iconColor: "text-rose-500 dark:text-rose-400",
  },
  {
    type: "quote",
    category: "Basic Blocks",
    label: "Quote",
    shortcut: '"',
    description: "Capture quotes or highlights",
    icon: Quote,
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    type: "table",
    category: "Basic Blocks",
    label: "Table",
    description: "Add simple tabular content",
    icon: Table,
    iconColor: "text-cyan-500 dark:text-cyan-400",
  },
  {
    type: "divider",
    category: "Basic Blocks",
    label: "Divider",
    shortcut: "---",
    description: "Visually divide blocks with a line",
    icon: Minus,
    iconColor: "text-neutral-400 dark:text-neutral-500",
  },
  {
    type: "link_to_page",
    category: "Basic Blocks",
    label: "Link to page",
    description: "Link to an existing page",
    icon: Link,
    iconColor: "text-blue-500 dark:text-blue-400",
  },

  // Media
  {
    type: "image",
    category: "Media",
    label: "Image",
    description: "Upload or embed with a link",
    icon: Image,
    iconColor: "text-indigo-500 dark:text-indigo-400",
  },
  {
    type: "video",
    category: "Media",
    label: "Video",
    description: "Embed from YouTube, Vimeo or upload",
    icon: Video,
    iconColor: "text-red-500 dark:text-red-400",
  },
  {
    type: "audio",
    category: "Media",
    label: "Audio",
    description: "Embed audio recordings or music",
    icon: Volume2,
    iconColor: "text-purple-500 dark:text-purple-400",
  },
  {
    type: "code",
    category: "Media",
    label: "Code",
    shortcut: "...",
    description: "Capture code snippets with syntax support",
    icon: Code,
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    type: "file",
    category: "Media",
    label: "File",
    description: "Upload or embed a standalone file",
    icon: Paperclip,
    iconColor: "text-neutral-500 dark:text-neutral-400",
  },
  {
    type: "web_bookmark",
    category: "Media",
    label: "Web bookmark",
    description: "Save a visual link preview from the web",
    icon: Bookmark,
    iconColor: "text-orange-500 dark:text-orange-400",
  },
];

interface ToolbarProps {
  newItemText: string;
  showSlashMenu: boolean;
  onTextChange: (value: string) => void;
  onAddItem: (type: BlockType) => void;
  onToggleSlashMenu: () => void;
}

export function Toolbar({
  newItemText,
  showSlashMenu,
  onTextChange,
  onAddItem,
  onToggleSlashMenu,
}: ToolbarProps) {
  const searchQuery = newItemText.startsWith("/")
    ? newItemText.slice(1).trim().toLowerCase()
    : "";

  const filteredItems = MENU_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery) ||
      (item.description && item.description.toLowerCase().includes(searchQuery)) ||
      (item.shortcut && item.shortcut.includes(searchQuery))
  );

  const basicBlocks = filteredItems.filter((i) => i.category === "Basic Blocks");
  const mediaBlocks = filteredItems.filter((i) => i.category === "Media");

  return (
    <div className="relative pt-4">
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={onToggleSlashMenu}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
          title="Add block (/)"
        >
          <Plus className="h-4 w-4" />
        </button>
        <input
          type="text"
          value={newItemText}
          onChange={(e) => {
            const val = e.target.value;
            onTextChange(val);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (showSlashMenu && filteredItems.length > 0) {
                onAddItem(filteredItems[0].type);
              } else {
                onAddItem("paragraph");
              }
            }
          }}
          placeholder="Type '/' for commands or press Enter to add a paragraph..."
          className="flex-1 bg-transparent border-b border-transparent hover:border-border focus:border-primary px-1 py-1 text-sm text-foreground placeholder:text-muted-foreground outline-none transition"
        />
      </div>

      {/* Slash Menu Popover */}
      {showSlashMenu && (
        <div className="absolute left-0 top-full mt-2 w-72 max-h-80 overflow-y-auto bg-popover/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-3 animate-in fade-in duration-100 scrollbar-thin scrollbar-thumb-muted">
          {basicBlocks.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Basic blocks
              </div>
              <div className="space-y-0.5">
                {basicBlocks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type + item.label}
                      onClick={() => onAddItem(item.type)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-accent text-left text-foreground hover:text-foreground transition group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1 rounded bg-background border border-border shrink-0">
                          <Icon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs truncate">
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-[10px] text-muted-foreground truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {item.shortcut && (
                        <span className="text-[10px] font-mono text-muted-foreground/70 group-hover:text-muted-foreground shrink-0 ml-2">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {mediaBlocks.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Media
              </div>
              <div className="space-y-0.5">
                {mediaBlocks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type + item.label}
                      onClick={() => onAddItem(item.type)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-accent text-left text-foreground hover:text-foreground transition group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1 rounded bg-background border border-border shrink-0">
                          <Icon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs truncate">
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-[10px] text-muted-foreground truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {item.shortcut && (
                        <span className="text-[10px] font-mono text-muted-foreground/70 group-hover:text-muted-foreground shrink-0 ml-2">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="p-3 text-center text-xs text-muted-foreground">
              No matching commands
            </div>
          )}
        </div>
      )}
    </div>
  );
}

