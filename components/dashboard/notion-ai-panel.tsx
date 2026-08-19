"use client";

import { useEffect, useState } from "react";
import {
  MoreHorizontal,
  ChevronDown,
  MessageSquarePlus,
  PanelRightClose,
  Sparkles,
  X,
  Plus,
  SlidersHorizontal,
  Mic,
  ArrowUp,
  FileText,
  Bot,
  User as UserIcon,
  Columns2,
  Lock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { PricingModal } from "./pricing-modal";

interface NotionAiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPageTitle: string;
  currentPageId?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: { pageId: string; title: string }[];
  source?: string;
  action?: "append_block";
  content?: string;
  timestamp?: string;
}

function createMessageId(role: "user" | "assistant"): string {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface SlashCmdItem {
  cmd: string;
  label: string;
  desc: string;
  icon: string;
  badgeClass: string;
}

const AI_SLASH_COMMANDS: SlashCmdItem[] = [
  {
    cmd: "/summary",
    label: "Summarize Page",
    desc: "AI summary of the current page (or full workspace)",
    icon: "📝",
    badgeClass: "bg-purple-600 text-white",
  },
  {
    cmd: "/search ",
    label: "Search Web (LangChain)",
    desc: "Live web search via DuckDuckGo tool",
    icon: "🌐",
    badgeClass: "bg-blue-600 text-white",
  },
  {
    cmd: "/write ",
    label: "Write to Active Page",
    desc: "Agentic action: append blocks directly to current note",
    icon: "✍️",
    badgeClass: "bg-emerald-600 text-white",
  },
  {
    cmd: "/code ",
    label: "Generate Code Block",
    desc: "Generate sandboxed code snippet",
    icon: "💻",
    badgeClass: "bg-orange-500 text-white",
  },
  {
    cmd: "/kanban",
    label: "Generate Kanban Board",
    desc: "Create interactive database Kanban board",
    icon: "🗄️",
    badgeClass: "bg-indigo-600 text-white",
  },
  {
    cmd: "/table",
    label: "Generate Matrix Table",
    desc: "Create dynamic data table",
    icon: "📊",
    badgeClass: "bg-rose-600 text-white",
  },
];

function ChatMessageText({
  text,
  onInsert,
}: {
  text: string;
  onInsert?: (content: string, type?: string) => void;
}) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [insertedIdx, setInsertedIdx] = useState<number | null>(null);

  if (!text) return null;

  const rawBlocks = text.split("```");
  if (rawBlocks.length <= 1) {
    return (
      <div className="space-y-2">
        <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
        {onInsert && text.length > 20 && (
          <div className="flex items-center gap-1.5 pt-1 text-[11px] border-t border-border/40 mt-1">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(text);
                setCopiedIdx(-1);
                setTimeout(() => setCopiedIdx(null), 2000);
              }}
              className="px-2 py-0.5 rounded bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition text-[10px] font-medium"
            >
              {copiedIdx === -1 ? "✓ Copied" : "📋 Copy"}
            </button>
            <button
              type="button"
              onClick={() => {
                onInsert(text, "callout");
                setInsertedIdx(-1);
                setTimeout(() => setInsertedIdx(null), 2000);
              }}
              className="px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-semibold transition"
            >
              {insertedIdx === -1 ? "✓ Added to Page!" : "+ Insert to Page"}
            </button>
          </div>
        )}
      </div>
    );
  }

  const parts: { type: "text" | "code"; content: string; lang?: string }[] = [];

  for (let i = 0; i < rawBlocks.length; i++) {
    const raw = rawBlocks[i];
    if (i % 2 === 0) {
      if (raw) {
        parts.push({ type: "text", content: raw });
      }
    } else {
      const firstLineEnd = raw.search(/[\r\n]/);
      let lang = "code";
      let codeContent = raw;
      if (firstLineEnd !== -1) {
        const potentialLang = raw.slice(0, firstLineEnd).trim();
        if (potentialLang && !potentialLang.includes(" ") && potentialLang.length < 20) {
          lang = potentialLang;
          codeContent = raw.slice(firstLineEnd).trim();
        }
      }
      parts.push({ type: "code", lang, content: codeContent.trim() });
    }
  }

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleInsert = (code: string, lang: string, idx: number) => {
    if (onInsert) {
      onInsert(code, "code");
    } else {
      window.dispatchEvent(
        new CustomEvent("ai-append-block", {
          detail: { text: code, type: "code", language: lang },
        })
      );
    }
    setInsertedIdx(idx);
    setTimeout(() => setInsertedIdx(null), 2000);
  };

  return (
    <div className="space-y-2.5">
      {parts.map((p, idx) => {
        if (p.type === "text") {
          return <div key={idx} className="whitespace-pre-wrap leading-relaxed">{p.content}</div>;
        }
        return (
          <div key={idx} className="my-2.5 rounded-xl bg-[#121214] border border-emerald-500/30 overflow-hidden shadow-xl text-xs font-mono">
            <div className="px-3.5 py-2 bg-[#1c1c1f] border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>💻</span>
                <span>{p.lang || "code"}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopy(p.content, idx)}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition text-[10px] font-sans font-medium active:scale-95"
                >
                  {copiedIdx === idx ? "✓ Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => handleInsert(p.content, p.lang || "code", idx)}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition text-[10px] font-sans flex items-center gap-1 active:scale-95 shadow-sm"
                >
                  {insertedIdx === idx ? "✓ Added to Page!" : "+ Insert to Page"}
                </button>
              </div>
            </div>
            <pre className="p-3.5 overflow-x-auto text-[11px] leading-relaxed text-emerald-300 font-mono select-text bg-[#09090b]">
              <code>{p.content}</code>
            </pre>
          </div>
        );
      })}
    </div>
  );
}

export function NotionAiPanel({
  isOpen,
  onClose,
  currentPageTitle,
  currentPageId,
}: NotionAiPanelProps) {
  const { data: session, update } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [writeAction, setWriteAction] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [contextTag, setContextTag] = useState<string | null>(currentPageTitle);
  const [modelMode, setModelMode] = useState("Auto");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const plan = session?.user?.plan || "free";
  const aiUsageCount = session?.user?.aiUsageCount || 0;
  const isLimitReached = plan === "free" && aiUsageCount >= 3;
  const [isListening, setIsListening] = useState(false);
  const [selectedSlashIdx, setSelectedSlashIdx] = useState(0);
  const [selectedCommand, setSelectedCommand] = useState<SlashCmdItem | null>(null);

  const showSlashMenu = input.startsWith("/") && !selectedCommand;
  const slashFiltered = showSlashMenu
    ? AI_SLASH_COMMANDS.filter((c) => {
        const query = input.toLowerCase().trim();
        const cmdName = c.cmd.toLowerCase().trim();
        const labelName = c.label.toLowerCase().trim();
        const descName = c.desc.toLowerCase().trim();
        if (cmdName === "/summary") {
          return (
            query.startsWith("/sum") ||
            query.startsWith("/summ") ||
            query.startsWith("/sume") ||
            query.startsWith("/summar") ||
            labelName.includes(query.slice(1)) ||
            descName.includes(query.slice(1))
          );
        }
        return (
          cmdName.includes(query) ||
          labelName.includes(query.slice(1)) ||
          descName.includes(query.slice(1))
        );
      })
    : [];

  const isSummaryInput = (text: string) => {
    const clean = text.trim().toLowerCase();
    return (
      clean === "/summary" ||
      clean === "/summery" ||
      clean === "/summarize" ||
      clean.startsWith("/summary ") ||
      clean.startsWith("/summery ") ||
      clean.startsWith("/summarize ") ||
      clean === "summarize" ||
      clean === "summarize this page" ||
      clean === "summarize page" ||
      clean === "summary"
    );
  };

  const activeCommand =
    selectedCommand ||
    AI_SLASH_COMMANDS.find((command) => {
      const cleanInput = input.trimStart().toLowerCase();
      if (command.cmd.trim() === "/summary") {
        return isSummaryInput(cleanInput);
      }
      return cleanInput.startsWith(command.cmd.trim().toLowerCase());
    });

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetch(`/api/ai/chat?pageId=${encodeURIComponent(currentPageId || "workspace")}`)
      .then((response) => response.ok ? response.json() : { messages: [] })
      .then((data) => {
        if (!cancelled) setMessages(Array.isArray(data.messages) ? data.messages : []);
      })
      .catch(() => { if (!cancelled) setMessages([]); });
    return () => { cancelled = true; };
  }, [isOpen, currentPageId]);

  // Listen for trigger-ai-command / open-ai-summary events from Editor or keyboard shortcuts
  useEffect(() => {
    const handleTriggerAi = (e: Event) => {
      const detail = (e as CustomEvent<{ prompt?: string }>).detail;
      const prompt = detail?.prompt || "/summary";
      handleSend(prompt);
    };
    window.addEventListener("trigger-ai-command", handleTriggerAi);
    window.addEventListener("open-ai-summary", handleTriggerAi);
    return () => {
      window.removeEventListener("trigger-ai-command", handleTriggerAi);
      window.removeEventListener("open-ai-summary", handleTriggerAi);
    };
  }, [currentPageId, currentPageTitle, isLimitReached]);

  async function saveChat(nextMessages: ChatMessage[]) {
    await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId: currentPageId || "workspace", messages: nextMessages }),
    });
  }

  function toggleVoiceInput() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  if (!isOpen) return null;

  function selectSlashCommand(c: SlashCmdItem) {
    setSelectedCommand(c);
    let cleanInput = input;
    const cmdPrefix = c.cmd.trim();
    if (cleanInput.toLowerCase().startsWith(cmdPrefix.toLowerCase())) {
      cleanInput = cleanInput.slice(cmdPrefix.length).trimStart();
    } else if (cleanInput.startsWith("/")) {
      cleanInput = cleanInput.replace(/^\/[a-zA-Z0-9_-]+\s*/, "");
    }
    setInput(cleanInput);

    if (cmdPrefix === "/summary" || cmdPrefix === "/kanban" || cmdPrefix === "/table") {
      if (!cleanInput) {
        handleSend(c.cmd, c);
      }
    }
  }

  async function handleSend(promptText?: string, explicitCmd?: SlashCmdItem | null) {
    const cmdToUse = explicitCmd !== undefined ? explicitCmd : activeCommand;
    const rawText = (promptText || input).trim();

    let textToSend = rawText;
    if (cmdToUse) {
      const prefix = cmdToUse.cmd.trim();
      if (!rawText.toLowerCase().startsWith(prefix.toLowerCase())) {
        textToSend = rawText ? `${prefix} ${rawText}` : prefix;
      }
    }

    if (!textToSend) return;

    if (isLimitReached) {
      setShowPricing(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: createMessageId("user"),
      role: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setWriteAction(null);
    setInput("");
    setSelectedCommand(null);
    setIsGenerating(true);

    // Extract live page context from active editor state
    let livePageContent = "";
    let livePageTitle = currentPageTitle;
    if (typeof window !== "undefined") {
      const activeCtx = (window as any).__ACTIVE_PAGE_CONTEXT__;
      if (activeCtx) {
        if (activeCtx.content) livePageContent = activeCtx.content;
        if (activeCtx.title) livePageTitle = activeCtx.title;
      }
      if (!livePageContent) {
        const domEl = document.getElementById("editor-page-container");
        if (domEl) {
          livePageContent = domEl.innerText?.trim() || "";
        }
      }
    }

    try {
      const response = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "incrementAiUsage" }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (errData.limitReached) {
          await update();
          setShowPricing(true);
          setIsGenerating(false);
          return;
        }
      }

      // NOTE: We intentionally do NOT call `update()` here on every message.
      // Calling useSession().update() triggers a full session refresh that
      // re-renders the entire app (Layout, Sidebar, TopBar, Editor).
      // The usage count is already incremented server-side; the session is
      // only refreshed when the limit is actually reached (above).
      const ragRes = await fetch("/api/ai/rag-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: textToSend,
          pageId: currentPageId,
          pageTitle: livePageTitle || currentPageTitle,
          pageContent: livePageContent,
          history: messages.map(({ role, text }) => ({ role, text })),
        }),
      });

      const data = await ragRes.json().catch(() => ({}));
      if (!ragRes.ok) {
        throw new Error(data.error || `AI request failed (${ragRes.status})`);
      }

      const answerText = data.answer || "I processed your request.";
      const assistantMsg: ChatMessage = {
        id: createMessageId("assistant"),
        role: "assistant",
        text: answerText,
        citations: data.citations || [],
        source: data.source,
      };
      // Use functional updater to avoid stale closure over `messages`
      let savedMessages: ChatMessage[] = [];
      setMessages((prev) => {
        savedMessages = [...prev, assistantMsg];
        return savedMessages;
      });
      await saveChat(savedMessages);

      // Append block to active page ONLY when server explicitly instructs it
      // (slash commands: /code, /write, /kanban, /table, /search)
      if (data.action === "append_block" && data.content) {
        const blockType = data.blockType || "paragraph";
        setWriteAction(`✅ Added to ${currentPageTitle}`);
        window.dispatchEvent(
          new CustomEvent("ai-append-block", {
            detail: {
              text: data.content,
              type: blockType,
              ...(data.language ? { language: data.language } : {}),
            },
          })
        );
      }
    } catch (e) {
      console.error("AI panel send error:", e);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "Sorry, I ran into an error processing your query. Please try again.",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleNewChat() {
    setMessages([]);
    setWriteAction(null);
    setInput("");
    setSelectedCommand(null);
    void saveChat([]);
  }

  return (
    <aside className="w-full sm:w-[380px] lg:w-[420px] bg-sidebar border-l border-sidebar-border flex flex-col h-full text-foreground select-none font-sans shrink-0 animate-in slide-in-from-right duration-200">
      {/* Top Header Bar */}
      <div className="h-11 border-b border-sidebar-border px-3 flex items-center justify-between text-xs text-muted-foreground shrink-0 bg-sidebar">
        {/* Left: Options & AI Chat Selector */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleNewChat()}
            className="p-1 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
            title="Options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          <button
            onClick={() => handleNewChat()}
            className="flex items-center gap-1 font-semibold text-foreground px-1.5 py-0.5 rounded hover:bg-sidebar-accent transition"
          >
            <span>New AI chat</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition text-muted-foreground"
            title="New AI Chat"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition text-muted-foreground"
            title="Split view"
          >
            <Columns2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition text-muted-foreground"
            title="Collapse AI panel"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar flex flex-col justify-between">
        {messages.length === 0 && !writeAction ? (
          /* Initial Empty State matching Screenshot 2 */
          <div className="space-y-6 pt-4 animate-in fade-in duration-300">
            {/* Notion Hand-Drawn Sketch Face Avatar */}
            <div className="h-16 w-16 rounded-full bg-card border border-border flex items-center justify-center shadow-lg">
              <NotionSketchFace />
            </div>

            {/* Main Greeting */}
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              How can I help you today?
            </h2>

            {/* Quick Action Prompt List */}
            <div className="space-y-2.5 pt-1 text-sm font-medium text-foreground">
              {/* RAG Executive Summary */}
              <button
                onClick={() => handleSend("/summary")}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition text-left group border border-transparent hover:border-border"
              >
                <span className="text-base">📝</span>
                <span className="group-hover:text-foreground transition flex items-center gap-2">
                  Summarize this page
                  <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    /summary
                  </span>
                </span>
              </button>

              {/* Web Search */}
              <button
                onClick={() => setInput("/search ")}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition text-left group border border-transparent hover:border-border"
              >
                <span className="text-base">🌐</span>
                <span className="group-hover:text-foreground transition flex items-center gap-2">
                  Search Web
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    /search
                  </span>
                </span>
              </button>

              {/* Item 1 */}
              <button
                onClick={() => handleSend("Personalize your Notion AI")}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition text-left group border border-transparent hover:border-border"
              >
                <span className="text-base">🦆</span>
                <span className="group-hover:text-foreground transition">
                  Personalize your Notion AI
                </span>
              </button>

              {/* Item 2 */}
              <button
                onClick={() => handleSend("Create HTML template")}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition text-left group border border-transparent hover:border-border"
              >
                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition shrink-0" />
                <span className="group-hover:text-foreground transition">
                  Create HTML
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="space-y-4 pt-2">
            {writeAction && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 shadow-sm">
                <div className="flex items-center gap-2 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Written to {currentPageTitle}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-foreground/80">{writeAction}</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={msg.id ? `${msg.id}-${idx}` : `msg-${idx}`}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user"
                      ? "bg-[#0078df] text-white"
                      : "bg-card border border-border text-purple-500 dark:text-purple-400"
                  }`}
                >
                  {msg.role === "user" ? (
                    <UserIcon className="h-3.5 w-3.5" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="max-w-[85%] space-y-2">
                  <div
                    className={`rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#0078df] text-white font-medium"
                        : "bg-card border border-border text-foreground"
                    }`}
                  >
                    <ChatMessageText
                      text={msg.text}
                      onInsert={
                        msg.role === "assistant"
                          ? (content, type) => {
                              window.dispatchEvent(
                                new CustomEvent("ai-append-block", {
                                  detail: { text: content, type: type || "paragraph" },
                                })
                              );
                              setWriteAction(`✅ Added to ${currentPageTitle}`);
                            }
                          : undefined
                      }
                    />
                  </div>

                  {/* Render Clickable Citation Badges */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase">Sources:</span>
                      {msg.citations.map((cit) => (
                        <a
                          key={cit.pageId}
                          href={`/dashboard/${cit.pageId}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] font-semibold border border-purple-500/20 transition"
                        >
                          <span>📄</span>
                          <span>{cit.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-purple-500 dark:text-purple-400 pl-9 animate-pulse">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>Notion AI is processing...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Glowing Input Box (Exact Copy of Screenshot 2) */}
      <div className="p-4 bg-sidebar border-t border-sidebar-border relative">
        {/* Floating Slash Autocomplete Menu Popup */}
        {showSlashMenu && slashFiltered.length > 0 && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-popover/95 border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-150 backdrop-blur-md">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-accent/40 border-b border-border flex items-center justify-between">
              <span>Slash AI Commands</span>
              <span className="font-mono">Use ↑ ↓ or Click</span>
            </div>
            <div className="p-1.5 space-y-1 max-h-48 overflow-y-auto">
              {slashFiltered.map((c: SlashCmdItem, idx: number) => (
                <button
                  key={c.cmd}
                  type="button"
                  onClick={() => selectSlashCommand(c)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition text-left border ${
                    selectedSlashIdx === idx
                      ? "bg-emerald-500/10 border-emerald-500/40 text-foreground font-semibold shadow-sm"
                      : "border-transparent hover:bg-accent hover:border-border text-foreground font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{c.icon}</span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{c.label}</div>
                      <div className="text-[10px] opacity-70 truncate">{c.desc}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 font-mono text-[9px] px-2 py-1 rounded-full font-bold uppercase tracking-wider shrink-0 ml-2 shadow-sm ${c.badgeClass}`}>
                    {selectedSlashIdx === idx && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                    {c.cmd.trim()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative bg-background border-2 border-primary rounded-2xl p-3 shadow-2xl focus-within:ring-2 focus-within:ring-primary/40 transition-all">
          {/* Context Tag Pill */}
          {contextTag && (
            <div className="mb-2 inline-flex items-center gap-1.5 bg-accent border border-border px-2.5 py-1 rounded-full text-xs text-foreground">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span className="truncate max-w-[200px] font-medium">
                {contextTag}
              </span>
              <button
                onClick={() => setContextTag(null)}
                className="p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-[#333] text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}

          {activeCommand && (
            <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${activeCommand.badgeClass}`}>
              <span>{activeCommand.icon}</span>
              <span>{activeCommand.cmd.trim()}</span>
              <span className="opacity-80 normal-case tracking-normal">{activeCommand.label}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCommand(null);
                  if (input.toLowerCase().startsWith(activeCommand.cmd.trim().toLowerCase())) {
                    setInput(input.slice(activeCommand.cmd.trim().length).trimStart());
                  }
                }}
                className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition cursor-pointer text-white/80 hover:text-white"
                title="Remove command badge"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Textarea Input */}
          <textarea
            rows={2}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setSelectedSlashIdx(0);
            }}
            onKeyDown={(e) => {
              if (showSlashMenu && slashFiltered.length > 0) {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSelectedSlashIdx((prev) => (prev + 1) % slashFiltered.length);
                  return;
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSelectedSlashIdx((prev) => (prev - 1 + slashFiltered.length) % slashFiltered.length);
                  return;
                }
                if (e.key === "Enter" || e.key === "Tab") {
                  e.preventDefault();
                  const targetCmd = slashFiltered[selectedSlashIdx] || slashFiltered[0];
                  if (targetCmd) {
                    selectSlashCommand(targetCmd);
                  }
                  return;
                }
              }

              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Do anything with AI..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
          />

          {/* Input Bottom Toolbar */}
          <div className="mt-2 flex items-center justify-between pt-1 border-t border-border/60">
            {/* Left Controls */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {showSlashMenu && slashFiltered.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready
                </span>
              )}
              <button
                onClick={() => setContextTag(currentPageTitle)}
                className="p-1 rounded-md hover:bg-accent hover:text-foreground transition"
                title="Add page context"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                className="p-1 rounded-md hover:bg-accent hover:text-foreground transition"
                title="AI parameters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Model Mode Pill */}
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-background border border-border rounded-md transition"
                >
                  {modelMode}
                </button>

                {showModelDropdown && (
                  <div className="absolute right-0 bottom-full mb-1 w-32 bg-popover border border-border rounded-lg shadow-xl p-1 z-50 text-xs text-popover-foreground">
                    <button
                      onClick={() => {
                        setModelMode("Auto");
                        setShowModelDropdown(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-accent text-foreground"
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => {
                        setModelMode("GPT-4o");
                        setShowModelDropdown(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-accent text-foreground"
                    >
                      GPT-4o
                    </button>
                    <button
                      onClick={() => {
                        setModelMode("Claude 3.5");
                        setShowModelDropdown(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-accent text-foreground"
                    >
                      Claude 3.5
                    </button>
                  </div>
                )}
              </div>

              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-1 rounded-md transition ${
                  isListening
                    ? "bg-red-500/20 text-red-500 animate-pulse"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
                title={isListening ? "Listening... (click to stop)" : "Voice input"}
              >
                <Mic className="h-4 w-4" />
              </button>

              {/* Send Button with Green Bot Badge */}
              <div className="relative">
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() && !activeCommand}
                  className="h-7 w-7 rounded-full bg-neutral-200 dark:bg-[#2a2a2a] hover:bg-primary dark:hover:bg-primary text-foreground dark:text-white flex items-center justify-center disabled:opacity-40 transition"
                  title="Send to Notion AI"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                {/* Green bot badge */}
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                  <Bot className="h-1.5 w-1.5 text-black" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Limit Reached Card / Overlay */}
        {isLimitReached && (
          <div className="absolute inset-x-0 bottom-0 top-11 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 z-10">
            <div className="p-3 bg-purple-950/60 border border-purple-800/40 text-purple-400 rounded-full mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Free Trial Limit Reached</h3>
            <p className="text-[11px] text-neutral-400 max-w-[280px] mb-6 leading-relaxed">
              You have sent {aiUsageCount}/3 free trial messages. Upgrade to the Pro plan for unlimited queries, priority support, and advanced AI models.
            </p>
            <button
              onClick={() => setShowPricing(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition shadow-lg shadow-purple-500/20 active:scale-95"
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
      />
    </aside>
  );
}

/* Iconic Notion Sketch Face SVG */
function NotionSketchFace() {
  return (
    <svg viewBox="0 0 100 100" className="h-10 w-10 text-foreground fill-none stroke-current stroke-[4]">
      {/* Head Outline */}
      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="4" fill="var(--card)" />
      {/* Left Eye */}
      <circle cx="36" cy="42" r="3" fill="currentColor" />
      {/* Right Eye */}
      <circle cx="64" cy="42" r="3" fill="currentColor" />
      {/* Eyebrows */}
      <path d="M30 34 Q36 30 42 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 35 Q64 30 70 34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Nose */}
      <path d="M50 42 L46 56 L54 56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Smile */}
      <path d="M38 66 Q50 76 62 66" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
