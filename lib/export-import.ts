export interface BlockItem {
  id: string;
  type: string;
  properties?: {
    title?: string;
    text?: string;
    checked?: boolean;
    language?: string;
  };
  content?: string[];
  parent?: string;
}

export function blocksToMarkdown(title: string, blocks: BlockItem[]): string {
  let md = `# ${title || "Untitled"}\n\n`;

  if (!blocks || !Array.isArray(blocks)) return md;

  for (const block of blocks) {
    const text = block.properties?.text || block.properties?.title || "";
    const type = block.type || "paragraph";

    switch (type) {
      case "heading_1":
      case "heading1":
      case "h1":
        md += `# ${text}\n\n`;
        break;
      case "heading_2":
      case "heading2":
      case "h2":
        md += `## ${text}\n\n`;
        break;
      case "heading_3":
      case "heading3":
      case "h3":
        md += `### ${text}\n\n`;
        break;
      case "bulleted_list_item":
      case "bullet":
      case "bulleted-list":
        md += `- ${text}\n`;
        break;
      case "numbered_list_item":
      case "numbered":
        md += `1. ${text}\n`;
        break;
      case "to_do":
      case "todo":
        md += `- [${block.properties?.checked ? "x" : " "}] ${text}\n`;
        break;
      case "code":
        md += `\`\`\`${block.properties?.language || ""}\n${text}\n\`\`\`\n\n`;
        break;
      case "quote":
        md += `> ${text}\n\n`;
        break;
      case "callout":
        md += `> 💡 ${text}\n\n`;
        break;
      default:
        if (text.trim()) {
          md += `${text}\n\n`;
        }
        break;
    }
  }

  return md;
}

export function markdownToBlocks(markdown: string): { title: string; blocks: BlockItem[] } {
  const lines = markdown.split(/\r?\n/);
  let title = "Imported Document";
  const blocks: BlockItem[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";

  lines.forEach((line, index) => {
    // Handle code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        blocks.push({
          id: `imported-code-${Date.now()}-${index}`,
          type: "code",
          properties: {
            text: codeBuffer.join("\n"),
            language: codeLang,
          },
        });
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = "";
      } else {
        inCodeBlock = true;
        codeLang = line.replace("```", "").trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    const trimmed = line.trim();
    if (!trimmed) return;

    // First H1 as document title if not set
    if (index === 0 && trimmed.startsWith("# ")) {
      title = trimmed.replace(/^#\s+/, "").trim();
      return;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push({
        id: `imported-${Date.now()}-${index}`,
        type: "heading_1",
        properties: { text: trimmed.replace(/^#\s+/, "") },
      });
    } else if (trimmed.startsWith("## ")) {
      blocks.push({
        id: `imported-${Date.now()}-${index}`,
        type: "heading_2",
        properties: { text: trimmed.replace(/^##\s+/, "") },
      });
    } else if (trimmed.startsWith("### ")) {
      blocks.push({
        id: `imported-${Date.now()}-${index}`,
        type: "heading_3",
        properties: { text: trimmed.replace(/^###\s+/, "") },
      });
    } else if (trimmed.startsWith("- [ ] ") || trimmed.startsWith("- [x] ")) {
      const checked = trimmed.startsWith("- [x] ");
      blocks.push({
        id: `imported-${Date.now()}-${index}`,
        type: "to_do",
        properties: {
          text: trimmed.replace(/^- \[[ x]\]\s+/, ""),
          checked,
        },
      });
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push({
        id: `imported-${Date.now()}-${index}`,
        type: "bulleted_list_item",
        properties: { text: trimmed.replace(/^[-*]\s+/, "") },
      });
    } else if (trimmed.startsWith("> ")) {
      blocks.push({
        id: `imported-${Date.now()}-${index}`,
        type: "quote",
        properties: { text: trimmed.replace(/^>\s+/, "") },
      });
    } else {
      blocks.push({
        id: `imported-${Date.now()}-${index}`,
        type: "paragraph",
        properties: { text: trimmed },
      });
    }
  });

  return { title, blocks };
}

export function downloadMarkdownFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".md") ? filename : `${filename}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPdfPrint(title: string, blocks: BlockItem[]) {
  const mdContent = blocksToMarkdown(title, blocks);
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title || "Document"}</title>
        <style>
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
          h1 { font-size: 28px; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          h2 { font-size: 22px; margin-top: 24px; }
          h3 { font-size: 18px; margin-top: 18px; }
          pre { background: #f4f4f5; padding: 12px; border-radius: 6px; font-family: monospace; }
          blockquote { border-left: 4px solid #0078df; padding-left: 12px; color: #555; margin: 16px 0; }
        </style>
      </head>
      <body>
        <pre style="white-space: pre-wrap; font-family: inherit;">${mdContent}</pre>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
