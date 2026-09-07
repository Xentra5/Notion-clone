"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Keyboard,
  Activity,
  LifeBuoy,
  Bot,
  ChevronRight,
  ArrowLeft,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Send,
  HelpCircle,
  Clock,
  Tag,
  ThumbsUp,
  ThumbsDown,
  Server,
  Database,
  Cpu,
  ShieldCheck,
  FileCode,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  KEYBOARD_SHORTCUTS,
  DIAGNOSTICS_DATA,
  HelpArticle,
} from "./help-data";

type TabType = "guides" | "shortcuts" | "diagnostics" | "support" | "assistant";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "Open" | "Under Review" | "Resolved";
  createdAt: string;
  description: string;
}

export function HelpCenter({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>("guides");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Topics");
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  // Keyboard shortcuts state
  const [osMode, setOsMode] = useState<"mac" | "win">(() => {
    if (typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("mac")) {
      return "mac";
    }
    return "win";
  });
  const [shortcutFilter, setShortcutFilter] = useState("All");

  // Diagnostics state
  const [isPinging, setIsPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState<number>(14);
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<string[]>([]);

  // Article feedback state
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "yes" | "no">>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Support tickets state
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "NTN-54812",
      subject: "Inquiry on Pyodide WASM runtime memory limit",
      category: "Polyglot Code",
      priority: "medium",
      status: "Resolved",
      createdAt: "Yesterday",
      description: "Wanted to know the maximum memory allocated for client-side Python execution in code blocks.",
    },
  ]);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Editor & Blocks");
  const [ticketPriority, setTicketPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [ticketDescription, setTicketDescription] = useState("");
  const [attachLogs, setAttachLogs] = useState(true);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Assistant state
  const [messages, setMessages] = useState<Array<{ role: "assistant" | "user"; text: string }>>([
    {
      role: "assistant",
      text: "Hello! I am your Notion Workspace Support Assistant. Ask me anything about block editing, in-browser code sandboxes, LangChain RAG vector search, multi-view databases, or keyboard shortcuts.",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return HELP_ARTICLES.filter((art) => {
      const matchesCategory =
        selectedCategory === "All Topics" || art.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.tags.some((t) => t.toLowerCase().includes(q)) ||
        art.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Filtered shortcuts
  const filteredShortcuts = useMemo(() => {
    return KEYBOARD_SHORTCUTS.filter((sc) => {
      const matchesCat = shortcutFilter === "All" || sc.category === shortcutFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQ =
        !q ||
        sc.description.toLowerCase().includes(q) ||
        sc.category.toLowerCase().includes(q) ||
        sc.keys.some((k) => k.toLowerCase().includes(q));
      return matchesCat && matchesQ;
    });
  }, [searchQuery, shortcutFilter]);

  function handleCopyCode(snippet: string, id: string) {
    navigator.clipboard.writeText(snippet);
    setCopiedCodeId(id);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedCodeId(null), 2000);
  }

  function handlePingTest() {
    setIsPinging(true);
    setTimeout(() => {
      const calculated = Math.floor(Math.random() * 8) + 11; // 11-18ms
      setPingLatency(calculated);
      setIsPinging(false);
      toast.success(`Network & DB roundtrip healthy: ${calculated}ms`);
      setDiagnosticsLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] PING check -> MongoDB Primary + L2 Redis latency: ${calculated}ms (HTTP 200 OK)`,
        ...prev.slice(0, 4),
      ]);
    }, 600);
  }

  function handleClearCache() {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: "Purging client IndexedDB cache and SWR store...",
        success: "Cache purged. Fresh workspace state synced from MongoDB.",
        error: "Failed to purge cache.",
      }
    );
  }

  function handleCopyDiagnostics() {
    const dump = {
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      screen: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "Unknown",
      indexedDbState: "Active (0ms Local First)",
      syncEngine: "BroadcastChannel Multi-Tab Synchronized",
      cacheTier: "L1 In-Memory + L2 Redis REST",
      latencyMs: pingLatency,
      primaryDb: "MongoDB Cluster (Health: Optimal)",
      ragEngine: "LangChain ChromaDB Embeddings Worker",
    };
    navigator.clipboard.writeText(JSON.stringify(dump, null, 2));
    toast.success("Diagnostics report copied to clipboard");
  }

  function handleTicketSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      toast.error("Please provide both a subject and description");
      return;
    }
    setIsSubmittingTicket(true);
    setTimeout(() => {
      const newId = `NTN-${Math.floor(10000 + Math.random() * 90000)}`;
      const newTicket: Ticket = {
        id: newId,
        subject: ticketSubject.trim(),
        category: ticketCategory,
        priority: ticketPriority,
        status: "Under Review",
        createdAt: "Just now",
        description: ticketDescription.trim(),
      };
      setTickets([newTicket, ...tickets]);
      setTicketSubject("");
      setTicketDescription("");
      setIsSubmittingTicket(false);
      toast.success(`Support ticket ${newId} submitted. SLA response within 2 hours.`);
    }, 700);
  }

  function handleSendAssistantQuery(presetText?: string) {
    const textToSend = presetText || inputQuery;
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    if (!presetText) setInputQuery("");
    setIsAssistantThinking(true);

    setTimeout(() => {
      let answer = "";
      const lower = textToSend.toLowerCase();

      if (lower.includes("python") || lower.includes("code") || lower.includes("wasm")) {
        answer =
          "To run Python code directly in your page, create a Code Block with `/code` and switch the language dropdown to 'Python'. Our in-browser Pyodide WASM engine runs standard Python 3 locally without sending your code to any external server. Click 'Run' to execute and view stdout in the interactive console drawer.";
      } else if (lower.includes("offline") || lower.includes("sync") || lower.includes("indexeddb")) {
        answer =
          "This workspace employs a local-first 0ms architecture. Every keystroke writes instantaneously to client IndexedDB before sending an autosave to MongoDB. If you lose internet access, changes are queued locally with exponential backoff and automatically synced when reconnected.";
      } else if (lower.includes("database") || lower.includes("kanban") || lower.includes("timeline") || lower.includes("table")) {
        answer =
          "Database blocks support three visual views: Kanban Board (drag-and-drop cards between To Do, In Progress, Done), Timeline / Gantt View (calendar date spans), and Table View (structured multi-column grid). Click the view switcher at the top of any database block to toggle layouts seamlessly.";
      } else if (lower.includes("rag") || lower.includes("ai") || lower.includes("vector") || lower.includes("chroma")) {
        answer =
          "Our AI pipeline utilizes LangChain and ChromaDB with a 2.5-second debounce queue. When you stop typing, your document is chunked and embedded via all-MiniLM-L6-v2. When you query Notion AI (Cmd+J or in the side panel), it retrieves vector matches to synthesize accurate, cited answers.";
      } else if (lower.includes("version") || lower.includes("diff") || lower.includes("history") || lower.includes("trash")) {
        answer =
          "Access 'Version History' from the page settings menu to compare historical snapshots. The visual comparator renders side-by-side or unified green/red diffs and provides one-click snapshot rollback. Deleted pages can be recovered from the Trash bin in the sidebar.";
      } else {
        answer =
          "Here are the best ways to accomplish that in Notion:\n• Use `/` to summon the block creation menu.\n• Use `Cmd/Ctrl + K` to open the Global Spotlight Command Palette.\n• Check the 'Guides' tab for step-by-step documentation on this feature.";
      }

      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
      setIsAssistantThinking(false);
    }, 600);
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* Top Header Bar */}
      <div className="shrink-0 border-b border-border bg-card/60 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto max-w-6xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to workspace</span>
            </button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight">Notion Help & Support</h1>
                <p className="text-[11px] text-muted-foreground">Comprehensive workspace guides & live diagnostics</p>
              </div>
            </div>
          </div>

          {/* Operational Status Pill */}
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">All systems operational</span>
            <span className="text-[10px] text-muted-foreground/80 font-mono">({pingLatency}ms)</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Navigation Tabs */}
          <div className="mb-6 flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
            <button
              onClick={() => {
                setActiveTab("guides");
                setSelectedArticle(null);
              }}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === "guides"
                  ? "bg-foreground text-background font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Guides & Documentation</span>
            </button>

            <button
              onClick={() => setActiveTab("shortcuts")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === "shortcuts"
                  ? "bg-foreground text-background font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              <span>Keyboard Shortcuts</span>
            </button>

            <button
              onClick={() => setActiveTab("diagnostics")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === "diagnostics"
                  ? "bg-foreground text-background font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Workspace Diagnostics</span>
            </button>

            <button
              onClick={() => setActiveTab("support")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === "support"
                  ? "bg-foreground text-background font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <LifeBuoy className="h-3.5 w-3.5" />
              <span>Contact Support</span>
              {tickets.length > 0 && (
                <span className="rounded-full bg-primary/20 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                  {tickets.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("assistant")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === "assistant"
                  ? "bg-foreground text-background font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Ask Help Assistant</span>
            </button>
          </div>

          {/* TAB 1: GUIDES & DOCUMENTATION */}
          {activeTab === "guides" && (
            <div>
              {selectedArticle ? (
                /* Article Reader View */
                <div className="max-w-3xl mx-auto py-2 animate-in fade-in duration-200">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to all guides</span>
                  </button>

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-foreground">
                      {selectedArticle.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {selectedArticle.readTime}
                    </span>
                    <span className="text-xs text-muted-foreground">• {selectedArticle.updatedAt}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                    {selectedArticle.title}
                  </h1>

                  <p className="mt-4 text-base leading-relaxed text-muted-foreground border-b border-border pb-6">
                    {selectedArticle.content.intro}
                  </p>

                  {/* Article Sections */}
                  <div className="mt-8 space-y-8">
                    {selectedArticle.content.sections.map((section, idx) => (
                      <div key={idx} className="space-y-3">
                        <h2 className="text-lg font-semibold tracking-tight text-foreground">
                          {section.heading}
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                          {section.body}
                        </p>

                        {/* Steps List */}
                        {section.steps && (
                          <div className="my-4 space-y-2 rounded-xl border border-border bg-card p-4">
                            {section.steps.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-start gap-3 text-xs leading-relaxed text-foreground">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                                  {sIdx + 1}
                                </span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Code Snippet with Copy */}
                        {section.codeSnippet && (
                          <div className="relative my-4 overflow-hidden rounded-xl border border-border bg-neutral-950 font-mono text-xs text-neutral-200">
                            <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/60 px-4 py-1.5 text-[11px] text-neutral-400">
                              <span>{section.codeSnippet.lang}</span>
                              <button
                                onClick={() =>
                                  handleCopyCode(section.codeSnippet!.code, `code-${idx}`)
                                }
                                className="flex items-center gap-1 hover:text-white transition"
                              >
                                {copiedCodeId === `code-${idx}` ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-4 overflow-x-auto text-[12px] leading-relaxed">
                              <code>{section.codeSnippet.code}</code>
                            </pre>
                          </div>
                        )}

                        {/* Callouts */}
                        {section.callout && (
                          <div
                            className={`my-4 flex items-start gap-3 rounded-xl border p-4 text-xs leading-relaxed ${
                              section.callout.type === "tip"
                                ? "border-emerald-500/20 bg-emerald-50/50 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300"
                                : section.callout.type === "warning"
                                ? "border-amber-500/20 bg-amber-50/50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-300"
                                : "border-border bg-accent/40 text-foreground"
                            }`}
                          >
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>{section.callout.text}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Feedback Section */}
                  <div className="mt-12 border-t border-border pt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Was this article helpful?</p>
                        <p className="text-[11px] text-muted-foreground">Your feedback helps improve workspace guides</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setFeedbackGiven((prev) => ({ ...prev, [selectedArticle.id]: "yes" }));
                            toast.success("Thank you for your feedback!");
                          }}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                            feedbackGiven[selectedArticle.id] === "yes"
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                              : "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Yes</span>
                        </button>
                        <button
                          onClick={() => {
                            setFeedbackGiven((prev) => ({ ...prev, [selectedArticle.id]: "no" }));
                            toast.info("Feedback noted. We'll improve this guide.");
                          }}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                            feedbackGiven[selectedArticle.id] === "no"
                              ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                              : "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          <span>No</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Main Articles Catalog */
                <div>
                  {/* Search and Category Filter Bar */}
                  <div className="mb-6 space-y-4">
                    <div className="relative max-w-2xl">
                      <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search documentation, blocks, databases, shortcuts..."
                        className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3.5 top-3 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Category Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {HELP_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                            selectedCategory === cat
                              ? "bg-foreground text-background font-semibold shadow-xs"
                              : "border border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Featured Guides (Show if no search) */}
                  {!searchQuery && selectedCategory === "All Topics" && (
                    <div className="mb-8">
                      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Essential Workspace Guides
                      </h2>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {HELP_ARTICLES.slice(0, 3).map((art) => (
                          <div
                            key={art.id}
                            onClick={() => setSelectedArticle(art)}
                            className="group cursor-pointer rounded-2xl border border-border bg-card p-5 transition hover:border-foreground/30 hover:shadow-sm"
                          >
                            <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold text-foreground">
                              {art.category}
                            </span>
                            <h3 className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary transition line-clamp-2">
                              {art.title}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                              {art.excerpt}
                            </p>
                            <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>{art.readTime}</span>
                              <span className="flex items-center gap-0.5 font-medium group-hover:translate-x-0.5 transition">
                                Read guide <ChevronRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Articles Grid */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {selectedCategory === "All Topics" ? "All Articles" : selectedCategory} (
                        {filteredArticles.length})
                      </h2>
                    </div>

                    {filteredArticles.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                        <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-3 text-sm font-medium text-foreground">No articles match your search</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Try searching for keywords like "blocks", "python", "rag", or "kanban"
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("All Topics");
                          }}
                          className="mt-4 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium hover:bg-accent/80 transition"
                        >
                          Reset filters
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {filteredArticles.map((art) => (
                          <div
                            key={art.id}
                            onClick={() => setSelectedArticle(art)}
                            className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition hover:border-foreground/30 hover:bg-accent/30 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-muted-foreground">{art.category}</span>
                                <span className="text-muted-foreground/80">{art.readTime}</span>
                              </div>
                              <h3 className="mt-2 text-sm font-semibold text-foreground group-hover:text-primary transition">
                                {art.title}
                              </h3>
                              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                                {art.excerpt}
                              </p>
                            </div>
                            <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                              <span>{art.updatedAt}</span>
                              <span className="flex items-center gap-1 font-medium group-hover:text-foreground transition">
                                Open <ChevronRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: KEYBOARD SHORTCUTS */}
          {activeTab === "shortcuts" && (
            <div className="space-y-6">
              {/* Header & OS Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Keyboard Shortcuts Directory</h2>
                  <p className="text-xs text-muted-foreground">Work at full speed without taking your hands off the keyboard</p>
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                  <button
                    onClick={() => setOsMode("mac")}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                      osMode === "mac" ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    macOS ( ⌘ )
                  </button>
                  <button
                    onClick={() => setOsMode("win")}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                      osMode === "win" ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Windows / Linux ( Ctrl )
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                {["All", "General & Navigation", "Block Creation", "Formatting", "Notion AI"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setShortcutFilter(cat)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      shortcutFilter === cat
                        ? "bg-foreground text-background font-semibold"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Shortcuts Table */}
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="divide-y divide-border">
                  {filteredShortcuts.map((sc, i) => {
                    const activeKeys = osMode === "mac" && sc.macKeys ? sc.macKeys : sc.keys;
                    return (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 hover:bg-accent/30 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {sc.category}
                          </span>
                          <span className="text-xs font-medium text-foreground">{sc.description}</span>
                        </div>

                        <div className="flex items-center gap-1 self-start sm:self-auto">
                          {activeKeys.map((key, kIdx) => (
                            <React.Fragment key={kIdx}>
                              <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-border bg-muted/80 px-2 font-mono text-[11px] font-semibold text-foreground shadow-xs">
                                {key}
                              </kbd>
                              {kIdx < activeKeys.length - 1 && <span className="text-xs text-muted-foreground">+</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKSPACE DIAGNOSTICS */}
          {activeTab === "diagnostics" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">System Status & Diagnostics</h2>
                  <p className="text-xs text-muted-foreground">
                    Inspect local storage quotas, cache tiers, RAG indexers, and geo-redundant database health
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePingTest}
                    disabled={isPinging}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent transition disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? "animate-spin" : ""}`} />
                    <span>{isPinging ? "Testing..." : "Test Latency"}</span>
                  </button>
                  <button
                    onClick={handleCopyDiagnostics}
                    className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90 transition"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Diagnostics Dump</span>
                  </button>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {DIAGNOSTICS_DATA.map((diag) => (
                  <div key={diag.id} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {diag.category}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {diag.status}
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-semibold text-foreground">{diag.name}</h3>
                    <p className="mt-1 font-mono text-xs font-bold text-primary">{diag.value}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{diag.detail}</p>
                  </div>
                ))}
              </div>

              {/* Action Utilities Card */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground">Maintenance & Troubleshooting Tools</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Run safe client-side recovery tools if you experience sync delays or visual glitches.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={handleClearCache}
                    className="rounded-lg border border-border bg-accent/50 px-3.5 py-2 text-xs font-medium hover:bg-accent hover:border-foreground/30 transition text-foreground"
                  >
                    Purge Local IndexedDB Cache
                  </button>
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.reload();
                      }
                    }}
                    className="rounded-lg border border-border bg-accent/50 px-3.5 py-2 text-xs font-medium hover:bg-accent hover:border-foreground/30 transition text-foreground"
                  >
                    Hard Reload Workspace (Ctrl + F5)
                  </button>
                </div>
              </div>

              {/* Realtime Event Log */}
              {diagnosticsLogs.length > 0 && (
                <div className="rounded-2xl border border-border bg-neutral-950 p-4 font-mono text-xs text-neutral-300">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Live Diagnostics Stream
                  </div>
                  <div className="space-y-1">
                    {diagnosticsLogs.map((log, idx) => (
                      <div key={idx} className="text-emerald-400">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONTACT SUPPORT & TICKETS */}
          {activeTab === "support" && (
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Submit a Workspace Support Request</h2>
                <p className="text-xs text-muted-foreground">
                  Our engineering and product teams investigate workspace inquiries and bug reports with a 2-hour SLA.
                </p>
              </div>

              <form onSubmit={handleTicketSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Issue Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground/40"
                    >
                      <option>Editor & Blocks</option>
                      <option>Polyglot Code & WASM</option>
                      <option>Multi-View Databases</option>
                      <option>Notion AI & LangChain RAG</option>
                      <option>Billing & Subscriptions (Stripe/Razorpay)</option>
                      <option>Bug Report / Glitch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Priority Level</label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as any)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground/40"
                    >
                      <option value="low">Low (General question)</option>
                      <option value="medium">Normal (Feature assistance)</option>
                      <option value="high">High (Workflow impacted)</option>
                      <option value="critical">Critical (Work blocked)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Question regarding timeline Gantt chart export"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs outline-none focus:border-foreground/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Detailed Description</label>
                  <textarea
                    rows={4}
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Describe what happened, steps to reproduce, or what assistance you need..."
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-foreground/40 leading-relaxed resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="attachLogs"
                    checked={attachLogs}
                    onChange={(e) => setAttachLogs(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="attachLogs" className="text-xs text-muted-foreground cursor-pointer select-none">
                    Automatically attach workspace diagnostics & browser telemetry to speed up resolution
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="w-full sm:w-auto rounded-xl bg-foreground px-5 py-2.5 text-xs font-semibold text-background hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmittingTicket ? "Submitting Ticket..." : "Submit Support Ticket"}</span>
                </button>
              </form>

              {/* Tickets Tracker */}
              {tickets.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Support Tickets ({tickets.length})
                  </h3>
                  <div className="space-y-3">
                    {tickets.map((t) => (
                      <div key={t.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground">{t.id}</span>
                            <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              {t.category}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                t.status === "Resolved"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{t.createdAt}</span>
                        </div>
                        <h4 className="mt-2 text-sm font-semibold text-foreground">{t.subject}</h4>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ASK HELP ASSISTANT */}
          {activeTab === "assistant" && (
            <div className="max-w-3xl mx-auto flex flex-col h-[520px] rounded-2xl border border-border bg-card overflow-hidden">
              {/* Assistant Header */}
              <div className="border-b border-border bg-muted/40 px-5 py-3.5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Notion Workspace Assistant</h3>
                  <p className="text-[10px] text-muted-foreground">Instant intelligent answers on workspace features</p>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 text-xs leading-relaxed ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.role === "assistant" && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 text-[10px]">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-line ${
                        m.role === "user"
                          ? "bg-foreground text-background font-medium"
                          : "border border-border bg-background text-foreground"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {isAssistantThinking && (
                  <div className="flex gap-2 items-center text-xs text-muted-foreground italic">
                    <Sparkles className="h-3 w-3 animate-spin text-amber-500" />
                    <span>Searching workspace knowledge base...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="border-t border-border bg-muted/20 px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase shrink-0">Try:</span>
                {[
                  "How to run Python in code blocks?",
                  "How does offline 0ms sync work?",
                  "How to switch Database views?",
                  "How does LangChain RAG vector search work?",
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendAssistantQuery(chip)}
                    className="shrink-0 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <div className="border-t border-border p-3 bg-card">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAssistantQuery();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask anything about Notion features, shortcuts, or setup..."
                    className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-xs outline-none focus:border-foreground/40"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isAssistantThinking}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background hover:opacity-90 transition disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
