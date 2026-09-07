"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Calendar,
  CalendarDays,
  FileText,
  FilePlus,
  Search,
  Globe,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  RotateCcw,
  ArrowUpRight,
  Lock,
  Crown,
  Copy,
  Check,
  Cpu,
  Terminal,
  Zap,
  X,
  History,
  Brain,
  Plus,
  Trash2,
  MessageSquarePlus,
  MessagesSquare,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatedBotLogo, BotCharacterState } from "@/components/dashboard/animated-bot-logo";
import { AgentMemoryModal } from "@/components/dashboard/modals/agent-memory-modal";
import { AgentHistoryDrawer } from "@/components/dashboard/modals/agent-history-drawer";
import { useWorkspaceStore } from "@/store/workspace-store";

const PricingModal = dynamic(
  () => import("@/components/dashboard/pricing-modal").then((m) => m.PricingModal),
  { ssr: false }
);

export interface Persona {
  id: string;
  name: string;
  role: string;
  badge: string;
  icon: string;
  description: string;
  accent: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "project_hr",
    name: "Notion Agent",
    role: "People & Operations",
    badge: "AGENT",
    icon: "✦",
    description: "Team syncs, calendar actions, workspace pages & meeting notes",
    accent: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
  },
  {
    id: "executive_assistant",
    name: "Executive Assistant",
    role: "Scheduling & Execution",
    badge: "EA",
    icon: "⚡",
    description: "Fast calendar revisions, task organization & summaries",
    accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    id: "tech_lead",
    name: "Tech Lead & PM",
    role: "Product & Architecture",
    badge: "TECH",
    icon: "🛠️",
    description: "Roadmaps, specs, sprint plans & engineering tasks",
    accent: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  },
  {
    id: "note_taker",
    name: "Note Architect",
    role: "Document Architecture",
    badge: "DOC",
    icon: "📄",
    description: "Structured Notion pages, thought structuring & formatting",
    accent: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
];

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

interface AgentSkill {
  id: string;
  prefix: string;
  label: string;
  category: string;
  icon: any;
  title: string;
  description: string;
  samplePrompt: string;
}

const AGENT_SKILLS: AgentSkill[] = [
  {
    id: "workspace",
    prefix: "@workspace ",
    label: "@workspace",
    category: "Knowledge RAG",
    icon: Search,
    title: "Search workspace notes",
    description: "Semantic query across your private notes, docs, and knowledge base",
    samplePrompt: "@workspace What were our key decisions on React architecture?",
  },
  {
    id: "calendar",
    prefix: "/calendar ",
    label: "/calendar",
    category: "Calendar",
    icon: Calendar,
    title: "Schedule meeting or event",
    description: "Create calendar invites with date, time, and agenda note",
    samplePrompt: "/calendar Schedule a team sync tomorrow at 10am with meeting notes",
  },
  {
    id: "events",
    prefix: "/events ",
    label: "/events",
    category: "Agenda",
    icon: CalendarDays,
    title: "View upcoming events",
    description: "Query calendar to list upcoming meetings and today's schedule",
    samplePrompt: "/events List my scheduled meetings for today",
  },
  {
    id: "page",
    prefix: "/page ",
    label: "/page",
    category: "Page Builder",
    icon: FilePlus,
    title: "Draft workspace page",
    description: "Generate structured project specs, task tables, or roadmaps",
    samplePrompt: "/page Create a new page for Q4 product roadmap with key deliverables",
  },
  {
    id: "pages",
    prefix: "/pages ",
    label: "/pages",
    category: "Documents",
    icon: FileText,
    title: "List workspace documents",
    description: "Explore and query all existing pages across your workspace",
    samplePrompt: "/pages Show all workspace pages created this week",
  },
  {
    id: "search",
    prefix: "/search ",
    label: "/search",
    category: "Live Web",
    icon: Globe,
    title: "Live web research",
    description: "Real-time web research across DuckDuckGo with citations",
    samplePrompt: "/search Search the web for Next.js 15 features, breaking changes and best practices",
  },
];

const TOOL_META: Record<string, { label: string; icon: any }> = {
  create_calendar_event: { label: "Calendar Event Created", icon: Calendar },
  update_calendar_event: { label: "Calendar Event Revised", icon: Calendar },
  delete_calendar_event: { label: "Calendar Event Deleted", icon: Calendar },
  list_calendar_events:  { label: "Calendar Events Queried", icon: Calendar },
  create_page:           { label: "Workspace Page Created", icon: FileText },
  update_page:           { label: "Workspace Page Revised", icon: FileText },
  list_pages:            { label: "Workspace Pages Queried", icon: FileText },
  search_workspace:      { label: "Workspace Notes Searched", icon: Search },
  remember_fact:         { label: "Saved to Persistent Memory", icon: Cpu },
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

function AssistantMessage({
  msg,
  personaName = "Notion Agent",
  onOpenMemory,
}: {
  msg: AgentMessage;
  personaName?: string;
  onOpenMemory?: () => void;
}) {
  const router = useRouter();
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

  const hasCalendarAction = msg.toolCalls?.some(
    (tc) => tc.tool === "create_calendar_event" || tc.tool === "update_calendar_event"
  );
  const hasPageAction = msg.toolCalls?.some(
    (tc) => tc.tool === "create_page" || tc.tool === "update_page"
  );
  const hasMemoryAction = msg.toolCalls?.some((tc) => tc.tool === "remember_fact");

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
          <span className="text-sm font-bold text-white tracking-tight">{personaName}</span>
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

        {/* Quick Action Badges */}
        {(hasCalendarAction || hasPageAction || hasMemoryAction) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {hasCalendarAction && (
              <button
                onClick={() => router.push("/dashboard/calendar")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 text-xs font-medium transition"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Open Calendar</span>
                <ArrowUpRight className="h-3 w-3 opacity-70" />
              </button>
            )}
            {hasPageAction && (() => {
              const pageTool = msg.toolCalls?.find((tc) => tc.tool === "create_page" || tc.tool === "update_page");
              const createdPageId = pageTool?.output?.match(/ID:\s*([a-f0-9]+)/i)?.[1];
              return (
                <button
                  onClick={() => router.push(createdPageId ? `/dashboard/${createdPageId}` : "/dashboard")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-medium transition"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>{createdPageId ? "Open Created Page" : "Open Workspace"}</span>
                  <ArrowUpRight className="h-3 w-3 opacity-70" />
                </button>
              );
            })()}
            {hasMemoryAction && (
              <button
                onClick={() => onOpenMemory?.()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 text-xs font-medium transition"
              >
                <Brain className="h-3.5 w-3.5" />
                <span>View Stored Memory</span>
                <ArrowUpRight className="h-3 w-3 opacity-70" />
              </button>
            )}
          </div>
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

function AgentProgressIndicator({ mode = "fast", personaName = "Notion Agent" }: { mode?: "fast" | "think" | "deepsearch"; personaName?: string }) {
  const isDeep = mode === "deepsearch";
  const isThink = mode === "think";

  const PROGRESS_STEPS = [
    { label: "Understanding your request", icon: "🧠", durationMs: 2500 },
    { label: isDeep ? "Deep-scanning workspace & web" : "Searching for information", icon: "🔍", durationMs: 4000 },
    { label: "Generating rich content with blocks", icon: "📝", durationMs: 5000 },
    { label: "Finalizing and formatting page", icon: "✨", durationMs: 6000 },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = Date.now();
    const timer = setInterval(() => {
      if (startRef.current !== null) {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;
    PROGRESS_STEPS.forEach((step, idx) => {
      if (idx > 0) {
        cumulative += PROGRESS_STEPS[idx - 1].durationMs;
        timeouts.push(setTimeout(() => setActiveStep(idx), cumulative));
      }
    });
    return () => timeouts.forEach(clearTimeout);
  }, []);

  const accentColor = isDeep ? "purple" : isThink ? "amber" : "cyan";
  const dotColor = isDeep ? "bg-purple-400" : isThink ? "bg-amber-400" : "bg-cyan-400";
  const glowColor = isDeep ? "rgba(168,85,247,0.15)" : isThink ? "rgba(245,158,11,0.15)" : "rgba(6,182,212,0.15)";
  const borderGlow = isDeep ? "border-purple-500/20" : isThink ? "border-amber-500/20" : "border-cyan-500/20";

  return (
    <div className="flex gap-3.5 py-3 max-w-4xl mx-auto w-full">
      <div className="shrink-0 mt-0.5">
        <AnimatedBotLogo
          size="sm"
          state={isDeep ? "deepsearch" : isThink ? "thinking" : "fast"}
          showStatusBadge={true}
        />
      </div>

      <div className="flex-1 min-w-0">
        {/* Progress Card */}
        <div
          className={`rounded-xl border ${borderGlow} bg-black/40 backdrop-blur-xl overflow-hidden`}
          style={{ boxShadow: `0 0 30px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.06)` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${dotColor} animate-pulse`} />
              <span className="text-xs font-semibold text-white tracking-wide">{personaName}</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border text-${accentColor}-400 border-${accentColor}-500/30 bg-${accentColor}-500/10 uppercase tracking-wider font-bold`}>
                {isDeep ? "DEEP SEARCH" : isThink ? "REASONING" : "EXECUTING"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-[10px] font-mono tabular-nums">{elapsed}s</span>
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="px-4 py-3 space-y-0">
            {PROGRESS_STEPS.map((step, idx) => {
              const isActive = idx === activeStep;
              const isCompleted = idx < activeStep;
              const isPending = idx > activeStep;

              return (
                <div key={idx} className="flex items-start gap-3 relative">
                  {/* Vertical connector line */}
                  {idx < PROGRESS_STEPS.length - 1 && (
                    <div
                      className={`absolute left-[9px] top-[22px] w-px h-[calc(100%-2px)] transition-colors duration-500 ${
                        isCompleted ? "bg-emerald-500/50" : "bg-white/[0.06]"
                      }`}
                    />
                  )}

                  {/* Step indicator dot */}
                  <div className="relative z-10 mt-0.5 shrink-0">
                    {isCompleted ? (
                      <div className="h-[18px] w-[18px] rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      </div>
                    ) : isActive ? (
                      <div className={`h-[18px] w-[18px] rounded-full bg-${accentColor}-500/20 border border-${accentColor}-500/40 flex items-center justify-center`}>
                        <div className={`h-2 w-2 rounded-full ${dotColor} animate-ping`} />
                      </div>
                    ) : (
                      <div className="h-[18px] w-[18px] rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                      </div>
                    )}
                  </div>

                  {/* Step text */}
                  <div className={`pb-3 transition-all duration-300 ${isPending ? "opacity-30" : "opacity-100"}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm leading-none">{step.icon}</span>
                      <span className={`text-[13px] font-medium transition-colors duration-300 ${
                        isActive ? "text-white" : isCompleted ? "text-zinc-400" : "text-zinc-600"
                      }`}>
                        {step.label}
                        {isActive && (
                          <span className="inline-flex ml-1.5">
                            <span className="animate-pulse text-zinc-500">...</span>
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="h-0.5 w-full bg-white/[0.04]">
            <div
              className={`h-full bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-400 transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(100, ((activeStep + 1) / PROGRESS_STEPS.length) * 100)}%` }}
            />
          </div>
        </div>
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

  // Personality & Multi-Agent Persona State
  const [selectedPersona, setSelectedPersona] = useState<string>("project_hr");
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  // Chat Session Persistence State
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  const [sessions, setSessions] = useState<Array<{ _id: string; title: string; personaId: string; updatedAt: string }>>([]);
  const [showSessionMenu, setShowSessionMenu] = useState(false);

  // Memory Modal & Action History Drawer States
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [historyDrawerTab, setHistoryDrawerTab] = useState<"chats" | "actions">("chats");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentPersona = PERSONAS.find((p) => p.id === selectedPersona) || PERSONAS[0];

  const isTyping = input.trim().length > 0 && !isLoading;
  const botState: BotCharacterState = hasError
    ? "error"
    : isLoading
    ? activeMode === "deepsearch"
      ? "deepsearch"
      : activeMode === "think"
      ? "thinking"
      : "fast"
    : activeMode === "deepsearch"
    ? "deepsearch"
    : activeMode === "think"
    ? "thinking"
    : isTyping
    ? "fast"
    : "idle";

  const plan = liveUsage?.plan ?? session?.user?.plan ?? "free";
  const aiUsageCount = liveUsage?.aiUsageCount ?? session?.user?.aiUsageCount ?? 0;
  const FREE_LIMIT = 3;
  const isLimitReached = plan === "free" && aiUsageCount >= FREE_LIMIT;
  const remainingFree = Math.max(0, FREE_LIMIT - aiUsageCount);

  // Slash Command Menu & Autocomplete State
  const [slashIndex, setSlashIndex] = useState(0);
  const [isSlashDismissed, setIsSlashDismissed] = useState(false);

  const slashMatch = input.match(/(?:^|\s)([\/@][a-zA-Z0-9_-]*)$/);
  const slashQuery = slashMatch ? slashMatch[1].toLowerCase() : "";
  const isSlashActive = Boolean(slashMatch) && !isSlashDismissed && !isLoading;

  const filteredSkills = isSlashActive
    ? AGENT_SKILLS.filter((skill) => {
        if (slashQuery === "/" || slashQuery === "") return true;
        if (slashQuery === "@") return skill.prefix.startsWith("@");
        const cleanQuery = slashQuery.replace(/^[\/@]/, "");
        return (
          skill.label.toLowerCase().includes(slashQuery) ||
          skill.id.toLowerCase().includes(cleanQuery) ||
          skill.title.toLowerCase().includes(cleanQuery) ||
          skill.category.toLowerCase().includes(cleanQuery)
        );
      })
    : [];

  const showSlashMenu = isSlashActive && filteredSkills.length > 0;

  // Selected Tool Blocks State
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = useCallback((skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
    inputRef.current?.focus();
  }, []);

  const removeSkill = useCallback((skillId: string) => {
    setSelectedSkills((prev) => prev.filter((id) => id !== skillId));
    inputRef.current?.focus();
  }, []);

  const applySkill = useCallback((skill: AgentSkill) => {
    setSelectedSkills((prev) => (prev.includes(skill.id) ? prev : [...prev, skill.id]));
    setInput((prev) => prev.replace(/(?:^|\s)([\/@][a-zA-Z0-9_-]*)$/, "").trimStart());
    setSlashIndex(0);
    setIsSlashDismissed(false);
    inputRef.current?.focus();
  }, []);

  // Load a chat session
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/ai/agent/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setCurrentSessionId(data.session._id);
          currentSessionIdRef.current = data.session._id;
          if (data.session.personaId) {
            setSelectedPersona(data.session.personaId);
          }
          const loadedMsgs = (data.session.messages || []).map((m: any) => ({
            id: m.id || msgId(),
            role: m.role,
            text: m.text,
            toolCalls: m.toolCalls,
            mode: m.mode || "fast",
            timestamp: new Date(m.timestamp || Date.now()),
          }));
          setMessages(loadedMsgs);
          toast.success("Loaded chat session");
        }
      }
    } catch {
      toast.error("Failed to load conversation");
    } finally {
      setIsLoading(false);
      setShowSessionMenu(false);
    }
  }, []);

  // Fetch chat sessions (optionally auto-load the most recent session)
  const fetchSessions = useCallback(async (autoLoadLatest = false) => {
    try {
      const res = await fetch("/api/ai/agent/sessions");
      if (res.ok) {
        const data = await res.json();
        const list = data.sessions || [];
        setSessions(list);
        if (autoLoadLatest && list.length > 0 && !currentSessionIdRef.current) {
          void loadSession(list[0]._id);
        }
      }
    } catch {
      // ignore
    }
  }, [loadSession]);

  // Start new chat
  const createNewSession = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
    setShowSessionMenu(false);
    toast.success("Started a new chat");
  }, []);

  // Delete chat session
  const deleteSession = useCallback(
    async (sessionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const res = await fetch(`/api/ai/agent/sessions/${sessionId}`, { method: "DELETE" });
        if (res.ok) {
          setSessions((prev) => prev.filter((s) => s._id !== sessionId));
          if (currentSessionId === sessionId) {
            setCurrentSessionId(null);
            setMessages([]);
          }
          toast.success("Chat deleted");
        }
      } catch {
        toast.error("Failed to delete chat");
      }
    },
    [currentSessionId]
  );

  // Sync actual usage and fetch sessions on mount
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
    fetchSessions(true);
  }, [refreshUsage, fetchSessions]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    setIsSlashDismissed(false);
    setSlashIndex(0);
    if (hasError) setHasError(false);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  }

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if ((!trimmed && selectedSkills.length === 0) || isLoading) return;

      if (isLimitReached) {
        setHasError(true);
        setShowPricing(true);
        return;
      }

      // Prepend selected tool blocks
      const toolPrefixes = selectedSkills
        .map((id) => AGENT_SKILLS.find((s) => s.id === id)?.prefix || "")
        .join("");
      const fullMessage = toolPrefixes ? `${toolPrefixes}${trimmed}` : trimmed;

      const userMsg: AgentMessage = {
        id: msgId(),
        role: "user",
        text: fullMessage,
        timestamp: new Date(),
        mode: activeMode,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setSelectedSkills([]);
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
            sessionId: currentSessionId,
            personaId: selectedPersona,
            history: messages.slice(-10).map(({ role, text }) => ({ role, text })),
            mode: activeMode,
          }),
        });

        const data = await res.json().catch(() => ({}));
        const answer = data.answer || "Request processed.";

        if (data.sessionId && data.sessionId !== currentSessionId) {
          setCurrentSessionId(data.sessionId);
          fetchSessions();
        }

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
              tc.tool === "create_page" ||
              tc.tool === "update_page" ||
              tc.tool === "create_calendar_event" ||
              tc.tool === "update_calendar_event"
          )
        ) {
          useWorkspaceStore.getState().refreshPages();
          window.dispatchEvent(new Event("page-updated"));
        }
      } catch {
        setHasError(true);
        setMessages((prev) => [
          ...prev,
          {
            id: msgId(),
            role: "assistant",
            text: "Connection error. Ensure the Python RAG agent service is running on port 8000 (`npm run dev`).",
            timestamp: new Date(),
            mode: activeMode,
          },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [isLoading, isLimitReached, messages, update, activeMode, currentSessionId, selectedPersona, selectedSkills, plan, fetchSessions]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (showSlashMenu && filteredSkills.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex((prev) => (prev + 1) % filteredSkills.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex((prev) => (prev - 1 + filteredSkills.length) % filteredSkills.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        applySkill(filteredSkills[slashIndex] || filteredSkills[0]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setIsSlashDismissed(true);
        return;
      }
    }

    if (e.key === "Backspace" && input === "" && selectedSkills.length > 0) {
      e.preventDefault();
      setSelectedSkills((prev) => prev.slice(0, -1));
      return;
    }

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
    <div className="flex flex-col h-full bg-[#06060a] text-zinc-100 overflow-hidden font-sans selection:bg-white/20 selection:text-white relative">
      {/* Deep ambient spotlight — more visible, more dramatic */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-5%,rgba(99,91,255,0.14),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_80%,rgba(168,85,247,0.05),transparent)] pointer-events-none" />
      {/* Fine dot grid */}
      <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,#000_60%,transparent_100%)] pointer-events-none" />

      {/* Pricing Paywall Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onUpgradeSuccess={async () => {
          await update();
          setShowPricing(false);
        }}
      />

      {/* AI Memory Manager Modal */}
      <AgentMemoryModal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
      />

      {/* Changes & History Audit Log Drawer */}
      <AgentHistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        initialTab={historyDrawerTab}
        onSelectSession={loadSession}
        currentSessionId={currentSessionId}
        onNewChat={createNewSession}
      />

      {/* ─── Premium Command Strip ─────────────────────────────────────────── */}
      <div className="shrink-0 relative z-20">
        {/* Thin accent line at top */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex items-center h-11 px-3 gap-1.5 bg-black/40 backdrop-blur-xl border-b border-white/[0.06]">

          {/* ── Persona Trigger ────────────────────────────────────────────── */}
          <div className="relative">
            <button
              id="persona-trigger"
              onClick={() => { setShowPersonaMenu((p) => !p); setShowSessionMenu(false); }}
              className={`group flex items-center gap-1.5 h-7 pl-2 pr-2.5 rounded-lg transition-all duration-150 text-[11px] font-semibold tracking-wide select-none ${
                showPersonaMenu
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/6"
              }`}
            >
              <span className="text-[13px] leading-none">{currentPersona.icon}</span>
              <span className="hidden sm:inline">{currentPersona.name}</span>
              <span className={`hidden sm:inline text-[9px] font-mono px-1 py-px rounded leading-none border ${currentPersona.accent}`}>
                {currentPersona.badge}
              </span>
              <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform duration-200 ${showPersonaMenu ? "rotate-180" : ""}`} />
            </button>

            {showPersonaMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPersonaMenu(false)} />
                <div className="absolute left-0 top-[calc(100%+6px)] w-[260px] rounded-xl border border-white/10 bg-[#0d0d12] shadow-[0_8px_48px_rgba(0,0,0,0.8)] ring-1 ring-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 pt-2.5 pb-1.5 border-b border-white/[0.06]">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Agent personality</p>
                  </div>
                  <div className="p-1.5 space-y-px">
                    {PERSONAS.map((p) => {
                      const active = selectedPersona === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedPersona(p.id); setShowPersonaMenu(false); toast.success(`Switched to ${p.name}`); }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-100 group ${
                            active ? "bg-white/10" : "hover:bg-white/5"
                          }`}
                        >
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-sm shrink-0 transition ${active ? "bg-white/10" : "bg-white/5 group-hover:bg-white/8"}`}>
                            {p.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-semibold ${active ? "text-white" : "text-zinc-300 group-hover:text-white"} transition`}>
                                {p.name}
                              </span>
                              <span className={`text-[9px] font-mono px-1 rounded border leading-4 ${p.accent}`}>{p.badge}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{p.description}</p>
                          </div>
                          {active && <div className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-4 bg-white/[0.08] mx-0.5" />

          {/* ── Session Switcher ───────────────────────────────────────────── */}
          <div className="relative flex-1 min-w-0 flex justify-center">
            <button
              id="session-trigger"
              onClick={() => { setShowSessionMenu((p) => !p); setShowPersonaMenu(false); }}
              className={`flex items-center gap-1.5 h-7 px-2.5 rounded-lg transition-all duration-150 text-[11px] max-w-[220px] sm:max-w-xs ${
                showSessionMenu
                  ? "bg-white/8 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <MessagesSquare className="h-3 w-3 shrink-0 text-zinc-500" />
              <span className="truncate font-medium">
                {sessions.find((s) => s._id === currentSessionId)?.title || "New conversation"}
              </span>
              <ChevronDown className={`h-3 w-3 text-zinc-600 shrink-0 transition-transform duration-200 ${showSessionMenu ? "rotate-180" : ""}`} />
            </button>

            {showSessionMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSessionMenu(false)} />
                <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+6px)] w-72 rounded-xl border border-white/10 bg-[#0d0d12] shadow-[0_8px_48px_rgba(0,0,0,0.8)] ring-1 ring-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-white/[0.06]">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Chat history</p>
                    <button
                      onClick={createNewSession}
                      className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white font-medium bg-white/8 hover:bg-white/12 px-2 py-1 rounded-md transition"
                    >
                      <Plus className="h-3 w-3" />
                      <span>New chat</span>
                    </button>
                  </div>
                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-px">
                    {sessions.length === 0 ? (
                      <div className="py-6 text-center">
                        <MessagesSquare className="h-5 w-5 text-zinc-700 mx-auto mb-1.5" />
                        <p className="text-[11px] text-zinc-600">No saved chats yet</p>
                      </div>
                    ) : (
                      sessions.map((s) => {
                        const active = currentSessionId === s._id;
                        return (
                          <div
                            key={s._id}
                            onClick={() => loadSession(s._id)}
                            className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                              active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {active && <div className="h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />}
                              <span className="text-[11px] truncate">{s.title}</span>
                            </div>
                            <button
                              onClick={(e) => deleteSession(s._id, e)}
                              className="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded text-zinc-600 hover:text-red-400 transition shrink-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-4 bg-white/[0.08] mx-0.5" />

          {/* ── Right Actions ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setHistoryDrawerTab("chats");
                setShowHistoryDrawer(true);
              }}
              title="View previous conversations"
              className="group flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-150"
            >
              <MessagesSquare className="h-3.5 w-3.5 text-sky-400 group-hover:text-sky-300 transition" />
              <span>Previous Chats ({sessions.length})</span>
            </button>

            <button
              onClick={createNewSession}
              title="Start a new chat conversation"
              className="group flex items-center gap-1.5 h-7 px-2 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-white/6 border border-white/5 transition-all duration-150"
            >
              <Plus className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white transition" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <button
              onClick={() => setShowMemoryModal(true)}
              title="Manage agent memory"
              className="group flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-white/6 transition-all duration-150"
            >
              <Brain className="h-3.5 w-3.5 text-purple-400/70 group-hover:text-purple-300 transition" />
              <span className="hidden sm:inline">Memory</span>
            </button>

            <button
              onClick={() => {
                setHistoryDrawerTab("actions");
                setShowHistoryDrawer(true);
              }}
              title="View action history"
              className="group flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-white/6 transition-all duration-150"
            >
              <History className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300 transition" />
              <span className="hidden sm:inline">Actions</span>
            </button>
          </div>

        </div>
        {/* Bottom separator */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>


      {/* Messages Thread or Welcome Hero */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 scrollbar-thin scrollbar-thumb-white/10 relative z-10">
        {showWelcome ? (
          <div className="flex flex-col items-center justify-center min-h-[480px] max-w-3xl mx-auto text-center py-8">

            {/* Bot Logo — untouched */}
            <div className="mb-7 relative flex flex-col items-center justify-center">
              <AnimatedBotLogo size="lg" state={botState} showStatusBadge={true} />
            </div>

            {/* ── Premium Gradient Headline ── */}
            <h1 className="text-[2rem] sm:text-[2.5rem] font-bold tracking-[-0.03em] leading-[1.15] bg-gradient-to-b from-white via-white/90 to-zinc-400 bg-clip-text text-transparent">
              What can {currentPersona.name} do for you?
            </h1>
            <p className="text-zinc-500 text-[13px] sm:text-sm mt-3 max-w-sm leading-relaxed font-normal tracking-wide">
              {currentPersona.description}
            </p>

            {/* ── Keyboard-shortcut style Chips ── */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-6">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => { setInput(chip.text); inputRef.current?.focus(); }}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-zinc-500 hover:text-zinc-200 bg-transparent hover:bg-white/5 border border-white/[0.08] hover:border-white/15 transition-all duration-150 active:scale-95"
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* ── Premium Skill Cards ── */}
            <div className="w-full mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-left">
              {AGENT_SKILLS.map((skill, i) => {
                const Icon = skill.icon;
                // Subtle per-card accent colors
                const accents = [
                  "group-hover:text-sky-300 group-hover:bg-sky-500/8 group-hover:border-sky-500/20",
                  "group-hover:text-violet-300 group-hover:bg-violet-500/8 group-hover:border-violet-500/20",
                  "group-hover:text-emerald-300 group-hover:bg-emerald-500/8 group-hover:border-emerald-500/20",
                  "group-hover:text-amber-300 group-hover:bg-amber-500/8 group-hover:border-amber-500/20",
                  "group-hover:text-rose-300 group-hover:bg-rose-500/8 group-hover:border-rose-500/20",
                  "group-hover:text-cyan-300 group-hover:bg-cyan-500/8 group-hover:border-cyan-500/20",
                ];
                const iconAccents = [
                  "group-hover:text-sky-400",
                  "group-hover:text-violet-400",
                  "group-hover:text-emerald-400",
                  "group-hover:text-amber-400",
                  "group-hover:text-rose-400",
                  "group-hover:text-cyan-400",
                ];
                const accent = accents[i % accents.length];
                const iconAccent = iconAccents[i % iconAccents.length];
                return (
                  <button
                    key={skill.id}
                    onClick={() => sendMessage(skill.samplePrompt)}
                    className={`group flex flex-col gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.045] ${accent} transition-all duration-200 text-left active:scale-[0.985] relative overflow-hidden`}
                  >
                    {/* Subtle glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.04),transparent)]" />

                    <div className="flex items-start justify-between">
                      <div className={`h-8 w-8 rounded-lg bg-white/5 border border-white/[0.08] flex items-center justify-center text-zinc-500 ${iconAccent} transition-colors shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-zinc-700 group-hover:text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                    </div>

                    <div>
                      <p className="text-[11px] font-mono text-zinc-600 mb-1">{skill.label}</p>
                      <span className="text-[13px] font-semibold text-zinc-200 group-hover:text-white transition-colors block leading-snug">
                        {skill.title}
                      </span>
                      <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed line-clamp-2">
                        {skill.description}
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
                <AssistantMessage
                  key={msg.id}
                  msg={msg}
                  personaName={currentPersona.name}
                  onOpenMemory={() => setShowMemoryModal(true)}
                />
              )
            )}
            {isLoading && <AgentProgressIndicator mode={activeMode} personaName={currentPersona.name} />}
            <div ref={scrollRef} />
          </div>
        )}
      </div>


      {/* Notion Agent Floating Command Input Bar */}
      <div className="shrink-0 max-w-3xl mx-auto w-full px-4 pb-4 pt-1">
        {isLimitReached ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-white/8 border border-white/12 flex items-center justify-center text-white shrink-0">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Free message limit reached (3/3)</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Upgrade to Pro for unlimited Notion Agent, calendar actions, and deep search.
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
          <div className="relative">
            {/* Slash Command Autocomplete Box */}
            {showSlashMenu && filteredSkills.length > 0 && (
              <div className="absolute bottom-full mb-2 left-0 right-0 rounded-xl border border-white/[0.08] bg-[#0c0c10]/98 backdrop-blur-2xl shadow-[0_-4px_48px_rgba(0,0,0,0.7)] ring-1 ring-black/60 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-100">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.05]">
                  <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Agent skills</span>
                  <span className="text-[10px] font-mono text-zinc-700">↑↓ navigate · ↵ select · esc</span>
                </div>

                {/* Results */}
                <div className="max-h-[240px] overflow-y-auto py-1 no-scrollbar">
                  {filteredSkills.map((skill, idx) => {
                    const Icon = skill.icon;
                    const isSelected = idx === slashIndex;
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => applySkill(skill)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-75 ${
                          isSelected ? "bg-white/8" : "hover:bg-white/4"
                        }`}
                      >
                        {/* Icon */}
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "bg-white/10 text-white" : "bg-white/4 text-zinc-500"
                        }`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0 flex items-center gap-2.5">
                          <span className={`font-mono text-[12px] font-semibold shrink-0 ${isSelected ? "text-white" : "text-zinc-400"}`}>
                            {skill.label}
                          </span>
                          <span className={`text-[11px] truncate ${isSelected ? "text-zinc-300" : "text-zinc-600"}`}>
                            {skill.title}
                          </span>
                        </div>

                        {/* Category + tab hint */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-zinc-700 font-medium hidden sm:inline">{skill.category}</span>
                          {isSelected && (
                            <kbd className="px-1.5 py-px rounded bg-white/8 border border-white/10 text-zinc-500 font-mono text-[10px]">⇥</kbd>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}


            {/* ── Input capsule ── */}
            <div className="rounded-2xl border border-white/[0.09] bg-[#0b0b0f]/96 backdrop-blur-2xl shadow-[0_2px_40px_rgba(0,0,0,0.6)] focus-within:border-white/20 focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_2px_40px_rgba(0,0,0,0.6)] transition-all duration-200">

              {/* ── Tool chips row ── */}
              <div className="flex items-center gap-1 px-3 pt-2.5 pb-2 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
                {AGENT_SKILLS.map((skill) => {
                  const Icon = skill.icon;
                  const isSelected = selectedSkills.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono font-medium transition shrink-0 active:scale-95 ${
                        isSelected
                          ? "bg-white/90 text-zinc-950 shadow-sm"
                          : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
                      }`}
                      title={skill.title}
                    >
                      <Icon className={`h-3 w-3 shrink-0 ${isSelected ? "text-zinc-900" : ""}`} />
                      <span>{skill.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active tool blocks */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 px-3 pt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  {selectedSkills.map((skillId) => {
                    const skill = AGENT_SKILLS.find((s) => s.id === skillId);
                    if (!skill) return null;
                    const Icon = skill.icon;
                    return (
                      <span key={skill.id} className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-white/8 border border-white/12 text-zinc-300 text-[11px] font-mono">
                        <Icon className="h-3 w-3 text-indigo-400 shrink-0" />
                        <span>{skill.label}</span>
                        <button type="button" onClick={() => removeSkill(skill.id)} className="ml-0.5 h-3.5 w-3.5 rounded flex items-center justify-center hover:bg-white/15 text-zinc-600 hover:text-white transition">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* ── Textarea ── */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={`Ask Notion Agent to search workspace, schedule meetings, or create pages…`}
                rows={1}
                disabled={isLoading}
                className="w-full resize-none bg-transparent text-[15px] text-white/90 placeholder:text-zinc-600 outline-none leading-relaxed max-h-[180px] disabled:opacity-40 font-normal px-3 pt-2.5 pb-1"
                style={{ minHeight: "36px" }}
              />

              {/* ── Bottom action row ── */}
              <div className="flex items-center justify-between px-3 pb-2.5 pt-1.5">
                {/* Mode toggles */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveMode((curr) => (curr === "deepsearch" ? "fast" : "deepsearch"))}
                    className={`flex items-center gap-1.5 h-6 px-2.5 rounded-md text-[11px] font-semibold transition ${
                      activeMode === "deepsearch"
                        ? "bg-white/12 text-white border border-white/20"
                        : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
                    }`}
                    title="Deep search queries workspace & web thoroughly"
                  >
                    <Search className="h-3 w-3" />
                    <span>DeepSearch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMode((curr) => (curr === "think" ? "fast" : "think"))}
                    className={`flex items-center gap-1.5 h-6 px-2.5 rounded-md text-[11px] font-semibold transition ${
                      activeMode === "think"
                        ? "bg-white/12 text-white border border-white/20"
                        : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
                    }`}
                    title="Reason step-by-step before answering"
                  >
                    <Cpu className="h-3 w-3" />
                    <span>Think</span>
                  </button>
                </div>

                {/* Send controls */}
                <div className="flex items-center gap-1.5">
                  {isListening ? (
                    <button type="button" onClick={toggleVoice} className="flex items-center gap-1 h-6 px-2 rounded-md bg-red-500/15 text-red-300 border border-red-500/25 text-[11px] transition">
                      <span className="flex items-center gap-px h-3">
                        <span className="w-0.5 h-1.5 bg-red-400 animate-pulse rounded-full" />
                        <span className="w-0.5 h-3 bg-red-400 animate-pulse delay-75 rounded-full" />
                        <span className="w-0.5 h-2 bg-red-400 animate-pulse delay-150 rounded-full" />
                      </span>
                      <MicOff className="h-3 w-3 ml-0.5" />
                    </button>
                  ) : (
                    <button type="button" onClick={toggleVoice} className="h-6 w-6 flex items-center justify-center rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition">
                      <Mic className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="h-7 w-7 rounded-lg bg-white hover:bg-zinc-100 text-black flex items-center justify-center transition disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                    title="Send (Enter)"
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-800" /> : <Send className="h-3 w-3 text-zinc-900 ml-px" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Keyboard hints ── */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-zinc-700">
              <kbd className="px-1.5 py-px rounded bg-white/5 border border-white/8 text-zinc-500 font-mono text-[10px]">↵</kbd>
              <span>send</span>
            </span>
            <span className="text-zinc-800">·</span>
            <span className="flex items-center gap-1 text-[10px] text-zinc-700">
              <kbd className="px-1.5 py-px rounded bg-white/5 border border-white/8 text-zinc-500 font-mono text-[10px]">⇧↵</kbd>
              <span>newline</span>
            </span>
          </div>

          {plan === "free" && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-700">
              <Zap className="h-3 w-3 text-amber-500/70" />
              <span>{remainingFree}/{FREE_LIMIT} free</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
