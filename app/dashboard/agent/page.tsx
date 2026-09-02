"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Calendar,
  FileText,
  Search,
  Globe,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  ArrowUpRight,
  Lock,
  Crown,
  Copy,
  Check,
  Cpu,
  Terminal,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatedBotLogo, BotCharacterState } from "@/components/dashboard/animated-bot-logo";

const PricingModal = dynamic(
  () => import("@/components/dashboard/pricing-modal").then((m) => m.PricingModal),
  { ssr: false }
);

interface ToolCall {
  tool: string;
  input: string;
  output: string;
}

interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  toolCalls?: ToolCall[];
  isLoading?: boolean;
  timestamp: Date;
  mode?: "fast" | "think" | "deepsearch";
}

interface StarterAction {
  id: string;
  category: string;
  icon: any;
  title: string;
  prompt: string;
  description: string;
}

const STARTER_ACTIONS: StarterAction[] = [
  {
    id: "calendar-standup",
    category: "Calendar",
    icon: Calendar,
    title: "Schedule team standup",
    prompt: "Schedule a team standup tomorrow at 10am with meeting notes",
    description: "Creates calendar invite & links a new agenda note",
  },
  {
    id: "workspace-search",
    category: "Workspace RAG",
    icon: Search,
    title: "Search workspace notes",
    prompt: "Search my workspace notes for React performance tips",
    description: "Semantic search across all your private documents",
  },
  {
    id: "page-roadmap",
    category: "Page Builder",
    icon: FileText,
    title: "Draft Q4 product roadmap",
    prompt: "Create a new page for my Q4 product roadmap with milestones and key deliverables",
    description: "Generates structured project specs and task tables",
  },
  {
    id: "web-research",
    category: "Web Research",
    icon: Globe,
    title: "Research Next.js 15 updates",
    prompt: "Search the web for Next.js 15 features, breaking changes and best practices",
    description: "Synthesizes real-time documentation with citations",
  },
];

const QUICK_CHIPS = [
  { label: "📅 Schedule meeting", text: "Schedule a meeting with the team tomorrow at 2pm" },
  { label: "🔍 Search notes", text: "Search my notes for recent project updates" },
  { label: "📝 New doc", text: "Create a project planning page with action items" },
  { label: "🌐 Web search", text: "Search the web for the latest updates on AI agents" },
];

const TOOL_META: Record<string, { label: string; icon: any }> = {
  create_calendar_event: { label: "Calendar Event Created", icon: Calendar },
  list_calendar_events:  { label: "Calendar Events Queried", icon: Calendar },
  create_page:           { label: "Workspace Page Created", icon: FileText },
  list_pages:            { label: "Workspace Pages Queried", icon: FileText },
  search_workspace:      { label: "Workspace Notes Searched", icon: Search },
  web_search:            { label: "Live Web Search Executed", icon: Globe },
};

function msgId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Grok-style Minimal Slash Brandmark */
function GrokMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="5" y1="19" x2="19" y2="5" />
      <line x1="10" y1="19" x2="19" y2="10" />
    </svg>
  );
}

/** Grok-style Tool Execution / DeepSearch reasoning trace */
function ToolCallTrace({ toolCalls }: { toolCalls: ToolCall[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="my-2.5 rounded-xl border border-white/15 bg-black/50 overflow-hidden text-xs">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-zinc-950/80 hover:bg-zinc-900 transition text-left"
      >
        <div className="flex items-center gap-2 text-zinc-200">
          <Terminal className="h-4 w-4 text-zinc-300" />
          <span className="text-xs font-semibold tracking-wide text-zinc-100">
            Action Trace ({toolCalls.length} tool{toolCalls.length > 1 ? "s" : ""})
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-300">
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            COMPLETED
          </span>
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="p-3 space-y-2.5 border-t border-white/15 bg-zinc-950">
          {toolCalls.map((tc, idx) => {
            const meta = TOOL_META[tc.tool] || { label: tc.tool, icon: Cpu };
            const Icon = meta.icon;
            return (
              <div key={idx} className="rounded-lg border border-white/10 bg-zinc-900/80 p-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-zinc-200">
                  <Icon className="h-4 w-4 text-zinc-300 shrink-0" />
                  <span className="font-semibold text-white">{meta.label}</span>
                  <span className="text-zinc-300 ml-auto font-mono text-xs">{tc.tool}</span>
                </div>
                {tc.output && (
                  <div className="bg-black/70 rounded p-2.5 text-zinc-200 whitespace-pre-wrap leading-relaxed border border-white/10 font-mono text-xs">
                    {tc.output}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Assistant Markdown message formatter with large, clear, high-contrast typography */
function FormattedAssistantText({ text }: { text: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const rawBlocks = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-[15px] sm:text-[16px] leading-[1.75] text-zinc-100 font-normal">
      {rawBlocks.map((block, idx) => {
        if (block.startsWith("```") && block.endsWith("```")) {
          const lines = block.slice(3, -3).trim().split("\n");
          const firstLine = lines[0].trim();
          const hasLang = !firstLine.includes(" ") && firstLine.length < 15;
          const lang = hasLang ? firstLine : "text";
          const code = hasLang ? lines.slice(1).join("\n") : lines.join("\n");

          return (
            <div key={idx} className="my-3.5 rounded-xl border border-white/15 bg-zinc-950 overflow-hidden font-mono text-xs sm:text-sm">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-white/10 text-zinc-300 text-xs">
                <span>{lang || "code"}</span>
                <button
                  onClick={() => copyCode(code, idx)}
                  className="flex items-center gap-1.5 hover:text-white transition"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-zinc-200 leading-relaxed font-mono">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        const lines = block.split(/\r?\n/);
        return (
          <div key={idx} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-2" />;

              if (/^#{1,3}\s/.test(trimmed)) {
                const headingText = trimmed.replace(/^#+\s/, "");
                return (
                  <h3 key={lIdx} className="text-white font-bold text-base sm:text-lg mt-4 mb-1 border-b border-white/10 pb-1.5">
                    {headingText}
                  </h3>
                );
              }

              if (/^[-*•]\s/.test(trimmed)) {
                return (
                  <div key={lIdx} className="flex gap-3 items-start pl-1">
                    <span className="text-zinc-300 font-bold text-lg leading-tight shrink-0 mt-0.5">•</span>
                    <span className="flex-1 text-[15px] sm:text-[16px] text-zinc-100 leading-relaxed font-normal">
                      {renderInline(trimmed.replace(/^[-*•]\s/, ""))}
                    </span>
                  </div>
                );
              }

              if (/^\d+\.\s/.test(trimmed)) {
                const num = trimmed.match(/^(\d+\.)/)?.[1];
                return (
                  <div key={lIdx} className="flex gap-2.5 items-start pl-1">
                    <span className="text-white font-bold text-[15px] sm:text-[16px] shrink-0 mt-0.5 font-sans">
                      {num}
                    </span>
                    <span className="flex-1 text-[15px] sm:text-[16px] text-zinc-100 leading-relaxed font-normal">
                      {renderInline(trimmed.replace(/^\d+\.\s/, ""))}
                    </span>
                  </div>
                );
              }

              return (
                <p key={lIdx} className="text-[15px] sm:text-[16px] text-zinc-100 leading-relaxed font-normal">
                  {renderInline(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function renderInline(str: string): React.ReactNode {
  const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="bg-zinc-800 text-zinc-100 px-2 py-0.5 rounded text-sm font-mono border border-white/10">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function AssistantMessage({ msg }: { msg: AgentMessage }) {
  const [copied, setCopied] = useState(false);
  const isErrorMsg =
    msg.text.toLowerCase().includes("connection error") ||
    msg.text.toLowerCase().includes("failed to fetch") ||
    msg.text.toLowerCase().includes("error.");

  const copyFull = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    toast.success("Response copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex gap-3.5 py-2 max-w-4xl mx-auto w-full">
      <div className="shrink-0 mt-0.5">
        <AnimatedBotLogo
          size="sm"
          state={isErrorMsg ? "error" : "idle"}
          showStatusBadge={true}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold text-white tracking-tight">Project HR</span>
          {msg.mode && (
            <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-white/15 border border-white/20 text-zinc-100 font-bold">
              {msg.mode}
            </span>
          )}
          <span className="text-xs text-zinc-300 font-sans font-medium ml-auto">
            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Action / Tool Execution Trace */}
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <ToolCallTrace toolCalls={msg.toolCalls} />
        )}

        {/* Content Body */}
        <FormattedAssistantText text={msg.text} />

        {/* Action bar */}
        <div className="flex items-center gap-2 mt-2.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={copyFull}
            className="flex items-center gap-1.5 text-xs text-zinc-200 hover:text-white transition px-3 py-1 rounded-md bg-zinc-900 border border-white/15 hover:bg-zinc-800 font-medium shadow-xs"
            title="Copy response"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-300" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function UserMessage({ msg }: { msg: AgentMessage }) {
  return (
    <div className="flex justify-end py-2 max-w-4xl mx-auto w-full">
      <div className="max-w-[80%] bg-zinc-800/95 border border-white/20 rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-md">
        <p className="text-[15px] sm:text-[16px] text-white leading-relaxed select-text font-normal">{msg.text}</p>
        <p className="text-zinc-300 font-sans text-xs mt-1.5 text-right font-medium">
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

function HRThinking({ mode = "fast" }: { mode?: "fast" | "think" | "deepsearch" }) {
  const isDeep = mode === "deepsearch";
  return (
    <div className="flex gap-3.5 py-3 max-w-4xl mx-auto w-full">
      <div className="shrink-0 mt-0.5">
        <AnimatedBotLogo
          size="sm"
          state={isDeep ? "deepsearch" : "thinking"}
          showStatusBadge={true}
        />
      </div>
      <div className="flex items-center gap-2.5 py-1">
        <div
          className={`h-2.5 w-2.5 rounded-full animate-ping ${
            isDeep ? "bg-purple-400" : "bg-cyan-400"
          }`}
        />
        <span className="text-sm text-zinc-200 font-sans tracking-wide font-medium">
          {isDeep
            ? "Project HR is deep-scanning workspace & live web tools..."
            : mode === "think"
            ? "Project HR is reasoning step-by-step..."
            : "Project HR is executing tools & synthesizing..."}
        </span>
      </div>
    </div>
  );
}

export default function AgentPage() {
  const { data: session, update } = useSession();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [activeMode, setActiveMode] = useState<"fast" | "think" | "deepsearch">("fast");
  const [liveUsage, setLiveUsage] = useState<{ plan: string; aiUsageCount: number } | null>(null);
  const [hasError, setHasError] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isTyping = input.trim().length > 0 && !isLoading;
  const botState: BotCharacterState = hasError
    ? "error"
    : isLoading
    ? activeMode === "deepsearch"
      ? "deepsearch"
      : activeMode === "think"
      ? "thinking"
      : "fast"
    : isTyping
    ? "typing"
    : activeMode === "deepsearch"
    ? "deepsearch"
    : activeMode === "think"
    ? "thinking"
    : "idle";

  const plan = liveUsage?.plan ?? session?.user?.plan ?? "free";
  const aiUsageCount = liveUsage?.aiUsageCount ?? session?.user?.aiUsageCount ?? 0;
  const FREE_LIMIT = 3;
  const isLimitReached = plan === "free" && aiUsageCount >= FREE_LIMIT;
  const remainingFree = Math.max(0, FREE_LIMIT - aiUsageCount);

  // Sync actual usage from database on mount
  const refreshUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/user/plan");
      if (res.ok) {
        const data = await res.json();
        setLiveUsage({ plan: data.plan || "free", aiUsageCount: data.aiUsageCount || 0 });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    if (hasError) setHasError(false);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  }

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      if (isLimitReached) {
        setHasError(true);
        setShowPricing(true);
        return;
      }

      const userMsg: AgentMessage = {
        id: msgId(),
        role: "user",
        text: trimmed,
        timestamp: new Date(),
        mode: activeMode,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
      setHasError(false);

      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      try {
        const planRes = await fetch("/api/user/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "incrementAiUsage" }),
        });

        if (!planRes.ok) {
          const planData = await planRes.json().catch(() => ({}));
          if (planData.limitReached) {
            setLiveUsage({ plan: planData.plan || "free", aiUsageCount: planData.aiUsageCount || 3 });
            await update();
            setHasError(true);
            setShowPricing(true);
            setIsLoading(false);
            return;
          }
        } else {
          const planData = await planRes.json().catch(() => ({}));
          if (typeof planData.aiUsageCount === "number") {
            setLiveUsage({ plan: planData.plan || plan, aiUsageCount: planData.aiUsageCount });
          }
        }

        // Augment prompt context if DeepSearch or Think mode is toggled
        let queryMessage = trimmed;
        if (activeMode === "deepsearch") {
          queryMessage = `[Mode: DeepSearch - Perform comprehensive search across workspace notes and web tools] ${trimmed}`;
        } else if (activeMode === "think") {
          queryMessage = `[Mode: Extended Reasoning - Think step-by-step] ${trimmed}`;
        }

        const res = await fetch("/api/ai/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: queryMessage,
            history: messages.slice(-10).map(({ role, text }) => ({ role, text })),
          }),
        });

        const data = await res.json().catch(() => ({}));
        const answer = data.answer || "Request processed.";

        const assistantMsg: AgentMessage = {
          id: msgId(),
          role: "assistant",
          text: answer,
          toolCalls: Array.isArray(data.toolCalls) ? data.toolCalls : [],
          timestamp: new Date(),
          mode: activeMode,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (
          (data.toolCalls ?? []).some(
            (tc: ToolCall) =>
              tc.tool === "create_page" || tc.tool === "create_calendar_event"
          )
        ) {
          window.dispatchEvent(new Event("page-updated"));
        }
      } catch {
        setHasError(true);
        setMessages((prev) => [
          ...prev,
          {
            id: msgId(),
            role: "assistant",
            text: "Connection error. Ensure the Python RAG agent service is running on port 8000.",
            timestamp: new Date(),
            mode: activeMode,
          },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [isLoading, isLimitReached, messages, update, activeMode]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function toggleVoice() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "en-US";
    r.onstart = () => setIsListening(true);
    r.onresult = (e: any) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setInput(t);
    };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    r.start();
  }

  const showWelcome = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-[#070709] text-zinc-100 overflow-hidden font-sans selection:bg-white/20 selection:text-white relative">
      {/* Subtle Linear / Vercel SaaS Background Grid & Ambient Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(120,119,198,0.08),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Pricing Paywall Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onUpgradeSuccess={async () => {
          await update();
          setShowPricing(false);
        }}
      />

      {/* Messages Thread or Project HR Welcome Hero */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-thin scrollbar-thumb-white/15 relative z-10">
        {showWelcome ? (
          <div className="flex flex-col items-center justify-center min-h-[460px] max-w-2xl mx-auto text-center py-6">
            {/* Middle Circular Bot Logo */}
            <div className="mb-4 relative group flex flex-col items-center justify-center">
              <AnimatedBotLogo size="lg" state={botState} showStatusBadge={true} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-heading">
              What would you like to do?
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-md leading-relaxed font-sans">
              Schedule meetings, draft workspace pages, or search private notes and live web research.
            </p>

            {/* Interactive Quick Action Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => {
                    setInput(chip.text);
                    inputRef.current?.focus();
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all duration-150 active:scale-95 shadow-xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* 4 Clean Interactive Action Cards */}
            <div className="w-full mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {STARTER_ACTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => sendMessage(item.prompt)}
                    className="flex items-start gap-3.5 p-4 rounded-2xl border border-white/10 hover:border-white/25 bg-zinc-900/60 hover:bg-zinc-800/80 transition-all duration-200 group relative text-left shadow-sm hover:shadow-md active:scale-[0.99]"
                  >
                    <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-white/20 shrink-0 transition-colors">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white group-hover:text-white transition-colors font-heading truncate">
                          {item.title}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 ml-1" />
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2 font-sans">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            {messages.map((msg) =>
              msg.role === "user" ? (
                <UserMessage key={msg.id} msg={msg} />
              ) : (
                <AssistantMessage key={msg.id} msg={msg} />
              )
            )}
            {isLoading && <HRThinking mode={activeMode} />}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* Project HR Floating Command Input Bar */}
      <div className="shrink-0 max-w-4xl mx-auto w-full px-4 pb-4 pt-1">
        {isLimitReached ? (
          <div className="rounded-2xl border border-white/15 bg-zinc-950 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-bold text-white">Free message limit reached (3/3)</p>
                <p className="text-sm text-zinc-300 mt-0.5">
                  Upgrade to Notion Pro for unlimited Project HR, calendar actions, and deep search.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    const r = await fetch("/api/user/plan", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "resetFreeUsage" }),
                    });
                    if (r.ok) {
                      const d = await r.json();
                      setLiveUsage({ plan: d.plan || "free", aiUsageCount: 0 });
                      await update();
                      toast.success("Free tier reset: 3 messages available!");
                    }
                  } catch {
                    toast.error("Failed to reset credits");
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-white/15 hover:bg-white/10 text-zinc-200 hover:text-white font-mono text-xs font-medium transition shrink-0"
                title="Reset 3 free trial messages"
              >
                Reset 3 Free
              </button>
              <button
                onClick={() => setShowPricing(true)}
                className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition active:scale-95 shrink-0"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/15 bg-[#0c0c10]/95 backdrop-blur-2xl shadow-2xl shadow-black/80 p-3.5 focus-within:border-white/35 focus-within:shadow-[0_0_30px_rgba(255,255,255,0.04)] transition-all">
            {/* Quick Context & Tool Insertion Action Chips - High Contrast */}
            <div className="flex items-center gap-2 mb-2.5 pb-2.5 border-b border-white/10 text-xs font-medium overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setInput((prev) => (prev ? `${prev} @workspace ` : "@workspace "));
                  inputRef.current?.focus();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 hover:text-white transition font-medium text-xs shadow-xs shrink-0"
                title="Include full workspace notes context"
              >
                <Search className="h-3 w-3 text-zinc-300" />
                <span>@workspace</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInput((prev) => (prev ? `${prev} /calendar ` : "/calendar "));
                  inputRef.current?.focus();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 hover:text-white transition font-medium text-xs shadow-xs shrink-0"
                title="Trigger calendar tool"
              >
                <Calendar className="h-3 w-3 text-zinc-300" />
                <span>/calendar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInput((prev) => (prev ? `${prev} /search ` : "/search "));
                  inputRef.current?.focus();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 hover:text-white transition font-medium text-xs shadow-xs shrink-0"
                title="Trigger live web search"
              >
                <Globe className="h-3 w-3 text-zinc-300" />
                <span>/search</span>
              </button>
            </div>

            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Project HR to search workspace, schedule meetings, or create pages..."
              rows={1}
              disabled={isLoading}
              className="w-full resize-none bg-transparent text-[15px] sm:text-[16px] text-white placeholder:text-zinc-400 outline-none leading-relaxed max-h-[180px] disabled:opacity-50 font-normal"
              style={{ minHeight: "32px" }}
            />

            <div className="flex items-center justify-between pt-2.5 border-t border-white/10 mt-2">
              {/* Quick mode chips inside prompt capsule */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveMode((curr) => (curr === "deepsearch" ? "fast" : "deepsearch"))
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeMode === "deepsearch"
                      ? "bg-white text-zinc-950 font-bold shadow-xs"
                      : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white"
                  }`}
                  title="Deep search queries workspace notes and web thoroughly"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>DeepSearch</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveMode((curr) => (curr === "think" ? "fast" : "think"))
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeMode === "think"
                      ? "bg-white text-zinc-950 font-bold shadow-xs"
                      : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white"
                  }`}
                  title="Reason step-by-step before answering"
                >
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Think</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isListening ? (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-200 border border-red-500/40 text-xs transition"
                    title="Click to stop listening"
                  >
                    <span className="flex items-center gap-0.5 h-3">
                      <span className="w-0.5 h-2 bg-red-400 animate-pulse" />
                      <span className="w-0.5 h-3.5 bg-red-400 animate-pulse delay-100" />
                      <span className="w-0.5 h-1.5 bg-red-400 animate-pulse delay-200" />
                    </span>
                    <span className="text-xs font-medium">Listening...</span>
                    <MicOff className="h-3.5 w-3.5 ml-0.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className="p-2 rounded-lg text-zinc-200 hover:text-white hover:bg-zinc-800 border border-zinc-700 bg-zinc-850 transition"
                    title="Dictate via voice"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="h-8 w-8 rounded-full bg-white hover:bg-zinc-200 text-black flex items-center justify-center transition disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 shadow-md"
                  title="Send (Enter)"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                  ) : (
                    <Send className="h-3.5 w-3.5 text-black ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs mt-3 px-3">
          <div className="flex items-center gap-2 text-zinc-200 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-600 text-white text-xs font-semibold shadow-xs">
                Enter
              </kbd>
              <span className="text-zinc-200 font-medium">to send</span>
            </span>
            <span className="text-zinc-500 font-bold">·</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-600 text-white text-xs font-semibold shadow-xs">
                Shift + Enter
              </kbd>
              <span className="text-zinc-200 font-medium">newline</span>
            </span>
          </div>

          {plan === "free" && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-100 font-semibold text-xs shadow-xs">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>{remainingFree} / {FREE_LIMIT} free prompts</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
