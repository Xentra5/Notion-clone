"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Database,
  FileCode,
  FileText,
  GitPullRequest,
  Kanban,
  Layers,
  Search,
  Sparkles,
  Terminal,
  Users,
} from "lucide-react";

export const Features = () => {
  // Document Toggle Block state
  const [toggleOpen, setToggleOpen] = useState(true);

  // Database View Switcher in Card 2
  const [dbView, setDbView] = useState<"board" | "table" | "timeline">("board");

  // Notion AI Prompt Demo state in Card 3
  const [activeAiPrompt, setActiveAiPrompt] = useState(0);

  const aiPrompts = [
    {
      action: "Draft release notes from sprint",
      query: "/ai Generate v2.4 changelog from closed sprint tasks",
      result:
        "### Release Notes (v2.4.0)\n• Database: Implemented O(1) Materialized Path hierarchy for instant subtree moves\n• Performance: Integrated L1 in-memory + L2 Upstash Redis caching with write-through invalidation\n• Security: Verified zero-trust authentication policies across all teamspaces",
      source: "Linked to 3 closed tasks in Sprint 24",
    },
    {
      action: "Summarize architecture RFC",
      query: "/ai Summarize ADR-04: Dual-Tier Caching Strategy",
      result:
        "**Key Decisions:**\n1. In-process LRU cache serves hot documents in <0.1ms with zero network hops.\n2. Upstash Redis coordinates distributed invalidation events across lambda workers.\n3. MongoDB disk is queried only on fresh cold misses.",
      source: "specs/adr-04-caching.md (Line 42-88)",
    },
    {
      action: "Find incident runbook",
      query: "/ai Where is the database failover procedure?",
      result:
        "The automated failover runbook is documented in **Infrastructure / MongoDB Atlas Guide**. If primary cluster heartbeat fails (/api/health/db), traffic automatically reroutes to MONGODB_BACKUP_URI in <350ms.",
      source: "wiki/ops/failover-runbook.md",
    },
  ];

  // Team Workspaces Tabs
  const [teamTab, setTeamTab] = useState<"eng" | "product" | "design" | "wiki">("eng");

  const teamWorkspaces = {
    eng: {
      title: "Engineering: Architecture specs, sprint boards, and incident runbooks.",
      subtitle: "Keep your system architecture, technical RFCs, and sprint tasks tightly coupled in one searchable hierarchy.",
      preview: (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 text-left text-xs shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
              <span>📐</span>
              <span>RFC-104: Real-time Collaborative Document Engine</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Accepted
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Technical Context</div>
              <p className="text-neutral-700 leading-relaxed text-xs">
                To eliminate latency during concurrent multi-user typing, we adopt a local-first mutation queue backed by IndexedDB and server-sent streaming state reconciliations.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-500">
                <span>Author: <strong className="text-neutral-800">@alex</strong></span>
                <span>&bull;</span>
                <span>Target: <strong className="text-neutral-800">Sprint 24</strong></span>
              </div>
            </div>

            <div className="rounded-lg bg-neutral-950 p-3.5 text-neutral-200 font-mono text-[11px] space-y-1 overflow-x-auto">
              <div className="text-neutral-500">{"// lib/models/page.ts"}</div>
              <div><span className="text-purple-400">interface</span> <span className="text-yellow-300">PageNode</span> &#123;</div>
              <div className="pl-4">id: <span className="text-emerald-400">string</span>;</div>
              <div className="pl-4">ancestors: <span className="text-emerald-400">string[]</span>; <span className="text-neutral-500">{"// O(1) path"}</span></div>
              <div className="pl-4">version: <span className="text-blue-400">number</span>;</div>
              <div>&#125;</div>
            </div>
          </div>
        </div>
      ),
    },
    product: {
      title: "Product: PRDs, user stories, and customer interview notes.",
      subtitle: "Connect customer feedback directly to roadmap items, user stories, and quarterly delivery goals.",
      preview: (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 text-left text-xs shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
              <span>🎯</span>
              <span>PRD: Polyglot In-Browser Code Runners</span>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              In Review
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="font-bold text-neutral-800">Problem</div>
              <p className="mt-1 text-neutral-600 text-[11px] leading-relaxed">Developers want to execute and test Python/JS algorithms directly inside technical notes without third-party sandboxes.</p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="font-bold text-neutral-800">Target Audience</div>
              <p className="mt-1 text-neutral-600 text-[11px] leading-relaxed">Data engineers, algorithm researchers, and technical documentation writers.</p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="font-bold text-neutral-800">Success Metric</div>
              <p className="mt-1 text-neutral-600 text-[11px] leading-relaxed">&gt;40% of code blocks executed within 30 days of release.</p>
            </div>
          </div>
        </div>
      ),
    },
    design: {
      title: "Design: Living component systems, tokens, and UX guidelines.",
      subtitle: "Maintain design tokens, typography scales, and Figma component libraries with live previews.",
      preview: (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 text-left text-xs shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
              <span>🎨</span>
              <span>Design System: Elevation, Typography &amp; Color Tokens</span>
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              v3.2 Tokens
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-neutral-200 bg-white shadow-2xs text-center">
              <div className="h-6 w-full rounded bg-[#0078df] mb-2" />
              <div className="font-bold text-neutral-900">Notion Blue</div>
              <div className="text-[10px] text-neutral-500 font-mono">#0078df</div>
            </div>
            <div className="p-3 rounded-lg border border-neutral-200 bg-white shadow-2xs text-center">
              <div className="h-6 w-full rounded bg-[#9d34da] mb-2" />
              <div className="font-bold text-neutral-900">AI Purple</div>
              <div className="text-[10px] text-neutral-500 font-mono">#9d34da</div>
            </div>
            <div className="p-3 rounded-lg border border-neutral-200 bg-white shadow-2xs text-center">
              <div className="h-6 w-full rounded bg-emerald-600 mb-2" />
              <div className="font-bold text-neutral-900">Success Green</div>
              <div className="text-[10px] text-neutral-500 font-mono">#059669</div>
            </div>
            <div className="p-3 rounded-lg border border-neutral-200 bg-white shadow-2xs text-center">
              <div className="h-6 w-full rounded bg-neutral-900 mb-2" />
              <div className="font-bold text-neutral-900">Text Primary</div>
              <div className="text-[10px] text-neutral-500 font-mono">#050505</div>
            </div>
          </div>
        </div>
      ),
    },
    wiki: {
      title: "Company Wiki: Central onboarding, policies, and team directories.",
      subtitle: "Ensure every new hire finds verified answers on day one without asking in Slack channels.",
      preview: (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 text-left text-xs shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
              <span>📚</span>
              <span>Engineering Onboarding Checklist (First 30 Days)</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified Guide
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <span className="font-semibold text-neutral-800">Day 1: Setup local development environment and run `npm run dev`</span>
              <span className="text-emerald-700 font-bold text-[10px]">&check; Completed</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <span className="font-semibold text-neutral-800">Day 3: Read ADR-04 and understand dual-tier caching invalidation</span>
              <span className="text-emerald-700 font-bold text-[10px]">&check; Completed</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
              <span className="font-semibold text-neutral-800">Day 7: Ship first pull request to sprint branch</span>
              <span className="text-blue-700 font-bold text-[10px]">In Progress</span>
            </div>
          </div>
        </div>
      ),
    },
  };

  return (
    <section className="mx-auto mt-24 max-w-[1140px] px-5">
      {/* SECTION HEADER */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-[34px] font-[850] tracking-tight text-[#050505] sm:text-[46px] leading-[1.1]">
          A workspace that adapts to how you think.
        </h2>
        <p className="mt-3 text-base text-neutral-600 sm:text-lg leading-relaxed font-normal">
          Docs, roadmaps, and wikis connected in one flexible canvas &mdash; with AI that actually understands your team&apos;s context.
        </p>
      </div>

      {/* 3 CORE PILLARS BENTO GRID */}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Pillar 1: Rich Document Canvas & Technical Specs */}
        <div className="group rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">01 &bull; Technical Docs</span>
              <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">Markdown Native</span>
            </div>
            <h3 className="mt-3 text-xl font-[850] tracking-tight text-[#050505]">
              Docs that stay structured as you scale.
            </h3>
            <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
              No formatting friction. Write engineering RFCs, system specs, and meeting notes with code blocks, callouts, and collapsible sections.
            </p>

            {/* Authentic Notion Document Mockup */}
            <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200/80 text-xs">
                <span className="text-base">📐</span>
                <span className="font-bold text-neutral-900">API Architecture &amp; Caching Strategy</span>
              </div>

              {/* Callout Block */}
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-neutral-700 flex items-start gap-2">
                <span className="text-blue-600 font-bold">ℹ️</span>
                <div>
                  <span className="font-bold text-blue-950">Architecture Note: </span>
                  Warm pages resolve in &lt;0.1ms from process RAM; invalidations broadcast through Redis.
                </div>
              </div>

              {/* Interactive Toggle Block */}
              <div className="rounded-lg border border-neutral-200 bg-white p-3 text-xs shadow-2xs">
                <button
                  onClick={() => setToggleOpen(!toggleOpen)}
                  className="flex items-center gap-1.5 font-bold text-neutral-900 w-full text-left cursor-pointer"
                >
                  {toggleOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-500" />
                  )}
                  <span>Database Query Benchmark (Click to toggle)</span>
                </button>

                {toggleOpen && (
                  <div className="mt-2.5 pl-5 border-l-2 border-neutral-200 space-y-1.5 text-[11px] text-neutral-600">
                    <div className="flex justify-between">
                      <span>Traditional Recursive Tree:</span>
                      <span className="font-mono text-neutral-800">~142ms (N queries)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-emerald-800">Our Materialized Path:</span>
                      <span className="font-mono font-bold text-emerald-700">1.4ms (1 query)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/product"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#0078df] hover:underline"
          >
            Explore document canvas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Pillar 2: Multi-View Connected Databases */}
        <div className="group rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">02 &bull; Connected Databases</span>
              <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">3 Views</span>
            </div>
            <h3 className="mt-3 text-xl font-[850] tracking-tight text-[#050505]">
              One database. Any view you want.
            </h3>
            <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
              Toggle instantly between a Kanban sprint board, a detailed technical table, or a timeline roadmap with the same underlying data.
            </p>

            {/* View switcher tabs */}
            <div className="mt-5 flex items-center gap-1.5 border-b border-neutral-200 pb-2">
              <button
                onClick={() => setDbView("board")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  dbView === "board"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Kanban className="h-3 w-3" /> Board
              </button>
              <button
                onClick={() => setDbView("table")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  dbView === "table"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Database className="h-3 w-3" /> Table
              </button>
              <button
                onClick={() => setDbView("timeline")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  dbView === "timeline"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Calendar className="h-3 w-3" /> Timeline
              </button>
            </div>

            {/* Database View Container */}
            <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5 shadow-2xs">
              {dbView === "board" && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-2">
                    <div className="font-bold text-neutral-500 text-[11px] pb-1 border-b border-neutral-200">
                      In Progress (2)
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-neutral-200 shadow-2xs space-y-1.5">
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">P0 &bull; Security</span>
                      <p className="font-bold text-neutral-900 text-[11px]">Audit KMS encryption key rotation</p>
                      <div className="text-[10px] text-neutral-500">@sarah</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-bold text-neutral-500 text-[11px] pb-1 border-b border-neutral-200">
                      Shipped (1)
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-neutral-200 shadow-2xs space-y-1.5">
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Shipped</span>
                      <p className="font-bold text-neutral-900 text-[11px]">O(1) Ancestors Materialized Path</p>
                      <div className="text-[10px] text-neutral-500">@alex</div>
                    </div>
                  </div>
                </div>
              )}

              {dbView === "table" && (
                <div className="text-[11px] space-y-1.5">
                  <div className="grid grid-cols-3 font-bold text-neutral-500 pb-1 border-b border-neutral-200">
                    <span>Task Name</span>
                    <span>Status</span>
                    <span>Assignee</span>
                  </div>
                  <div className="grid grid-cols-3 py-1 text-neutral-800 border-b border-neutral-100">
                    <span className="font-semibold">Audit KMS key rotation</span>
                    <span className="text-rose-700 font-bold">P0 &bull; In Progress</span>
                    <span className="text-neutral-500">@sarah</span>
                  </div>
                  <div className="grid grid-cols-3 py-1 text-neutral-800">
                    <span className="font-semibold">O(1) Materialized Path</span>
                    <span className="text-emerald-700 font-bold">Shipped</span>
                    <span className="text-neutral-500">@alex</span>
                  </div>
                </div>
              )}

              {dbView === "timeline" && (
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-neutral-500 text-[10px]">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                  </div>
                  <div className="h-5 rounded bg-blue-100 text-blue-800 px-2 flex items-center font-bold text-[10px]">
                    KMS Key Rotation &bull; Active
                  </div>
                  <div className="h-5 rounded bg-emerald-100 text-emerald-800 px-2 flex items-center font-bold text-[10px]">
                    Materialized Path &bull; Done
                  </div>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/product"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#0078df] hover:underline"
          >
            Explore database views <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Pillar 3: Grounded Notion AI (Full width card) */}
        <div className="group md:col-span-2 rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">03 &bull; Built-in AI</span>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Grounded Vector Retrieval
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-[850] tracking-tight text-[#050505]">
                Answers grounded in your team&apos;s actual documents.
              </h3>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed max-w-xl">
                Notion AI doesn&apos;t guess. It searches your workspace&apos;s vector embeddings to synthesize answers with exact document citations.
              </p>
            </div>

            {/* Prompt Selector Pills */}
            <div className="flex flex-wrap gap-2 self-start md:self-auto">
              {aiPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveAiPrompt(idx)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                    activeAiPrompt === idx
                      ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                      : "bg-white text-neutral-700 border-neutral-200 hover:border-purple-300 hover:bg-neutral-50"
                  }`}
                >
                  {p.action}
                </button>
              ))}
            </div>
          </div>

          {/* AI Interaction Workbench */}
          <div className="mt-5 rounded-xl border border-purple-200/80 bg-purple-50/30 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-950 font-mono bg-white p-2.5 rounded-lg border border-purple-200/70">
              <span className="text-[#9d34da] font-bold">✨</span>
              <span>{aiPrompts[activeAiPrompt].query}</span>
            </div>

            <div className="p-4 rounded-lg bg-white border border-purple-200 text-xs text-neutral-800 leading-relaxed whitespace-pre-line shadow-2xs">
              {aiPrompts[activeAiPrompt].result}
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Grounded in workspace knowledge
              </span>
              <span className="text-neutral-500 font-medium font-mono text-[10px]">
                Source: {aiPrompts[activeAiPrompt].source}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* WORKSPACES BY TEAM: REAL WORKSPACES, REAL TEAMS */}
      <div className="mt-20">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full inline-block mb-3">
            EVERY TEAM IN ONE GRAPH
          </span>
          <h3 className="text-2xl sm:text-3xl font-[850] tracking-tight text-[#050505]">
            Built for how modern teams work.
          </h3>
          <p className="mt-1.5 text-sm text-neutral-600 font-normal">
            Switch between teams to see how engineering, product, design, and operations collaborate in Notion.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="inline-flex p-1 rounded-xl bg-neutral-100 border border-neutral-200 shadow-2xs">
            {(
              [
                { id: "eng", label: "Engineering" },
                { id: "product", label: "Product" },
                { id: "design", label: "Design" },
                { id: "wiki", label: "Company Wiki" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTeamTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  teamTab === tab.id
                    ? "bg-white text-neutral-900 shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Workspace Showcase */}
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-6 sm:p-8 transition-all duration-300">
          <div className="max-w-xl mb-5">
            <h4 className="text-lg font-[850] text-neutral-900">
              {teamWorkspaces[teamTab].title}
            </h4>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              {teamWorkspaces[teamTab].subtitle}
            </p>
          </div>

          {teamWorkspaces[teamTab].preview}
        </div>
      </div>
    </section>
  );
};
