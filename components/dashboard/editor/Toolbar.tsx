"use client";

import { Check, Heading, List, MessageSquareQuote, Plus } from "lucide-react";

export type BlockType = "todo" | "heading" | "quote" | "bullet";

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
              onAddItem("todo");
            }
          }}
          placeholder="Type '/' for commands or press Enter to add a block..."
          className="flex-1 bg-transparent border-b border-transparent hover:border-border focus:border-primary px-1 py-1 text-sm text-foreground placeholder:text-muted-foreground outline-none transition"
        />
      </div>

      {/* Slash Menu Popover */}
      {showSlashMenu && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-popover border border-border rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in duration-100">
          <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Basic blocks
          </div>
          <button
            onClick={() => onAddItem("todo")}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-accent text-left text-foreground hover:text-foreground transition"
          >
            <div className="p-1 rounded bg-background border border-border">
              <Check className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-semibold">To-do list</div>
              <div className="text-[10px] text-muted-foreground">Track tasks with a checkbox</div>
            </div>
          </button>
          <button
            onClick={() => onAddItem("heading")}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-accent text-left text-foreground hover:text-foreground transition"
          >
            <div className="p-1 rounded bg-background border border-border">
              <Heading className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
            </div>
            <div>
              <div className="font-semibold">Heading</div>
              <div className="text-[10px] text-muted-foreground">Large section header</div>
            </div>
          </button>
          <button
            onClick={() => onAddItem("quote")}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-accent text-left text-foreground hover:text-foreground transition"
          >
            <div className="p-1 rounded bg-background border border-border">
              <MessageSquareQuote className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <div className="font-semibold">Quote</div>
              <div className="text-[10px] text-muted-foreground">Capture quotes or highlights</div>
            </div>
          </button>
          <button
            onClick={() => onAddItem("bullet")}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-accent text-left text-foreground hover:text-foreground transition"
          >
            <div className="p-1 rounded bg-background border border-border">
              <List className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <div className="font-semibold">Bulleted list</div>
              <div className="text-[10px] text-muted-foreground">Create a simple bulleted list</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
