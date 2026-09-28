"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import { Code2, Eye, RefreshCw, Copy, ChevronDown, Sparkles } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_DIAGRAM = `graph TD
    A[🚀 Start] --> B{Is it working?}
    B -->|Yes| C[🎉 Ship it!]
    B -->|No| D[🔍 Debug]
    D --> E[Fix the bug]
    E --> B`;

const TEMPLATES: Record<string, string> = {
  flowchart: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action A]
    B -->|No| D[Action B]
    C --> E[End]
    D --> E`,
  sequence: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob!
    Bob-->>Alice: Hi Alice!
    Alice->>Bob: How are you?
    Bob-->>Alice: I'm fine, thanks!`,
  er: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int id
        date created_at
    }`,
  gantt: `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Research        :a1, 2024-01-01, 7d
    Design          :a2, after a1, 5d
    section Development
    Frontend        :b1, after a2, 10d
    Backend         :b2, after a2, 10d
    section Launch
    Testing         :c1, after b1, 5d
    Deploy          :c2, after c1, 2d`,
  pie: `pie title Browser Share
    "Chrome" : 64.5
    "Safari" : 19.1
    "Firefox" : 3.6
    "Edge" : 4.2
    "Other" : 8.6`,
  mindmap: `mindmap
  root((Notion Clone))
    Features
      Editor
        Blocks
        AI Copilot
      Collaboration
        Real-time
        Comments
    Tech Stack
      Next.js
      MongoDB
      Gemini AI`,
};

interface MermaidBlockProps {
  code?: string;
  onUpdateCode?: (code: string) => void;
}

export function MermaidBlock({ code: initialCode, onUpdateCode }: MermaidBlockProps) {
  const [code, setCode] = useState(initialCode || DEFAULT_DIAGRAM);
  const [view, setView] = useState<"split" | "code" | "preview">("split");
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [isRendering, setIsRendering] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const diagramId = useRef(`mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`);

  const renderDiagram = useCallback(async (src: string) => {
    setIsRendering(true);
    setError(null);
    try {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
        securityLevel: "loose",
        fontFamily: "Inter, sans-serif",
      });
      const id = diagramId.current;
      const { svg } = await mermaid.render(id, src);
      setSvgContent(svg);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid diagram syntax";
      setError(message.replace(/^Error:\s*/i, "").split("\n")[0]);
      setSvgContent("");
    } finally {
      setIsRendering(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => renderDiagram(code), 400);
    return () => clearTimeout(timer);
  }, [code, renderDiagram]);

  const handleCodeChange = (val: string) => {
    setCode(val);
    onUpdateCode?.(val);
  };

  const handleTemplate = (key: string) => {
    handleCodeChange(TEMPLATES[key]);
    setShowTemplates(false);
  };

  const handleCopySvg = () => {
    if (svgContent) {
      navigator.clipboard.writeText(svgContent);
      toast.success("SVG copied to clipboard");
    }
  };

  return (
    <div className="my-3 rounded-2xl border border-foreground/10 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/80 dark:bg-[#111]/80 backdrop-blur-sm border-b border-foreground/[0.07]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <span className="text-[13px] font-semibold text-foreground/80">Mermaid Diagram</span>
          {isRendering && <RefreshCw className="h-3.5 w-3.5 text-foreground/40 animate-spin" />}
          {error && <span className="text-xs text-red-500 font-medium truncate max-w-[200px]">⚠ {error}</span>}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Template picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1 text-xs font-medium text-foreground/50 hover:text-foreground px-2 py-1 rounded-lg hover:bg-foreground/[0.06] transition-all"
            >
              Templates <ChevronDown className="h-3 w-3" />
            </button>
            {showTemplates && (
              <div className="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-[#1c1c1c] border border-foreground/10 rounded-xl shadow-xl overflow-hidden">
                {Object.keys(TEMPLATES).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTemplate(key)}
                    className="w-full text-left px-3 py-2 text-xs text-foreground/70 hover:bg-foreground/[0.05] hover:text-foreground capitalize transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggles */}
          <div className="flex rounded-lg overflow-hidden border border-foreground/10">
            {(["code", "split", "preview"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  view === v
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/40 hover:text-foreground hover:bg-foreground/[0.04]"
                }`}
              >
                {v === "code" ? <Code2 className="h-3.5 w-3.5" /> : v === "preview" ? <Eye className="h-3.5 w-3.5" /> : "Split"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopySvg}
            title="Copy SVG"
            className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/[0.06] transition-all"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex" style={{ minHeight: 280 }}>
        {/* Code editor */}
        {(view === "code" || view === "split") && (
          <div className={`${view === "split" ? "w-1/2 border-r border-foreground/[0.07]" : "w-full"} bg-[#0d0d0d] relative`}>
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              spellCheck={false}
              className="w-full h-full min-h-[280px] p-4 bg-transparent font-mono text-[13px] text-[#cdd6f4] resize-none outline-none leading-relaxed"
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
              placeholder="Enter Mermaid diagram code..."
            />
          </div>
        )}

        {/* Preview */}
        {(view === "preview" || view === "split") && (
          <div
            className={`${view === "split" ? "w-1/2" : "w-full"} flex items-center justify-center p-6 bg-white dark:bg-[#141414] overflow-auto`}
            ref={previewRef}
          >
            {error ? (
              <div className="text-center text-red-500/70 text-sm max-w-xs">
                <div className="text-2xl mb-2">⚠️</div>
                <div className="font-medium text-xs">{error}</div>
                <div className="text-xs text-foreground/30 mt-1">Fix the diagram syntax in the editor</div>
              </div>
            ) : svgContent ? (
              <div
                dangerouslySetInnerHTML={{ __html: svgContent }}
                className="max-w-full [&_svg]:max-w-full [&_svg]:h-auto"
              />
            ) : (
              <div className="text-foreground/20 text-sm flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Rendering...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
