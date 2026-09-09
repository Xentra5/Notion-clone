import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "../_components/navbar";
import { Footer } from "../_components/footer";
import { Button } from "@/components/ui/button";
import { EnterpriseInteractive } from "./enterprise-client";
import LogoLoop, { LogoItem } from "@/components/ui/logo-loop";
import {
  Zap,
  GitBranch,
  Server,
  ArrowRight,
  HardDrive,
  Cpu,
  Shield,
  Sparkles,
} from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TypewriterText } from "@/components/ui/typewriter-text";

export const metadata = {
  title: "Enterprise - Notion Scalable Architecture & Governance",
  description:
    "Enterprise-grade performance with Dual-Tier Distributed Cache (<0.1ms), O(1) Materialized Path Tree Hierarchy, Geo-Redundant Database Failover, and Async Vector RAG.",
};

const enterpriseStackLogos: LogoItem[] = [
  {
    title: "Next.js 16",
    node: (
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-neutral-200/90 bg-white hover:border-[#0078df] hover:shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer shadow-2xs group">
        <Image src="/next-js-svgrepo-com.svg" alt="Next.js 16" width={22} height={22} className="h-5 w-5 object-contain group-hover:scale-110 transition-transform" />
        <div className="text-left">
          <div className="text-xs font-bold text-neutral-900 leading-none">Next.js 16</div>
          <div className="text-[10px] font-medium text-neutral-500 mt-0.5">App Router</div>
        </div>
      </div>
    ),
  },
  {
    title: "MongoDB Atlas",
    node: (
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-neutral-200/90 bg-white hover:border-emerald-500 hover:shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer shadow-2xs group">
        <Image src="/mongodb-svgrepo-com.svg" alt="MongoDB" width={22} height={22} className="h-5 w-5 object-contain group-hover:scale-110 transition-transform" />
        <div className="text-left">
          <div className="text-xs font-bold text-neutral-900 leading-none">MongoDB Atlas</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">Materialized Path</div>
        </div>
      </div>
    ),
  },
  {
    title: "Upstash Redis",
    node: (
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-neutral-200/90 bg-white hover:border-rose-500 hover:shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer shadow-2xs group">
        <Image src="/nodejs-svgrepo-com.svg" alt="Redis" width={22} height={22} className="h-5 w-5 object-contain group-hover:scale-110 transition-transform" />
        <div className="text-left">
          <div className="text-xs font-bold text-neutral-900 leading-none">Upstash Redis</div>
          <div className="text-[10px] font-semibold text-rose-600 mt-0.5">Dual-Tier L2 Cache</div>
        </div>
      </div>
    ),
  },
  {
    title: "React 19",
    node: (
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-neutral-200/90 bg-white hover:border-blue-400 hover:shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer shadow-2xs group">
        <Image src="/react-svgrepo-com.svg" alt="React 19" width={22} height={22} className="h-5 w-5 object-contain group-hover:scale-110 transition-transform" />
        <div className="text-left">
          <div className="text-xs font-bold text-neutral-900 leading-none">React 19</div>
          <div className="text-[10px] font-semibold text-blue-600 mt-0.5">Concurrent UI</div>
        </div>
      </div>
    ),
  },
  {
    title: "TypeScript",
    node: (
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-neutral-200/90 bg-white hover:border-blue-600 hover:shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer shadow-2xs group">
        <Image src="/typescript-svgrepo-com.svg" alt="TypeScript" width={22} height={22} className="h-5 w-5 object-contain group-hover:scale-110 transition-transform" />
        <div className="text-left">
          <div className="text-xs font-bold text-neutral-900 leading-none">TypeScript 5</div>
          <div className="text-[10px] font-medium text-neutral-500 mt-0.5">Strict Types</div>
        </div>
      </div>
    ),
  },
  {
    title: "Docker",
    node: (
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-neutral-200/90 bg-white hover:border-cyan-500 hover:shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer shadow-2xs group">
        <Image src="/docker-svgrepo-com (2).svg" alt="Docker" width={22} height={22} className="h-5 w-5 object-contain group-hover:scale-110 transition-transform" />
        <div className="text-left">
          <div className="text-xs font-bold text-neutral-900 leading-none">Docker</div>
          <div className="text-[10px] font-medium text-neutral-500 mt-0.5">Standalone Image</div>
        </div>
      </div>
    ),
  },
  {
    title: "Tailwind CSS v4",
    node: (
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-neutral-200/90 bg-white hover:border-teal-500 hover:shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer shadow-2xs group">
        <Image src="/tailwind-svgrepo-com.svg" alt="Tailwind CSS v4" width={22} height={22} className="h-5 w-5 object-contain group-hover:scale-110 transition-transform" />
        <div className="text-left">
          <div className="text-xs font-bold text-neutral-900 leading-none">Tailwind v4</div>
          <div className="text-[10px] font-semibold text-teal-600 mt-0.5">Zero Runtime CSS</div>
        </div>
      </div>
    ),
  },
];

export default function EnterprisePage() {
  return (
    <main className="relative min-h-screen bg-white text-[#050505] overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* HERO SECTION - CLEAN LIGHT THEME WITH REFINED TYPOGRAPHY */}
      <section className="relative z-10 mx-auto max-w-[1140px] px-5 pt-16 pb-12 text-center">
        {/* Badge with micro-interaction */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e6e6e6] bg-white px-4 py-1.5 text-xs font-bold text-[#4f4f4f] shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:border-[#0078df]/50 hover:shadow-xs transition-all cursor-default">
          <Zap className="h-3.5 w-3.5 text-[#0078df]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#0078df]">
            ENTERPRISE ARCHITECTURE
          </span>
          <span className="h-1 w-1 rounded-full bg-neutral-300" />
          <span>High-Scale Performance &amp; Governance</span>
        </div>

        {/* Heading with typewriter slow reveal and complete */}
        <h1 className="mt-5 text-[42px] font-[850] tracking-[-0.03em] text-[#050505] sm:text-[66px] leading-[1.05] max-w-4xl mx-auto">
          Architected for zero latency, continuous uptime, and{" "}
          <TypewriterText
            words={[
              "enterprise scale.",
              "O(1) tree hierarchy.",
              "geo-redundant failover.",
              "sub-0.1ms cache speed.",
            ]}
            className="text-[#0078df] underline decoration-blue-200 underline-offset-8"
          />
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-neutral-600 leading-relaxed font-normal">
          Scale your workspace with confidence. Powered by a Dual-Tier distributed cache (&lt;0.1ms), O(1) Materialized Path tree hierarchy, geo-redundant database failover, and asynchronous vector RAG intelligence.
        </p>

        {/* Dual CTA Actions with smooth hover dynamics */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-3.5">
          <Link href="/request-demo">
            <Button className="h-11 rounded-lg bg-[#0078df] px-6 text-[16px] font-bold text-white shadow-[0_1px_0_rgba(0,0,0,0.12)] hover:bg-[#0066bd] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              Contact Enterprise Team <ArrowRight className="ml-1.5 h-4 w-4" />
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
            <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">L1 RAM Cache</div>
            <div className="mt-1 text-base font-extrabold text-neutral-900 flex items-center gap-1.5 whitespace-nowrap">
              <Cpu className="h-4 w-4 text-[#0078df] shrink-0" />
              <AnimatedCounter value={0.1} prefix="<" suffix="ms Latency" decimals={1} duration={1200} />
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs hover:border-neutral-300 transition-all duration-200">
            <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Subtree Index</div>
            <div className="mt-1 text-base font-extrabold text-neutral-900 flex items-center gap-1.5 whitespace-nowrap">
              <GitBranch className="h-4 w-4 text-purple-600 shrink-0" />
              <AnimatedCounter prefix="O(" value={1} suffix=") Single Query" duration={800} />
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs hover:border-neutral-300 transition-all duration-200">
            <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Cluster Failover</div>
            <div className="mt-1 text-base font-extrabold text-neutral-900 flex items-center gap-1.5 whitespace-nowrap">
              <Server className="h-4 w-4 text-emerald-600 shrink-0" />
              <AnimatedCounter value={99.99} suffix="% Uptime" decimals={2} duration={1600} />
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs hover:border-neutral-300 transition-all duration-200">
            <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Local Persistence</div>
            <div className="mt-1 text-base font-extrabold text-neutral-900 flex items-center gap-1.5 whitespace-nowrap">
              <HardDrive className="h-4 w-4 text-amber-600 shrink-0" />
              <AnimatedCounter value={0} suffix="ms Local-First" duration={600} />
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK LOGO LOOP WITH ROLE BADGES */}
      <section className="relative z-10 mx-auto max-w-[1140px] px-5 pb-12 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500 mb-5">
          ENTERPRISE ARCHITECTURE POWERED BY MODERN PRODUCTION TECH STACK
        </p>
        <div
          className="relative overflow-hidden py-2"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <LogoLoop
            logos={enterpriseStackLogos}
            speed={26}
            gap={28}
            logoHeight={44}
            pauseOnHover={true}
            scaleOnHover={false}
            ariaLabel="Production tech stack logos"
          />
        </div>
      </section>

      {/* INTERACTIVE CONSOLE, BENTO GRID WITH "WHAT IS THIS USED FOR?", & FAQ */}
      <EnterpriseInteractive />

      <Footer />
    </main>
  );
}
