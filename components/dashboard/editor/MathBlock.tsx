"use client";

import { useState, useEffect, useRef } from "react";
import { Calculator, Copy, ChevronDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const EXAMPLES = [
  { label: "Quadratic formula", latex: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}" },
  { label: "Euler's identity", latex: "e^{i\\pi} + 1 = 0" },
  { label: "Maxwell's equations", latex: "\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}" },
  { label: "Schrödinger equation", latex: "i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi" },
  { label: "Normal distribution", latex: "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}" },
  { label: "Fourier transform", latex: "\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x)\\,e^{-2\\pi i x\\xi}\\,dx" },
  { label: "Taylor series", latex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n" },
  { label: "Pythagorean theorem", latex: "a^2 + b^2 = c^2" },
];

interface MathBlockProps {
  code?: string;
  onUpdateCode?: (code: string) => void;
  displayMode?: boolean;
}

export function MathBlock({ code: initialCode, onUpdateCode, displayMode = true }: MathBlockProps) {
  const [latex, setLatex] = useState(initialCode || "E = mc^2");
  const [isEditing, setIsEditing] = useState(!initialCode);
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const render = async () => {
      if (!outputRef.current) return;
      try {
        const katex = (await import("katex")).default;
        // Import KaTeX CSS dynamically
        if (!document.getElementById("katex-css")) {
          const link = document.createElement("link");
          link.id = "katex-css";
          link.rel = "stylesheet";
          link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css";
          document.head.appendChild(link);
        }
        katex.render(latex || " ", outputRef.current, {
          displayMode,
          throwOnError: true,
          errorColor: "#ef4444",
          strict: false,
        });
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "LaTeX syntax error";
        setError(message.replace(/^KaTeX parse error:\s*/i, "").split(" at position")[0]);
        if (outputRef.current) {
          outputRef.current.innerHTML = "";
        }
      }
    };
    const timer = setTimeout(render, 200);
    return () => clearTimeout(timer);
  }, [latex, displayMode]);

  const handleLatexChange = (val: string) => {
    setLatex(val);
    onUpdateCode?.(val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`$${displayMode ? "$" : ""}${latex}${displayMode ? "$$" : "$"}`);
    toast.success("LaTeX copied to clipboard");
  };

  return (
    <div
      className="my-2 group/math"
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {isEditing ? (
        <div className="rounded-2xl border border-violet-500/30 bg-white dark:bg-[#111] overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-foreground/[0.07] bg-violet-50/50 dark:bg-violet-950/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/15">
                <Calculator className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-[13px] font-semibold text-foreground/80">LaTeX Math</span>
              {error && (
                <span className="flex items-center gap-1 text-[11px] text-red-500">
                  <AlertTriangle className="h-3 w-3" /> {error}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* Examples */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowExamples(!showExamples); }}
                  className="flex items-center gap-1 text-xs text-foreground/50 hover:text-foreground px-2 py-1 rounded-lg hover:bg-foreground/[0.06] transition-all"
                >
                  Examples <ChevronDown className="h-3 w-3" />
                </button>
                {showExamples && (
                  <div className="absolute right-0 top-8 z-50 w-52 bg-white dark:bg-[#1c1c1c] border border-foreground/10 rounded-xl shadow-xl overflow-hidden">
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex.label}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleLatexChange(ex.latex); setShowExamples(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-foreground/[0.05] transition-colors"
                      >
                        <div className="text-xs font-medium text-foreground/80">{ex.label}</div>
                        <div className="text-[10px] font-mono text-foreground/40 truncate">{ex.latex}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); handleCopy(); }} title="Copy LaTeX" className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/[0.06] transition-all">
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
                className="px-2.5 py-1 text-xs font-semibold bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-all"
              >
                Done
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex gap-0">
            {/* LaTeX input */}
            <div className="flex-1 bg-[#0d0d0d] relative">
              <div className="absolute top-2 left-3 text-[10px] font-mono text-[#555] select-none">
                {displayMode ? "$$" : "$"}
              </div>
              <textarea
                value={latex}
                onChange={(e) => handleLatexChange(e.target.value)}
                spellCheck={false}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                rows={3}
                className="w-full pt-6 pb-3 pl-8 pr-3 bg-transparent font-mono text-[13px] text-[#cdd6f4] resize-none outline-none leading-relaxed"
                style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
                placeholder="Enter LaTeX here..."
              />
              <div className="absolute bottom-2 right-3 text-[10px] font-mono text-[#555] select-none">
                {displayMode ? "$$" : "$"}
              </div>
            </div>

            {/* Live preview */}
            <div
              className={`w-1/2 flex items-center justify-center p-6 bg-white dark:bg-[#141414] border-l border-foreground/[0.07] min-h-[80px] ${
                error ? "opacity-50" : ""
              }`}
            >
              {error ? (
                <span className="text-red-400/60 text-xs font-mono">Syntax error</span>
              ) : (
                <div ref={outputRef} className="[&_.katex]:text-foreground overflow-x-auto max-w-full" />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Display mode - click to edit */
        <div
          className="inline-flex items-center gap-2 cursor-pointer rounded-xl px-4 py-3 hover:bg-foreground/[0.03] transition-colors w-full justify-center group/display"
          title="Click to edit equation"
        >
          {error ? (
            <span className="text-red-400 text-sm font-mono italic">{latex}</span>
          ) : (
            <div ref={outputRef} className="[&_.katex]:text-foreground overflow-x-auto max-w-full" />
          )}
          <div className="opacity-0 group-hover/display:opacity-100 transition">
            <Calculator className="h-3.5 w-3.5 text-foreground/30" />
          </div>
        </div>
      )}
    </div>
  );
}
