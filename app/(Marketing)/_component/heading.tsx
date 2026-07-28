"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const rotatingWords = [
  { label: "build", bg: "bg-[#ffe1a3]", dot: "bg-[#ffad0a]" },
  { label: "plan", bg: "bg-[#dff2ff]", dot: "bg-[#0078df]" },
  { label: "write", bg: "bg-[#ffe1db]", dot: "bg-[#ff503e]" },
  { label: "decide", bg: "bg-[#e8ddff]", dot: "bg-[#8b5cf6]" },
];

export const Heading = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const activeWord = rotatingWords[wordIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % rotatingWords.length);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-[1120px] flex-col items-center px-5 text-center">
      <p className="mb-5 rounded-full border border-[#e6e6e6] bg-white px-4 py-1.5 text-sm font-semibold text-[#4f4f4f] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        One workspace for teams, docs, projects, and AI
      </p>

      <h1 className="max-w-[1080px] text-[46px] font-[850] leading-[1] tracking-normal text-[#050505] sm:text-[74px] lg:text-[94px]">
        Where teams and AI agents{" "}
        <span
          className={`inline-flex min-w-[210px] translate-y-1 items-center justify-center gap-3 rounded-full px-5 py-2 font-[650] text-[#050505] transition-colors duration-500 sm:min-w-[260px] sm:gap-4 sm:px-7 sm:py-3 ${activeWord.bg}`}
        >
          <span className={`h-6 w-6 rounded-full transition-colors duration-500 sm:h-8 sm:w-8 ${activeWord.dot}`} />
          {activeWord.label}
        </span>{" "}
        together.
      </h1>

      <p className="mt-7 max-w-[780px] text-[18px] leading-8 text-[#242424] sm:text-[21px]">
        Bring company knowledge, project plans, meeting notes, and everyday workflows into one connected place. Find reliable answers, preserve context, and let AI move routine work forward.
      </p>

      <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
        <Button className="h-11 rounded-lg bg-[#0078df] px-6 text-[16px] font-bold text-white shadow-[0_1px_0_rgba(0,0,0,0.12)] hover:bg-[#006dcc]">
          Get Notion free
        </Button>
        <Button
          variant="secondary"
          className="h-11 rounded-lg bg-[#eaf4ff] px-6 text-[16px] font-bold text-[#005fad] hover:bg-[#dceeff]"
        >
          Request a demo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="mt-5 max-w-[450px] text-sm font-medium text-[#606060] sm:max-w-[600px]">
        Start with a workspace your team understands. Scale with AI, governance, and context built in.
      </p>
    </section>
  );
};