"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Plus, GripVertical, MoreHorizontal, X } from "lucide-react";
import type { KanbanColumn, KanbanCard } from "@/hooks/use-pages";

// ── Default Columns ──────────────────────────────────────────────────────────

const DEFAULT_COLUMNS: KanbanColumn[] = [
  {
    id: "col-todo",
    title: "To Do",
    color: "#2383e2",
    cards: [
      { id: "card-1", title: "Research project requirements", description: "Review stakeholder documentation" },
      { id: "card-2", title: "Set up dev environment" },
    ],
  },
  {
    id: "col-progress",
    title: "In Progress",
    color: "#d9730d",
    cards: [
      { id: "card-3", title: "Design system components", description: "Build reusable UI primitives" },
    ],
  },
  {
    id: "col-done",
    title: "Done",
    color: "#0f7b6c",
    cards: [
      { id: "card-4", title: "Project kickoff meeting" },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────────────────

interface KanbanBoardProps {
  blockId: string;
  columns: KanbanColumn[] | undefined;
  onColumnsChange: (blockId: string, columns: KanbanColumn[]) => void;
}

export function KanbanBoard({ blockId, columns: externalColumns, onColumnsChange }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(
    externalColumns && externalColumns.length > 0 ? externalColumns : DEFAULT_COLUMNS
  );
  const [dragItem, setDragItem] = useState<{ cardId: string; fromColId: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [cardMenu, setCardMenu] = useState<string | null>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const titleEditRef = useRef<HTMLInputElement>(null);

  // Sync to parent on every column change
  const updateColumns = useCallback(
    (nextCols: KanbanColumn[]) => {
      setColumns(nextCols);
      onColumnsChange(blockId, nextCols);
    },
    [blockId, onColumnsChange]
  );

  // Sync internal state when external columns prop updates
  useEffect(() => {
    if (externalColumns && externalColumns.length > 0) {
      setColumns(externalColumns);
    }
  }, [externalColumns]);

  // Auto-focus editing inputs
  useEffect(() => {
    if (editingCard && editRef.current) editRef.current.focus();
  }, [editingCard]);
  useEffect(() => {
    if (editingTitle && titleEditRef.current) titleEditRef.current.focus();
  }, [editingTitle]);

  // ── Card Operations ──────────────────────────────────────────────────────

  const addCard = useCallback(
    (colId: string) => {
      const newCard: KanbanCard = {
        id: `card-${Date.now()}`,
        title: "",
      };
      const next = columns.map((col) =>
        col.id === colId ? { ...col, cards: [...col.cards, newCard] } : col
      );
      updateColumns(next);
      setEditingCard(newCard.id);
    },
    [columns, updateColumns]
  );

  const updateCard = useCallback(
    (cardId: string, updates: Partial<KanbanCard>) => {
      const next = columns.map((col) => ({
        ...col,
        cards: col.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
      }));
      updateColumns(next);
    },
    [columns, updateColumns]
  );

  const deleteCard = useCallback(
    (cardId: string) => {
      const next = columns.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardId),
      }));
      updateColumns(next);
      setCardMenu(null);
    },
    [columns, updateColumns]
  );

  // ── Column Operations ────────────────────────────────────────────────────

  const addColumn = useCallback(() => {
    const newCol: KanbanColumn = {
      id: `col-${Date.now()}`,
      title: "New Column",
      color: "#9b9a97",
      cards: [],
    };
    updateColumns([...columns, newCol]);
    setEditingTitle(newCol.id);
  }, [columns, updateColumns]);

  const updateColumnTitle = useCallback(
    (colId: string, title: string) => {
      const next = columns.map((col) => (col.id === colId ? { ...col, title } : col));
      updateColumns(next);
    },
    [columns, updateColumns]
  );

  const deleteColumn = useCallback(
    (colId: string) => {
      updateColumns(columns.filter((col) => col.id !== colId));
    },
    [columns, updateColumns]
  );

  // ── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDragStart = useCallback((cardId: string, fromColId: string) => {
    setDragItem({ cardId, fromColId });
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, colId: string) => {
      e.preventDefault();
      if (dragItem && dragItem.fromColId !== colId) {
        setDropTarget(colId);
      }
    },
    [dragItem]
  );

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (toColId: string) => {
      if (!dragItem) return;
      const { cardId, fromColId } = dragItem;
      if (fromColId === toColId) return;

      let movedCard: KanbanCard | undefined;
      const next = columns.map((col) => {
        if (col.id === fromColId) {
          const card = col.cards.find((c) => c.id === cardId);
          if (card) movedCard = card;
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        return col;
      });

      if (movedCard) {
        const final = next.map((col) =>
          col.id === toColId ? { ...col, cards: [...col.cards, movedCard!] } : col
        );
        updateColumns(final);
      }

      setDragItem(null);
      setDropTarget(null);
    },
    [dragItem, columns, updateColumns]
  );

  const handleDragEnd = useCallback(() => {
    setDragItem(null);
    setDropTarget(null);
  }, []);

  // ── Move card via click menu (mobile-friendly) ─────────────────────────

  const moveCard = useCallback(
    (cardId: string, fromColId: string, toColId: string) => {
      let movedCard: KanbanCard | undefined;
      const next = columns.map((col) => {
        if (col.id === fromColId) {
          const card = col.cards.find((c) => c.id === cardId);
          if (card) movedCard = card;
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        return col;
      });

      if (movedCard) {
        const final = next.map((col) =>
          col.id === toColId ? { ...col, cards: [...col.cards, movedCard!] } : col
        );
        updateColumns(final);
      }
      setCardMenu(null);
    },
    [columns, updateColumns]
  );

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="my-2 select-none">
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ minHeight: 200 }}>
        {columns.map((col) => (
          <div
            key={col.id}
            className={`flex-shrink-0 w-[280px] rounded-xl transition-all duration-200 ${
              dropTarget === col.id
                ? "bg-[#2383e2]/5 ring-2 ring-[#2383e2]/30 dark:ring-[#2383e2]/20"
                : "bg-[#f7f7f5] dark:bg-[#252525]"
            }`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(col.id)}
          >
            {/* ── Column Header ── */}
            <div className="flex items-center justify-between px-3 py-2.5 group">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                {editingTitle === col.id ? (
                  <input
                    ref={titleEditRef}
                    value={col.title}
                    onChange={(e) => updateColumnTitle(col.id, e.target.value)}
                    onBlur={() => setEditingTitle(null)}
                    onKeyDown={(e) => { if (e.key === "Enter") setEditingTitle(null); }}
                    className="text-[13px] font-semibold text-[#37352f] dark:text-[#e0dfdc] bg-transparent border-none outline-none flex-1 min-w-0"
                  />
                ) : (
                  <span
                    className="text-[13px] font-semibold text-[#37352f] dark:text-[#e0dfdc] truncate cursor-pointer"
                    onDoubleClick={() => setEditingTitle(col.id)}
                  >
                    {col.title}
                  </span>
                )}
                <span className="text-[11px] text-[#9b9a97] font-medium ml-1 tabular-nums">
                  {col.cards.length}
                </span>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => addCard(col.id)}
                  className="p-0.5 rounded hover:bg-[#e9e9e7] dark:hover:bg-[#3d3d3d] text-[#9b9a97] hover:text-[#37352f] dark:hover:text-[#e0dfdc] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                {columns.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteColumn(col.id)}
                    className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-[#9b9a97] hover:text-red-500 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* ── Cards ── */}
            <div className="px-2 pb-2 space-y-1.5 min-h-[60px]">
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card.id, col.id)}
                  onDragEnd={handleDragEnd}
                  className={`group/card relative bg-white dark:bg-[#2f2f2f] rounded-lg px-3 py-2.5 border border-[#e9e9e7] dark:border-[#434343] hover:border-[#2383e2]/30 cursor-grab active:cursor-grabbing transition-all hover:shadow-sm ${
                    dragItem?.cardId === card.id ? "opacity-40 scale-95" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-3.5 w-3.5 mt-0.5 text-[#d4d4d4] dark:text-[#555] flex-shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                    <div className="flex-1 min-w-0">
                      {editingCard === card.id ? (
                        <input
                          ref={editRef}
                          value={card.title}
                          onChange={(e) => updateCard(card.id, { title: e.target.value })}
                          onBlur={() => {
                            if (!card.title.trim()) deleteCard(card.id);
                            else setEditingCard(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (!card.title.trim()) deleteCard(card.id);
                              else setEditingCard(null);
                            }
                            if (e.key === "Escape") setEditingCard(null);
                          }}
                          className="text-[13px] text-[#37352f] dark:text-[#e0dfdc] bg-transparent border-none outline-none w-full"
                          placeholder="Card title…"
                        />
                      ) : (
                        <div
                          className="text-[13px] text-[#37352f] dark:text-[#e0dfdc] leading-snug cursor-text"
                          onDoubleClick={() => setEditingCard(card.id)}
                        >
                          {card.title || <span className="text-[#9b9a97] italic">Untitled</span>}
                        </div>
                      )}
                      {card.description && (
                        <div className="text-[11px] text-[#9b9a97] mt-1 line-clamp-2 leading-relaxed">
                          {card.description}
                        </div>
                      )}
                    </div>
                    {/* Card menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setCardMenu(cardMenu === card.id ? null : card.id)}
                        className="p-0.5 rounded text-[#d4d4d4] hover:text-[#9b9a97] dark:text-[#555] dark:hover:text-[#9b9a97] opacity-0 group-hover/card:opacity-100 transition-all"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                      {cardMenu === card.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setCardMenu(null)} />
                          <div className="absolute right-0 top-full z-50 mt-1 w-36 bg-white dark:bg-[#2f2f2f] border border-[#e9e9e7] dark:border-[#434343] rounded-lg shadow-xl py-1 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setEditingCard(card.id)}
                              className="w-full text-left px-3 py-1.5 text-[12px] text-[#37352f] dark:text-[#e0dfdc] hover:bg-[#f7f7f5] dark:hover:bg-[#3d3d3d]"
                            >
                              Edit
                            </button>
                            {columns
                              .filter((c) => c.id !== col.id)
                              .map((target) => (
                                <button
                                  key={target.id}
                                  type="button"
                                  onClick={() => moveCard(card.id, col.id, target.id)}
                                  className="w-full text-left px-3 py-1.5 text-[12px] text-[#37352f] dark:text-[#e0dfdc] hover:bg-[#f7f7f5] dark:hover:bg-[#3d3d3d]"
                                >
                                  Move → {target.title}
                                </button>
                              ))}
                            <button
                              type="button"
                              onClick={() => deleteCard(card.id)}
                              className="w-full text-left px-3 py-1.5 text-[12px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {col.cards.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-[11px] text-[#9b9a97] italic">No cards</p>
                </div>
              )}
            </div>

            {/* ── Add card button ── */}
            <button
              type="button"
              onClick={() => addCard(col.id)}
              className="w-full flex items-center gap-1.5 px-3 py-2 text-[12px] text-[#9b9a97] hover:text-[#37352f] dark:hover:text-[#e0dfdc] hover:bg-[#e9e9e7]/50 dark:hover:bg-[#3d3d3d]/50 transition-colors rounded-b-xl"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
          </div>
        ))}

        {/* ── Add Column ── */}
        <button
          type="button"
          onClick={addColumn}
          className="flex-shrink-0 w-[280px] h-[60px] rounded-xl border-2 border-dashed border-[#e9e9e7] dark:border-[#434343] hover:border-[#2383e2]/40 flex items-center justify-center gap-1.5 text-[12px] text-[#9b9a97] hover:text-[#2383e2] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add column
        </button>
      </div>
    </div>
  );
}
