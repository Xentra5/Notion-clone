// Shared types and default data for page/block editing.
// Data-fetching helpers (getPage, createPage, etc.) live in lib/actions/pages.ts.

export interface ChecklistItem {
  id: string;
  type: "todo" | "heading" | "quote" | "bullet";
  text: string;
  checked?: boolean;
  hasSubPage?: boolean;
  hasAiSparkle?: boolean;
}

export const DEFAULT_ITEMS: ChecklistItem[] = [
  {
    id: "1",
    type: "todo",
    text: "Tap anywhere and start typing",
    checked: false,
  },
  {
    id: "2",
    type: "todo",
    text: "Tap the + above your keyboard to add content — headers, sub pages, etc.",
    checked: false,
    hasSubPage: true,
  },
  {
    id: "3",
    type: "todo",
    text: "Highlight text and use the bar above your keyboard to format",
    checked: false,
  },
  {
    id: "4",
    type: "todo",
    text: "Tap and hold this line, then drag",
    checked: false,
  },
  {
    id: "5",
    type: "todo",
    text: "Tap the home tab button at the bottom left to see your pages",
    checked: false,
  },
  {
    id: "6",
    type: "todo",
    text: "Tap anywhere and select ✨ in the bar above your keyboard to check out Notion AI",
    checked: false,
    hasAiSparkle: true,
  },
];
