/**
 * Utility to strip raw AI block metadata, Python repr dicts, JSON block arrays,
 * and signature metadata, extracting ONLY clean, human-readable text.
 */
export function cleanAiText(raw: unknown): string {
  if (raw === null || raw === undefined) return "";

  // 1. If it's a native array of blocks or strings
  if (Array.isArray(raw)) {
    const parts = raw
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const rec = item as Record<string, unknown>;
          if (typeof rec.text === "string") return rec.text;
          if (typeof rec.content === "string") return rec.content;
          if (Array.isArray(rec.content)) return cleanAiText(rec.content);
        }
        return "";
      })
      .filter(Boolean);
    return parts.join("\n\n");
  }

  // 2. If it's a native object (e.g. { type: 'text', text: '...' })
  if (typeof raw === "object") {
    const rec = raw as Record<string, unknown>;
    if (typeof rec.text === "string") return rec.text;
    if (typeof rec.content === "string") return rec.content;
    if (Array.isArray(rec.content)) return cleanAiText(rec.content);
  }

  if (typeof raw !== "string") return String(raw);

  const str = raw.trim();

  // 3. If it's a JSON array or object string
  if ((str.startsWith("[") && str.endsWith("]")) || (str.startsWith("{") && str.endsWith("}"))) {
    try {
      const parsed = JSON.parse(str);
      const cleaned = cleanAiText(parsed);
      if (cleaned) return cleaned;
    } catch {
      // Fall through to regex-based extraction
    }
  }

  // 4. If it's a Python repr string containing [{'type': 'text', ...}] or 'extras': {'signature': ...}
  if (
    /['"]type['"]\s*:\s*['"]text['"]/.test(str) ||
    /['"]extras['"]\s*:\s*\{/.test(str) ||
    (str.startsWith("[{") && str.includes("'text':"))
  ) {
    const textMatches: string[] = [];
    // Match 'text': "..." or 'text': '...'
    const textRegex = /['"]text['"]\s*:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;
    let match: RegExpExecArray | null;
    while ((match = textRegex.exec(str)) !== null) {
      const val = match[1] !== undefined ? match[1] : match[2];
      if (val) {
        const unescaped = val
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
          .replace(/\\'/g, "'")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
        textMatches.push(unescaped);
      }
    }
    if (textMatches.length > 0) {
      return textMatches.join("\n\n");
    }
  }

  return raw;
}
