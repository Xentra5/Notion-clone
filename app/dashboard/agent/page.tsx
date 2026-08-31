"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  Bot,
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
  Zap,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  ArrowRight,
  Lock,
  Crown,
} from "lucide-react";

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
}

const EXAMPLE_PROMPTS = [
  { icon: "🗓️", text: "Schedule a team standup tomorrow at 10am", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400/60" },
  { icon: "📄", text: "Create a new page for my Q4 roadmap", color: "from-purple-500/20 to-violet-500/20 border-purple-500/30 hover:border-purple-400/60" },
  { icon: "🔍", text: "Search my notes for React performance tips", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-400/60" },
  { icon: "📅", text: "What events do I have this week?", color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-400/60" },
  { icon: "🌐", text: "Search the web for Next.js 15 features", color: "from-rose-500/20 to-pink-500/20 border-rose-500/30 hover:border-rose-400/60" },
  { icon: "📋", text: "List all my workspace pages", color: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30 hover:border-indigo-400/60" },
];

const TOOL_META: Record<string, { icon: string; label: string; color: string }> = {
  create_calendar_event: { icon: "🗓️", label: "Creating calendar event", color: "text-blue-400" },
  list_calendar_events:  { icon: "📅", label: "Fetching calendar events", color: "text-cyan-400" },
  create_page:           { icon: "📄", label: "Creating page",          color: "text-purple-400" },
  list_pages:            { icon: "📋", label: "Listing pages",          color: "text-violet-400" },
  search_workspace:      { icon: "🔍", label: "Searching workspace",    color: "text-emerald-400" },
  web_search:            { icon: "🌐", label: "Searching the web",      color: "text-amber-400" },
};

function msgId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ToolCallBadge({ tc, index }: { tc: ToolCall; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TOOL_META[tc.tool] || { icon: "⚙️", label: tc.tool, color: "text-zinc-400" };
  return (
    <div className="mt-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] overflow-hidden text-[11px]">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.04] transition"
      >
        <span className="text-base">{meta.icon}</span>
        <span className={`font-semibold ${meta.color}`}>{meta.label}</span>
        <CheckCircle2 className="h-3 w-3 text-emerald-400 ml-auto shrink-0" />
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-zinc-500 shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 text-zinc-500 shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-2.5 space-y-1.5 border-t border-white/[0.05] pt-2">
          <div>
            <span className="text-zinc-500 uppercase tracking-wide text-[10px] font-semibold">Result</span>
            <p className="text-zinc-300 mt-0.5 leading-relaxed">{tc.output}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AssistantMessage({ msg }: { msg: AgentMessage }) {
  const lines = msg.text.split(/\r?\n/);
  return (
    <div className="group flex gap-3 py-1">
      <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 mt-0.5">
        <Bot className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-zinc-100 leading-relaxed space-y-1">
          {lines.map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2" />;
            if (/^#{1,3}\s/.test(trimmed)) {
              const text = trimmed.replace(/^#+\s/, "");
              return <p key={i} className="font-bold text-white text-sm mt-2">{text}</p>;
            }
            if (/^[-*•]\s/.test(trimmed)) {
              return (
                <div key={i} className="flex gap-2">
                  <span className="text-violet-400 mt-0.5 shrink-0">•</span>
                  <span>{trimmed.replace(/^[-*•]\s/, "")}</span>
                </div>
              );
            }
            if (/^\d+\.\s/.test(trimmed)) {
              return (
                <div key={i} className="flex gap-2">
                  <span className="text-violet-400 shrink-0 font-mono">{trimmed.match(/^(\d+\.)/)?.[1]}</span>
                  <span>{trimmed.replace(/^\d+\.\s/, "")}</span>
                </div>
              );
            }
            // Bold
            const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={i}>
                {parts.map((p, j) =>
                  p.startsWith("**") && p.endsWith("**") ? (
                    <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>
                  ) : p
                )}
              </p>
            );
          })}
        </div>
        {/* Tool calls breadcrumb */}
        {(msg.toolCalls ?? []).length > 0 && (
          <div className="mt-3 space-y-1">
            {(msg.toolCalls ?? []).map((tc, i) => (
              <ToolCallBadge key={i} tc={tc} index={i} />
            ))}
          </div>
        )}
        <p className="text-zinc-600 text-[10px] mt-2">
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

function UserMessage({ msg }: { msg: AgentMessage }) {
  return (
    <div className="flex gap-3 py-1 justify-end">
      <div className="max-w-[80%] bg-gradient-to-br from-violet-600/80 to-indigo-700/80 backdrop-blur border border-violet-500/30 rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-lg shadow-violet-900/20">
        <p className="text-xs text-white leading-relaxed">{msg.text}</p>
        <p className="text-violet-300/60 text-[10px] mt-1 text-right">
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-3 py-1">
      <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 mt-0.5">
        <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
      </div>
      <div className="flex items-center gap-1.5 py-2">
        <span className="text-xs text-zinc-400">Agent is working</span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full bg-violet-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const plan = session?.user?.plan || "free";
  const aiUsageCount = session?.user?.aiUsageCount || 0;
  const FREE_LIMIT = 3;
  const isLimitReached = plan === "free" && aiUsageCount >= FREE_LIMIT;
  const remainingFree = Math.max(0, FREE_LIMIT - aiUsageCount);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  }

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // ── Paywall: free users get 3 messages total across all AI features ─────
    if (isLimitReached) {
      setShowPricing(true);
      return;
    }

    const userMsg: AgentMessage = {
      id: msgId(),
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      // ── Increment usage counter (shared with AI panel) ───────────────────
      const planRes = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "incrementAiUsage" }),
      });
      if (!planRes.ok) {
        const planData = await planRes.json().catch(() => ({}));
        if (planData.limitReached) {
          await update(); // refresh session so aiUsageCount is current
          setShowPricing(true);
          setIsLoading(false);
          return;
        }
      }

      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-10).map(({ role, text }) => ({ role, text })),
        }),
      });

      const data = await res.json().catch(() => ({}));
      const answer = data.answer || "I ran into an issue. Please try again.";

      const assistantMsg: AgentMessage = {
        id: msgId(),
        role: "assistant",
        text: answer,
        toolCalls: Array.isArray(data.toolCalls) ? data.toolCalls : [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Notify workspace if a page was created / event added
      if ((data.toolCalls ?? []).some((tc: ToolCall) => tc.tool === "create_page" || tc.tool === "create_calendar_event")) {
        window.dispatchEvent(new Event("page-updated"));
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: msgId(),
          role: "assistant",
          text: "Sorry, something went wrong. Please check the Python RAG service is running.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, isLimitReached, messages, update]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function toggleVoice() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    if (isListening) { setIsListening(false); return; }
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
    <div className="flex flex-col h-full bg-[#0a0a0b] text-white overflow-hidden">
      {/* Pricing Paywall Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onUpgradeSuccess={async () => { await update(); setShowPricing(false); }}
      />

      {/* Header */}
      <div className="shrink-0 border-b border-white/[0.06] bg-[#0d0d0f]/80 backdrop-blur px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Notion AI Agent</h1>
            <p className="text-[11px] text-zinc-500">Powered by Gemini + LangChain · 6 tools available</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Free usage counter badge */}
            {plan === "free" && !isLimitReached && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                <Zap className="h-3 w-3" />
                <span className="font-semibold">{remainingFree} / {FREE_LIMIT} free</span>
              </div>
            )}
            {isLimitReached && (
              <button
                onClick={() => setShowPricing(true)}
                className="flex items-center gap-1.5 text-[11px] text-violet-300 bg-violet-500/20 border border-violet-500/40 px-2.5 py-1 rounded-full hover:bg-violet-500/30 transition font-semibold"
              >
                <Crown className="h-3 w-3" />
                Upgrade
              </button>
            )}
            {plan !== "free" && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                <Zap className="h-3 w-3" />
                <span className="font-semibold">Live</span>
              </div>
            )}
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                title="Clear conversation"
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
        {showWelcome ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-8 py-8">
            {/* Hero */}
            <div className="text-center space-y-3">
              <div className="relative inline-flex">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-violet-500/40">
                  <Bot className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-2 border-[#0a0a0b] flex items-center justify-center">
                  <Zap className="h-2.5 w-2.5 text-[#0a0a0b]" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white via-violet-200 to-indigo-200 bg-clip-text text-transparent">
                  Meet your Notion AI Agent
                </h2>
                <p className="text-zinc-400 text-sm mt-1.5 max-w-sm">
                  I can create calendar events, write pages, search your workspace, and browse the web — just ask naturally.
                </p>
              </div>
            </div>

            {/* Capability pills */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {[
                { icon: <Calendar className="h-3 w-3" />, label: "Calendar" },
                { icon: <FileText className="h-3 w-3" />, label: "Pages" },
                { icon: <Search className="h-3 w-3" />, label: "Workspace RAG" },
                { icon: <Globe className="h-3 w-3" />, label: "Web Search" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] text-zinc-300">
                  <span className="text-violet-400">{icon}</span>
                  {label}
                </div>
              ))}
            </div>

            {/* Example prompts */}
            <div className="w-full max-w-lg space-y-2">
              <p className="text-[11px] text-zinc-600 text-center uppercase tracking-wider font-semibold mb-3">Try asking me</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXAMPLE_PROMPTS.map(({ icon, text, color }) => (
                  <button
                    key={text}
                    onClick={() => sendMessage(text)}
                    className={`text-left px-3.5 py-3 rounded-xl border bg-gradient-to-br ${color} transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <span className="text-base">{icon}</span>
                    <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed group-hover:text-white transition-colors">{text}</p>
                    <ArrowRight className="h-3 w-3 text-zinc-600 group-hover:text-zinc-300 mt-1 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) =>
              msg.role === "user" ? (
                <UserMessage key={msg.id} msg={msg} />
              ) : (
                <AssistantMessage key={msg.id} msg={msg} />
              )
            )}
            {isLoading && <ThinkingDots />}
          </>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input area — locked for free users who hit limit */}
      {isLimitReached ? (
        <div className="shrink-0 border-t border-white/[0.06] bg-[#0d0d0f]/80 backdrop-blur px-4 py-4">
          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/60 to-indigo-950/60 backdrop-blur px-5 py-4 flex flex-col items-center gap-3 text-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Lock className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">You&apos;ve used your 3 free AI messages</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Upgrade to Premium for unlimited AI Agent, calendar automation, and more.
              </p>
            </div>
            <button
              onClick={() => setShowPricing(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-violet-500/30 hover:from-violet-400 hover:to-indigo-500 transition-all active:scale-95"
            >
              <Crown className="h-3.5 w-3.5" />
              Upgrade to Premium
            </button>
            <p className="text-[10px] text-zinc-600">
              Plans from ₹299/mo · Unlimited AI · All 6 agent tools
            </p>
          </div>
        </div>
      ) : (
        <div className="shrink-0 border-t border-white/[0.06] bg-[#0d0d0f]/80 backdrop-blur px-4 py-3">
          <div className="relative flex items-end gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-violet-500/40 focus-within:bg-white/[0.06] transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask the agent to create events, pages, search notes..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none bg-transparent text-xs text-white placeholder-zinc-600 outline-none leading-relaxed max-h-[140px] disabled:opacity-50"
              style={{ minHeight: "20px" }}
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={toggleVoice}
                className={`p-1.5 rounded-lg transition ${
                  isListening
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "text-zinc-500 hover:bg-white/[0.08] hover:text-zinc-300"
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="h-7 w-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 hover:from-violet-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 text-white" />
                )}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-700 mt-2 text-center">
            Press <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-zinc-500 font-mono text-[9px]">Enter</kbd> to send · Shift+Enter for new line
            {plan === "free" && remainingFree > 0 && (
              <span className="ml-2 text-amber-600">{remainingFree} free message{remainingFree !== 1 ? "s" : ""} left</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
