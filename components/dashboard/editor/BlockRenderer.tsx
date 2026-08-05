"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  GripVertical,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Volume2,
  Code as CodeIcon,
  Paperclip,
  Bookmark,
  Table as TableIcon,
  Smile,
} from "lucide-react";
import type { ChecklistItem } from "@/hooks/use-pages";

interface BlockRendererProps {
  items: ChecklistItem[];
  onToggleCheck: (id: string) => void;
  onUpdateText?: (id: string, text: string) => void;
  onOpenAi: () => void;
  onSelectSubPage: (title: string) => void;
}

export function BlockRenderer({
  items,
  onToggleCheck,
  onUpdateText,
  onOpenAi,
  onSelectSubPage,
}: BlockRendererProps) {
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});

  const toggleOpen = (id: string) => {
    setToggleStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-3.5 pt-1">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="group flex items-start gap-2 -ml-6 pl-1 rounded-lg hover:bg-accent/40 py-1 transition"
        >
          {/* Drag Handle Icon on Hover */}
          <div className="opacity-0 group-hover:opacity-100 transition text-muted-foreground cursor-grab pt-1 shrink-0 select-none">
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            {/* Paragraph / Text */}
            {(item.type === "paragraph" || !item.type) && (
              <div className="text-sm text-foreground leading-relaxed">
                {onUpdateText ? (
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => onUpdateText(item.id, e.target.value)}
                    className="w-full bg-transparent outline-none focus:bg-accent/30 rounded px-1 -mx-1 transition"
                  />
                ) : (
                  <span>{item.text}</span>
                )}
              </div>
            )}

            {/* Headings */}
            {item.type === "heading1" && (
              <div className="pt-2">
                {onUpdateText ? (
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => onUpdateText(item.id, e.target.value)}
                    className="w-full text-2xl sm:text-3xl font-bold text-foreground bg-transparent outline-none focus:bg-accent/30 rounded px-1 -mx-1 transition"
                    placeholder="Heading 1"
                  />
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{item.text}</h1>
                )}
              </div>
            )}

            {item.type === "heading2" && (
              <div className="pt-1.5">
                {onUpdateText ? (
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => onUpdateText(item.id, e.target.value)}
                    className="w-full text-xl sm:text-2xl font-bold text-foreground bg-transparent outline-none focus:bg-accent/30 rounded px-1 -mx-1 transition"
                    placeholder="Heading 2"
                  />
                ) : (
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">{item.text}</h2>
                )}
              </div>
            )}

            {item.type === "heading3" && (
              <div className="pt-1">
                {onUpdateText ? (
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => onUpdateText(item.id, e.target.value)}
                    className="w-full text-lg font-semibold text-foreground bg-transparent outline-none focus:bg-accent/30 rounded px-1 -mx-1 transition"
                    placeholder="Heading 3"
                  />
                ) : (
                  <h3 className="text-lg font-semibold text-foreground">{item.text}</h3>
                )}
              </div>
            )}

            {(item.type === "heading4" || item.type === "heading") && (
              <div className="pt-1">
                {onUpdateText ? (
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => onUpdateText(item.id, e.target.value)}
                    className="w-full text-base font-semibold text-foreground bg-transparent outline-none focus:bg-accent/30 rounded px-1 -mx-1 transition"
                    placeholder="Heading 4"
                  />
                ) : (
                  <h4 className="text-base font-semibold text-foreground">{item.text}</h4>
                )}
              </div>
            )}

            {/* Lists */}
            {item.type === "bullet" && (
              <div className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-muted-foreground font-bold select-none">•</span>
                {onUpdateText ? (
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => onUpdateText(item.id, e.target.value)}
                    className="flex-1 bg-transparent outline-none focus:bg-accent/30 rounded px-1 -mx-1 transition"
                  />
                ) : (
                  <span>{item.text}</span>
                )}
              </div>
            )}

            {item.type === "numbered" && (
              <div className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-muted-foreground font-medium select-none text-xs pt-0.5">
                  {index + 1}.
                </span>
                {onUpdateText ? (
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => onUpdateText(item.id, e.target.value)}
                    className="flex-1 bg-transparent outline-none focus:bg-accent/30 rounded px-1 -mx-1 transition"
                  />
                ) : (
                  <span>{item.text}</span>
                )}
              </div>
            )}

            {/* To-Do List */}
            {item.type === "todo" && (
              <div className="flex items-start gap-3 text-sm text-foreground leading-relaxed">
                <button
                  type="button"
                  onClick={() => onToggleCheck(item.id)}
                  className={`mt-0.5 h-4 w-4 rounded border transition flex items-center justify-center shrink-0 ${
                    item.checked
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border bg-transparent hover:border-muted-foreground"
                  }`}
                  aria-label="Toggle checkbox"
                >
                  {item.checked && <Check className="h-3 w-3 stroke-[2.5]" />}
                </button>

                {onUpdateText ? (
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => onUpdateText(item.id, e.target.value)}
                    className={`flex-1 bg-transparent outline-none focus:bg-accent/30 rounded px-1 -mx-1 transition ${
                      item.checked ? "line-through text-muted-foreground" : ""
                    }`}
                  />
                ) : (
                  <span
                    className={`flex-1 ${
                      item.checked ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {item.hasAiSparkle ? (
                      <>
                        Tap anywhere and select{" "}
                        <button
                          onClick={onOpenAi}
                          className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-medium hover:underline mx-0.5"
                        >
                          <Sparkles className="h-3.5 w-3.5 inline fill-purple-500/20" />
                        </button>{" "}
                        in the bar above your keyboard to check out{" "}
                        <button
                          onClick={onOpenAi}
                          className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                        >
                          Notion AI
                        </button>
                      </>
                    ) : (
                      item.text
                    )}
                  </span>
                )}
              </div>
            )}

            {/* Toggle List */}
            {item.type === "toggle" && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <button
                    type="button"
                    onClick={() => toggleOpen(item.id)}
                    className="p-0.5 rounded hover:bg-accent text-muted-foreground transition"
                  >
                    {toggleStates[item.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {onUpdateText ? (
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => onUpdateText(item.id, e.target.value)}
                      className="flex-1 bg-transparent outline-none focus:bg-accent/30 rounded px-1 transition font-medium"
                      placeholder="Toggle title..."
                    />
                  ) : (
                    <span className="font-medium">{item.text}</span>
                  )}
                </div>
                {toggleStates[item.id] && (
                  <div className="pl-6 border-l-2 border-border/40 text-xs text-muted-foreground py-1">
                    Empty toggle. Write or drag blocks here...
                  </div>
                )}
              </div>
            )}

            {/* Quote */}
            {item.type === "quote" && (
              <div className="border-l-3 border-primary pl-3 py-1 text-sm text-muted-foreground italic bg-accent/20 rounded-r-lg">
                {onUpdateText ? (
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => onUpdateText(item.id, e.target.value)}
                    className="w-full bg-transparent outline-none font-sans not-italic text-foreground"
                    placeholder="Empty quote"
                  />
                ) : (
                  <span>{item.text}</span>
                )}
              </div>
            )}

            {/* Callout */}
            {item.type === "callout" && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/40 border border-border/60 text-sm text-foreground">
                <span className="text-lg select-none">💡</span>
                {onUpdateText ? (
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => onUpdateText(item.id, e.target.value)}
                    className="flex-1 bg-transparent outline-none focus:bg-accent/50 rounded px-1 transition"
                    placeholder="Type a callout message..."
                  />
                ) : (
                  <span className="flex-1">{item.text}</span>
                )}
              </div>
            )}

            {/* Divider */}
            {item.type === "divider" && (
              <div className="py-2">
                <hr className="border-t border-border" />
              </div>
            )}

            {/* Page & Link to Page */}
            {(item.type === "page" || item.type === "link_to_page") && (
              <button
                type="button"
                onClick={() => onSelectSubPage(item.text || "Untitled Page")}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-card hover:bg-accent border border-border text-xs font-medium text-foreground transition shadow-sm text-left group"
              >
                {item.type === "link_to_page" ? (
                  <LinkIcon className="h-4 w-4 text-blue-500 shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground" />
                )}
                <span className="underline underline-offset-2 decoration-neutral-400 dark:decoration-[#555] group-hover:decoration-foreground">
                  {item.text || "Untitled Page"}
                </span>
              </button>
            )}

            {/* Table */}
            {item.type === "table" && (
              <div className="p-3 rounded-xl bg-card border border-border space-y-2 overflow-x-auto">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <TableIcon className="h-3.5 w-3.5 text-cyan-500" /> Table
                </div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-2 text-left bg-muted/40 font-medium">Header 1</th>
                      <th className="p-2 text-left bg-muted/40 font-medium">Header 2</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="p-2">Row 1, Cell 1</td>
                      <td className="p-2">Row 1, Cell 2</td>
                    </tr>
                    <tr>
                      <td className="p-2">Row 2, Cell 1</td>
                      <td className="p-2">Row 2, Cell 2</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Media: Image */}
            {item.type === "image" && (
              <div className="p-4 rounded-xl bg-accent/20 border border-dashed border-border space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
                  <ImageIcon className="h-4 w-4 text-indigo-500" />
                  <span>{item.text || "Add an image"}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text"
                    placeholder="Paste image URL..."
                    value={item.url || ""}
                    onChange={(e) =>
                      onUpdateText && onUpdateText(item.id, item.text)
                    }
                    className="max-w-xs text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-primary"
                  />
                  <button className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                    Embed
                  </button>
                </div>
              </div>
            )}

            {/* Media: Video */}
            {item.type === "video" && (
              <div className="p-4 rounded-xl bg-accent/20 border border-dashed border-border space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
                  <VideoIcon className="h-4 w-4 text-red-500" />
                  <span>{item.text || "Embed video link"}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text"
                    placeholder="YouTube or Vimeo URL..."
                    className="max-w-xs text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border outline-none focus:border-primary"
                  />
                  <button className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                    Embed
                  </button>
                </div>
              </div>
            )}

            {/* Media: Audio */}
            {item.type === "audio" && (
              <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                  <Volume2 className="h-4 w-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-semibold">{item.text || "Audio block"}</div>
                  <div className="text-muted-foreground text-[10px]">No audio file attached</div>
                </div>
                <button className="px-2.5 py-1 rounded-md bg-accent hover:bg-accent/80 text-[11px] font-medium">
                  Upload
                </button>
              </div>
            )}

            {/* Media: Code */}
            {item.type === "code" && (
              <div className="rounded-xl bg-neutral-900 text-neutral-100 p-3 font-mono text-xs space-y-2 border border-neutral-800">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-1 text-[10px] text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <CodeIcon className="h-3 w-3 text-emerald-400" />
                    <span>TypeScript</span>
                  </div>
                  <span>Copy</span>
                </div>
                {onUpdateText ? (
                  <textarea
                    rows={3}
                    value={item.text}
                    onChange={(e) => onUpdateText(item.id, e.target.value)}
                    className="w-full bg-transparent outline-none font-mono text-xs resize-none text-emerald-300"
                    placeholder="// Write or paste code here..."
                  />
                ) : (
                  <pre className="text-emerald-300 overflow-x-auto">{item.text}</pre>
                )}
              </div>
            )}

            {/* Media: File */}
            {item.type === "file" && (
              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{item.text || "Attached File"}</div>
                    <div className="text-[10px] text-muted-foreground">Click to upload or drag file</div>
                  </div>
                </div>
                <button className="px-2.5 py-1 rounded-lg border border-border hover:bg-accent text-[11px]">
                  Choose file
                </button>
              </div>
            )}

            {/* Media: Web Bookmark */}
            {item.type === "web_bookmark" && (
              <div className="p-3 rounded-xl bg-card hover:bg-accent/50 border border-border flex items-center justify-between text-xs transition cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Bookmark className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="font-semibold">{item.text || "Web Bookmark"}</div>
                    <div className="text-[10px] text-muted-foreground truncate max-w-xs">
                      https://notion.so
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub page link if present */}
            {item.hasSubPage && (
              <div className="pl-7 pt-0.5">
                <button
                  onClick={() => onSelectSubPage("Example sub page")}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card hover:bg-accent border border-border hover:border-border/80 text-xs font-medium text-foreground transition group/sub shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground group-hover/sub:text-foreground transition" />
                  <span className="underline underline-offset-2 decoration-neutral-400 dark:decoration-[#555] group-hover/sub:decoration-foreground">
                    Example sub page
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

