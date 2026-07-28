"use client";

import React from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    company: "Cursor",
    quote: "Using the most AI-native tools like Notion is an important competitive advantage for us to stay small while doing a lot.",
    author: "Michael Truell",
    role: "Co-founder & CEO",
    colorTheme: "from-red-50 to-red-100/30 border-red-200",
    badgeColor: "bg-red-100 text-red-700",
    avatarChar: "M",
    avatarBg: "bg-red-500",
  },
  {
    company: "Faire",
    quote: "Notion's thoughtful design speeds up collaboration and decisions so we can deliver impact to our customers faster.",
    author: "Renee Solorzano",
    role: "Sr. Director of Product Design",
    colorTheme: "from-blue-50 to-blue-100/30 border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700",
    avatarChar: "R",
    avatarBg: "bg-blue-500",
  },
  {
    company: "Ramp",
    quote: "Notion Custom Agents help our team go beyond doing work with AI to building AI tools that do the work for them.",
    author: "Ben Levick",
    role: "Head of Operations & Internal AI",
    colorTheme: "from-amber-50 to-amber-100/30 border-amber-200",
    badgeColor: "bg-amber-100 text-amber-700",
    avatarChar: "B",
    avatarBg: "bg-amber-500",
  },
];

export const Testimonials = () => {
  return (
    <section className="mx-auto mt-28 max-w-[1120px] px-5">
      <div className="text-center">
        <h2 className="text-[32px] font-[850] tracking-tight text-[#050505] sm:text-[42px]">
          Trusted by teams that ship.
        </h2>
        <p className="mt-3 text-lg text-neutral-600">
          See how leading organizations build and automate their workspaces.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t, index) => (
          <div
            key={index}
            className={`flex flex-col justify-between rounded-2xl border p-8 bg-gradient-to-b ${t.colorTheme} shadow-sm hover:shadow-md transition-all duration-300`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${t.badgeColor}`}>
                  {t.company}
                </span>
                <Quote className="h-5 w-5 opacity-20" />
              </div>
              <p className="mt-6 text-[15px] font-medium leading-relaxed text-neutral-800 italic">
                "{t.quote}"
              </p>
            </div>

            <div className="mt-8 flex items-center gap-3 border-t border-neutral-200/50 pt-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white font-bold ${t.avatarBg}`}>
                {t.avatarChar}
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">{t.author}</h4>
                <p className="text-xs font-medium text-neutral-500">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
