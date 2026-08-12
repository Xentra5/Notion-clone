"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import type { KanbanColumn, KanbanCard } from "@/hooks/use-pages";

interface TimelineViewProps {
  blockId: string;
  columns?: KanbanColumn[];
  onColumnsChange: (blockId: string, columns: KanbanColumn[]) => void;
}

export function TimelineView({ columns = [] }: TimelineViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1)); // August 2026

  const cards: (KanbanCard & { colTitle: string; colColor: string; startDay: number; durationDays: number })[] = [];

  columns.forEach((col) => {
    col.cards.forEach((card, idx) => {
      // Deterministic spread across days for timeline visualization
      const startDay = (idx * 5 + col.title.length * 2) % 20 + 2;
      const durationDays = (card.title.length % 7) + 3;
      cards.push({
        ...card,
        colTitle: col.title,
        colColor: col.color || "#2383e2",
        startDay,
        durationDays,
      });
    });
  });

  const monthDays = 31;
  const daysArray = Array.from({ length: monthDays }, (_, i) => i + 1);

  return (
    <div className="my-2 border border-foreground/10 rounded-xl bg-background overflow-hidden select-none">
      {/* Header Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-foreground/10 bg-foreground/[0.02]">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Timeline View</span>
          <span className="text-[11px] text-muted-foreground ml-2">
            {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="p-1 rounded hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="p-1 rounded hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="flex border-b border-foreground/10 text-[10px] text-muted-foreground font-mono bg-foreground/[0.01]">
            <div className="w-48 p-2 shrink-0 border-r border-foreground/10 font-sans font-medium text-foreground">
              Task
            </div>
            <div className="flex-1 grid grid-cols-31 divide-x divide-foreground/5">
              {daysArray.map((day) => (
                <div key={day} className="text-center py-2">
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-foreground/5">
            {cards.map((card) => (
              <div key={card.id} className="flex items-center text-xs hover:bg-foreground/[0.02] transition h-10">
                <div className="w-48 px-3 shrink-0 border-r border-foreground/10 truncate font-medium text-foreground flex items-center justify-between">
                  <span className="truncate">{card.title || "Untitled Task"}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded text-white shrink-0 ml-1" style={{ backgroundColor: card.colColor }}>
                    {card.colTitle}
                  </span>
                </div>
                <div className="flex-1 relative h-full flex items-center px-1">
                  {/* Timeline Bar */}
                  <div
                    className="absolute h-6 rounded-md px-2 flex items-center text-[10px] font-medium text-white shadow-sm truncate transition-all cursor-pointer hover:brightness-110"
                    style={{
                      left: `${(card.startDay / monthDays) * 100}%`,
                      width: `${(card.durationDays / monthDays) * 100}%`,
                      backgroundColor: card.colColor,
                    }}
                    title={`${card.title} (${card.colTitle})`}
                  >
                    <span className="truncate">{card.title}</span>
                  </div>
                </div>
              </div>
            ))}

            {cards.length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground italic">
                No tasks available. Add cards to the Database to render timeline bars.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
