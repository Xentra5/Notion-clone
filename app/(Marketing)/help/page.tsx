"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "../_components/navbar";
import { Footer } from "../_components/footer";
import {
  Search,
  BookOpen,
  Keyboard,
  Layers,
  Code2,
  Sparkles,
  Users,
  ShieldCheck,
  CreditCard,
  ChevronDown,
  ArrowRight,
  LifeBuoy,
  HelpCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function MarketingHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const categories = [
    {
      icon: <Layers className="h-5 w-5 text-blue-600" />,
      title: "Getting Started",
      description: "Learn workspace hierarchy, page nesting, and slash commands.",
      articlesCount: "12 articles",
    },
    {
      icon: <BookOpen className="h-5 w-5 text-emerald-600" />,
      title: "Editor & Rich Blocks",
      description: "Callouts, toggles, data tables, bookmarks, and formatting.",
      articlesCount: "18 articles",
    },
    {
      icon: <Code2 className="h-5 w-5 text-violet-600" />,
      title: "Polyglot Code Sandboxes",
      description: "Execute Python WebAssembly (WASM) and JavaScript in browser.",
      articlesCount: "8 articles",
    },
    {
      icon: <Layers className="h-5 w-5 text-amber-600" />,
      title: "Multi-View Databases",
      description: "Kanban task boards, Timeline Gantt charts, and Table views.",
      articlesCount: "14 articles",
    },
    {
      icon: <Sparkles className="h-5 w-5 text-pink-600" />,
      title: "Notion AI & LangChain RAG",
      description: "Vector indexing, speech transcription, and semantic citations.",
      articlesCount: "10 articles",
    },
    {
      icon: <Users className="h-5 w-5 text-indigo-600" />,
      title: "Real-Time Collaboration",
      description: "Multi-cursor presence, inline threads, and cross-tab sync.",
      articlesCount: "9 articles",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-teal-600" />,
      title: "0ms Local-First & Versions",
      description: "IndexedDB persistence, visual diff comparator, and trash recovery.",
      articlesCount: "11 articles",
    },
    {
      icon: <CreditCard className="h-5 w-5 text-orange-600" />,
      title: "Billing & Subscriptions",
      description: "Free vs Pro tiers, Stripe USD, and Razorpay INR checkout.",
      articlesCount: "7 articles",
    },
  ];

  const popularArticles = [
    {
      title: "How to use Slash ( / ) commands to build pages faster",
      category: "Getting Started",
      readTime: "3 min read",
    },
    {
      title: "Running Python WASM code blocks directly in your documents",
      category: "Polyglot Code",
      readTime: "5 min read",
    },
    {
      title: "Switching between Kanban, Timeline Gantt, and Data Table views",
      category: "Databases",
      readTime: "4 min read",
    },
    {
      title: "Understanding 0ms Local-First IndexedDB and offline queues",
      category: "Data & Sync",
      readTime: "4 min read",
    },
    {
      title: "How LangChain RAG indexes your workspace into ChromaDB vectors",
      category: "Notion AI",
      readTime: "5 min read",
    },
    {
      title: "Restoring deleted documents and visual revision diff rollbacks",
      category: "Data Safety",
      readTime: "3 min read",
    },
  ];

  const faqs = [
    {
      q: "Does this workspace work offline?",
      a: "Yes! The workspace uses a 0ms local-first architecture powered by client-side IndexedDB. Every block edit is written to your browser's local store first. If you lose internet connectivity, changes are stored safely in an offline mutation queue and synced automatically with exponential backoff once reconnected.",
    },
    {
      q: "How does the Python code runner execute without an external server?",
      a: "Code blocks leverage Pyodide, a complete Python 3 runtime compiled to WebAssembly (WASM). It runs 100% inside your client browser tab, meaning your code and data never leave your device, ensuring maximum privacy and zero latency.",
    },
    {
      q: "How does Notion AI understand the content across my pages?",
      a: "Our vector pipeline uses LangChain with an asynchronous 2.5-second debounce queue. When you pause typing, documents are chunked and embedded via sentence-transformers into a local ChromaDB vector store. When you query Notion AI, it performs cosine similarity retrieval to cite your exact notes.",
    },
    {
      q: "What payment methods are supported for Pro subscriptions?",
      a: "We support dual payment gateways tailored to your geography: Stripe handles international credit/debit cards and Apple Pay in USD/EUR, while Razorpay powers domestic payments in India via UPI, RuPay, and NetBanking.",
    },
    {
      q: "Can I collaborate with teammates in real time?",
      a: "Yes. Collaborative presence includes live remote cursor positions with distinct user-branded color tags, an active presence bar, and threaded inline comments with resolution tracking.",
    },
  ];

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return popularArticles;
    const q = searchQuery.toLowerCase();
    return popularArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <main className="relative min-h-screen bg-white text-[#050505] selection:bg-blue-100">
      <Navbar />

      {/* Hero Search Section */}
      <section className="mx-auto max-w-[1120px] px-5 pt-16 pb-14 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0078df]">
          <LifeBuoy className="h-3.5 w-3.5" />
          Documentation & Help Center
        </span>

        <h1 className="mt-4 text-[38px] font-[850] tracking-tight sm:text-[54px] leading-[1.15]">
          How can we help you today?
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-neutral-600 leading-relaxed">
          Explore comprehensive workspace tutorials, API references, keyboard shortcuts, and troubleshooting guides.
        </p>

        {/* Big Notion Search Bar */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="relative flex items-center rounded-2xl border border-neutral-300 bg-white p-2 shadow-sm transition hover:border-neutral-400 focus-within:border-[#0078df] focus-within:ring-2 focus-within:ring-blue-100">
            <Search className="ml-3 h-5 w-5 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides: 'blocks', 'python wasm', 'kanban', 'shortcuts'..."
              className="w-full bg-transparent px-3 py-1.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mr-2 text-xs font-medium text-neutral-400 hover:text-neutral-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-[1120px] px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Browse by Workspace Topic
          </h2>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs font-semibold text-[#0078df] hover:underline"
          >
            Open in Workspace <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredCategories.map((cat, i) => (
            <Link
              key={i}
              href="/dashboard"
              className="group rounded-2xl border border-neutral-200 bg-neutral-50/40 p-5 transition hover:border-neutral-400 hover:bg-white hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-2xs">
                {cat.icon}
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-900 group-hover:text-[#0078df] transition">
                {cat.title}
              </h3>
              <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed line-clamp-2">
                {cat.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-neutral-400">
                <span>{cat.articlesCount}</span>
                <span className="flex items-center gap-0.5 text-neutral-700 group-hover:translate-x-0.5 transition">
                  Explore <ChevronDown className="h-3 w-3 -rotate-90" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Guides Section */}
      <section className="mx-auto max-w-[1120px] px-5 py-12">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 mb-6">
          Recommended Documentation Articles
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((art, idx) => (
            <Link
              key={idx}
              href="/dashboard"
              className="group rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-400 hover:shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                  {art.category}
                </span>
                <h4 className="mt-2 text-sm font-semibold text-neutral-900 group-hover:text-[#0078df] transition line-clamp-2">
                  {art.title}
                </h4>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {art.readTime}
                </span>
                <span className="flex items-center gap-0.5 text-neutral-700 group-hover:text-black font-medium">
                  Read article <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="mx-auto max-w-[1120px] px-5 py-12 border-t border-neutral-100">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0078df]">
              Common Questions
            </span>
            <h2 className="mt-2 text-2xl font-bold text-neutral-900 sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white overflow-hidden">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4.5 text-left text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                      openFaqIndex === i ? "rotate-180 text-black" : ""
                    }`}
                  />
                </button>
                {openFaqIndex === i && (
                  <div className="px-6 pb-5 pt-1 text-xs leading-relaxed text-neutral-600 bg-neutral-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support CTA Card */}
      <section className="mx-auto max-w-[1120px] px-5 py-12">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-900 p-8 text-white sm:p-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-2xl font-extrabold tracking-tight">
              Need personalized assistance?
            </h3>
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
              Our engineering support team is available 24/7. Submit a workspace ticket or explore our live developer community.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-neutral-100 transition shadow-sm"
            >
              Open Workspace Help Center
            </Link>
            <Link
              href="/request-demo"
              className="rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-neutral-700 transition"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
