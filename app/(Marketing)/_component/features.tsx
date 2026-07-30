"use client";

import React, { useState } from "react";
import { ArrowRight, Bot, BookOpen, CheckCircle, Database, Search, Sparkle, Terminal } from "lucide-react";

export const Features = () => {
  const [activePill, setActivePill] = useState(0);

  const pills = [
    { label: "Triage product feedback", desc: "AI reads reviews, groups them by topic, and files bug tickets automatically." },
    { label: "Resolve support tickets in Slack", desc: "An AI agent reads Slack channel messages and suggests instant troubleshooting steps." },
    { label: "Respond to security alerts faster", desc: "Automate CVE scans, map them to source repositories, and tag the security lead." },
    { label: "Automate weekly reporting", desc: "AI gathers tasks shipped over the week and writes a clean markdown summary for leadership." },
    { label: "Create your own developer tools", desc: "Connect databases with Notion API to build custom scripts and internal dashboards." }
  ];

  return (
    <section className="mx-auto mt-28 max-w-[1120px] px-5">
      <div className="text-center">
        <h2 className="text-[36px] font-[850] tracking-tight text-[#050505] sm:text-[48px]">
          AI where your team works.
        </h2>
        <p className="mt-3 text-lg text-neutral-600 sm:text-xl">
          Supercharge your docs, wikis, and projects with built-in agent workflows.
        </p>
      </div>

      {/* Grid of features */}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: Capture Knowledge */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Capture knowledge</h3>
            <p className="mt-2 text-xl font-bold text-neutral-900">Bring everything into one system of record.</p>
          </div>
          
          {/* Mockup visual */}
          <div className="mt-6 rounded-lg border border-neutral-100 bg-neutral-50 p-4 font-mono text-[11px] text-neutral-600 shadow-inner">
            <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-2 mb-2 text-neutral-400">
              <Database className="h-3 w-3" />
              <span>Wiki / Engineering / Standard Operating Procedures</span>
            </div>
            <div className="space-y-2">
              <div className="h-4 rounded bg-white px-2 py-0.5 flex justify-between items-center border border-neutral-100">
                <span className="font-semibold text-black">Checked: Code Review Process</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1 rounded">Verified</span>
              </div>
              <div className="h-4 rounded bg-white px-2 py-0.5 flex justify-between items-center border border-neutral-100">
                <span className="font-semibold text-black">Checked: Onboarding Checklist</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1 rounded">Verified</span>
              </div>
              <div className="h-4 rounded bg-white px-2 py-0.5 flex justify-between items-center border border-neutral-100">
                <span className="font-semibold text-black">Checked: Release Playbook</span>
                <span className="text-[9px] bg-amber-50 text-amber-600 px-1 rounded">Under Review</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-1 text-[13px] font-bold text-blue-600 group-hover:text-blue-700">
            Explore wikis <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Card 2: Find Answers */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Search className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Find answers</h3>
            <p className="mt-2 text-xl font-bold text-neutral-900">Get answers, instantly - with citations.</p>
          </div>

          {/* AI Chat Visual */}
          <div className="mt-6 rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-[12px] shadow-inner">
            <div className="flex items-start gap-2.5 rounded-lg bg-purple-50/50 p-2.5 border border-purple-100/50">
              <Sparkle className="mt-0.5 h-3.5 w-3.5 text-purple-600 fill-purple-100" />
              <div>
                <p className="font-semibold text-purple-900 text-[11px]">Notion AI Assistant</p>
                <p className="mt-1 text-neutral-700 leading-normal">
                  &quot;Based on the <span className="underline decoration-purple-400 font-medium">Q3 Roadmap</span>, our biggest opportunity is shifting developers to Custom Agents.&quot;
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-1 text-[13px] font-bold text-purple-600 group-hover:text-purple-700">
            Learn about AI Search <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Card 3: Automate Busywork (Full width) */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 md:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Bot className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Automate busywork</h3>
              <p className="mt-2 text-xl font-bold text-neutral-900">Keep work moving 24/7 with agents.</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-1 text-[13px] font-bold text-amber-600 group-hover:text-amber-700">
              Meet Custom Agents <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Large agent pipeline mockup */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-[11px] shadow-inner">
            <div className="rounded-lg bg-white p-3 border border-neutral-200">
              <span className="font-semibold text-neutral-500">INCOMING REQUESTS</span>
              <div className="mt-2 p-2 rounded bg-neutral-50 border border-neutral-100">
                <p className="font-medium text-neutral-800">Support #1042: API Timeout</p>
                <div className="mt-1.5 flex items-center gap-1 text-[9px] text-neutral-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> High Priority
                </div>
              </div>
            </div>

            <div className="relative rounded-lg bg-white p-3 border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.12)]">
              <span className="flex items-center gap-1 font-semibold text-amber-700">
                <Sparkle className="h-3 w-3 fill-amber-200" /> CODING AGENT ACTIVE
              </span>
              <div className="mt-2 p-2 rounded bg-amber-50/50 border border-amber-200">
                <p className="font-medium text-neutral-800">Reviewing logs & codebase...</p>
                <div className="mt-1.5 flex items-center gap-1 text-[9px] text-amber-700">
                  <Terminal className="h-2.5 w-2.5" /> Running tests
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-3 border border-neutral-200">
              <span className="font-semibold text-neutral-500">SHIPPED & RECONCILED</span>
              <div className="mt-2 p-2 rounded bg-neutral-50 border border-neutral-100">
                <p className="font-medium text-neutral-800">Fix deployed & closed ticket</p>
                <div className="mt-1.5 flex items-center gap-1 text-[9px] text-emerald-600 font-medium">
                  <CheckCircle className="h-3 w-3" /> Auto-closed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* See what Notion can do */}
      <div className="mt-20">
        <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-neutral-400">
          See what Notion can do
        </h3>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {pills.map((pill, idx) => (
            <button
              key={pill.label}
              onClick={() => setActivePill(idx)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer ${
                activePill === idx
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-black"
              }`}
            >
              <span>{pill.label}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        {/* Display details of the active pill */}
        <div className="mx-auto mt-6 max-w-xl rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-center text-sm shadow-sm transition-all duration-300">
          <p className="font-bold text-neutral-900">How it works:</p>
          <p className="mt-2 text-neutral-600 leading-relaxed">{pills[activePill].desc}</p>
        </div>
      </div>
    </section>
  );
};
