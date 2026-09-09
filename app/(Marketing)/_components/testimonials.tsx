"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface Testimonial {
  company: string;
  category: string;
  quote: string;
  author: string;
  role: string;
  impactMetric: string;
}

const testimonials: Testimonial[] = [
  {
    company: "Figma",
    category: "Design & Product Engineering",
    quote:
      "Notion is the single source of truth for our entire product organization. Having our architecture specs, roadmaps, and meeting decisions in one connected graph saved our engineering team hundreds of hours.",
    author: "Amanda Kleha",
    role: "Chief Customer Officer",
    impactMetric: "Unified 1,200+ employees into one workspace",
  },
  {
    company: "Ramp",
    category: "FinTech & Scaled Systems",
    quote:
      "Instead of maintaining five fragmented tools that don't talk to each other, our engineers and product managers run our entire sprint lifecycle and technical documentation in Notion.",
    author: "Geoff Charles",
    role: "VP of Product",
    impactMetric: "Replaced 4 disconnected point tools",
  },
  {
    company: "Vercel",
    category: "Developer Experience & Cloud",
    quote:
      "The speed, keyboard shortcuts, and flexibility make Notion feel like a natural extension of our developer workflow. It's the only tool that everyone from engineering to design actually loves using.",
    author: "Lee Robinson",
    role: "VP of Developer Experience",
    impactMetric: "Adopted across 100% of engineering sprints",
  },
];

export const Testimonials = () => {
  return (
    <section className="mx-auto mt-28 max-w-[1140px] px-5">
      {/* SECTION HEADER */}
      <div className="text-center max-w-xl mx-auto">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full inline-block mb-3">
          TRUSTED BY MODERN TEAMS
        </span>
        <h2 className="text-[32px] font-[850] tracking-tight text-[#050505] sm:text-[42px] leading-tight">
          Teams that build the future build on Notion.
        </h2>
        <p className="mt-2 text-base text-neutral-600 font-normal">
          From fast-growing startups to global engineering organizations.
        </p>
      </div>

      {/* 3 TESTIMONIAL CARDS */}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t, index) => (
          <div
            key={index}
            className="flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-white p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all duration-300"
          >
            <div>
              {/* Header: Company & Category */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <h3 className="text-lg font-[850] tracking-tight text-[#050505]">
                  {t.company}
                </h3>
                <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200/70">
                  {t.category}
                </span>
              </div>

              {/* Quote */}
              <p className="mt-5 text-[14px] text-neutral-700 leading-relaxed font-normal">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>

            <div className="mt-8 pt-5 border-t border-neutral-100 space-y-3">
              {/* Verified Impact Pill */}
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span>{t.impactMetric}</span>
              </div>

              {/* Author Info */}
              <div>
                <h4 className="text-xs font-bold text-neutral-900">{t.author}</h4>
                <p className="text-[11px] font-medium text-neutral-500">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
