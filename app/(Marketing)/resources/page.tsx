"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "../_components/navbar";
import { Footer } from "../_components/footer";
import {
  Search,
  BookOpen,
  GraduationCap,
  LayoutTemplate,
  Video,
  Users,
  Code2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Check,
  Copy,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  Terminal,
  ShieldCheck,
  Layers,
  Bookmark,
  Award,
  Filter,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

type CategoryFilter =
  | "All"
  | "Notion Academy"
  | "Templates"
  | "Guides & Formulas"
  | "Webinars & Events"
  | "Enterprise & AI";

interface ResourceItem {
  id: string;
  emoji: string;
  category: CategoryFilter;
  title: string;
  description: string;
  readTime: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  tag: string;
  href: string;
  featured?: boolean;
}

const RESOURCES_DATA: ResourceItem[] = [
  {
    id: "res-1",
    emoji: "📐",
    category: "Guides & Formulas",
    title: "Mastering Database Relations & Multi-Tier Rollups",
    description: "Design relational models that connect projects, sprints, and team OKRs without circular performance bottlenecks.",
    readTime: "8 min read",
    level: "Intermediate",
    tag: "Database Architecture",
    href: "/help",
    featured: true,
  },
  {
    id: "res-2",
    emoji: "🎓",
    category: "Notion Academy",
    title: "Notion Certified Administrator Curriculum",
    description: "Official 4-module certification track covering teamspace governance, domain verification, SCIM provisioning, and audit logs.",
    readTime: "3.5 hrs coursework",
    level: "Advanced",
    tag: "Official Certification",
    href: "/help",
    featured: true,
  },
  {
    id: "res-3",
    emoji: "⚡",
    category: "Guides & Formulas",
    title: "Formulas 2.0: Dynamic Arrays, Maps & Let() Variables",
    description: "Write cleaner calculations with new syntax. Learn how to map through linked tasks and compute progress bars dynamically.",
    readTime: "12 min read",
    level: "Intermediate",
    tag: "Formulas 2.0",
    href: "/help",
  },
  {
    id: "res-4",
    emoji: "📋",
    category: "Templates",
    title: "Engineering Sprint Tracker & RFC Governance Wiki",
    description: "Battle-tested schema for engineering organizations with automated sprint rollover, review stages, and code review checklists.",
    readTime: "Used by 42,000+ teams",
    level: "Intermediate",
    tag: "Engineering Template",
    href: "/dashboard",
  },
  {
    id: "res-5",
    emoji: "🤖",
    category: "Enterprise & AI",
    title: "Deploying Notion AI RAG with Local Vector Stores",
    description: "How workspace indexing and LangChain vector pipelines answer team questions while preserving document access permissions.",
    readTime: "10 min read",
    level: "Advanced",
    tag: "AI & Vector Search",
    href: "/help",
  },
  {
    id: "res-6",
    emoji: "🎙️",
    category: "Webinars & Events",
    title: "Live Masterclass: Scaling from 10 to 500 Teamspaces",
    description: "Join Notion product architects for an interactive live walkthrough of enterprise permission boundaries and migration strategies.",
    readTime: "Live Interactive Session",
    level: "Intermediate",
    tag: "Live Webinar",
    href: "/help",
  },
  {
    id: "res-7",
    emoji: "🏛️",
    category: "Templates",
    title: "Company Operating System & Employee Handbook",
    description: "Complete corporate wiki setup including onboarding hubs, team directories, policy documents, and quarterly roadmaps.",
    readTime: "Used by 85,000+ teams",
    level: "Beginner",
    tag: "Company Wiki",
    href: "/dashboard",
  },
  {
    id: "res-8",
    emoji: "⌨️",
    category: "Guides & Formulas",
    title: "Slash Commands & Markdown Acceleration Reference",
    description: "Every key combination, markdown shortcut, and slash command to draft documents at the speed of thought without a mouse.",
    readTime: "4 min read",
    level: "Beginner",
    tag: "Productivity",
    href: "/help",
  },
  {
    id: "res-9",
    emoji: "🔐",
    category: "Enterprise & AI",
    title: "Zero-Trust Permissions & Teamspace Hierarchy Guide",
    description: "Architect secure multi-department workspaces with granular role inheritance, restricted view permissions, and guest management.",
    readTime: "9 min read",
    level: "Advanced",
    tag: "Security & Governance",
    href: "/enterprise",
  },
];

const CERTIFICATION_TRACKS = [
  {
    id: "essentials",
    tier: "Tier 1",
    title: "Notion Essentials",
    badge: "Certified User",
    duration: "1.5 hours",
    description: "Core foundation for power users: page hierarchies, slash commands, callouts, and multi-view database basics.",
    modules: [
      "Workspace navigation & recursive page structures",
      "Rich block types: toggles, synced blocks, and callouts",
      "Database views: Kanban boards, calendars & tables",
      "Sharing, guest access, and real-time co-authoring",
    ],
  },
  {
    id: "architect",
    tier: "Tier 2",
    title: "Workspace Architecture",
    badge: "Certified Architect",
    duration: "4.0 hours",
    description: "Advanced relational models: 2-way relations, rollups, Formulas 2.0 syntax, and workflow automation templates.",
    modules: [
      "Two-way database relations and nested rollups",
      "Formulas 2.0: let(), map(), filter(), and string manipulation",
      "Sprint cycles, automated status triggers, and dependencies",
      "Template buttons, recurring task workflows, and self-cleaning wikis",
    ],
  },
  {
    id: "admin",
    tier: "Tier 3",
    title: "Enterprise Administration",
    badge: "Certified Administrator",
    duration: "6.0 hours",
    description: "Full enterprise governance: SAML SSO, SCIM user provisioning, audit log monitoring, and AI vector privacy controls.",
    modules: [
      "Enterprise SAML SSO & Okta/Azure SCIM lifecycle sync",
      "Granular teamspace permissions and external guest restrictions",
      "Audit logs, workspace compliance exports, and retention rules",
      "Deploying Notion AI securely across restricted teamspaces",
    ],
  },
];

const CHEATSHEET_TABS = [
  {
    id: "formulas",
    label: "Formulas 2.0",
    description: "Modern Notion formula expressions for dynamic calculations",
    items: [
      {
        title: "Dynamic Progress Bar",
        syntax: `repeat("■", round(prop("Completed") / prop("Total") * 10)) + repeat("□", 10 - round(prop("Completed") / prop("Total") * 10)) + " " + round(prop("Completed") / prop("Total") * 100) + "%"`,
        note: "Renders visual 10-segment block progress bar",
      },
      {
        title: "Map & Filter Linked Tasks",
        syntax: `prop("Tasks").filter(current.prop("Status") == "Done").length() + " of " + prop("Tasks").length() + " completed"`,
        note: "Iterates through linked relation items using modern array syntax",
      },
      {
        title: "Days Remaining Until Target",
        syntax: `let(daysLeft, dateBetween(prop("Target Date"), now(), "days"), if(daysLeft < 0, "Overdue by " + abs(daysLeft) + "d", if(daysLeft == 0, "Due today", daysLeft + " days remaining")))`,
        note: "Uses let() variable declaration for readable conditions",
      },
    ],
  },
  {
    id: "shortcuts",
    label: "Keyboard Shortcuts",
    description: "Accelerate your editing flow without reaching for the mouse",
    items: [
      {
        title: "Create Toggle List",
        syntax: "> + Space",
        note: "Instantly formats the line into a collapsible toggle block",
      },
      {
        title: "Create Callout Box",
        syntax: "/callout + Enter",
        note: "Creates an accented callout container with customizable emoji",
      },
      {
        title: "Quick Page Search & Jump",
        syntax: "Ctrl / Cmd + P (or Ctrl / Cmd + K)",
        note: "Opens the global quick-find spotlight across all teamspaces",
      },
      {
        title: "Duplicate Current Block",
        syntax: "Alt / Option + Drag (or Ctrl / Cmd + D)",
        note: "Clones the selected block directly beneath",
      },
    ],
  },
  {
    id: "markdown",
    label: "Markdown Syntax",
    description: "Native markdown combinations supported on any block line",
    items: [
      {
        title: "Checklist Item",
        syntax: "[] + Space",
        note: "Transforms line into an interactive checkbox task",
      },
      {
        title: "H1, H2, H3 Headings",
        syntax: "# + Space, ## + Space, ### + Space",
        note: "Sets corresponding heading hierarchy level",
      },
      {
        title: "Inline Code & Code Block",
        syntax: "`text` for inline, ``` + language for block",
        note: "Supports syntax highlighting across 40+ programming languages",
      },
      {
        title: "Divider Line",
        syntax: "--- (three dashes)",
        note: "Inserts a clean horizontal rule divider block",
      },
    ],
  },
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [activeCheatsheet, setActiveCheatsheet] = useState("formulas");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [spotlightToggleOpen, setSpotlightToggleOpen] = useState(true);

  const categories: CategoryFilter[] = [
    "All",
    "Guides & Formulas",
    "Notion Academy",
    "Templates",
    "Webinars & Events",
    "Enterprise & AI",
  ];

  const filteredResources = useMemo(() => {
    return RESOURCES_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesQuery =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <main className="relative min-h-screen bg-[#fafaf9] text-[#191919] selection:bg-[#e8ddff] selection:text-[#2e1065]">
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative border-b border-[#e9e9e7] bg-white pt-12 pb-14 sm:pt-16 sm:pb-18">
        <div className="mx-auto max-w-[1160px] px-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#787774]">
            <Link href="/" className="hover:text-black transition">
              Notion
            </Link>
            <span>/</span>
            <span className="text-[#37352f] font-semibold">Resources & Learning</span>
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e3] bg-[#f7f6f3] px-3 py-1 text-xs font-semibold text-[#37352f]">
                <BookOpen className="h-3.5 w-3.5 text-[#0078df]" />
                Official Knowledge Hub & Certifications
              </div>
              <h1 className="mt-4 text-[34px] font-[850] tracking-[-0.03em] text-[#050505] sm:text-[46px] lg:text-[52px] leading-[1.08]">
                Notion Resource Library
              </h1>
              <p className="mt-3 text-base sm:text-lg text-[#5a5957] leading-relaxed">
                Curated documentation, database architectures, community templates, and official certification paths built for workspace creators and enterprise teams.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 border-l border-[#e9e9e7] pl-5 text-xs text-[#787774] shrink-0">
              <div>
                <div className="text-base font-bold text-[#191919]">120+</div>
                <div>Deep Guides</div>
              </div>
              <div className="h-6 w-px bg-[#e9e9e7]" />
              <div>
                <div className="text-base font-bold text-[#191919]">3 Tracks</div>
                <div>Accreditations</div>
              </div>
              <div className="h-6 w-px bg-[#e9e9e7]" />
              <div>
                <div className="text-base font-bold text-[#191919]">Weekly</div>
                <div>Live Webinars</div>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="mt-8 space-y-4">
            <div className="relative flex items-center rounded-xl border border-[#d9d8d6] bg-white p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-within:border-[#0078df] focus-within:ring-2 focus-within:ring-[#0078df]/15 transition">
              <Search className="ml-3 h-4 w-4 text-[#787774] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides, formulas, templates, or certification topics..."
                className="w-full bg-transparent px-3 py-2 text-sm text-[#191919] placeholder:text-[#9b9a97] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mr-2 text-xs font-semibold text-[#787774] hover:text-[#191919] px-2 py-1 rounded bg-[#f7f6f3]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="flex items-center gap-1 text-xs font-bold text-[#787774] mr-1">
                <Filter className="h-3 w-3" /> Topic:
              </span>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? "bg-[#191919] text-white shadow-xs"
                        : "bg-white border border-[#e2e2df] text-[#5a5957] hover:border-[#b4b3b0] hover:text-[#191919]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Spotlight: Asymmetric Layout */}
      <section className="mx-auto max-w-[1160px] px-5 py-12">
        <div className="rounded-2xl border border-[#e2e2df] bg-white p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#eaf4ff] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#0078df]">
                  Featured Learning Track
                </span>
                <span className="text-xs font-medium text-[#787774]">Updated for Formulas 2.0</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#050505] leading-tight">
                Notion Certified: Workspace Architecture & Formulas 2.0
              </h2>

              <p className="text-sm text-[#5a5957] leading-relaxed">
                Learn how top engineering, product, and operations leaders structure enterprise-grade workspaces. Cover two-way database relations, nested rollups, dynamic let() variables, and self-maintaining project dashboards.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 text-[#37352f]">
                  <CheckCircle2 className="h-4 w-4 text-[#0078df] shrink-0" />
                  <span>24 Hands-on Exercises</span>
                </div>
                <div className="flex items-center gap-2 text-[#37352f]">
                  <CheckCircle2 className="h-4 w-4 text-[#0078df] shrink-0" />
                  <span>Interactive Exam & Credential</span>
                </div>
                <div className="flex items-center gap-2 text-[#37352f]">
                  <CheckCircle2 className="h-4 w-4 text-[#0078df] shrink-0" />
                  <span>4.0 Hours Self-Paced</span>
                </div>
                <div className="flex items-center gap-2 text-[#37352f]">
                  <CheckCircle2 className="h-4 w-4 text-[#0078df] shrink-0" />
                  <span>Verified Digital Badge</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0078df] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#006dcc] transition"
                >
                  <span>Start Certification Track</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#d9d8d6] bg-white px-4 py-2.5 text-xs font-semibold text-[#37352f] hover:bg-[#f7f6f3] transition"
                >
                  <span>View Sample Sandbox</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#787774]" />
                </Link>
              </div>
            </div>

            {/* Right: Authentic Notion Document Interactive Preview */}
            <div className="lg:col-span-6">
              <div className="rounded-xl border border-[#e2e2df] bg-[#fbfbfa] p-4 sm:p-5 text-left text-xs shadow-2xs font-sans">
                {/* Notion Doc Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#ecebe8]">
                  <div className="flex items-center gap-2 font-bold text-[#191919] text-sm">
                    <span className="text-base">📐</span>
                    <span>ADR-14: Relational Knowledge Architecture</span>
                  </div>
                  <span className="rounded bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold text-[#15803d]">
                    Verified Spec
                  </span>
                </div>

                {/* Page Metadata Properties */}
                <div className="py-3 space-y-1.5 border-b border-[#ecebe8] text-[11px]">
                  <div className="flex items-center">
                    <span className="w-24 text-[#787774]">Status:</span>
                    <span className="font-semibold text-[#191919]">Active Standard</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-[#787774]">Level:</span>
                    <span className="inline-block rounded bg-[#f1f1ef] px-1.5 py-0.5 font-medium text-[#37352f]">
                      Level 2: Architect
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-[#787774]">Formulas:</span>
                    <span className="font-mono text-[#0078df]">v2.0 Syntax</span>
                  </div>
                </div>

                {/* Collapsible Toggle Block */}
                <div className="pt-3">
                  <button
                    onClick={() => setSpotlightToggleOpen(!spotlightToggleOpen)}
                    className="flex items-center gap-1.5 font-bold text-[#191919] hover:text-[#0078df] transition"
                  >
                    <ChevronRight
                      className={`h-3.5 w-3.5 transition-transform duration-150 ${
                        spotlightToggleOpen ? "rotate-90" : ""
                      }`}
                    />
                    <span>▶ Core Rule: Single Source of Truth Relations</span>
                  </button>

                  {spotlightToggleOpen && (
                    <div className="pl-5 pt-2 text-xs text-[#5a5957] space-y-2">
                      <p>
                        Never duplicate sprint tasks into separate documentation. Connect sprint boards to engineering wikis through two-way relations with parent-child tree inheritance.
                      </p>

                      {/* Code Block Snippet */}
                      <div className="rounded-lg bg-[#191919] p-3 text-neutral-200 font-mono text-[11px] overflow-x-auto">
                        <div className="text-neutral-500">{"// Formulas 2.0: Dynamic Subtask Progress"}</div>
                        <div>
                          <span className="text-purple-400">let</span>(completed,{" "}
                          <span className="text-yellow-300">prop</span>(<span className="text-emerald-400">&quot;Tasks&quot;</span>).filter(current.prop(<span className="text-emerald-400">&quot;Done&quot;</span>)),
                        </div>
                        <div className="pl-3">
                          round(completed.length() / <span className="text-yellow-300">prop</span>(<span className="text-emerald-400">&quot;Tasks&quot;</span>).length() * 100) + <span className="text-emerald-400">&quot;%&quot;</span>
                        </div>
                        <div>)</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtered Resource Directory */}
      <section className="mx-auto max-w-[1160px] px-5 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#050505]">
              {selectedCategory === "All" ? "All Resources & Documentation" : selectedCategory}
            </h2>
            <p className="text-xs text-[#787774] mt-0.5">
              Showing {filteredResources.length} of {RESOURCES_DATA.length} available resources
            </p>
          </div>

          <Link
            href="/help"
            className="flex items-center gap-1 text-xs font-semibold text-[#0078df] hover:underline"
          >
            <span>Browse Full Documentation</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {filteredResources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d9d8d6] bg-white p-12 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f6f3] text-[#787774]">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#191919]">No matching resources found</h3>
            <p className="mt-1 text-xs text-[#787774]">
              Try adjusting your query or resetting topic filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 rounded-lg bg-[#f1f1ef] px-3.5 py-1.5 text-xs font-semibold text-[#191919] hover:bg-[#e5e5e3]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group rounded-xl border border-[#e2e2df] bg-white p-5 hover:border-[#b4b3b0] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] text-xl">
                      {item.emoji}
                    </div>
                    <span className="rounded bg-[#f1f1ef] px-2 py-0.5 text-[10px] font-bold text-[#5a5957]">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="mt-3.5 text-base font-bold text-[#191919] group-hover:text-[#0078df] transition line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs text-[#5a5957] leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#f1f1ef] pt-3 text-[11px] text-[#787774]">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="h-3 w-3" />
                    {item.readTime}
                  </span>
                  <span className="flex items-center gap-0.5 font-bold text-[#37352f] group-hover:text-[#0078df] transition">
                    Explore <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Notion Academy Certification Roadmap */}
      <section className="mx-auto max-w-[1160px] px-5 py-14">
        <div className="rounded-2xl border border-[#e2e2df] bg-white p-6 sm:p-10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
              <Award className="h-3.5 w-3.5" />
              Notion Academy
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#050505]">
              Official Certification Pathways
            </h2>
            <p className="mt-2 text-sm text-[#5a5957] leading-relaxed">
              Validate your workspace expertise through step-by-step tracks designed for creators, enterprise architects, and workspace admins.
            </p>
          </div>

          {/* Track Selector Tabs */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-[#e9e9e7] pb-4">
            {CERTIFICATION_TRACKS.map((track, idx) => {
              const isSelected = selectedTrack === idx;
              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(idx)}
                  className={`rounded-xl p-4 text-left transition cursor-pointer border ${
                    isSelected
                      ? "border-[#191919] bg-[#fbfbfa] shadow-2xs"
                      : "border-transparent hover:bg-[#f7f6f3]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#0078df]">{track.tier}</span>
                    <span className="rounded bg-[#f1f1ef] px-2 py-0.5 text-[10px] text-[#5a5957]">
                      {track.duration}
                    </span>
                  </div>
                  <div className="mt-2 text-base font-extrabold text-[#191919]">
                    {track.title}
                  </div>
                  <div className="mt-1 text-xs text-[#787774] line-clamp-1">
                    {track.badge}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Track Detail */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-lg font-bold text-[#191919]">
                {CERTIFICATION_TRACKS[selectedTrack].title} Curriculum
              </h3>
              <p className="text-xs sm:text-sm text-[#5a5957] leading-relaxed">
                {CERTIFICATION_TRACKS[selectedTrack].description}
              </p>

              <div className="space-y-2 pt-2">
                {CERTIFICATION_TRACKS[selectedTrack].modules.map((mod, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#37352f]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{mod}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#191919] px-5 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition"
                >
                  <span>Enroll in Course & Take Exam</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl border border-[#e2e2df] bg-[#fbfbfa] p-5 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#efeefc] text-purple-700 text-2xl">
                  🎓
                </div>
                <div>
                  <div className="text-sm font-bold text-[#191919]">
                    {CERTIFICATION_TRACKS[selectedTrack].badge}
                  </div>
                  <div className="text-xs text-[#787774] mt-0.5">
                    Official Notion Certified Credential
                  </div>
                </div>
                <div className="rounded-lg bg-white border border-[#e9e9e7] p-3 text-left text-[11px] text-[#5a5957] space-y-1">
                  <div className="flex justify-between">
                    <span>Passing Score:</span>
                    <strong className="text-[#191919]">80% or higher</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Credential Validity:</span>
                    <strong className="text-[#191919]">2 Years</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Verification:</span>
                    <strong className="text-[#0078df]">LinkedIn & Accredible</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Community Templates Showcase */}
      <section className="mx-auto max-w-[1160px] px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0078df]">
              Ready-to-Use Workspaces
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#050505]">
              Featured Production Templates
            </h2>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs font-semibold text-[#0078df] hover:underline"
          >
            <span>Explore 10,000+ Community Templates</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Engineering Sprint & Bug Tracker",
              category: "Engineering",
              downloads: "64k duplicates",
              emoji: "⚡",
              desc: "Complete linear-style sprint cycle with automated status transitions.",
            },
            {
              title: "Company Wiki & Operating System",
              category: "Company Ops",
              downloads: "92k duplicates",
              emoji: "🏛️",
              desc: "Scalable company intranet with team directories and policy hubs.",
            },
            {
              title: "Polyglot WASM Code Notebook",
              category: "Developers",
              downloads: "28k duplicates",
              emoji: "💻",
              desc: "In-browser Python and JS execution blocks with zero setup.",
            },
            {
              title: "Product PRD & Discovery Hub",
              category: "Product",
              downloads: "45k duplicates",
              emoji: "🎯",
              desc: "Connect user research interviews directly to release roadmaps.",
            },
          ].map((tmpl, idx) => (
            <Link
              key={idx}
              href="/dashboard"
              className="group rounded-xl border border-[#e2e2df] bg-white p-4.5 hover:border-[#b4b3b0] hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{tmpl.emoji}</span>
                  <span className="rounded bg-[#f1f1ef] px-2 py-0.5 text-[10px] font-bold text-[#5a5957]">
                    {tmpl.category}
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-bold text-[#191919] group-hover:text-[#0078df] transition">
                  {tmpl.title}
                </h4>
                <p className="mt-1.5 text-xs text-[#5a5957] leading-relaxed line-clamp-2">
                  {tmpl.desc}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#f1f1ef] pt-2 text-[11px] text-[#787774]">
                <span>{tmpl.downloads}</span>
                <span className="font-bold text-[#37352f] group-hover:text-black">Use template →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Interactive Quick Reference & Cheatsheet */}
      <section className="mx-auto max-w-[1160px] px-5 py-12">
        <div className="rounded-2xl border border-[#e2e2df] bg-white p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e9e9e7] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0078df]">
                Quick Reference
              </span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#050505]">
                Developer & Power User Cheatsheet
              </h2>
            </div>

            {/* Tab switchers */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#e2e2df] bg-[#f7f6f3] p-1">
              {CHEATSHEET_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCheatsheet(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    activeCheatsheet === tab.id
                      ? "bg-white text-[#191919] shadow-2xs"
                      : "text-[#787774] hover:text-[#191919]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6 space-y-3">
            {CHEATSHEET_TABS.find((t) => t.id === activeCheatsheet)?.items.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-[#ecebe8] bg-[#fbfbfa] p-4 text-xs hover:border-[#d9d8d6] transition"
              >
                <div className="space-y-1">
                  <div className="font-bold text-[#191919] text-sm">{item.title}</div>
                  <div className="text-[#787774] text-xs">{item.note}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <code className="rounded-md bg-white border border-[#e2e2df] px-3 py-1.5 font-mono text-[11px] text-[#191919] max-w-md overflow-x-auto">
                    {item.syntax}
                  </code>
                  <button
                    onClick={() => handleCopy(item.syntax, `${activeCheatsheet}-${idx}`)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e2df] bg-white text-[#787774] hover:text-black hover:border-neutral-400 transition cursor-pointer shrink-0"
                    title="Copy code"
                  >
                    {copiedId === `${activeCheatsheet}-${idx}` ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Live Webinars & Events */}
      <section className="mx-auto max-w-[1160px] px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0078df]">
              Live Sessions
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#050505]">
              Upcoming Webinars & Community Office Hours
            </h2>
          </div>

          <Link
            href="/help"
            className="flex items-center gap-1 text-xs font-semibold text-[#0078df] hover:underline"
          >
            <span>View All Past Recordings</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-[#e2e2df] bg-white p-5 hover:border-[#b4b3b0] transition flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#0078df]">
                <Calendar className="h-3.5 w-3.5" />
                <span>Thursday, Oct 24 • 10:00 AM PST</span>
              </div>
              <h3 className="mt-2 text-base font-bold text-[#191919]">
                Deep Dive: Engineering Workflows with Formulas 2.0 & Subtrees
              </h3>
              <p className="mt-1.5 text-xs text-[#5a5957] leading-relaxed">
                Join our solutions architects as we reconstruct a high-scale product sprint tracker with subtask dependency calculations and burndown charts.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-[#787774]">
                <span>Host: <strong>Elena Vance</strong> (Lead Architect)</span>
                <span>•</span>
                <span>45 min + Q&A</span>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-[#f1f1ef] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Seats Available
              </span>
              <button
                onClick={() => toast.success("Registration confirmed! Check your email for calendar invite.")}
                className="rounded-lg bg-[#0078df] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#006dcc] transition cursor-pointer"
              >
                Register Free
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#e2e2df] bg-white p-5 hover:border-[#b4b3b0] transition flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#0078df]">
                <Calendar className="h-3.5 w-3.5" />
                <span>Tuesday, Nov 05 • 9:00 AM PST</span>
              </div>
              <h3 className="mt-2 text-base font-bold text-[#191919]">
                Enterprise Governance: SAML SSO, Audit Logs & Domain Controls
              </h3>
              <p className="mt-1.5 text-xs text-[#5a5957] leading-relaxed">
                Essential session for IT leaders and security engineers configuring multi-teamspace permissions, SCIM provisioning, and external guest sharing.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-[#787774]">
                <span>Host: <strong>Marcus Chen</strong> (VP Infrastructure)</span>
                <span>•</span>
                <span>60 min + Live Demo</span>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-[#f1f1ef] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Seats Available
              </span>
              <button
                onClick={() => toast.success("Registration confirmed! Check your email for calendar invite.")}
                className="rounded-lg bg-[#0078df] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#006dcc] transition cursor-pointer"
              >
                Register Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Notion Callout Bottom Action */}
      <section className="mx-auto max-w-[1160px] px-5 py-14">
        <div className="rounded-2xl border border-[#e2e2df] bg-[#fbfbfa] p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#e2e2df] shadow-2xs text-2xl">
            🚀
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#050505] tracking-tight">
            Start building your connected workspace
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base text-[#5a5957] leading-relaxed">
            Join millions of creators, fast-moving startups, and global enterprises who run their documentation, engineering sprints, and daily tasks in Notion.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-[#0078df] px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#006dcc] transition"
            >
              Get Notion free
            </Link>
            <Link
              href="/request-demo"
              className="rounded-lg border border-[#d9d8d6] bg-white px-5 py-2.5 text-sm font-bold text-[#37352f] hover:bg-[#f7f6f3] transition"
            >
              Request an Enterprise Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
