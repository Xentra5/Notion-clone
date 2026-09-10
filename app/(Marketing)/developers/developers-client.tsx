"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Terminal, Cpu, Key, ExternalLink, Copy, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface DevelopersClientProps {
  codeSnippet: string;
}

export function DevelopersClient({ codeSnippet }: DevelopersClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    toast.success("Code snippet copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <section className="mx-auto max-w-[1120px] px-5 pt-16 pb-14 text-center">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#0078df]">
          Developer Platform
        </span>
        <h1 className="mt-3 text-[40px] font-[850] tracking-tight text-[#050505] sm:text-[56px] leading-[1.1]">
          Build custom tools on the Notion API.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed">
          Access pages, databases, users, and comments programmatically. Automate workflows or launch public integrations for millions of teams.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/help">
            <Button className="h-11 rounded-lg bg-[#0078df] px-6 text-[16px] font-bold text-white hover:bg-[#006dcc] notion-press shadow-xs">
              Read API Docs <ExternalLink className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="h-11 rounded-lg border-neutral-300 px-6 text-[16px] font-bold text-neutral-800 hover:bg-neutral-50 notion-press"
            >
              My Integrations
            </Button>
          </Link>
        </div>
      </section>

      {/* Code Editor Preview */}
      <section className="mx-auto max-w-[900px] px-5 py-6">
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#0d1117] shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between border-b border-neutral-800 bg-[#161b22] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-xs text-neutral-400">query-database.ts</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-blue-400">TypeScript</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md bg-neutral-800/80 hover:bg-neutral-700 px-2.5 py-1 text-xs text-neutral-300 hover:text-white transition duration-150 cursor-pointer"
                title="Copy code snippet"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px] font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-medium">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <pre className="p-6 font-mono text-sm leading-relaxed text-emerald-400 overflow-x-auto">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      </section>

      {/* Developer Features */}
      <section className="mx-auto max-w-[1120px] px-5 py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="group rounded-2xl border border-neutral-200 bg-neutral-50/60 p-6 transition-all duration-200 ease-out hover:border-neutral-400 hover:bg-white hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-neutral-200 shadow-2xs group-hover:scale-105 transition-transform duration-200 mb-4">
                <Terminal className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 group-hover:text-[#0078df] transition-colors">
                REST &amp; GraphQL APIs
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Perform standard CRUD operations on documents, block structures, properties, and comments with sub-100ms response times.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-[#0078df]">
              <span>API Reference</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>

          <div className="group rounded-2xl border border-neutral-200 bg-neutral-50/60 p-6 transition-all duration-200 ease-out hover:border-neutral-400 hover:bg-white hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-neutral-200 shadow-2xs group-hover:scale-105 transition-transform duration-200 mb-4">
                <Cpu className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 group-hover:text-purple-600 transition-colors">
                Webhooks &amp; Realtime Events
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Receive real-time event updates when pages are modified, created, or status fields change with HMAC signature verification.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-purple-600">
              <span>Webhook Guides</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>

          <div className="group rounded-2xl border border-neutral-200 bg-neutral-50/60 p-6 transition-all duration-200 ease-out hover:border-neutral-400 hover:bg-white hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-neutral-200 shadow-2xs group-hover:scale-105 transition-transform duration-200 mb-4">
                <Key className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 group-hover:text-emerald-600 transition-colors">
                OAuth 2.0 Auth &amp; Scopes
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Secure granular user permissions with standard OAuth 2.0 authorization flows and restricted workspace teamspace boundaries.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span>Auth Architecture</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
