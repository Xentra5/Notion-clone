"use client";

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback, memo } from "react";
import type { ChecklistItem, KanbanColumn } from "@/hooks/use-pages";
import { getPlaceholder } from "./SlashCommandMenu";
import { EmojiDropdown } from "./EmojiPicker";
import { CodeBlock } from "./CodeBlock";
import { DatabaseBlock } from "./DatabaseBlock";
import { WebBookmarkBlock } from "./WebBookmarkBlock";
import { FileUploadBlock } from "./FileUploadBlock";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  Check,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  Volume2,
} from "lucide-react";

export interface BlockProps {
  item: ChecklistItem;
  seqNumber?: number;
  isFocused: boolean;
  onFocus: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onUpdateLanguage?: (id: string, language: string) => void;
  onUpdateCalloutIcon?: (id: string, icon: string) => void;
  onUpdateToggleChildren?: (id: string, childrenText: string) => void;
  onUpdateTableData?: (id: string, data: string[][]) => void;
  onUpdateKanbanColumns?: (id: string, columns: KanbanColumn[]) => void;
  onUpdateFile?: (id: string, url: string, fileName: string, fileSize?: string) => void;
  onUpdateUrl?: (id: string, url: string) => void;
  onToggleCheck: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onPaste?: (e: React.ClipboardEvent, id: string) => void;
  onDelete?: (id: string) => void;
  onDeleteSubPage?: (subPageId: string) => void;
  onAddAfter?: (id: string) => void;
  onSelectSubPage: (blockId: string, subPageId?: string, title?: string) => void;
  registerRef: (id: string, el: HTMLElement | null) => void;
}

export function areBlockPropsEqual(prev: BlockProps, next: BlockProps): boolean {
  if (prev.isFocused !== next.isFocused) return false;
  if (prev.seqNumber !== next.seqNumber) return false;
  if (prev.onSelectSubPage !== next.onSelectSubPage) return false;

  const p = prev.item;
  const n = next.item;

  if (p === n) return true;
  if (p.id !== n.id) return false;
  if (p.type !== n.type) return false;
  if (p.text !== n.text) return false;
  if (p.checked !== n.checked) return false;
  if (p.codeLanguage !== n.codeLanguage) return false;
  if (p.subPageId !== n.subPageId) return false;
  if (p.url !== n.url) return false;
  if (p.fileName !== n.fileName) return false;
  if (p.fileSize !== n.fileSize) return false;
  if (p.toggleChildren !== n.toggleChildren) return false;
  if (p.calloutIcon !== n.calloutIcon) return false;
  if (p.tableData !== n.tableData) return false;
  if (p.kanbanColumns !== n.kanbanColumns) return false;

  return true;
}

export const BlockItem = memo(function BlockItem({
  item,
  seqNumber = 1,
  isFocused,
  onFocus,
  onUpdateText,
  onUpdateLanguage,
  onUpdateCalloutIcon,
  onUpdateToggleChildren,
  onUpdateTableData,
  onUpdateKanbanColumns,
  onUpdateFile,
  onUpdateUrl,
  onToggleCheck,
  onKeyDown,
  onPaste,
  onDelete,
  onDeleteSubPage,
  onAddAfter,
  onSelectSubPage,
  registerRef,
}: BlockProps) {
  const elRef = useRef<HTMLElement | null>(null);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [showCalloutPicker, setShowCalloutPicker] = useState(false);

  // Synchronize contentEditable text safely without clobbering live typing or caret
  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerText !== (item.text || "")) {
      el.innerText = item.text || "";
    }
  }, [item.text]);

  useEffect(() => {
    if (isFocused) elRef.current?.focus();
  }, [isFocused]);

  const setRef = useCallback(
    (el: HTMLElement | null) => {
      elRef.current = el;
      registerRef(item.id, el);
    },
    [item.id, registerRef]
  );

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    onUpdateText(item.id, (e.target as HTMLElement).innerText);
  };

  const handleKD = (e: React.KeyboardEvent<HTMLElement>) => onKeyDown(e, item.id);
  const handleFocus = () => onFocus(item.id);

  const ce = {
    contentEditable: true as const,
    suppressContentEditableWarning: true,
    onInput: handleInput,
    onKeyDown: handleKD,
    onFocus: handleFocus,
    onPaste: (e: React.ClipboardEvent<HTMLElement>) => onPaste?.(e, item.id),
    "data-placeholder": item.text ? undefined : getPlaceholder(item.type),
  };

  const textCls =
    "w-full text-[15px] leading-[1.75] text-foreground outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[#aaa] dark:empty:before:text-[#3d3d3d] empty:before:pointer-events-none empty:before:select-none";

  return (
    <div
      className={`group/b relative flex items-start -ml-2 pl-2 sm:-ml-4 sm:pl-4 -mr-2 pr-6 sm:-mr-12 sm:pr-12 rounded-md hover:bg-[#f7f7f5] dark:hover:bg-white/[0.03] transition-colors overflow-visible ${
        !isFocused ? "[content-visibility:auto] [contain-intrinsic-size:0_36px]" : ""
      }`}
      data-block-id={item.id}
    >
      {/* Drag handle, Add & Delete */}
      {item.type !== "code" && (
        <div className="absolute right-1 top-[4px] flex items-center gap-0.5 opacity-0 group-hover/b:opacity-100 transition-all duration-150 z-10">
          <button
            type="button"
            className="p-1 rounded-md text-[#888] dark:text-[#666] hover:text-foreground hover:bg-[#eee] dark:hover:bg-[#2a2a2a] hover:scale-110 active:scale-95 transition-all duration-150"
            title="Add block below"
            onClick={() => onAddAfter?.(item.id)}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded-md text-[#888] dark:text-[#666] hover:text-foreground hover:bg-[#eee] dark:hover:bg-[#2a2a2a] hover:scale-110 active:scale-95 transition-all duration-150 cursor-grab active:cursor-grabbing"
            title="Drag block"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          {onDelete && (
            <button
              type="button"
              className="p-1 rounded-md text-[#888] dark:text-[#666] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:scale-110 active:scale-95 transition-all duration-150"
              title="Delete block"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0 py-[1.5px]">
        {/* Paragraph */}
        {(item.type === "paragraph" || !item.type) && (
          <div {...ce} ref={setRef} className={textCls} />
        )}

        {/* Headings */}
        {item.type === "heading1" && (
          <div
            {...ce}
            ref={setRef}
            className="w-full text-[2rem] font-bold leading-tight tracking-tight text-foreground outline-none mt-8 mb-1 empty:before:content-[attr(data-placeholder)] empty:before:text-[#ccc] dark:empty:before:text-[#3a3a3a] empty:before:pointer-events-none"
          />
        )}
        {item.type === "heading2" && (
          <div
            {...ce}
            ref={setRef}
            className="w-full text-[1.5rem] font-bold leading-tight tracking-tight text-foreground outline-none mt-6 mb-0.5 empty:before:content-[attr(data-placeholder)] empty:before:text-[#ccc] dark:empty:before:text-[#3a3a3a] empty:before:pointer-events-none"
          />
        )}
        {item.type === "heading3" && (
          <div
            {...ce}
            ref={setRef}
            className="w-full text-[1.125rem] font-semibold leading-snug text-foreground outline-none mt-4 mb-0.5 empty:before:content-[attr(data-placeholder)] empty:before:text-[#ccc] dark:empty:before:text-[#3a3a3a] empty:before:pointer-events-none"
          />
        )}
        {(item.type === "heading4" || item.type === "heading") && (
          <div
            {...ce}
            ref={setRef}
            className="w-full text-[1rem] font-semibold leading-snug text-foreground outline-none mt-3 mb-0.5 empty:before:content-[attr(data-placeholder)] empty:before:text-[#ccc] dark:empty:before:text-[#3a3a3a] empty:before:pointer-events-none"
          />
        )}

        {/* Bullet */}
        {item.type === "bullet" && (
          <div className="flex items-start gap-2.5 py-px">
            <span className="shrink-0 select-none text-foreground/50 font-bold text-[8px] mt-[9px] leading-none">
              •
            </span>
            <div {...ce} ref={setRef} className={textCls} />
          </div>
        )}

        {/* Numbered */}
        {item.type === "numbered" && (
          <div className="flex items-start gap-2.5 py-px">
            <span className="shrink-0 select-none text-foreground/50 tabular-nums text-[13px] mt-[2px] min-w-[1.2rem] text-right font-medium">
              {seqNumber}.
            </span>
            <div {...ce} ref={setRef} className={textCls} />
          </div>
        )}

        {/* To-do */}
        {item.type === "todo" && (
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => onToggleCheck(item.id)}
              className={`shrink-0 mt-[4px] h-[17px] w-[17px] rounded-[3px] border-[1.5px] flex items-center justify-center transition-all ${
                item.checked
                  ? "bg-[#2383e2] border-[#2383e2]"
                  : "border-[#c0c0c0] dark:border-[#444] hover:border-[#2383e2]"
              }`}
            >
              {item.checked && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
            </button>
            <div
              {...ce}
              ref={setRef}
              className={`${textCls} ${item.checked ? "line-through text-foreground/40" : ""}`}
            />
          </div>
        )}

        {/* Toggle */}
        {item.type === "toggle" && (
          <div>
            <div className="flex items-start gap-1">
              <button
                type="button"
                onClick={() => setToggleOpen((v) => !v)}
                className={`shrink-0 mt-[3px] p-0.5 rounded text-foreground/40 hover:text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 ${
                  toggleOpen ? "rotate-90" : ""
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div {...ce} ref={setRef} className={`${textCls} font-medium`} />
            </div>
            {toggleOpen && (
              <div className="ml-[22px] pl-3.5 border-l-2 border-foreground/[0.08] dark:border-foreground/10 mt-1.5 pb-1">
                <textarea
                  value={item.toggleChildren || ""}
                  onChange={(e) => onUpdateToggleChildren?.(item.id, e.target.value)}
                  placeholder="Type something inside the toggle..."
                  rows={Math.max(2, (item.toggleChildren || "").split("\n").length)}
                  className="w-full bg-transparent text-[14px] text-foreground/70 outline-none resize-none placeholder:text-foreground/25 leading-relaxed font-sans"
                />
              </div>
            )}
          </div>
        )}

        {/* Quote */}
        {item.type === "quote" && (
          <div className="flex items-start gap-0 py-1">
            <div className="w-[3px] shrink-0 self-stretch bg-foreground/20 dark:bg-foreground/15 rounded-full mr-4" />
            <div {...ce} ref={setRef} className={`${textCls} text-foreground/80 italic`} />
          </div>
        )}

        {/* Callout */}
        {item.type === "callout" && (
          <div className="relative flex items-start gap-3 px-3.5 py-2.5 rounded-lg bg-[#f3f3f2] dark:bg-[#1c1c1c] border border-transparent dark:border-white/[0.05] my-1 transition-colors hover:bg-[#eeeeed] dark:hover:bg-[#1f1f1f]">
            <button
              type="button"
              onClick={() => setShowCalloutPicker(!showCalloutPicker)}
              className="shrink-0 text-[18px] select-none mt-[2px] hover:scale-110 transition-transform cursor-pointer p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
              title="Change callout icon"
            >
              {item.calloutIcon || "💡"}
            </button>
            {showCalloutPicker && (
              <div className="absolute left-4 top-12 z-50">
                <EmojiDropdown
                  onSelect={(emoji) => {
                    onUpdateCalloutIcon?.(item.id, emoji);
                    setShowCalloutPicker(false);
                  }}
                  onClose={() => setShowCalloutPicker(false)}
                />
              </div>
            )}
            <div {...ce} ref={setRef} className={`${textCls} text-[14px]`} />
          </div>
        )}

        {/* Divider */}
        {item.type === "divider" && (
          <div className="py-3">
            <hr className="border-t border-foreground/10" />
          </div>
        )}

        {/* Code */}
        {item.type === "code" && (
          <CodeBlock
            id={item.id}
            code={item.text}
            language={item.codeLanguage || "javascript"}
            onChangeCode={(id, code) => onUpdateText(id, code)}
            onChangeLang={(id, lang) => onUpdateLanguage?.(id, lang)}
            isFocused={isFocused}
            onFocus={handleFocus}
            onExitToNewBlock={() => onAddAfter?.(item.id)}
          />
        )}

        {/* Page / Link to page */}
        {(item.type === "page" || item.type === "link_to_page") && (
          <div
            className="flex items-center justify-between gap-3 my-1.5 px-2.5 py-2 rounded-xl bg-foreground/[0.02] hover:bg-foreground/[0.06] border border-foreground/[0.06] hover:border-foreground/15 transition-all group/page cursor-pointer w-full shadow-xs"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (!target.isContentEditable && !target.closest("button")) {
                onSelectSubPage(item.id, item.subPageId, item.text || "Untitled");
              }
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className="h-6 w-6 rounded-md bg-foreground/5 flex items-center justify-center text-foreground/80 shrink-0 group-hover/page:text-primary transition"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSubPage(item.id, item.subPageId, item.text || "Untitled");
                }}
                title="Open sub-page"
              >
                <FileText className="h-4 w-4 stroke-[1.8]" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  {...ce}
                  ref={setRef}
                  className="font-bold text-[14px] text-foreground hover:text-primary outline-none w-full cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-foreground/30 empty:before:pointer-events-none transition-colors"
                  data-placeholder="Untitled page"
                />
              </div>
            </div>

            {item.subPageId ? (
              <div className="flex items-center gap-1.5 opacity-0 group-hover/page:opacity-100 transition shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSubPage(item.id, item.subPageId, item.text || "Untitled");
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-foreground/10 hover:bg-primary hover:text-primary-foreground text-foreground transition shadow-2xs"
                  title="Open this sub-page"
                >
                  <span>Open</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
                {onDeleteSubPage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSubPage(item.subPageId!);
                    }}
                    title="Delete sub-page"
                    className="p-1 rounded-lg hover:bg-red-500/10 text-foreground/40 hover:text-red-500 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSubPage(item.id, undefined, item.text || "Untitled");
                }}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition shadow-xs shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create page</span>
              </button>
            )}
          </div>
        )}

        {/* Image */}
        {item.type === "image" && (
          <div className="my-2 p-8 rounded-lg border-2 border-dashed border-foreground/10 flex flex-col items-center gap-2 text-foreground/40 hover:border-foreground/20 hover:bg-foreground/[0.02] transition cursor-pointer">
            <ImageIcon className="h-6 w-6" />
            <span className="text-sm">Click to add an image</span>
          </div>
        )}

        {/* Video */}
        {item.type === "video" && (
          <div className="my-2 p-8 rounded-lg border-2 border-dashed border-foreground/10 flex flex-col items-center gap-2 text-foreground/40 hover:border-foreground/20 hover:bg-foreground/[0.02] transition cursor-pointer">
            <Video className="h-6 w-6" />
            <span className="text-sm">Add video URL (YouTube, Vimeo…)</span>
          </div>
        )}

        {/* Audio */}
        {item.type === "audio" && (
          <div className="my-1 p-4 rounded-lg border border-foreground/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Volume2 className="h-4 w-4 text-purple-500" />
            </div>
            <span className="text-sm text-foreground/60">{item.text || "Audio block"}</span>
          </div>
        )}

        {/* File Upload */}
        {item.type === "file" && (
          <FileUploadBlock
            url={item.url}
            fileName={item.fileName}
            fileSize={item.fileSize}
            onUpdateFile={(fileUrl, name, size) => onUpdateFile?.(item.id, fileUrl, name, size)}
          />
        )}

        {/* Web Bookmark */}
        {item.type === "web_bookmark" && (
          <WebBookmarkBlock
            url={item.url}
            onUpdateUrl={(bookmarkUrl) => onUpdateUrl?.(item.id, bookmarkUrl)}
          />
        )}

        {/* Table */}
        {item.type === "table" &&
          (() => {
            const table = item.tableData || [
              ["Header 1", "Header 2", "Header 3"],
              ["Row 1, Cell 1", "Row 1, Cell 2", "Row 1, Cell 3"],
              ["Row 2, Cell 1", "Row 2, Cell 2", "Row 2, Cell 3"],
            ];
            return (
              <div className="my-2 overflow-x-auto rounded-lg border border-foreground/10 p-2 space-y-2">
                <table className="w-full text-sm border-collapse border border-foreground/10">
                  <tbody>
                    {table.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-foreground/10 last:border-0">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`p-0 border-r border-foreground/10 last:border-r-0 ${
                              rIdx === 0 ? "bg-foreground/[0.03] font-semibold" : ""
                            }`}
                          >
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => {
                                const nextData = table.map((r, ri) =>
                                  ri === rIdx
                                    ? r.map((c, ci) => (ci === cIdx ? e.target.value : c))
                                    : r
                                );
                                onUpdateTableData?.(item.id, nextData);
                              }}
                              placeholder={rIdx === 0 ? `Column ${cIdx + 1}` : ""}
                              className="w-full px-3 py-1.5 bg-transparent text-xs text-foreground outline-none placeholder:text-foreground/20"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const cols = table[0]?.length || 3;
                      const nextData = [...table, Array(cols).fill("")];
                      onUpdateTableData?.(item.id, nextData);
                    }}
                    className="px-2.5 py-1 rounded bg-foreground/5 hover:bg-foreground/10 text-foreground/70 font-medium transition cursor-pointer"
                  >
                    + Add Row
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextData = table.map((row) => [...row, ""]);
                      onUpdateTableData?.(item.id, nextData);
                    }}
                    className="px-2.5 py-1 rounded bg-[#2383e2]/10 hover:bg-[#2383e2]/20 text-[#2383e2] font-medium transition cursor-pointer"
                  >
                    + Add Column
                  </button>
                </div>
              </div>
            );
          })()}

        {/* Database Block (Multi-View) */}
        {item.type === "kanban" && (
          <ErrorBoundary
            fallbackTitle="Database Block Error"
            fallbackMessage="Could not render the database view."
          >
            <DatabaseBlock
              blockId={item.id}
              columns={item.kanbanColumns}
              onColumnsChange={(id, cols) => onUpdateKanbanColumns?.(id, cols)}
            />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}, areBlockPropsEqual);
