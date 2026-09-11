"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckSquare,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  LayoutTemplate,
  Search,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Code2,
  Rocket,
  Palette,
  Terminal,
  ExternalLink,
  Plus,
  Eye,
  Copy,
  SlidersHorizontal,
  Bookmark,
  Users,
  FolderOpen,
  Layers,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { HelpCenter } from "./help/help-center";

type UtilityPageType = "Library" | "My Tasks" | "Marketplace" | "Help";

interface ResourceItem {
  id: string;
  title: string;
  category: "Engineering" | "Product" | "Operations" | "Design" | "SOPs & Wikis";
  tag: string;
  desc: string;
  author: string;
  readTime: string;
  lastUpdated: string;
  isPinned?: boolean;
  content: string;
}

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  format: string;
  author: string;
  uses: number;
  desc: string;
  previewSnippet: string;
}

const PINNED_RESOURCES: ResourceItem[] = [
  {
    id: "eng-adr-guide",
    title: "Engineering Architecture & ADR Guide",
    category: "Engineering",
    tag: "ENG-01",
    desc: "Standard process for drafting, reviewing, and ratifying Architectural Decision Records (ADRs). Includes state management & distributed caching rules.",
    author: "@alex (Principal Architect)",
    readTime: "7 min read",
    lastUpdated: "2 days ago",
    isPinned: true,
    content: `# Engineering Architecture & ADR Guide\n\nAll non-trivial backend and infrastructure mutations require an Architectural Decision Record (ADR) before code freeze.\n\n### Core Tenets\n1. **Materialized Paths:** Nested document subtrees must update atomic path prefixes in O(1).\n2. **Cache-Through Validation:** Every write updates Redis L2 and marks local in-memory LRU as dirty.\n3. **Idempotent Webhooks:** All stripe/database webhook consumers must verify transactional idempotency keys.`,
  },
  {
    id: "prd-standard",
    title: "Product Requirement Document (PRD) Standard",
    category: "Product",
    tag: "PRD-SPEC",
    desc: "The cross-functional framework for scoping new features. Bridges user problem statements directly to technical milestones.",
    author: "@sarah (VP of Product)",
    readTime: "5 min read",
    lastUpdated: "Yesterday",
    isPinned: true,
    content: `# Product Requirement Document (PRD) Standard\n\nEvery product feature spec must answer four foundational questions before engineering handoff:\n\n1. **Target Problem:** Which concrete user persona suffers from this blocker?\n2. **Measurable Outcome:** What quantitative metric (e.g. ARR, conversion, MTTR) indicates success?\n3. **Scope Constraints:** What is explicitly out of scope for v1?\n4. **Technical Feasibility:** Approved by engineering lead with schema validation.`,
  },
  {
    id: "ops-incident-runbook",
    title: "Incident Response & Post-Mortem Runbook",
    category: "Operations",
    tag: "RUNBOOK",
    desc: "High-priority (P0/P1) service disruption protocol. On-call escalation ladder, customer status page updates, and automated post-mortem synthesis.",
    author: "@devops-team",
    readTime: "8 min read",
    lastUpdated: "Nov 2026",
    isPinned: true,
    content: `# Incident Response & Post-Mortem Runbook\n\n### Severity Levels\n- **P0 Critical:** Complete platform outage or customer data isolation breach. SLA: 15-minute response.\n- **P1 High:** Major feature degradation without complete failure. SLA: 1-hour response.\n\n### Action Protocol\n1. Declare incident in #war-room and assign Incident Commander.\n2. Execute automated database failover if heartbeat latency exceeds 250ms.\n3. Run Notion AI incident extractor to generate post-mortem notes within 24 hours.`,
  },
  {
    id: "design-tokens-v3",
    title: "Design System Tokens & Brand Wiki",
    category: "Design",
    tag: "TOKENS",
    desc: "Official color scales, radius tokens, typography hierarchies, and Figma component bindings for the Notion workspace interface.",
    author: "@design-systems",
    readTime: "4 min read",
    lastUpdated: "Nov 2026",
    isPinned: true,
    content: `# Design System Tokens v3.2\n\n### Foundations\n- **Canvas Background:** #FFFFFF (light) / #FBFBFA (subtle panels)\n- **Hairlines:** #E5E7EB (neutral-200)\n- **Primary Brand:** #0078DF (Notion Blue)\n- **Font Stack:** Plus Jakarta Sans (UI/Headings) + JetBrains Mono (Code/Metadata)\n- **Border Radii:** 6px (Controls), 10px (Cards), 14px (Modals)`,
  },
];

const TEMPLATES: TemplateItem[] = [
  {
    id: "tpl-sprint",
    title: "Sprint Planning & Retro Board",
    category: "Engineering",
    format: "Kanban + Table",
    author: "Core Eng",
    uses: 142,
    desc: "Connected sprint planning database with backlog estimation, burndown tracking, and automated GitHub PR associations.",
    previewSnippet: "Columns: [Backlog] · [In Dev] · [In Review] · [QA] · [Merged]\nIncludes: Story points rollup, assignee avatars, branch links.",
  },
  {
    id: "tpl-adr",
    title: "Architecture Decision Record (ADR)",
    category: "Engineering",
    format: "Markdown Spec",
    author: "Infra Guild",
    uses: 89,
    desc: "Structured template with Context, Considered Options, Pros/Cons matrix, and Consequences for major architecture changes.",
    previewSnippet: "Sections: Context · Decision · Considered Alternatives · Validation Results · Risk Mitigation.",
  },
  {
    id: "tpl-customer-feedback",
    title: "Customer Interview & Feedback Triage",
    category: "Product",
    format: "Relational Database",
    author: "User Research",
    uses: 67,
    desc: "Connect user interview recordings and pain points directly to roadmap prioritization scores.",
    previewSnippet: "Properties: Client Name · ARR Tier · Pain Point Category · Impact Score · Linked Roadmap Ticket.",
  },
  {
    id: "tpl-onboarding",
    title: "30-60-90 Day New Hire Journey",
    category: "People & HR",
    format: "Interactive Checklist",
    author: "People Ops",
    uses: 118,
    desc: "Complete onboarding plan with buddy assignments, key reading list, first PR tasks, and 90-day review milestones.",
    previewSnippet: "Checklist: Hardware 2FA · Monorepo Setup · First Bugfix · Shadowing 3 Client Calls · 90-day Sync.",
  },
];

const SOP_DOCS = [
  {
    title: "Employee Handbook & Remote Work Policy",
    category: "SOPs & Wikis",
    dept: "People Ops",
    access: "Workspace-wide",
    verified: "2026-11-01",
  },
  {
    title: "SOC2 Type II Security Compliance Controls",
    category: "Operations",
    dept: "Security",
    access: "Admin / Security",
    verified: "2026-10-18",
  },
  {
    title: "API Rate Limiting & Quota Management",
    category: "Engineering",
    dept: "Core Backend",
    access: "Workspace-wide",
    verified: "2026-11-08",
  },
  {
    title: "Customer Escalation & Support Playbook",
    category: "Operations",
    dept: "Support",
    access: "Workspace-wide",
    verified: "2026-10-29",
  },
  {
    title: "Release Deployment & Canary Verification",
    category: "Engineering",
    dept: "DevOps",
    access: "Engineering",
    verified: "2026-11-10",
  },
];

export function UtilityPage({ type, onBack }: { type: UtilityPageType; onBack: () => void }) {
  if (type === "Help") {
    return <HelpCenter onBack={onBack} />;
  }

  const config = {
    Library: {
      icon: BookOpen,
      eyebrow: "WORKSPACE RESOURCES",
      title: "Library",
      description: "Official guides, architectural decision records, design tokens, and verified building blocks.",
    },
    "My Tasks": {
      icon: CheckSquare,
      eyebrow: "PERSONAL WORKSPACE",
      title: "My Tasks",
      description: "A focused view of the work that needs your immediate attention.",
    },
    Marketplace: {
      icon: ShoppingBag,
      eyebrow: "EXPLORE TEMPLATES",
      title: "Marketplace",
      description: "Pre-built workspaces and workflow databases created for high-velocity teams.",
    },
    Help: {
      icon: CircleHelp,
      eyebrow: "SUPPORT CENTER",
      title: "Help",
      description: "Guides, documentation, and instant answers for your team.",
    },
  }[type];

  const Icon = config.icon;

  return (
    <main className="flex-1 overflow-y-auto bg-background text-foreground font-sans">
      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10 sm:py-12">
        {/* Navigation Breadcrumb */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to workspace</span>
        </button>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-muted border border-border text-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                {config.eyebrow}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5">
                {config.title}
              </h1>
              <p className="mt-1 max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {config.description}
              </p>
            </div>
          </div>

          {type === "Library" && (
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                onClick={() => toast.success("Resource creation dialog opened")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#0078df] hover:bg-[#006dcc] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New resource</span>
              </button>
            </div>
          )}
        </div>

        {/* Page Body */}
        {type === "Library" && <LibraryContent />}
        {type === "My Tasks" && <TasksContent />}
        {type === "Marketplace" && <MarketplaceContent />}
      </div>
    </main>
  );
}

function LibraryContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDoc, setPreviewDoc] = useState<ResourceItem | null>(null);

  const categories = ["All", "Engineering", "Product", "Operations", "Design", "SOPs & Wikis"];

  const filteredResources = useMemo(() => {
    return PINNED_RESOURCES.filter((res) => {
      const matchesCategory = selectedCategory === "All" || res.category === selectedCategory;
      const matchesQuery =
        searchQuery.trim() === "" ||
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, specs, and templates..."
            className="w-full h-9 rounded-[6px] border border-border bg-muted/50 px-3 pl-9 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:bg-background focus:border-[#0078df] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-foreground text-background font-semibold"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 1: Pinned Official Guides */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Verified Workspace Guides
            </h2>
            <span className="text-[11px] font-mono text-muted-foreground">
              ({filteredResources.length} items)
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Verified by Workspace Admins
          </span>
        </div>

        {filteredResources.length === 0 ? (
          <div className="p-8 rounded-[8px] border border-dashed border-border text-center text-xs text-muted-foreground bg-muted/30">
            No resources match &ldquo;{searchQuery}&rdquo; in {selectedCategory}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((item) => (
              <div
                key={item.id}
                className="group rounded-[10px] border border-border bg-card p-4 sm:p-5 flex flex-col justify-between hover:border-border/80 hover:bg-accent/30 transition-all duration-150 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="px-2 py-0.5 rounded-[4px] bg-muted border border-border text-[10px] font-mono font-semibold text-muted-foreground">
                      {item.tag}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {item.readTime} · {item.lastUpdated}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground group-hover:text-[#2383e2] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>{item.author}</span>
                  <button
                    onClick={() => setPreviewDoc(item)}
                    className="flex items-center gap-1 text-[#2383e2] font-sans font-semibold hover:underline cursor-pointer"
                  >
                    <span>Read doc</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Reusable Workspace Templates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Verified Building Blocks & Templates
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instant one-click scaffolds for cross-functional teams
            </p>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">4 templates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-[10px] border border-border bg-card p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:bg-accent/20 transition-all duration-150"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-medium text-muted-foreground">
                    {tpl.category} · {tpl.format}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {tpl.uses} duplicate uses
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground">{tpl.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{tpl.desc}</p>

                <div className="mt-3 p-2.5 rounded-[6px] bg-muted/60 border border-border font-mono text-[11px] text-muted-foreground">
                  {tpl.previewSnippet}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                  Maintained by {tpl.author}
                </span>
                <button
                  onClick={() => {
                    toast.success(`Template "${tpl.title}" added to your private workspace!`);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-[5px] bg-foreground text-background text-xs font-semibold hover:opacity-90 transition cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>Use template</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Standard Operating Procedures Directory (Table View) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            Standard Operating Procedures (SOPs)
          </h2>
          <span className="text-[11px] font-mono text-muted-foreground">5 live documents</span>
        </div>

        <div className="overflow-x-auto rounded-[8px] border border-border bg-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground font-mono text-[11px]">
                <th className="py-2.5 px-3.5 font-semibold">Document Title</th>
                <th className="py-2.5 px-3 font-semibold">Department</th>
                <th className="py-2.5 px-3 font-semibold">Access Level</th>
                <th className="py-2.5 px-3 font-semibold">Verified</th>
                <th className="py-2.5 px-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SOP_DOCS.map((doc, i) => (
                <tr key={i} className="hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-3.5 font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{doc.title}</span>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                    {doc.dept}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">
                    <span className="px-2 py-0.5 rounded-[4px] bg-muted text-muted-foreground font-mono text-[10px]">
                      {doc.access}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                    {doc.verified}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => toast.success(`Viewing "${doc.title}"`)}
                      className="text-xs text-[#2383e2] hover:underline font-medium cursor-pointer"
                    >
                      Open doc
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doc Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-[12px] bg-card border border-border p-6 shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-[4px] bg-muted text-muted-foreground">
                  {previewDoc.tag}
                </span>
                <span className="text-xs font-mono text-muted-foreground">{previewDoc.author}</span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 font-sans text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {previewDoc.content}
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">
                Last modified {previewDoc.lastUpdated}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(previewDoc.content);
                    toast.success("Markdown copied to clipboard!");
                  }}
                  className="px-3 py-1.5 rounded-[6px] border border-border text-xs font-medium text-foreground hover:bg-accent transition cursor-pointer"
                >
                  Copy Markdown
                </button>
                <button
                  onClick={() => {
                    toast.success(`"${previewDoc.title}" added to your active notes!`);
                    setPreviewDoc(null);
                  }}
                  className="px-3.5 py-1.5 rounded-[6px] bg-[#0078df] text-white text-xs font-semibold hover:bg-[#006dcc] transition cursor-pointer"
                >
                  Insert to Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TasksContent() {
  const [tasks, setTasks] = useState([
    { id: "1", text: "Finish architecture review for ADR-14", due: "Today", priority: "high", done: false },
    { id: "2", text: "Review sprint backlog with design lead", due: "Today", priority: "normal", done: false },
    { id: "3", text: "Plan sprint 43 milestone delivery", due: "Tomorrow", priority: "normal", done: false },
  ]);
  const [adding, setAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
    const task = tasks.find((t) => t.id === id);
    if (task) {
      toast.success(task.done ? `Task reopened` : `Task completed: ${task.text}`);
    }
  }

  function addTask() {
    const text = newTaskText.trim();
    if (!text) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), text, due: "Today", priority: "normal", done: false },
    ]);
    setNewTaskText("");
    setAdding(false);
    toast.success("Task added");
  }

  const today = tasks.filter((t) => t.due === "Today");
  const upcoming = tasks.filter((t) => t.due !== "Today");

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Today</h2>
        <span className="text-xs font-mono text-muted-foreground">{today.length} tasks</span>
      </div>
      <div className="space-y-2">
        {today.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 rounded-[8px] border border-border bg-card px-4 py-3 hover:bg-accent/30 transition ${task.done ? "opacity-50" : ""}`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition cursor-pointer ${
                task.done
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-border hover:border-foreground"
              }`}
            >
              {task.done && <Check className="h-3 w-3 text-white" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-xs sm:text-sm font-medium text-foreground ${task.done ? "line-through" : ""}`}>
                {task.text}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                <Clock3 className="h-3 w-3" />
                {task.due}
              </p>
            </div>
            <span
              className={`rounded-[4px] px-2 py-0.5 text-[10px] font-mono font-semibold ${
                task.priority === "high"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {task.priority}
            </span>
          </div>
        ))}
      </div>

      {upcoming.length > 0 && (
        <>
          <div className="mt-8 mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Upcoming</h2>
            <span className="text-xs font-mono text-muted-foreground">{upcoming.length} tasks</span>
          </div>
          <div className="space-y-2">
            {upcoming.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 rounded-[8px] border border-border bg-card px-4 py-3 hover:bg-accent/30 transition ${task.done ? "opacity-50" : ""}`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition cursor-pointer ${
                    task.done
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {task.done && <Check className="h-3 w-3 text-white" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-xs sm:text-sm font-medium text-foreground ${task.done ? "line-through" : ""}`}>
                    {task.text}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                    <Clock3 className="h-3 w-3" />
                    {task.due}
                  </p>
                </div>
                <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-mono font-semibold bg-muted text-muted-foreground border border-border">
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {adding ? (
        <div className="mt-5 flex items-center gap-2">
          <input
            autoFocus
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
              if (e.key === "Escape") { setAdding(false); setNewTaskText(""); }
            }}
            placeholder="Task name…"
            className="flex-1 rounded-[6px] border border-[#0078df] bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-[#0078df]"
          />
          <button
            onClick={addTask}
            className="px-3 py-2 rounded-[6px] bg-[#0078df] text-white text-xs font-semibold hover:bg-[#006dcc] transition cursor-pointer"
          >
            Add
          </button>
          <button
            onClick={() => { setAdding(false); setNewTaskText(""); }}
            className="px-3 py-2 rounded-[6px] border border-border text-xs font-medium text-muted-foreground hover:bg-accent transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-5 rounded-[6px] border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
        >
          + Add task
        </button>
      )}
    </>
  );
}

function MarketplaceContent() {
  const [searchQuery, setSearchQuery] = useState("");

  const allTemplates = [
    {
      title: "Engineering Sprint Board",
      desc: "Connected backlog, PR specs, and release changelogs",
      color: "from-blue-500/20 to-blue-600/10",
      accent: "text-blue-400",
      tags: ["Engineering", "Kanban"],
    },
    {
      title: "Product Roadmap & Insights",
      desc: "Triage customer pain points directly to milestones",
      color: "from-purple-500/20 to-purple-600/10",
      accent: "text-purple-400",
      tags: ["Product", "Database"],
    },
    {
      title: "Company Knowledge Wiki",
      desc: "Clean, searchable directory for handbooks and runbooks",
      color: "from-emerald-500/20 to-emerald-600/10",
      accent: "text-emerald-400",
      tags: ["Operations", "Wiki"],
    },
    {
      title: "OKR Tracker & Goal Hub",
      desc: "Link objectives to key results with real-time progress rollups",
      color: "from-amber-500/20 to-amber-600/10",
      accent: "text-amber-400",
      tags: ["Operations", "Tracker"],
    },
    {
      title: "Design System Docs",
      desc: "Living documentation for tokens, components, and usage patterns",
      color: "from-pink-500/20 to-pink-600/10",
      accent: "text-pink-400",
      tags: ["Design", "Docs"],
    },
    {
      title: "Hiring Pipeline CRM",
      desc: "End-to-end candidate tracking from sourcing to offer stage",
      color: "from-cyan-500/20 to-cyan-600/10",
      accent: "text-cyan-400",
      tags: ["People & HR", "CRM"],
    },
  ];

  const filtered = allTemplates.filter(
    (t) =>
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[6px] border border-border bg-muted/50 py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0078df] focus:bg-background transition"
            placeholder="Search verified templates..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="p-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-[8px]">
          No templates match &ldquo;{searchQuery}&rdquo;
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {filtered.map(({ title, desc, color, accent, tags }, i) => (
            <div
              key={title}
              className="overflow-hidden rounded-[10px] border border-border bg-card shadow-sm hover:border-border/60 hover:bg-accent/20 transition-all duration-150"
            >
              <div
                className={`h-20 bg-gradient-to-br ${color} border-b border-border flex items-center justify-center`}
              >
                <span className={`text-xs font-mono font-semibold ${accent}`}>{title}</span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded-[3px] bg-muted text-[10px] font-mono text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{desc}</p>
                <button
                  onClick={() => toast.success(`Template "${title}" added to workspace!`)}
                  className="mt-4 w-full rounded-[6px] bg-muted py-2 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer"
                >
                  Use template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}