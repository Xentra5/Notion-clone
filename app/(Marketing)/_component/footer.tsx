"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="mt-28 border-t border-neutral-200 bg-white">
      {/* Get started block */}
      <div className="mx-auto max-w-[1120px] px-5 py-20 text-center">
        <h2 className="text-[36px] font-[850] tracking-tight text-[#050505] sm:text-[48px]">
          Get started today.
        </h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
      </div>

      <div className="border-t border-neutral-100 py-16">
        <div className="mx-auto grid max-w-[1120px] grid-cols-2 gap-8 px-5 sm:grid-cols-3 md:grid-cols-5">
          {/* Logo & Info column */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1 flex flex-col gap-4">
            <a href="#" className="flex items-center gap-2">
              <Image
                src="/notion-svgrepo-com.svg"
                alt="Notion Logo"
                width={30}
                height={30}
                className="h-7 w-7"
              />
              <span className="font-bold text-black text-[17px]">Notion</span>
            </a>
            <div className="flex items-center gap-3 text-neutral-400 mt-2">
              {/* Twitter / X */}
              <a href="#" className="hover:text-black transition" aria-label="Twitter">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="hover:text-black transition" aria-label="Instagram">
                <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="hover:text-black transition" aria-label="LinkedIn">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" className="hover:text-black transition" aria-label="YouTube">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              {/* GitHub */}
              <a href="#" className="hover:text-black transition" aria-label="GitHub">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
            <p className="text-[12px] text-neutral-400 mt-4 leading-normal">
              &copy; {new Date().getFullYear()} Notion Labs, Inc. All rights reserved.
            </p>
          </div>

          {/* Product links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Download</h4>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">iOS & Android</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Mac & Windows</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Calendar</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Web Clipper</a>
          </div>

          {/* Notion for links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Notion for</h4>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Enterprise</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Startups</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Small business</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Personal</a>
          </div>

          {/* Resources links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Resources</h4>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Help center</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Pricing</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Blog</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Community</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Templates</a>
          </div>

          {/* Company links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Company</h4>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">About us</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Careers</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Security</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Status</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-black transition">Terms & privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
