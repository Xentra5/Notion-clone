"use client";

import React from "react";
import Image from "next/image";
import LogoLoop, { LogoItem } from "@/components/ui/logo-loop";

const publicSvgLogos: LogoItem[] = [
  {
    title: "Notion",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/notion-svgrepo-com.svg"
          alt="Notion"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
  {
    title: "Next.js",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/next-js-svgrepo-com.svg"
          alt="Next.js"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
  {
    title: "TypeScript",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/typescript-svgrepo-com.svg"
          alt="TypeScript"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
  {
    title: "React",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/react-svgrepo-com.svg"
          alt="React"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
  {
    title: "Tailwind CSS",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/tailwind-svgrepo-com.svg"
          alt="Tailwind CSS"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
  {
    title: "Node.js",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/nodejs-svgrepo-com.svg"
          alt="Node.js"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
  {
    title: "MongoDB",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/mongodb-svgrepo-com.svg"
          alt="MongoDB"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
  {
    title: "Docker",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/docker-svgrepo-com (2).svg"
          alt="Docker"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
  {
    title: "JavaScript",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/js-svgrepo-com.svg"
          alt="JavaScript"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
  {
    title: "HTML5",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/html-5-svgrepo-com.svg"
          alt="HTML5"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
  {
    title: "CSS3",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/css-3-svgrepo-com.svg"
          alt="CSS3"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
  {
    title: "npm",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/npm-svgrepo-com.svg"
          alt="npm"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
  {
    title: "Prisma",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/light-prisma-svgrepo-com.svg"
          alt="Prisma"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
  {
    title: "Vercel",
    node: (
      <div className="flex h-10 w-10 items-center justify-center p-1 hover:scale-115 transition-transform duration-200 cursor-pointer">
        <Image
          src="/vercel-fill-svgrepo-com.svg"
          alt="Vercel"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
    ),
  },
];

export const LogoBar = () => {
  return (
    <section className="mx-auto mt-20 max-w-[1120px] px-5 text-center">
      <p className="text-[0.75rem] font-bold uppercase tracking-[0.05em] text-[#6B7280] mb-8">
        POWERED BY MODERN &amp; RELIABLE TECHNOLOGY STACK
      </p>

      {/* Infinite Auto-Scroll Marquee Carousel */}
      <div
        className="relative overflow-hidden py-2"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <LogoLoop
          logos={publicSvgLogos}
          speed={35}
          gap={52}
          logoHeight={36}
          pauseOnHover={true}
          scaleOnHover={true}
          ariaLabel="Technology stack logos"
        />
      </div>
    </section>
  );
};
