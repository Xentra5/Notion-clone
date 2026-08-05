import React from "react";
import Link from "next/link";
import { Navbar } from "../_components/navbar";
import { Footer } from "../_components/footer";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, CheckSquare, BookOpen, Bot, Zap, Shield, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Product - Notion Connected Workspace",
  description: "Explore Notion's AI-native workspace features: Docs, Wikis, Projects, and AI Agents.",
};

export default function ProductPage() {
  const features = [
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: "Docs & Notes",
      description: "Simple, powerful, and intelligent documents with embedded tables, AI writing assistance, and real-time collaboration.",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-emerald-600" />,
      title: "Connected Wikis",
      description: "Turn fragmented team knowledge into a single search-enabled source of truth with automated context linking.",
    },
    {
      icon: <CheckSquare className="h-6 w-6 text-purple-600" />,
      title: "Projects & Tasks",
      description: "Manage timelines, Kanban boards, and sprint backlog with custom properties and automated status updates.",
    },
    {
      icon: <Bot className="h-6 w-6 text-amber-600" />,
      title: "Notion AI Agents",
      description: "Deploy autonomous AI agents that analyze documents, generate insights, and automate repetitive team routines.",
    },
  ];

  return (
    <main className="relative min-h-screen bg-white text-black">
      <Navbar />

      <section className="mx-auto max-w-[1120px] px-5 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 mb-6">
          <Sparkles className="h-4 w-4" /> Next-Generation Workspace
        </div>
        <h1 className="text-[40px] font-[850] tracking-tight text-[#050505] sm:text-[56px] leading-[1.1]">
          One product for docs, projects, and AI routines.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed">
          Bring all your notes, knowledge bases, and sprint workflows together in a single connected environment powered by native AI.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/signup">
            <Button className="h-11 rounded-lg bg-[#0078df] px-6 text-[16px] font-bold text-white hover:bg-[#006dcc]">
              Try Notion free <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/request-demo">
            <Button variant="outline" className="h-11 rounded-lg border-neutral-300 px-6 text-[16px] font-bold text-neutral-800 hover:bg-neutral-50">
              Request a demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-[1120px] px-5 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6 shadow-xs hover:border-neutral-400 hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs border border-neutral-100">
                {f.icon}
              </div>
              <h3 className="mt-5 text-xl font-bold text-neutral-900">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Highlight Section */}
      <section className="mx-auto mt-16 max-w-[1120px] px-5">
        <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-10 text-white shadow-xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Deep Integration</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Connected context across every page and database.
            </h2>
            <p className="mt-4 text-neutral-300 leading-relaxed">
              Every document in Notion can become a database item, and every database item can open into a full canvas document. Sync with Slack, GitHub, Jira, and Google Drive seamlessly.
            </p>
            <div className="mt-8 flex gap-6 text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" /> Instant Search
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" /> Enterprise Grade
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
