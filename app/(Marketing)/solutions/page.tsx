import React from "react";
import Link from "next/link";
import { Navbar } from "../_components/navbar";
import { Footer } from "../_components/footer";
import { Button } from "@/components/ui/button";
import { Code, Palette, Cpu, BarChart3, Users, Rocket, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Solutions - Notion for Every Team",
  description: "Discover how Engineering, Product, Design, and Operations teams build on Notion.",
};

export default function SolutionsPage() {
  const solutions = [
    {
      icon: <Code className="h-6 w-6 text-blue-600" />,
      role: "Engineering",
      title: "Ship faster with connected sprint boards & tech specs",
      desc: "Centralize pull request specs, architecture decision records, and automated incident response wikis.",
    },
    {
      icon: <Rocket className="h-6 w-6 text-purple-600" />,
      role: "Product",
      title: "Align roadmaps with customer feedback & specs",
      desc: "Connect user research directly to your product feature backlogs and roadmap timelines.",
    },
    {
      icon: <Palette className="h-6 w-6 text-pink-600" />,
      role: "Design",
      title: "Design systems & asset libraries in one place",
      desc: "Store component specs, brand guidelines, and Figma embeds in accessible team spaces.",
    },
    {
      icon: <Cpu className="h-6 w-6 text-amber-600" />,
      role: "AI & Operations",
      title: "Automate routine operations with AI Agents",
      desc: "Run background summaries, meeting minutes extraction, and automated project status reporting.",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-emerald-600" />,
      role: "Sales & Marketing",
      title: "Manage campaigns & sales collateral",
      desc: "Coordinate launch calendars, competitive battlecards, and sales enablement decks.",
    },
    {
      icon: <Users className="h-6 w-6 text-indigo-600" />,
      role: "HR & People",
      title: "Onboard new hires with interactive wikis",
      desc: "Streamline employee onboarding checklists, company policies, and organizational charts.",
    },
  ];

  return (
    <main className="relative min-h-screen bg-white text-black">
      <Navbar />

      <section className="mx-auto max-w-[1120px] px-5 pt-16 pb-16 text-center">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#0078df]">
          Tailored Solutions
        </span>
        <h1 className="mt-3 text-[40px] font-[850] tracking-tight text-[#050505] sm:text-[56px] leading-[1.1]">
          Built for how modern teams work.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed">
          From early-stage startups to global enterprises, discover tailored workflows designed for your team&apos;s exact discipline.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/request-demo">
            <Button className="h-11 rounded-lg bg-[#0078df] px-6 text-[16px] font-bold text-white hover:bg-[#006dcc]">
              Talk to Sales <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s, i) => (
            <div key={i} className="group rounded-2xl border border-neutral-200 bg-neutral-50/50 p-7 shadow-xs hover:border-blue-300 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-neutral-200 group-hover:scale-105 transition-transform">
                {s.icon}
              </div>
              <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-neutral-500">
                {s.role}
              </span>
              <h3 className="mt-1 text-xl font-bold text-neutral-900 group-hover:text-[#0078df] transition-colors">
                {s.title}
              </h3>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
