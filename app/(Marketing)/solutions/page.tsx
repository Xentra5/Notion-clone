import React from "react";
import Link from "next/link";
import { Navbar } from "../_components/navbar";
import { Footer } from "../_components/footer";
import { Button } from "@/components/ui/button";
import { SolutionsShowcase } from "./solutions-showcase";
import {
  ArrowRight,
  GitPullRequest,
  Check,
  X,
  FileCode,
  Users,
  Database,
  Terminal,
} from "lucide-react";

export const metadata = {
  title: "Solutions by Discipline | Notion",
  description:
    "Explore purpose-built workspaces for Engineering, Product, Design, and Operations. Unify docs, sprint boards, and AI agents in one relational system.",
};

export default function SolutionsPage() {
  const deepDives = [
    {
      role: "Engineering & Product",
      roleCode: "ENG-PRD",
      headline: "Specs that link directly to production sprint tasks",
      desc: "No more stale Confluence docs or orphan Jira tickets. When an engineer opens a pull request, the architecture decision record and product requirements document update automatically.",
      features: [
        "Bi-directional GitHub PR linking with status sync",
        "Architecture Decision Records (ADRs) with version histories",
        "Automated sprint changelog generation via Notion AI",
      ],
      previewSnippet: {
        type: "code",
        title: "adr-14-caching.md #L42-50",
        content:
          "// Atomic Subtree Move via Materialized Path\nconst update = await Teamspace.updateMany(\n  { path: { $regex: `^${sourcePath}` } },\n  [{ $set: { path: { $replaceOne: { input: '$path', find: sourcePath, replacement: targetPath } } } }]\n);",
      },
    },
    {
      role: "Operations & Leadership",
      roleCode: "OPS-LEAD",
      headline: "Autonomous summaries, zero manual status pings",
      desc: "Eliminate Friday status check-in meetings. Notion AI synthesizes closed tasks, open blockers, and pull requests across all teamspaces into executive briefings every Monday morning.",
      features: [
        "Executive briefing generation across multiple databases",
        "Automated blocker alerts routed to team Slack channels",
        "Incident response runbooks with one-click post-mortems",
      ],
      previewSnippet: {
        type: "brief",
        title: "Monday Executive Briefing (Auto-generated)",
        content:
          "Summary: 42 PRs merged across Core API & Mobile. Zero P0 incidents. Key Milestone: Materialized Path hierarchy migrated with zero customer downtime.",
      },
    },
    {
      role: "Cross-Functional",
      roleCode: "DATA-CORE",
      headline: "One database, every perspective",
      desc: "Engineers want a Kanban board. Executives want a quarterly timeline. Finance wants a tabular budget. In Notion, these are all instant filtered views of the exact same data source.",
      features: [
        "Kanban, Table, Timeline, List, and Calendar views",
        "Real-time relational rollups and multi-property formulas",
        "Fine-grained view-level access controls and custom filters",
      ],
      previewSnippet: {
        type: "views",
        title: "Database Views (Active Sprint)",
        content:
          "Views: [Board: By Assignee] · [Table: By Priority] · [Timeline: Milestones] · [Calendar: Release Dates]",
      },
    },
    {
      role: "Security & Governance",
      roleCode: "SEC-ADMIN",
      headline: "Open collaboration with enterprise-grade guardrails",
      desc: "Give individual teams the autonomy to structure their workspaces, while maintaining strict SSO, SCIM provisioning, audit log export, and SOC2 Type II compliance.",
      features: [
        "SAML 2.0 Single Sign-On and automated SCIM provisioning",
        "Granular page-level, teamspace, and workspace permission tiers",
        "Comprehensive audit logging with SIEM export capabilities",
      ],
      previewSnippet: {
        type: "compliance",
        title: "Compliance & Security Matrix",
        content:
          "SOC2 Type II Certified · HIPAA Compatible · ISO 27001 Certified · AES-256 at rest & TLS 1.3 in transit",
      },
    },
  ];

  const comparisons = [
    {
      capability: "Information Model",
      fragmented: "Siloed in 4 different tools with broken webhooks",
      notion: "Unified relational document & database model",
    },
    {
      capability: "Sprint-to-Doc Parity",
      fragmented: "Specs in Google Docs get stale after week one",
      notion: "ADRs, PRs, and tickets share the same live record",
    },
    {
      capability: "AI Assistance",
      fragmented: "Generic chat widgets with no workspace context",
      notion: "Context-aware AI with full access to company wikis",
    },
    {
      capability: "Total Cost of Ownership",
      fragmented: "$110+/seat/mo across Jira, Confluence, Asana, & Docs",
      notion: "Single transparent seat price, consolidating 4 tools",
    },
  ];

  return (
    <main className="relative min-h-screen bg-white text-[#050505] overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* Hero Section */}
      <section className="mx-auto max-w-[1160px] px-5 sm:px-6 pt-14 sm:pt-20 pb-10 text-left sm:text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-neutral-100 border border-neutral-200 text-[12px] font-mono font-medium text-neutral-700">
          <span className="h-2 w-2 rounded-full bg-[#0078df]" />
          <span>Cross-Functional Operating System</span>
        </div>

        <h1 className="mt-4 text-[34px] sm:text-[52px] lg:text-[58px] font-bold tracking-tight text-neutral-950 leading-[1.12]">
          One workspace for every discipline.
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
          Engineering specs, product roadmaps, brand token repositories, and automated runbooks —
          interconnected in a single relational document model.
        </p>

        <div className="mt-7 flex flex-wrap sm:justify-center items-center gap-3">
          <Link href="/dashboard">
            <Button className="h-10 px-5 rounded-[6px] bg-[#0078df] hover:bg-[#006dcc] text-white text-sm font-semibold transition-all duration-160 shadow-2xs cursor-pointer">
              Explore workspaces <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/request-demo">
            <Button
              variant="outline"
              className="h-10 px-5 rounded-[6px] border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-sm font-medium transition-all duration-160 cursor-pointer"
            >
              Talk to Sales
            </Button>
          </Link>
        </div>
      </section>

      {/* Section 2: Interactive Live Workstation Showcase */}
      <section className="mx-auto max-w-[1160px] px-5 sm:px-6 py-6 sm:py-10">
        <SolutionsShowcase />
      </section>

      {/* Section 3: Deep Dives (Structured Asymmetric 2x2 Grid) */}
      <section className="mx-auto max-w-[1160px] px-5 sm:px-6 py-14 sm:py-20 border-t border-neutral-200">
        <div className="max-w-xl">
          <span className="text-xs font-mono font-semibold uppercase text-neutral-500">
            System Capabilities
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            Built for how high-velocity teams build.
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Every feature in Notion is built around a single premise: structured data should live
            inside your documents, not inside closed silos.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {deepDives.map((item, idx) => (
            <div
              key={idx}
              className="rounded-[12px] border border-neutral-200 bg-[#fbfbfa] p-6 sm:p-7 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded-[4px] bg-white border border-neutral-200 text-neutral-700">
                    {item.roleCode}
                  </span>
                  <span className="text-xs font-mono text-neutral-500">{item.role}</span>
                </div>

                <h3 className="mt-3 text-lg sm:text-xl font-bold text-neutral-950 leading-snug">
                  {item.headline}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                  {item.desc}
                </p>

                <ul className="mt-4 space-y-2">
                  {item.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-neutral-700"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-200">
                <div className="text-[11px] font-mono text-neutral-500 mb-1.5 flex items-center justify-between">
                  <span>{item.previewSnippet.title}</span>
                  <Terminal className="h-3 w-3" />
                </div>
                <div className="p-3 rounded-[6px] bg-white border border-neutral-200 font-mono text-[11px] text-neutral-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {item.previewSnippet.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Tool Consolidation Matrix */}
      <section className="mx-auto max-w-[1160px] px-5 sm:px-6 py-14 sm:py-20 border-t border-neutral-200">
        <div className="text-left sm:text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono font-semibold uppercase text-neutral-500">
            Stack Consolidation
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            Replace four fragmented subscriptions with one system.
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Stop paying per-seat fees across Jira, Confluence, Asana, and Google Workspace just to keep
            teams out of sync.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-[12px] border border-neutral-200 bg-white">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-[#fbfbfa] text-neutral-600 font-mono text-xs">
                <th className="py-3 px-4 font-semibold">Workflow Metric</th>
                <th className="py-3 px-4 font-semibold text-rose-700">
                  Fragmented Stack (Jira + Confluence + Asana + Docs)
                </th>
                <th className="py-3 px-4 font-semibold text-[#0078df]">
                  Notion Unified System
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {comparisons.map((c, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/70">
                  <td className="py-3.5 px-4 font-medium text-neutral-900">
                    {c.capability}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600 flex items-center gap-2">
                    <X className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>{c.fragmented}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-neutral-900">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Check className="h-4 w-4 shrink-0" />
                      <span className="text-neutral-900">{c.notion}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5: Minimal Editorial Bottom CTA */}
      <section className="mx-auto max-w-[1160px] px-5 sm:px-6 py-16 sm:py-24 border-t border-neutral-200">
        <div className="rounded-[14px] bg-[#fbfbfa] border border-neutral-200 p-8 sm:p-14 text-center">
          <span className="text-xs font-mono font-semibold uppercase text-neutral-500">
            Start Today
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-neutral-950">
            Set up your team&apos;s workspace in minutes.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-neutral-600">
            Choose from hundreds of verified community templates or start with our core
            cross-functional operating model.
          </p>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
            <Link href="/dashboard">
              <Button className="h-10 px-6 rounded-[6px] bg-[#0078df] hover:bg-[#006dcc] text-white text-sm font-semibold transition-all duration-160 shadow-2xs cursor-pointer">
                Launch template <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/request-demo">
              <Button
                variant="outline"
                className="h-10 px-6 rounded-[6px] border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-sm font-medium transition-all duration-160 cursor-pointer"
              >
                Schedule an enterprise demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
