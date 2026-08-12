"use client";

import { useState, useCallback } from "react";
import { Table as TableIcon, Plus, Trash2 } from "lucide-react";
import type { KanbanColumn, KanbanCard } from "@/hooks/use-pages";

interface TableViewProps {
  blockId: string;
  columns?: KanbanColumn[];
  onColumnsChange: (blockId: string, columns: KanbanColumn[]) => void;
}

export function TableView({ blockId, columns = [], onColumnsChange }: TableViewProps) {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const updateCardTitle = useCallback(
    (cardId: string, newTitle: string) => {
      const next = columns.map((col) => ({
        ...col,
        cards: col.cards.map((c) => (c.id === cardId ? { ...c, title: newTitle } : c)),
      }));
      onColumnsChange(blockId, next);
    },
    [blockId, columns, onColumnsChange]
  );

  const updateCardStatus = useCallback(
    (cardId: string, targetColId: string) => {
      let movedCard: KanbanCard | undefined;
      const step1 = columns.map((col) => {
        const found = col.cards.find((c) => c.id === cardId);
        if (found) movedCard = found;
        return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
      });

      if (movedCard) {
        const finalCols = step1.map((col) =>
          col.id === targetColId ? { ...col, cards: [...col.cards, movedCard!] } : col
        );
        onColumnsChange(blockId, finalCols);
      }
    },
    [blockId, columns, onColumnsChange]
  );

  const addCard = useCallback(() => {
    const targetCol = columns[0] || { id: "col-todo", title: "To Do", color: "#2383e2", cards: [] };
    const newCard: KanbanCard = {
      id: `card-${Date.now()}`,
      title: "",
    };

    let nextCols: KanbanColumn[];
    if (columns.some((c) => c.id === targetCol.id)) {
      nextCols = columns.map((c) => (c.id === targetCol.id ? { ...c, cards: [...c.cards, newCard] } : c));
    } else {
      nextCols = [{ ...targetCol, cards: [newCard] }];
    }

    onColumnsChange(blockId, nextCols);
    setEditingCardId(newCard.id);
  }, [blockId, columns, onColumnsChange]);

  const deleteCard = useCallback(
    (cardId: string) => {
      const next = columns.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardId),
      }));
      onColumnsChange(blockId, next);
    },
    [blockId, columns, onColumnsChange]
  );

  const allRows: { card: KanbanCard; column: KanbanColumn }[] = [];
  columns.forEach((col) => {
    col.cards.forEach((card) => {
      allRows.push({ card, column: col });
    });
  });

  return (
    <div className="my-2 border border-foreground/10 rounded-xl bg-background overflow-hidden select-none">
      {/* Table Controls Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/10 bg-foreground/[0.02]">
        <div className="flex items-center gap-2">
          <TableIcon className="h-4 w-4 text-cyan-500" />
          <span className="text-xs font-semibold text-foreground">Table View</span>
          <span className="text-[11px] text-muted-foreground ml-1 tabular-nums">
            {allRows.length} {allRows.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        <button
          type="button"
          onClick={addCard}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          New Row
        </button>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-foreground/10 bg-foreground/[0.01] text-muted-foreground font-medium">
              <th className="py-2 px-4 w-1/2">Task Name</th>
              <th className="py-2 px-4 w-1/4">Status</th>
              <th className="py-2 px-4 w-1/4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {allRows.map(({ card, column }) => (
              <tr key={card.id} className="hover:bg-foreground/[0.02] transition group">
                <td className="py-2 px-4">
                  {editingCardId === card.id ? (
                    <input
                      autoFocus
                      value={card.title}
                      onChange={(e) => updateCardTitle(card.id, e.target.value)}
                      onBlur={() => setEditingCardId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingCardId(null);
                      }}
                      className="w-full bg-transparent border-b border-primary outline-none font-medium text-foreground"
                      placeholder="Task name…"
                    />
                  ) : (
                    <span
                      onClick={() => setEditingCardId(card.id)}
                      className="font-medium text-foreground cursor-pointer hover:underline"
                    >
                      {card.title || <span className="text-muted-foreground italic">Untitled</span>}
                    </span>
                  )}
                </td>
                <td className="py-2 px-4">
                  <select
                    value={column.id}
                    onChange={(e) => updateCardStatus(card.id, e.target.value)}
                    className="bg-transparent text-xs font-medium outline-none cursor-pointer rounded px-1 py-0.5"
                    style={{ color: column.color }}
                  >
                    {columns.map((col) => (
                      <option key={col.id} value={col.id} className="text-foreground bg-background">
                        {col.title}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => deleteCard(card.id)}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    title="Delete row"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}

            {allRows.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-muted-foreground italic">
                  No records in table. Click &quot;New Row&quot; to add a task.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
