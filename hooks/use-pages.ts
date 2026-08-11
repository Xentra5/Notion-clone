// Shared types and default data for page/block editing.
// Data-fetching helpers (getPage, createPage, etc.) live in lib/actions/pages.ts.

export type BlockType =
  | "paragraph"
  | "heading"
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "bullet"
  | "numbered"
  | "todo"
  | "toggle"
  | "page"
  | "callout"
  | "quote"
  | "table"
  | "divider"
  | "link_to_page"
  | "image"
  | "video"
  | "audio"
  | "code"
  | "file"
  | "kanban"
  | "web_bookmark";

export interface ChecklistItem {
  id: string;
  type: BlockType;
  text: string;
  checked?: boolean;
  hasSubPage?: boolean;
  hasAiSparkle?: boolean;
  // Extended properties for media and special blocks
  url?: string;
  codeLanguage?: string;
  calloutIcon?: string;
  toggleOpen?: boolean;
  toggleChildren?: string;
  tableData?: string[][];
  subPageId?: string;
  fileSize?: string;
  fileName?: string;
  kanbanColumns?: KanbanColumn[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
}

export const DEFAULT_ITEMS: ChecklistItem[] = [];
