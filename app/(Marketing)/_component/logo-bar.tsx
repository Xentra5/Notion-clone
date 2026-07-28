"use client";

import React from "react";

const logos = [
  { name: "OpenAI", logo: "OpenAI" },
  { name: "Figma", logo: "Figma" },
  { name: "Ramp", logo: "ramp" },
  { name: "Cursor", logo: "CURSOR" },
  { name: "Vercel", logo: "Vercel" },
  { name: "NVIDIA", logo: "NVIDIA" },
  { name: "Volvo", logo: "VOLVO" },
  { name: "L'Oreal", logo: "L'ORÉAL" },
  { name: "Discord", logo: "Discord" },
  { name: "Toyota", logo: "TOYOTA" },
  { name: "1Password", logo: "1Password" },
  { name: "Affirm", logo: "affirm" },
];

export const LogoBar = () => {
  return (
    <section className="mx-auto mt-24 max-w-[1120px] px-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
        Trusted by teams at the world's most innovative companies
      </p>
      
      {/* Logos grid */}
      <div className="mt-8 grid grid-cols-3 gap-x-8 gap-y-6 sm:grid-cols-4 md:grid-cols-6 items-center justify-items-center opacity-45 grayscale transition duration-300">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex items-center justify-center font-sans text-lg font-bold tracking-tight text-neutral-800 hover:text-black hover:opacity-100 transition-all duration-200"
          >
            {logo.logo === "OpenAI" && (
              <span className="flex items-center gap-1.5 text-[15px] font-semibold tracking-normal">
                <span className="text-xl">❖</span> OpenAI
              </span>
            )}
            {logo.logo === "Figma" && (
              <span className="flex items-center gap-1 text-[15px] font-semibold tracking-normal">
                <span className="text-red-500 text-lg">∫</span> Figma
              </span>
            )}
            {logo.logo === "ramp" && <span className="lowercase font-serif tracking-tighter text-xl">ramp</span>}
            {logo.logo === "CURSOR" && <span className="uppercase font-mono tracking-widest text-[14px]">[cursor]</span>}
            {logo.logo === "Vercel" && (
              <span className="flex items-center gap-1.5 text-[14px] font-bold tracking-wide">
                <span className="border-t-[10px] border-x-[6px] border-x-transparent border-t-black inline-block rotate-180 transform" /> VERCEL
              </span>
            )}
            {logo.logo === "NVIDIA" && <span className="italic tracking-tighter text-lg font-extrabold">NVIDIA</span>}
            {logo.logo === "VOLVO" && <span className="tracking-[0.2em] font-serif text-[13px] font-normal uppercase">Volvo</span>}
            {logo.logo === "L'ORÉAL" && <span className="tracking-[0.15em] text-[13px] font-light uppercase">L'ORÉAL</span>}
            {logo.logo === "Discord" && <span className="tracking-tight text-[16px] font-semibold">Discord</span>}
            {logo.logo === "TOYOTA" && <span className="tracking-[0.1em] text-[14px] font-bold uppercase">TOYOTA</span>}
            {logo.logo === "1Password" && <span className="tracking-tight text-[15px] font-medium">1Password</span>}
            {logo.logo === "affirm" && <span className="lowercase italic font-semibold text-[17px] tracking-tight">affirm</span>}
          </div>
        ))}
      </div>
    </section>
  );
};
