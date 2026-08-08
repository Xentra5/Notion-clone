"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { Check, Copy, ChevronDown, MoreHorizontal, Sparkles } from "lucide-react";

const LANGUAGES = [
  { value: "abap", label: "ABAP" },
  { value: "arduino", label: "Arduino" },
  { value: "bash", label: "Bash" },
  { value: "basic", label: "BASIC" },
  { value: "c", label: "C" },
  { value: "clojure", label: "Clojure" },
  { value: "coffeescript", label: "CoffeeScript" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "css", label: "CSS" },
  { value: "dart", label: "Dart" },
  { value: "diff", label: "Diff" },
  { value: "docker", label: "Docker" },
  { value: "elixir", label: "Elixir" },
  { value: "elm", label: "Elm" },
  { value: "erlang", label: "Erlang" },
  { value: "flow", label: "Flow" },
  { value: "fortran", label: "Fortran" },
  { value: "fsharp", label: "F#" },
  { value: "gherkin", label: "Gherkin" },
  { value: "glsl", label: "GLSL" },
  { value: "go", label: "Go" },
  { value: "graphql", label: "GraphQL" },
  { value: "groovy", label: "Groovy" },
  { value: "haskell", label: "Haskell" },
  { value: "html", label: "HTML" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
  { value: "julia", label: "Julia" },
  { value: "kotlin", label: "Kotlin" },
  { value: "latex", label: "LaTeX" },
  { value: "less", label: "Less" },
  { value: "lisp", label: "Lisp" },
  { value: "livescript", label: "LiveScript" },
  { value: "lua", label: "Lua" },
  { value: "makefile", label: "Makefile" },
  { value: "markdown", label: "Markdown" },
  { value: "markup", label: "Markup" },
  { value: "matlab", label: "MATLAB" },
  { value: "mermaid", label: "Mermaid" },
  { value: "nix", label: "Nix" },
  { value: "objectivec", label: "Objective-C" },
  { value: "ocaml", label: "OCaml" },
  { value: "pascal", label: "Pascal" },
  { value: "perl", label: "Perl" },
  { value: "php", label: "PHP" },
  { value: "plaintext", label: "Plain Text" },
  { value: "powershell", label: "PowerShell" },
  { value: "prolog", label: "Prolog" },
  { value: "protobuf", label: "Protobuf" },
  { value: "python", label: "Python" },
  { value: "r", label: "R" },
  { value: "reason", label: "Reason" },
  { value: "ruby", label: "Ruby" },
  { value: "rust", label: "Rust" },
  { value: "sass", label: "Sass" },
  { value: "scala", label: "Scala" },
  { value: "scss", label: "SCSS" },
  { value: "shell", label: "Shell" },
  { value: "sql", label: "SQL" },
  { value: "swift", label: "Swift" },
  { value: "toml", label: "TOML" },
  { value: "typescript", label: "TypeScript" },
  { value: "vbnet", label: "VB.Net" },
  { value: "verilog", label: "Verilog" },
  { value: "vhdl", label: "VHDL" },
  { value: "vim", label: "Vim Script" },
  { value: "wasm", label: "WebAssembly" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
];

interface CodeBlockProps {
  id: string;
  code: string;
  language: string;
  onChangeCode: (id: string, code: string) => void;
  onChangeLang: (id: string, lang: string) => void;
  onExitToNewBlock?: () => void;
  isFocused?: boolean;
  onFocus?: () => void;
}

export function CodeBlock({
  id,
  code,
  language,
  onChangeCode,
  onChangeLang,
  onExitToNewBlock,
  isFocused,
  onFocus,
}: CodeBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");

  // Auto-grow textarea
  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [code, adjustHeight]);

  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus();
      setIsEditing(true);
    }
  }, [isFocused]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = textareaRef.current!;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        // Support shift+tab to unindent
        if (e.shiftKey) {
          const lineStart = code.lastIndexOf("\n", start - 1) + 1;
          if (code.slice(lineStart, lineStart + 2) === "  ") {
            const newVal = code.slice(0, lineStart) + code.slice(lineStart + 2);
            onChangeCode(id, newVal);
            requestAnimationFrame(() => {
              ta.selectionStart = ta.selectionEnd = Math.max(start - 2, lineStart);
            });
          }
        } else {
          const newVal = code.slice(0, start) + "  " + code.slice(end);
          onChangeCode(id, newVal);
          requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + 2;
          });
        }
        return;
      }
      if (e.key === "Enter" && code.trim() === "") {
        e.preventDefault();
        onExitToNewBlock?.();
        return;
      }
    },
    [code, id, onChangeCode, onExitToNewBlock]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChangeCode(id, e.target.value);
      adjustHeight();
    },
    [id, onChangeCode, adjustHeight]
  );

  const selectedLang = LANGUAGES.find((l) => l.value === language) ?? { value: "plaintext", label: "Plain Text" };
  const lineCount = code ? code.split("\n").length : 1;
  const filteredLangs = langSearch
    ? LANGUAGES.filter((l) => l.label.toLowerCase().includes(langSearch.toLowerCase()))
    : LANGUAGES;

  return (
    <div
      className="relative my-1 rounded-md overflow-visible"
      style={{ isolation: "isolate" }}
    >
      {/* ── Controls pinned top-right (always visible) ── */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setLangMenuOpen((v) => !v); setLangSearch(""); }}
            className="flex items-center gap-1 text-[12px] text-[#9b9a97] hover:text-[#37352f] dark:hover:text-[#e0dfdc] hover:bg-[#e9e9e7] dark:hover:bg-[#37352f] px-1.5 py-0.5 rounded transition-colors select-none"
          >
            {selectedLang.label}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>

          {/* Language dropdown */}
          {langMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 bg-white dark:bg-[#2f2f2f] border border-[#e9e9e7] dark:border-[#434343] rounded-lg shadow-2xl overflow-hidden">
                {/* Search */}
                <div className="px-2 pt-2 pb-1 border-b border-[#e9e9e7] dark:border-[#434343]">
                  <input
                    autoFocus
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    placeholder="Filter languages..."
                    className="w-full text-[12px] bg-[#f7f7f5] dark:bg-[#3d3d3d] text-[#37352f] dark:text-[#e0dfdc] placeholder:text-[#9b9a97] rounded px-2 py-1 outline-none"
                  />
                </div>
                <div className="overflow-y-auto max-h-48 py-1">
                  {filteredLangs.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => { onChangeLang(id, lang.value); setLangMenuOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors ${
                        lang.value === language
                          ? "text-[#2383e2] bg-[#eff8ff] dark:bg-[#2383e2]/10"
                          : "text-[#37352f] dark:text-[#e0dfdc] hover:bg-[#f7f7f5] dark:hover:bg-[#3d3d3d]"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                  {filteredLangs.length === 0 && (
                    <div className="px-3 py-2 text-[12px] text-[#9b9a97]">No languages found</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          title="Copy code"
          className="p-1 rounded text-[#9b9a97] hover:text-[#37352f] dark:hover:text-[#e0dfdc] hover:bg-[#e9e9e7] dark:hover:bg-[#37352f] transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>

        {/* More (···) menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMoreMenuOpen((v) => !v)}
            title="More options"
            className="p-1 rounded text-[#9b9a97] hover:text-[#37352f] dark:hover:text-[#e0dfdc] hover:bg-[#e9e9e7] dark:hover:bg-[#37352f] transition-colors"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          {moreMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMoreMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-44 bg-white dark:bg-[#2f2f2f] border border-[#e9e9e7] dark:border-[#434343] rounded-lg shadow-xl py-1 overflow-hidden">
                <button
                  type="button"
                  onClick={() => { handleCopy(); setMoreMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[12px] text-[#37352f] dark:text-[#e0dfdc] hover:bg-[#f7f7f5] dark:hover:bg-[#3d3d3d] transition-colors"
                >
                  Copy to clipboard
                </button>
                <button
                  type="button"
                  onClick={() => { onChangeCode(id, ""); setMoreMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  Clear content
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Code editing area ── */}
      <div
        className={`relative rounded-md overflow-hidden transition-colors ${
          isEditing
            ? "bg-[#f7f7f5] dark:bg-[#282828]"
            : "bg-[#f7f7f5] dark:bg-[#282828]"
        }`}
      >
        {/* Syntax highlight layer (pointer-events: none, absolute behind textarea) */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          aria-hidden
        >
          <SyntaxHighlighter
            language={language || "plaintext"}
            style={atomOneDark}
            showLineNumbers={false}
            customStyle={{
              margin: 0,
              padding: "30px 16px 16px 16px",
              background: "transparent",
              fontSize: "14px",
              lineHeight: "1.6",
              fontFamily: "'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace",
              minHeight: "52px",
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
            wrapLongLines
          >
            {code || " "}
          </SyntaxHighlighter>
        </div>

        {/* Editable textarea (transparent text, visible caret) */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { setIsEditing(true); onFocus?.(); }}
          onBlur={() => setIsEditing(false)}
          spellCheck={false}
          placeholder="// Write or paste code…"
          rows={Math.max(lineCount, 2)}
          className="relative z-10 w-full bg-transparent text-transparent caret-[#37352f] dark:caret-[#e0dfdc] outline-none resize-none font-mono block"
          style={{
            fontFamily: "'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace",
            fontSize: "14px",
            lineHeight: "1.6",
            padding: "30px 16px 16px 16px", // top padding for the controls overlay
            minHeight: "52px",
            overflow: "hidden",
            caretColor: isEditing ? undefined : "transparent",
          }}
        />

        {/* "Use AI" badge – shows when focused and code is empty-ish */}
        {isEditing && !code.trim() && (
          <div className="absolute left-4 top-[52px] z-20 pointer-events-none animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#3d3d3d] border border-[#e9e9e7] dark:border-[#555] rounded-full px-2.5 py-1 shadow-sm">
              <Sparkles className="h-3 w-3 text-emerald-500" />
              <span className="text-[11px] font-medium text-[#37352f] dark:text-[#e0dfdc]">Use AI</span>
            </div>
          </div>
        )}
      </div>

      {/* Subtle focus ring around the whole block */}
      {isEditing && (
        <div className="absolute inset-0 rounded-md ring-1 ring-[#2383e2]/30 pointer-events-none" />
      )}
    </div>
  );
}
