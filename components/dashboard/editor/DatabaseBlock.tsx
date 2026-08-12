"use client";

import { useState } from "react";
import { LayoutGrid, Calendar, Table as TableIcon } from "lucide-react";
import { KanbanBoard } from "./KanbanBoard";
import { TimelineView } from "./TimelineView";
import { TableView } from "./TableView";
import type { KanbanColumn } from "@/hooks/use-pages";

interface DatabaseBlockProps {
  blockId: string;
  columns?: KanbanColumn[];
  onColumnsChange: (blockId: string, columns: KanbanColumn[]) => void;
}

type ViewMode = "kanban" | "timeline" | "table";

export function DatabaseBlock({ blockId, columns, onColumnsChange }: DatabaseBlockProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  return (
    <div className="my-3 space-y-2">
      {/* View Switcher Tab Bar */}
      <div className="flex items-center gap-1 border-b border-foreground/10 pb-1.5 select-none">
        <button
          type="button"
          onClick={() => setViewMode("kanban")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
            viewMode === "kanban"
              ? "bg-foreground/10 text-foreground"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5 text-blue-500" />
          <span>Board</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("timeline")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
            viewMode === "timeline"
              ? "bg-foreground/10 text-foreground"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          }`}
        >
          <Calendar className="h-3.5 w-3.5 text-amber-500" />
          <span>Timeline</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("table")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
            viewMode === "table"
              ? "bg-foreground/10 text-foreground"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          }`}
        >
          <TableIcon className="h-3.5 w-3.5 text-cyan-500" />
          <span>Table</span>
        </button>
      </div>

      {/* Render Selected View */}
      {viewMode === "kanban" && (
        <KanbanBoard blockId={blockId} columns={columns} onColumnsChange={onColumnsChange} />
      )}
      {viewMode === "timeline" && (
        <TimelineView blockId={blockId} columns={columns} onColumnsChange={onColumnsChange} />
      )}
      {viewMode === "table" && (
        <TableView blockId={blockId} columns={columns} onColumnsChange={onColumnsChange} />
      )}
    </div>
  );
}
