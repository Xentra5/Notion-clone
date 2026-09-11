"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Rocket,
  Palette,
  Bot,
  Users2,
  GitPullRequest,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  ChevronRight,
} from "lucide-react";

type Discipline = "eng" | "product" | "design" | "ops" | "hr";

interface DisciplineData {
  id: Discipline;
  label: string;
  tag: string;
  headline: string;
  subheadline: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  stats: { label: string; value: string }[];
}

const disciplines: DisciplineData[] = [
  {
    id: "eng",
    label: "Engineering",
    tag: "ENG-WORKSPACE",
    headline: "From RFC to production deployment in one view",
    subheadline:
      "Connect architectural decision records (ADRs), sprint backlog tickets, and pull requests without leaving your doc model.",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    stats: [
      { label: "Sprint velocity increase", value: "+34%" },
      { label: "PR context switching", value: "-62%" },
      { label: "ADR adoption rate", value: "100%" },
    ],
  },
  {
    id: "product",
    label: "Product Management",
    tag: "PRD-WORKSPACE",
    headline: "Customer feedback connected directly to roadmaps",
    subheadline:
      "Triage user interviews, synthesize recurring pain points with AI, and map them to weighted quarterly roadmaps.",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
    stats: [
      { label: "Feedback-to-spec time", value: "2 days" },
      { label: "Spec review turnaround", value: "3.5x faster" },
      { label: "Roadmap visibility", value: "Company-wide" },
    ],
  },
  {
    id: "design",
    label: "Design & Brand",
    tag: "DESIGN-SYSTEM",
    headline: "Living design system & token repository",
    subheadline:
      "Embed live Figma frames, document color and typography token scales, and maintain unified component guidelines.",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200",
    stats: [
      { label: "Design-eng handoff friction", value: "-48%" },
      { label: "Token consistency", value: "99.8%" },
      { label: "Asset retrieval time", value: "<15s" },
    ],
  },
  {
    id: "ops",
    label: "Operations & AI",
    tag: "OPS-AI-WORKSPACE",
    headline: "Autonomous runbooks & cross-team intelligence",
    subheadline:
      "Run AI agents that summarize cross-functional blockers, draft incident post-mortems, and trigger status updates.",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-200",
    stats: [
      { label: "Status report prep time", value: "0 hrs" },
      { label: "MTTR incident doc", value: "8 mins" },
      { label: "Automated triage", value: "24/7" },
    ],
  },
  {
    id: "hr",
    label: "People & HR",
    tag: "PEOPLE-OPS",
    headline: "Living onboarding wikis new hires actually read",
    subheadline:
      "Interactive 30-60-90 checklists, company policies, and department org charts that stay updated automatically.",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-200",
    stats: [
      { label: "Ramp time to first PR", value: "4.2 days" },
      { label: "Policy search queries", value: "<10s" },
      { label: "Onboarding completion", value: "99%" },
    ],
  },
];

export function SolutionsShowcase() {
  const [activeTab, setActiveTab] = useState<Discipline>("eng");
  const [engSubView, setEngSubView] = useState<"board" | "adr">("board");

  const current = disciplines.find((d) => d.id === activeTab) || disciplines[0];

  return (
    <div className="w-full">
      {/* Discipline Selector Tabs */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none border-b border-neutral-200">
        <div className="inline-flex p-1 bg-neutral-100 rounded-[10px] gap-1 border border-neutral-200/80">
          {disciplines.map((d) => {
            const isActive = d.id === activeTab;
            return (
              <button
                key={d.id}
                onClick={() => setActiveTab(d.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium rounded-[6px] transition-all duration-160 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-white text-neutral-900 shadow-xs font-semibold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50"
                }`}
              >
                {d.id === "eng" && <Code2 className="h-3.5 w-3.5 text-emerald-600" />}
                {d.id === "product" && <Rocket className="h-3.5 w-3.5 text-blue-600" />}
                {d.id === "design" && <Palette className="h-3.5 w-3.5 text-purple-600" />}
                {d.id === "ops" && <Bot className="h-3.5 w-3.5 text-amber-600" />}
                {d.id === "hr" && <Users2 className="h-3.5 w-3.5 text-rose-600" />}
                <span>{d.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Showcase Panel */}
      <div className="mt-8 rounded-[14px] border border-neutral-200 bg-white shadow-xs overflow-hidden">
        {/* Discipline Header Bar */}
        <div className="border-b border-neutral-200 bg-[#fbfbfa] px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className={`px-2 py-0.5 text-[11px] font-mono uppercase font-semibold rounded-[4px] border ${current.badgeBg} ${current.badgeText} ${current.badgeBorder}`}
              >
                {current.tag}
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                workspace://solutions/{current.id}
              </span>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
              {current.headline}
            </h2>
            <p className="mt-1 text-sm text-neutral-600 max-w-2xl">
              {current.subheadline}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-200 shrink-0">
            {current.stats.map((st, i) => (
              <div key={i} className="text-left">
                <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-neutral-900">
                  {st.value}
                </div>
                <div className="text-[11px] text-neutral-500 uppercase tracking-wide">
                  {st.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Interactive Workspace Simulation */}
        <div className="p-4 sm:p-6 bg-white">
          {/* 1. ENGINEERING WORKSPACE */}
          {activeTab === "eng" && (
            <div className="space-y-4">
              {/* Internal Tab Bar */}
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <button
                    onClick={() => setEngSubView("board")}
                    className={`px-3 py-1.5 rounded-[6px] transition cursor-pointer ${
                      engSubView === "board"
                        ? "bg-neutral-900 text-white font-semibold"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    Sprint 42 Board
                  </button>
                  <button
                    onClick={() => setEngSubView("adr")}
                    className={`px-3 py-1.5 rounded-[6px] transition cursor-pointer ${
                      engSubView === "adr"
                        ? "bg-neutral-900 text-white font-semibold"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    ADR-14 Architecture Spec
                  </button>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[12px] font-mono text-neutral-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  branch: release/v2.4
                </div>
              </div>

              {engSubView === "board" ? (
                /* Board View */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Column 1: In Progress */}
                  <div className="rounded-[8px] bg-[#fbfbfa] p-3 border border-neutral-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200 text-xs font-semibold text-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        <span>In Progress (2)</span>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div className="p-3 bg-white rounded-[6px] border border-neutral-200 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                          <span>ENG-412</span>
                          <span className="text-amber-700 font-medium">P1 High</span>
                        </div>
                        <h4 className="mt-1 text-[13px] font-medium text-neutral-900 leading-snug">
                          Distributed token bucket rate limiter for API endpoints
                        </h4>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                          <span className="flex items-center gap-1 font-mono">
                            <GitPullRequest className="h-3 w-3 text-neutral-400" /> PR #223
                          </span>
                          <span className="font-mono text-neutral-600">@chen</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-[6px] border border-neutral-200 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                          <span>ENG-415</span>
                          <span className="text-neutral-500">P2 Med</span>
                        </div>
                        <h4 className="mt-1 text-[13px] font-medium text-neutral-900 leading-snug">
                          Optimize cold-start subtree hydration in Redis LRU
                        </h4>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                          <span className="flex items-center gap-1 font-mono">
                            <GitPullRequest className="h-3 w-3 text-neutral-400" /> PR #225
                          </span>
                          <span className="font-mono text-neutral-600">@kavita</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: In Review */}
                  <div className="rounded-[8px] bg-[#fbfbfa] p-3 border border-neutral-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200 text-xs font-semibold text-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>In Review (1)</span>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div className="p-3 bg-white rounded-[6px] border border-neutral-200 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                          <span>ENG-409</span>
                          <span className="text-emerald-700 font-medium">Ready</span>
                        </div>
                        <h4 className="mt-1 text-[13px] font-medium text-neutral-900 leading-snug">
                          O(1) Materialized Path hierarchy schema migration
                        </h4>
                        <div className="mt-2 flex items-center gap-1 text-[11px] text-neutral-600 font-mono bg-neutral-100 p-1.5 rounded-[4px]">
                          <span>Linked to: ADR-14 (Accepted)</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                          <span className="flex items-center gap-1 font-mono text-blue-600">
                            <GitPullRequest className="h-3 w-3" /> PR #219 (2 approvals)
                          </span>
                          <span className="font-mono">@alex</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Shipped & Deployed */}
                  <div className="rounded-[8px] bg-[#fbfbfa] p-3 border border-neutral-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200 text-xs font-semibold text-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Deployed to Prod (2)</span>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div className="p-3 bg-white rounded-[6px] border border-neutral-200 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                          <span>ENG-398</span>
                          <span className="text-emerald-700 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="h-3 w-3" /> Merged
                          </span>
                        </div>
                        <h4 className="mt-1 text-[13px] font-medium text-neutral-900 leading-snug">
                          Multi-tenant organization boundary enforcement
                        </h4>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                          <span className="font-mono">commit #8f32a0c</span>
                          <span className="font-mono">@sarah</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ADR Spec View */
                <div className="rounded-[8px] bg-[#fbfbfa] p-5 border border-neutral-200 font-sans">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <div>
                      <span className="text-[11px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-[4px] font-semibold">
                        STATUS: ACCEPTED
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-neutral-900">
                        ADR-14: Distributed Hierarchy Storage via Materialized Paths
                      </h3>
                    </div>
                    <div className="text-right text-xs font-mono text-neutral-500">
                      <div>Author: @alex (Principal Architect)</div>
                      <div>Date: 2026-11-12</div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-neutral-700">
                    <p>
                      <strong>Context:</strong> Notion&apos;s nested block trees previously required recursive graph queries for permission checks. At scale, moving deep page subtrees caused database lock contention.
                    </p>
                    <div className="p-3 bg-white rounded-[6px] border border-neutral-200 font-mono text-xs text-neutral-800">
                      path: &quot;/workspace-90/teamspace-eng/adr-14&quot;
                      <br />
                      depth: 3 | access_level: &quot;write&quot; | cache_ttl: 3600
                    </div>
                    <p>
                      <strong>Decision:</strong> Store materialized path prefixes alongside parent pointers. Moves are executed with atomic string prefix replaces in MongoDB (<code className="font-mono text-xs bg-neutral-200 px-1 py-0.5 rounded">$regex: ^parentPath</code>), serving read requests in <span className="font-mono text-emerald-700 font-semibold">&lt;1.2ms</span>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. PRODUCT MANAGEMENT WORKSPACE */}
          {activeTab === "product" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-xs font-mono font-semibold uppercase text-neutral-500">
                  Feature Backlog & Customer Synthesis Matrix
                </span>
                <span className="text-xs font-mono text-neutral-500">3 features in review</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500 font-mono">
                      <th className="py-2.5 px-3">Feature Spec</th>
                      <th className="py-2.5 px-3">Primary Signal</th>
                      <th className="py-2.5 px-3">Impact</th>
                      <th className="py-2.5 px-3">Effort</th>
                      <th className="py-2.5 px-3">Target Sprint</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    <tr className="hover:bg-neutral-50">
                      <td className="py-3 px-3 font-semibold text-neutral-900">
                        Granular teamspace guest permissions
                      </td>
                      <td className="py-3 px-3 text-neutral-600">
                        Enterprise ARR ($140k) security blocker
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">High</td>
                      <td className="py-3 px-3 font-mono text-neutral-500">Med (3 pts)</td>
                      <td className="py-3 px-3 font-mono text-neutral-600">Sprint 43</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-[4px] bg-blue-100 text-blue-800 font-mono text-[11px]">
                          Spec Signed Off
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-3 px-3 font-semibold text-neutral-900">
                        Automated changelog generator from closed PRs
                      </td>
                      <td className="py-3 px-3 text-neutral-600">
                        DevRel team + 400 community upvotes
                      </td>
                      <td className="py-3 px-3 font-mono text-blue-700 font-semibold">High</td>
                      <td className="py-3 px-3 font-mono text-neutral-500">Low (1 pt)</td>
                      <td className="py-3 px-3 font-mono text-neutral-600">Sprint 42</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-[4px] bg-amber-100 text-amber-800 font-mono text-[11px]">
                          In Dev
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-3 px-3 font-semibold text-neutral-900">
                        Bi-directional GitHub Issue sync engine
                      </td>
                      <td className="py-3 px-3 text-neutral-600">
                        24 Enterprise clients request linear parity
                      </td>
                      <td className="py-3 px-3 font-mono text-rose-700 font-semibold">Critical</td>
                      <td className="py-3 px-3 font-mono text-neutral-500">High (8 pts)</td>
                      <td className="py-3 px-3 font-mono text-neutral-600">Sprint 44</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-[4px] bg-neutral-100 text-neutral-800 font-mono text-[11px]">
                          RFC Draft
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. DESIGN & BRAND WORKSPACE */}
          {activeTab === "design" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-xs font-mono font-semibold uppercase text-neutral-500">
                  Design System Token Engine v3.2 (Figma Linked)
                </span>
                <span className="text-xs font-mono text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Tokens In Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-[6px] border border-neutral-200 bg-[#fbfbfa]">
                  <div className="h-8 rounded-[4px] bg-[#0078DF] mb-2" />
                  <div className="font-mono text-xs font-semibold text-neutral-900">
                    --brand-primary
                  </div>
                  <div className="font-mono text-[11px] text-neutral-500">#0078DF (Notion Blue)</div>
                </div>

                <div className="p-3 rounded-[6px] border border-neutral-200 bg-[#fbfbfa]">
                  <div className="h-8 rounded-[4px] bg-[#111827] mb-2" />
                  <div className="font-mono text-xs font-semibold text-neutral-900">
                    --text-primary
                  </div>
                  <div className="font-mono text-[11px] text-neutral-500">#111827 (Gray 900)</div>
                </div>

                <div className="p-3 rounded-[6px] border border-neutral-200 bg-[#fbfbfa]">
                  <div className="h-8 rounded-[4px] bg-[#E5E7EB] mb-2" />
                  <div className="font-mono text-xs font-semibold text-neutral-900">
                    --border-hairline
                  </div>
                  <div className="font-mono text-[11px] text-neutral-500">#E5E7EB (Neutral 200)</div>
                </div>

                <div className="p-3 rounded-[6px] border border-neutral-200 bg-[#fbfbfa]">
                  <div className="h-8 rounded-[4px] bg-[#15803D] mb-2" />
                  <div className="font-mono text-xs font-semibold text-neutral-900">
                    --status-success
                  </div>
                  <div className="font-mono text-[11px] text-neutral-500">#15803D (Emerald 700)</div>
                </div>
              </div>

              <div className="p-4 rounded-[6px] border border-neutral-200 bg-white">
                <div className="text-xs font-mono text-neutral-500 mb-2">
                  Interactive Button Component Anatomy
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="h-9 px-4 rounded-[6px] bg-[#0078DF] text-white text-xs font-semibold">
                    Primary Action
                  </button>
                  <button className="h-9 px-4 rounded-[6px] bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-medium">
                    Secondary Outline
                  </button>
                  <button className="h-9 px-4 rounded-[6px] bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium">
                    Destructive Action
                  </button>
                  <span className="text-xs font-mono text-neutral-500 ml-auto">
                    radius: 6px | transition: 160ms cubic-bezier(0.4, 0, 0.2, 1)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. OPERATIONS & AI WORKSPACE */}
          {activeTab === "ops" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-xs font-mono font-semibold uppercase text-neutral-500">
                  Autonomous Agent Logs & Incident Response
                </span>
                <span className="text-xs font-mono text-amber-700 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Agent Active: Bot-04
                </span>
              </div>

              <div className="rounded-[6px] border border-neutral-200 bg-[#fbfbfa] text-neutral-900 p-4 font-mono text-xs space-y-2">
                <div className="text-neutral-600">
                  [14:02:18 UTC] TRIGGER: INC-883 Primary database heartbeat latency &gt; 250ms
                </div>
                <div className="text-emerald-700 font-semibold">
                  [14:02:19 UTC] ACTION: Automated failover to secondary replica set completed in 312ms
                </div>
                <div className="text-blue-700">
                  [14:02:22 UTC] NOTION AI: Extracted incident timeline and created post-mortem doc in /wiki/ops/incidents
                </div>
                <div className="text-neutral-700 pl-4 border-l-2 border-neutral-300">
                  &gt; Drafted 3 prevention action items:
                  <br />
                  &gt; 1. Add connection pooling throttle in proxy.ts (@chen)
                  <br />
                  &gt; 2. Update health-check alarm threshold from 5s to 2s (@devops)
                  <br />
                  &gt; 3. Notify status page subscribers via webhook
                </div>
                <div className="text-neutral-500 pt-1">
                  STATUS: All 3 tasks populated into Active Engineering Sprint 42.
                </div>
              </div>
            </div>
          )}

          {/* 5. PEOPLE & HR WORKSPACE */}
          {activeTab === "hr" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-xs font-mono font-semibold uppercase text-neutral-500">
                  Employee Journey & Living Wiki (Onboarding Checklist)
                </span>
                <span className="text-xs font-mono text-neutral-600">
                  Target: Senior Infrastructure Engineer
                </span>
              </div>

              <div className="p-4 rounded-[6px] border border-neutral-200 bg-[#fbfbfa] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-900">
                    First 30 Days Milestones
                  </span>
                  <span className="font-mono text-neutral-500">75% Complete (3 of 4 done)</span>
                </div>
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-3/4 rounded-full" />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-neutral-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="line-through text-neutral-400">
                      Set up 1Password vault, YubiKey hardware 2FA, and GitHub enterprise access
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-neutral-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="line-through text-neutral-400">
                      Clone monorepo and execute local Docker development cluster verification
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-neutral-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="line-through text-neutral-400">
                      Ship first starter bugfix to production (PR approved by onboarding buddy)
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-neutral-900 font-medium">
                    <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      Complete deep-dive review of ADR-14 architecture with Principal Engineer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar inside preview */}
        <div className="px-6 py-3.5 bg-[#fbfbfa] border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 font-mono">
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5" />
            <span>Relational database linked across 6 teamspaces</span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-[#0078df] hover:underline font-semibold"
          >
            <span>Launch {current.label} template</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
