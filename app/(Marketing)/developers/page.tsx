import React from "react";
import { Navbar } from "../_components/navbar";
import { Footer } from "../_components/footer";
import { Button } from "@/components/ui/button";
import { Terminal, Cpu, Key, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Developers - Notion API & Integrations",
  description: "Connect Notion to your tools or build custom apps with the Notion REST API and SDKs.",
};

export default function DevelopersPage() {
  const codeSnippet = `// Search database items using Notion API
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const response = await notion.databases.query({
  database_id: "782390f7-1290-4a8b-a190-210192830192",
  filter: {
    property: "Status",
    status: { equals: "In Progress" },
  },
});
console.log("Active Tasks:", response.results);`;

  return (
    <main className="relative min-h-screen bg-white text-black">
      <Navbar />

      <section className="mx-auto max-w-[1120px] px-5 pt-16 pb-16 text-center">
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
          <Button className="h-11 rounded-lg bg-[#0078df] px-6 text-[16px] font-bold text-white hover:bg-[#006dcc]">
            Read API Docs <ExternalLink className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Code Editor Preview */}
      <section className="mx-auto max-w-[900px] px-5 py-6">
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#0d1117] shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-800 bg-[#161b22] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-xs text-neutral-400">query-database.ts</span>
            </div>
            <span className="font-mono text-xs text-blue-400">TypeScript</span>
          </div>
          <pre className="p-6 font-mono text-sm leading-relaxed text-emerald-400 overflow-x-auto">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      </section>

      {/* Developer Features */}
      <section className="mx-auto max-w-[1120px] px-5 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
            <Terminal className="h-6 w-6 text-blue-600 mb-3" />
            <h3 className="text-lg font-bold text-neutral-900">REST & GraphQL APIs</h3>
            <p className="mt-2 text-sm text-neutral-600">Perform standard CRUD operations on documents, block structures, properties, and comments.</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
            <Cpu className="h-6 w-6 text-purple-600 mb-3" />
            <h3 className="text-lg font-bold text-neutral-900">Webhooks & Triggers</h3>
            <p className="mt-2 text-sm text-neutral-600">Receive real-time event updates when pages are modified, created, or status fields change.</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
            <Key className="h-6 w-6 text-emerald-600 mb-3" />
            <h3 className="text-lg font-bold text-neutral-900">OAuth 2.0 Auth</h3>
            <p className="mt-2 text-sm text-neutral-600">Secure granular user permissions with standard OAuth 2.0 authorization flows.</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
