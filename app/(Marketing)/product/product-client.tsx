"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  BookOpen,
  CheckSquare,
  Sparkles,
  Kanban,
  Table,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Code,
  Copy,
  Check,
  Search,
  Mic,
  Sliders,
  Play,
  Layers,
  Zap,
  Globe,
  Plus,
  Clock,
  Send,
  HelpCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Authentic Notion AI Star / Sparkle Icon (Clean SVG)
function NotionAiSparkleIcon({ className = "h-6 w-6 text-[#9d34da]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C12.4 6.8 15.2 9.6 20 10C15.2 10.4 12.4 13.2 12 18C11.6 13.2 8.8 10.4 4 10C8.8 9.6 11.6 6.8 12 2Z" />
      <path
        d="M19 16C19.2 18.2 20.2 19.2 22 19.5C20.2 19.8 19.2 20.8 19 23C18.8 20.8 17.8 19.8 16 19.5C17.8 19.2 18.8 18.2 19 16Z"
        opacity="0.85"
      />
      <path
        d="M6 16C6.15 17.8 7 18.6 8.5 18.8C7 19 6.15 19.8 6 21.5C5.85 19.8 5 19 3.5 18.8C5 18.6 5.85 17.8 6 16Z"
        opacity="0.75"
      />
    </svg>
  );
}

export function ProductInteractive() {
  const [activeTab, setActiveTab] = useState<"editor" | "databases" | "ai" | "calendar">("editor");
  const [dbViewMode, setDbViewMode] = useState<"kanban" | "timeline" | "table">("kanban");
  const [copiedCode, setCopiedCode] = useState(false);

  // Interactive Checklist states
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Finalize Next.js 16 App Router migration", checked: true },
    { id: 2, text: "Dual-Tier Redis L2 Cache write-through invalidation", checked: true },
    { id: 3, text: "Pyodide WebAssembly client Python execution sandbox", checked: true },
    { id: 4, text: "FastAPI Vector RAG indexer with 2.5s edit debouncer", checked: false },
  ]);

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Interactive AI Simulator states
  const [aiQuery, setAiQuery] = useState("Summarize sprint decisions from meeting audio");
  const [aiResponse, setAiResponse] = useState<string | null>(
    "Based on the transcript and Architecture Specs (p. 14):\n• Approved Dual-Tier cache: L1 Memory (<0.1ms) + L2 Upstash Redis (~8ms)\n• Materialized Path tree hierarchy adopted for O(1) single-query subtrees\n• Action items assigned to @core-platform-team for Friday release."
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const triggerAiDemo = (promptText: string, resultText: string) => {
    setAiQuery(promptText);
    setIsGeneratingAi(true);
    setAiResponse(null);
    setTimeout(() => {
      setAiResponse(resultText);
      setIsGeneratingAi(false);
    }, 600);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`// In-Browser Pyodide WASM Execution
import pyodide from "pyodide";
const result = await pyodide.runPythonAsync(\`
  data = [12, 45, 78, 23, 89]
  print(f"Computed Sprint Velocity: {sum(data)/len(data):.1f}")
\`);`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full bg-white">
      {/* 1. PRODUCT PILLARS (WITH REAL NOTION AI LOGO - NO ROBOT ICON) */}
      <section className="mx-auto max-w-[1140px] px-5 py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Docs & Canvas */}
          <div
            onClick={() => setActiveTab("editor")}
            className={`rounded-2xl border p-6 transition-all duration-200 cursor-pointer shadow-2xs hover:-translate-y-1 hover:shadow-md ${
              activeTab === "editor"
                ? "border-[#0078df] bg-blue-50/20 shadow-xs"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-blue-200/80 text-[#0078df] shadow-2xs">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-[850] text-[#050505]">Docs &amp; Dynamic Canvas</h3>
            <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-normal">
              Rich blocks: toggles, checklists, data tables, callouts, Unsplash covers, and debounced auto-saving.
            </p>
            <div className="mt-4 flex items-center text-[11px] font-bold text-[#0078df]">
              <span>Explore Canvas</span> <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </div>

          {/* Card 2: Connected Wikis */}
          <div
            onClick={() => setActiveTab("calendar")}
            className={`rounded-2xl border p-6 transition-all duration-200 cursor-pointer shadow-2xs hover:-translate-y-1 hover:shadow-md ${
              activeTab === "calendar"
                ? "border-emerald-500 bg-emerald-50/20 shadow-xs"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 shadow-2xs">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-[850] text-[#050505]">Connected Wikis</h3>
            <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-normal">
              Organize team knowledge with O(1) Materialized Path hierarchy, tags, and Cmd+K spotlight search.
            </p>
            <div className="mt-4 flex items-center text-[11px] font-bold text-emerald-600">
              <span>View Structure</span> <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </div>

          {/* Card 3: Multi-View Databases */}
          <div
            onClick={() => setActiveTab("databases")}
            className={`rounded-2xl border p-6 transition-all duration-200 cursor-pointer shadow-2xs hover:-translate-y-1 hover:shadow-md ${
              activeTab === "databases"
                ? "border-purple-500 bg-purple-50/20 shadow-xs"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 border border-purple-200/80 text-purple-600 shadow-2xs">
              <Kanban className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-[850] text-[#050505]">Multi-View Databases</h3>
            <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-normal">
              Switch effortlessly between drag-and-drop Kanban boards, Timeline Gantt charts, and editable Data Tables.
            </p>
            <div className="mt-4 flex items-center text-[11px] font-bold text-purple-600">
              <span>Test Board Views</span> <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </div>

          {/* Card 4: Authentic Notion AI Logo (No Robot Icon!) */}
          <div
            onClick={() => setActiveTab("ai")}
            className={`rounded-2xl border p-6 transition-all duration-200 cursor-pointer shadow-2xs hover:-translate-y-1 hover:shadow-md ${
              activeTab === "ai"
                ? "border-[#9d34da] bg-purple-50/20 shadow-xs"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 border border-purple-200 text-[#9d34da] shadow-2xs">
              {/* Official Notion AI Sparkle / Star Emblem */}
              <NotionAiSparkleIcon className="h-6 w-6 text-[#9d34da]" />
            </div>
            <h3 className="mt-5 text-lg font-[850] text-[#050505]">Notion AI &amp; Voice Notes</h3>
            <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-normal">
              FastAPI RAG vector intelligence with ChromaDB, Gemini 1.5 Flash synthesis, and audio meeting notes.
            </p>
            <div className="mt-4 flex items-center text-[11px] font-bold text-[#9d34da]">
              <span>Try Native AI</span> <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE PRODUCT PLAYGROUND */}
      <section className="mx-auto max-w-[1140px] px-5 pt-4 pb-20">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#0078df] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full inline-block">
            Interactive Product Preview
          </span>
          <h2 className="mt-3 text-[30px] font-[850] tracking-tight text-[#050505] sm:text-[40px] leading-tight">
            See how work actually happens.
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Switch between the dynamic views below to test our Block Canvas, Multi-View Databases, and Native AI assistant.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200 shadow-inner">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "editor"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <FileText className="h-4 w-4 text-blue-600" />
              Dynamic Block Canvas
            </button>
            <button
              onClick={() => setActiveTab("databases")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "databases"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Kanban className="h-4 w-4 text-purple-600" />
              Multi-View Databases
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "ai"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <NotionAiSparkleIcon className="h-4 w-4 text-[#9d34da]" />
              Notion AI &amp; Meeting Voice
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "calendar"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <CalendarIcon className="h-4 w-4 text-emerald-600" />
              Notion Calendar
            </button>
          </div>
        </div>

        {/* Live Playground Canvas Container */}
        <div className="rounded-3xl border border-neutral-200/90 bg-white shadow-lg overflow-hidden transition-all duration-300">
          {/* Top Browser / Workspace Chrome Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 bg-neutral-50 px-5 py-3.5 gap-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-neutral-300 border border-neutral-400 inline-block" />
              <span className="h-3 w-3 rounded-full bg-neutral-300 border border-neutral-400 inline-block" />
              <span className="h-3 w-3 rounded-full bg-neutral-300 border border-neutral-400 inline-block" />
              <span className="ml-2 text-xs font-medium text-neutral-500">
                workspace.notion.so/engineering/core-platform
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span className="font-semibold text-neutral-700">0ms Local-First Sync: Connected</span>
            </div>
          </div>

          {/* TAB 1: BLOCK CANVAS & EDITOR SIMULATOR */}
          {activeTab === "editor" && (
            <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
              {/* Header Title with Emoji Icon & Cover Banner */}
              <div>
                <div className="text-4xl mb-3 select-none">🚀</div>
                <h1 className="text-3xl sm:text-4xl font-[850] text-[#050505] tracking-tight">
                  Q3 Product Specs &amp; Sprint Execution
                </h1>
                <p className="mt-2 text-sm text-neutral-500">
                  Last edited 2 minutes ago by <span className="font-bold text-neutral-800">Alex Chen</span> &bull; 4 collaborators active
                </p>
              </div>

              {/* Callout Block with Icon */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 flex items-start gap-3 text-sm">
                <span className="text-lg select-none">💡</span>
                <div>
                  <span className="font-bold text-blue-900">Sprint Goal:</span>
                  <span className="text-neutral-700 ml-1">
                    Deliver sub-0.1ms document rendering across all enterprise workspaces using Dual-Tier L1 RAM and Upstash Redis L2 caching.
                  </span>
                </div>
              </div>

              {/* Interactive Checklist Block */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Sprint Deliverables (Click to toggle)
                </div>
                <div className="space-y-2">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {}}
                        className="h-4.5 w-4.5 rounded border-neutral-300 text-[#0078df] focus:ring-0 cursor-pointer"
                      />
                      <span
                        className={`text-sm transition-all ${
                          item.checked
                            ? "line-through text-neutral-400"
                            : "text-neutral-800 font-medium group-hover:text-black"
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Polyglot Code Block with Pyodide WASM Execution */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-950 text-neutral-200 p-4 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1.5 font-semibold text-neutral-300">
                    <Code className="h-3.5 w-3.5 text-blue-400" /> Python (Pyodide WASM In-Browser Runner)
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <pre className="mt-3 text-emerald-400 text-xs overflow-x-auto leading-relaxed">
{`# Client-side Python running inside Notion document block
import math

sprint_velocity = [42, 58, 64, 71]
average_burn = sum(sprint_velocity) / len(sprint_velocity)
print(f"✅ Rolling Sprint Velocity: {average_burn:.1f} pts/wk (0ms WASM runtime)")`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-VIEW DATABASES (KANBAN / TIMELINE / TABLE) */}
          {activeTab === "databases" && (
            <div className="p-6 sm:p-8">
              {/* Database View Switcher Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDbViewMode("kanban")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      dbViewMode === "kanban"
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    <Kanban className="h-3.5 w-3.5" /> Kanban Board
                  </button>
                  <button
                    onClick={() => setDbViewMode("timeline")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      dbViewMode === "timeline"
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" /> Timeline Gantt
                  </button>
                  <button
                    onClick={() => setDbViewMode("table")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      dbViewMode === "table"
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    <Table className="h-3.5 w-3.5" /> Data Table
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                  <span>Filtered: Sprint Backlog &bull; 14 Items</span>
                </div>
              </div>

              {/* View 1: Kanban Board */}
              {dbViewMode === "kanban" && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Column 1: To Do */}
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-200 text-xs font-bold text-neutral-700">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-neutral-400" /> To Do
                      </span>
                      <span className="bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded font-bold text-[10px]">2</span>
                    </div>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-2xs hover:border-[#0078df] cursor-pointer transition-colors">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Security</span>
                        <h4 className="mt-2 text-xs font-bold text-neutral-900">Configure BYOK KMS encryption</h4>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                          <span>@sarah</span>
                          <span className="text-rose-600 font-bold text-xs">P0</span>
                        </div>
                      </div>
                      <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-2xs hover:border-[#0078df] cursor-pointer transition-colors">
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Design</span>
                        <h4 className="mt-2 text-xs font-bold text-neutral-900">WebGL 3D audio waveform spec</h4>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                          <span>@elena</span>
                          <span className="text-amber-600 font-bold text-xs">P1</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: In Progress */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4">
                    <div className="flex items-center justify-between pb-3 border-b border-blue-200 text-xs font-bold text-blue-900">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-600" /> In Progress
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold text-[10px]">2</span>
                    </div>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-2xs hover:border-[#0078df] cursor-pointer transition-colors">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Database</span>
                        <h4 className="mt-2 text-xs font-bold text-neutral-900">O(1) Ancestors Materialized Path</h4>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                          <span>@alex</span>
                          <span className="text-rose-600 font-bold text-xs">P0</span>
                        </div>
                      </div>
                      <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-2xs hover:border-[#0078df] cursor-pointer transition-colors">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Cache</span>
                        <h4 className="mt-2 text-xs font-bold text-neutral-900">L1 RAM &amp; L2 Redis invalidation</h4>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                          <span>@marcus</span>
                          <span className="text-emerald-600 font-bold text-xs">P2</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Shipped */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
                    <div className="flex items-center justify-between pb-3 border-b border-emerald-200 text-xs font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-600" /> Shipped
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold text-[10px]">1</span>
                    </div>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-2xs">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Core Engine</span>
                        <h4 className="mt-2 text-xs font-bold text-neutral-900 line-through text-neutral-500">
                          Local-First IndexedDB 0ms Persistence
                        </h4>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                          <span>Completed</span>
                          <span className="text-emerald-700 font-bold">&#10003; Live</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View 2: Timeline Gantt View */}
              {dbViewMode === "timeline" && (
                <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 text-xs space-y-4">
                  <div className="text-xs font-sans font-bold text-neutral-800">Sprint Schedule Timeline:</div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="w-36 truncate font-bold text-neutral-800">L1+L2 Cache Engine</span>
                      <div className="flex-1 bg-neutral-100 h-6 rounded-md relative overflow-hidden">
                        <div className="absolute left-[10%] w-[55%] h-full bg-blue-500 text-white flex items-center px-2 text-[10px] font-bold rounded">
                          Aug 28 - Sep 12 &bull; Active
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-36 truncate font-bold text-neutral-800">Materialized Path O(1)</span>
                      <div className="flex-1 bg-neutral-100 h-6 rounded-md relative overflow-hidden">
                        <div className="absolute left-[30%] w-[45%] h-full bg-purple-500 text-white flex items-center px-2 text-[10px] font-bold rounded">
                          Sep 04 - Sep 18 &bull; Testing
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-36 truncate font-bold text-neutral-800">FastAPI Vector RAG</span>
                      <div className="flex-1 bg-neutral-100 h-6 rounded-md relative overflow-hidden">
                        <div className="absolute left-[50%] w-[40%] h-full bg-amber-500 text-white flex items-center px-2 text-[10px] font-bold rounded">
                          Sep 14 - Sep 28 &bull; In Progress
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View 3: Data Table View */}
              {dbViewMode === "table" && (
                <div className="mt-6 rounded-xl border border-neutral-200 overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-200 font-bold text-neutral-700">
                      <tr>
                        <th className="p-3">Task Name</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Owner</th>
                        <th className="p-3">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800 font-medium">
                      <tr>
                        <td className="p-3 font-bold">O(1) Ancestors Materialized Path</td>
                        <td className="p-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">In Progress</span></td>
                        <td className="p-3">Alex Chen</td>
                        <td className="p-3 text-rose-600 font-bold">P0</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">Dual-Tier RAM + Redis Caching</td>
                        <td className="p-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">In Progress</span></td>
                        <td className="p-3">Marcus Brody</td>
                        <td className="p-3 text-amber-600 font-bold">P1</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">Local-First 0ms Persistence</td>
                        <td className="p-3"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">Shipped</span></td>
                        <td className="p-3">Elena Rostova</td>
                        <td className="p-3 text-emerald-600 font-bold">P2</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTION AI & MEETING AUDIO NOTES (AUTHENTIC BRANDING) */}
          {activeTab === "ai" && (
            <div className="p-6 sm:p-10 max-w-3xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#9d34da] shadow-2xs">
                  <NotionAiSparkleIcon className="h-6 w-6 text-[#9d34da]" />
                </div>
                <div>
                  <h3 className="text-xl font-[850] text-[#050505]">Notion AI Knowledge Assistant</h3>
                  <p className="text-xs text-neutral-500">
                    Grounded in your workspace documents via FastAPI &amp; ChromaDB vector search.
                  </p>
                </div>
              </div>

              {/* Sample Prompt Selector Buttons */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Try a simulated enterprise prompt:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      triggerAiDemo(
                        "Summarize sprint decisions from meeting audio",
                        "From the recorded meeting transcript:\n• Finalized Dual-Tier cache: L1 Memory (<0.1ms) + L2 Redis (~8ms)\n• Materialized Path tree hierarchy chosen for O(1) single-query subtrees\n• Action items assigned to @core-platform-team for release."
                      )
                    }
                    className="text-xs px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-800 font-bold hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    ✨ Summarize Sprint Decisions
                  </button>
                  <button
                    onClick={() =>
                      triggerAiDemo(
                        "What is our database failover SLA policy?",
                        "From Architecture Specs (lib/mongodb.ts & /api/health/db):\n• Uptime SLA: 99.99% guaranteed\n• Automated failover triggers to MONGODB_BACKUP_URI within <350ms upon primary heartbeat failure."
                      )
                    }
                    className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    ✨ Database Failover SLA Policy
                  </button>
                  <button
                    onClick={() =>
                      triggerAiDemo(
                        "Generate release notes for Pyodide WASM",
                        "Release Notes: In-Browser Python Sandbox (lib/code-runner.ts)\n- Runs client-side Python 3.11 via WebAssembly\n- Intercepted console.log stdout with execution runtime tracking (ms)\n- Zero cloud compute cost."
                      )
                    }
                    className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    ✨ Pyodide WASM Release Notes
                  </button>
                </div>
              </div>

              {/* Query Box */}
              <div className="rounded-xl border border-purple-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900 border-b border-neutral-100 pb-2">
                  <NotionAiSparkleIcon className="h-4 w-4 text-[#9d34da]" />
                  <span>Prompt: &ldquo;{aiQuery}&rdquo;</span>
                </div>

                {isGeneratingAi ? (
                  <div className="py-6 flex items-center justify-center gap-2 text-xs text-purple-700 font-bold">
                    <Sparkles className="h-4 w-4 animate-spin text-[#9d34da]" />
                    <span>Searching workspace vector embeddings with ChromaDB...</span>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-800 whitespace-pre-line leading-relaxed bg-purple-50/40 p-3 rounded-lg border border-purple-100 font-medium">
                    {aiResponse}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-100">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> Grounded in 3 verified documents with citations
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">rag_service/main.py</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTION CALENDAR */}
          {activeTab === "calendar" && (
            <div className="p-6 sm:p-10 max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div>
                  <h3 className="text-xl font-[850] text-[#050505]">Connected Notion Calendar</h3>
                  <p className="text-xs text-neutral-500">
                    Deadlines, sprint launches, and meetings synced directly with workspace database items.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  Active Sprint 14
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { time: "Today &bull; 10:00 AM", title: "Core Platform Sprint Kickoff", tag: "Sprint Planning", color: "border-blue-200 bg-blue-50/50 text-blue-900" },
                  { time: "Tomorrow &bull; 02:30 PM", title: "Enterprise Security Architecture Review", tag: "Security", color: "border-purple-200 bg-purple-50/50 text-purple-900" },
                  { time: "Friday &bull; 04:00 PM", title: "Production Deployment (v1.4.0)", tag: "Deployment", color: "border-emerald-200 bg-emerald-50/50 text-emerald-900" },
                  { time: "Monday &bull; 11:00 AM", title: "FastAPI RAG Ingestion Performance Sync", tag: "AI / ML", color: "border-amber-200 bg-amber-50/50 text-amber-900" },
                ].map((ev, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${ev.color} shadow-2xs hover:shadow-xs transition-shadow`}>
                    <div className="text-[10px] font-semibold opacity-70" dangerouslySetInnerHTML={{ __html: ev.time }} />
                    <h4 className="mt-1 text-sm font-bold">{ev.title}</h4>
                    <span className="mt-2 inline-block text-[10px] font-bold bg-white/80 px-2 py-0.5 rounded border border-current">
                      {ev.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. DEEP INTEGRATION (LIGHT THEME) */}
      <section className="mx-auto max-w-[1140px] px-5 pb-16">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50/70 p-8 sm:p-12 shadow-sm">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#0078df]">
              CONNECTED ECOSYSTEM
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-[850] tracking-tight text-[#050505]">
              Connected context across every page and database.
            </h2>
            <p className="mt-3 text-base text-neutral-600 leading-relaxed font-normal">
              Every document in your workspace can become a database item, and every database item can open into a full canvas document. Sync with Slack, GitHub, Jira, and Google Drive seamlessly.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-bold text-neutral-800">
              <span className="flex items-center gap-1.5 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <Zap className="h-4 w-4 text-[#0078df]" /> Instant Cmd+K Search
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> O(1) Materialized Subtrees
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <NotionAiSparkleIcon className="h-4 w-4 text-[#9d34da]" /> FastAPI RAG Knowledge
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
