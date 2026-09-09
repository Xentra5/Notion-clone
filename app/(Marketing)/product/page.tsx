import React from "react";
import Link from "next/link";
import { Navbar } from "../_components/navbar";
import { Footer } from "../_components/footer";
import { Button } from "@/components/ui/button";
import { ProductInteractive } from "./product-client";
import { Sparkles, ArrowRight, FileText, Kanban, BookOpen, HardDrive } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TypewriterText } from "@/components/ui/typewriter-text";

export const metadata = {
  title: "Product - Notion Connected Workspace & AI",
  description:
    "Explore Notion's modern workspace features: Block Canvas, Multi-View Databases, Connected Wikis, and Native AI.",
};

export default function ProductPage() {
  return (
    <main className="relative min-h-screen bg-white text-[#050505] overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* HERO SECTION - CLEAN LIGHT THEME */}
      <section className="relative z-10 mx-auto max-w-[1140px] px-5 pt-16 pb-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e6e6e6] bg-white px-4 py-1.5 text-xs font-bold text-[#4f4f4f] shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:border-neutral-300 transition-all cursor-default">
          <Sparkles className="h-3.5 w-3.5 text-[#0078df]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#0078df]">
            NEXT-GENERATION WORKSPACE
          </span>
          <span className="h-1 w-1 rounded-full bg-neutral-300" />
          <span>Connected Docs, Projects &amp; AI</span>
        </div>

        {/* Heading with typewriter slow reveal and complete */}
        <h1 className="mt-5 text-[42px] font-[850] tracking-[-0.03em] text-[#050505] sm:text-[66px] leading-[1.05] max-w-4xl mx-auto">
          One connected product for docs, projects, and{" "}
          <TypewriterText
            words={[
              "native AI.",
              "Kanban sprints.",
              "connected wikis.",
              "WASM code runners.",
            ]}
            className="text-[#0078df] underline decoration-blue-200 underline-offset-8"
          />
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-neutral-600 leading-relaxed font-normal">
          Bring all your notes, knowledge bases, and sprint workflows together in a single connected environment powered by native AI.
        </p>

        {/* Dual CTA Actions */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-3.5">
          <Link href="/signup">
            <Button className="h-11 rounded-lg bg-[#0078df] px-6 text-[16px] font-bold text-white shadow-[0_1px_0_rgba(0,0,0,0.12)] hover:bg-[#0066bd] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              Try Notion free <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/request-demo">
            <Button
              variant="secondary"
              className="h-11 rounded-lg bg-[#eaf4ff] px-6 text-[16px] font-bold text-[#005fad] hover:bg-[#dceeff] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Request a demo
            </Button>
          </Link>
        </div>

        {/* Quick Highlights Metrics Bar with scroll-triggered 0 to X animated counters */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs hover:border-neutral-300 transition-all duration-200">
            <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Dynamic Editor</div>
            <div className="mt-1 text-base font-extrabold text-neutral-900 flex items-center gap-1.5 whitespace-nowrap">
              <FileText className="h-4 w-4 text-[#0078df] shrink-0" />
              <AnimatedCounter value={25} suffix="+ Rich Blocks" duration={1200} />
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs hover:border-neutral-300 transition-all duration-200">
            <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Database Views</div>
            <div className="mt-1 text-base font-extrabold text-neutral-900 flex items-center gap-1.5 whitespace-nowrap">
              <Kanban className="h-4 w-4 text-purple-600 shrink-0" />
              <AnimatedCounter value={3} suffix=" Native Views" duration={800} />
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs hover:border-neutral-300 transition-all duration-200">
            <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Tree Hierarchy</div>
            <div className="mt-1 text-base font-extrabold text-neutral-900 flex items-center gap-1.5 whitespace-nowrap">
              <BookOpen className="h-4 w-4 text-emerald-600 shrink-0" />
              <AnimatedCounter prefix="O(" value={1} suffix=") Subtrees" duration={600} />
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs hover:border-neutral-300 transition-all duration-200">
            <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Persistence</div>
            <div className="mt-1 text-base font-extrabold text-neutral-900 flex items-center gap-1.5 whitespace-nowrap">
              <HardDrive className="h-4 w-4 text-amber-600 shrink-0" />
              <AnimatedCounter value={0} suffix="ms Local-First" duration={500} />
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PRODUCT WORKSPACE SHOWCASE */}
      <ProductInteractive />

      <Footer />
    </main>
  );
}
