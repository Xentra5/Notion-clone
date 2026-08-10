import React from "react";
import { Navbar } from "../_components/navbar";
import { Footer } from "../_components/footer";
import { BookOpen, Video, LayoutTemplate, HelpCircle, GraduationCap, Compass } from "lucide-react";

export const metadata = {
  title: "Resources - Notion Guides, Templates & Community",
  description: "Explore guides, community templates, tutorials, and documentation for Notion.",
};

export default function ResourcesPage() {
  const resources = [
    {
      icon: <GraduationCap className="h-6 w-6 text-blue-600" />,
      category: "Notion Academy",
      title: "Interactive courses & certifications",
      desc: "Master workspace architecture, database formulas, and AI prompt engineering with official video courses.",
    },
    {
      icon: <LayoutTemplate className="h-6 w-6 text-emerald-600" />,
      category: "Template Gallery",
      title: "10,000+ community templates",
      desc: "Kickstart your setup with ready-to-use templates for project tracking, OKRs, CRM, and personal wikis.",
    },
    {
      icon: <Video className="h-6 w-6 text-purple-600" />,
      category: "Webinars & Events",
      title: "Live walkthroughs with product experts",
      desc: "Join weekly live sessions to learn advanced Notion setups and discover newly released features.",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-amber-600" />,
      category: "Guides & Tutorials",
      title: "Step-by-step documentation",
      desc: "Detailed articles covering permissions, formula syntax, team space governance, and API integrations.",
    },
    {
      icon: <Compass className="h-6 w-6 text-pink-600" />,
      category: "Community Hub",
      title: "Connect with 1M+ creators & teams",
      desc: "Join local meetups, Reddit forums, and Discord channels to share ideas and ask questions.",
    },
    {
      icon: <HelpCircle className="h-6 w-6 text-indigo-600" />,
      category: "Help Center",
      title: "24/7 Support & FAQ",
      desc: "Troubleshoot issues, view account billing info, or contact our support team directly.",
    },
  ];

  return (
    <main className="relative min-h-screen bg-white text-black">
      <Navbar />

      <section className="mx-auto max-w-[1120px] px-5 pt-16 pb-16 text-center">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#0078df]">
          Learning & Knowledge
        </span>
        <h1 className="mt-3 text-[40px] font-[850] tracking-tight text-[#050505] sm:text-[56px] leading-[1.1]">
          Everything you need to succeed with Notion.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed">
          From beginner tutorials to advanced enterprise architecture guides, get the resources to build your dream workspace.
        </p>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((r, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-7 shadow-xs hover:border-neutral-400 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-neutral-200">
                {r.icon}
              </div>
              <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-neutral-500">
                {r.category}
              </span>
              <h3 className="mt-1 text-xl font-bold text-neutral-900">{r.title}</h3>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
