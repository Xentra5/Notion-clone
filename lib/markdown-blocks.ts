import type { ChecklistItem, BlockType } from "@/hooks/use-pages";

export function generateBlockId(prefix = "block"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Strips AI chat prefix wrappers (e.g. 🌐 **Web Search: "..."**, ✍️ **Content...**)
 * so inserted page content is clean and formatted.
 */
export function cleanAiChatMarkdown(raw: string): string {
  if (!raw) return "";
  let clean = raw.trim();

  // Strip leading AI banners
  clean = clean.replace(/^🌐\s*\*\*Web Search:[^\n]*\*\*\s*(\n+|$)/i, "");
  clean = clean.replace(/^✍️\s*\*\*Content written[^\n]*\*\*\s*(\n+|$)/i, "");
  clean = clean.replace(/^✍️\s*\*\*Content ready[^\n]*\*\*\s*(\n+|$)/i, "");
  clean = clean.replace(/^📝\s*\*\*Page Summary:[^\n]*\*\*\s*(\n+|$)/i, "");
  clean = clean.replace(/^📝\s*\*\*Workspace[^\n]*\*\*\s*(\n+|$)/i, "");
  clean = clean.replace(/^📋\s*\*\*Action Items[^\n]*\*\*\s*(\n+|$)/i, "");
  clean = clean.replace(/^🗄️\s*\*\*Kanban Board[^\n]*\*\*\s*(\n+|$)/i, "");
  clean = clean.replace(/^📊\s*\*\*Matrix Table[^\n]*\*\*\s*(\n+|$)/i, "");

  // Strip trailing AI tips/disclaimers
  clean = clean.replace(/\n+\*\(Answered from general knowledge[^\n]*\)\*$/i, "");
  clean = clean.replace(/\n+💡\s*\*Tip:[^\n]*\*$/i, "");

  return clean.trim();
}

/**
 * Converts a raw markdown string into a structured array of Notion blocks.
 */
export function parseMarkdownToBlocks(
  markdown: string,
  defaultType?: BlockType,
  defaultLanguage?: string
): ChecklistItem[] {
  const cleaned = cleanAiChatMarkdown(markdown);
  if (!cleaned) return [];

  // Special cases if explicit type requested
  if (defaultType === "code") {
    return [
      {
        id: generateBlockId("code"),
        type: "code",
        text: cleaned,
        codeLanguage: defaultLanguage || "javascript",
      },
    ];
  }

  const lines = cleaned.split(/\r?\n/);
  const blocks: ChecklistItem[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "javascript";
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join(" ").trim();
      if (text) {
        blocks.push({
          id: generateBlockId("p"),
          type: "paragraph",
          text,
        });
      }
      paragraphBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // ── Code Block detection ─────────────────────────────────────────────────
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        blocks.push({
          id: generateBlockId("code"),
          type: "code",
          text: codeBuffer.join("\n"),
          codeLanguage: codeLang || "javascript",
        });
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = "javascript";
      } else {
        // Start code block
        flushParagraph();
        inCodeBlock = true;
        const matchLang = trimmed.slice(3).trim();
        codeLang = matchLang || defaultLanguage || "javascript";
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Empty line -> separates paragraphs
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    // ── Heading 1 (# Heading) ────────────────────────────────────────────────
    if (/^#\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push({
        id: generateBlockId("h1"),
        type: "heading1",
        text: trimmed.replace(/^#\s+/, "").trim(),
      });
      continue;
    }

    // ── Heading 2 (## Heading) ───────────────────────────────────────────────
    if (/^##\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push({
        id: generateBlockId("h2"),
        type: "heading2",
        text: trimmed.replace(/^##\s+/, "").trim(),
      });
      continue;
    }

    // ── Heading 3 (### Heading) ──────────────────────────────────────────────
    if (/^###\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push({
        id: generateBlockId("h3"),
        type: "heading3",
        text: trimmed.replace(/^###\s+/, "").trim(),
      });
      continue;
    }

    // ── Heading 4 (#### Heading) ─────────────────────────────────────────────
    if (/^####\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push({
        id: generateBlockId("h4"),
        type: "heading4",
        text: trimmed.replace(/^####\s+/, "").trim(),
      });
      continue;
    }

    // ── Divider (--- or *** or ___) ──────────────────────────────────────────
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      blocks.push({
        id: generateBlockId("div"),
        type: "divider",
        text: "",
      });
      continue;
    }

    // ── Todo checkbox (- [ ] or - [x]) ───────────────────────────────────────
    const todoMatch = /^(-|\*|\+)?\s*\[([ xX])\]\s+(.*)$/.exec(trimmed);
    if (todoMatch) {
      flushParagraph();
      const checked = todoMatch[2].toLowerCase() === "x";
      blocks.push({
        id: generateBlockId("todo"),
        type: "todo",
        text: todoMatch[3].trim(),
        checked,
      });
      continue;
    }

    // ── Bullet list (- item, * item, + item, • item) ─────────────────────────
    const bulletMatch = /^[-*+•]\s+(.*)$/.exec(trimmed);
    if (bulletMatch) {
      flushParagraph();
      blocks.push({
        id: generateBlockId("bullet"),
        type: "bullet",
        text: bulletMatch[1].trim(),
      });
      continue;
    }

    // ── Numbered list (1. item, 2. item) ─────────────────────────────────────
    const numMatch = /^\d+[\.\)]\s+(.*)$/.exec(trimmed);
    if (numMatch) {
      flushParagraph();
      blocks.push({
        id: generateBlockId("num"),
        type: "numbered",
        text: numMatch[1].trim(),
      });
      continue;
    }

    // ── Quote (> Quote) ──────────────────────────────────────────────────────
    if (/^>\s+/.test(trimmed)) {
      flushParagraph();
      const quoteText = trimmed.replace(/^>\s+/, "").trim();
      // If it's a markdown alert like > [!NOTE], make it a callout
      const alertMatch = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)/i.exec(quoteText);
      if (alertMatch) {
        const iconMap: Record<string, string> = {
          NOTE: "📌",
          TIP: "💡",
          IMPORTANT: "❗",
          WARNING: "⚠️",
          CAUTION: "🛑",
        };
        blocks.push({
          id: generateBlockId("callout"),
          type: "callout",
          text: alertMatch[2] || alertMatch[1],
          calloutIcon: iconMap[alertMatch[1].toUpperCase()] || "💡",
        });
      } else {
        blocks.push({
          id: generateBlockId("quote"),
          type: "quote",
          text: quoteText,
        });
      }
      continue;
    }

    // ── Callout with emoji start (💡 Callout) ────────────────────────────────
    if (/^💡\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push({
        id: generateBlockId("callout"),
        type: "callout",
        text: trimmed.replace(/^💡\s+/, "").trim(),
        calloutIcon: "💡",
      });
      continue;
    }

    // Default: regular paragraph line
    paragraphBuffer.push(trimmed);
  }

  // Flush any remaining code block or paragraph buffer
  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push({
      id: generateBlockId("code"),
      type: "code",
      text: codeBuffer.join("\n"),
      codeLanguage: codeLang || "javascript",
    });
  }
  flushParagraph();

  return blocks;
}
