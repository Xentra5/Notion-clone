"use client";

import React from "react";

const stats = [
  { value: "100M+", label: "Users worldwide" },
  { value: "50%+", label: "of YC companies" },
  { value: "1.4M+", label: "Community members" },
  { value: "62%", label: "of Fortune 100" },
  { value: "#1", label: "G2 Knowledge Base" }
];

export const StatsBar = () => {
  return (
    <section className="mx-auto mt-28 max-w-[1120px] px-5">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-12 md:px-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-[36px] font-[850] tracking-tight text-black sm:text-[44px]">
                {stat.value}
              </span>
              <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
