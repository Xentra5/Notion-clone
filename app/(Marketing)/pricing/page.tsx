"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../_components/navbar";
import { Footer } from "../_components/footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Bot, Zap, ArrowRight, ShieldCheck, Building2 } from "lucide-react";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "For individuals getting organized",
      buttonText: "Get Started Free",
      buttonStyle: "bg-neutral-900 text-white hover:bg-black border border-black font-extrabold",
      cardStyle: "bg-white border border-neutral-300 text-black shadow-xs hover:border-neutral-900",
      popular: false,
      features: [
        "Single user workspace",
        "5 guest collaborators",
        "Basic page analytics",
        "7-day version history",
      ],
    },
    {
      name: "Plus",
      price: isAnnual ? "$10" : "$12",
      originalPrice: "$12",
      annualTotal: "Billed annually as $120/yr (Save $24/yr)",
      period: "seat / month",
      desc: "For small teams planning together",
      buttonText: "Start Free Trial",
      buttonStyle: "bg-[#0078df] text-white hover:bg-[#006dcc] shadow-md font-extrabold",
      cardStyle: "bg-blue-50/40 border-2 border-[#0078df] text-black shadow-xl ring-2 ring-[#0078df]",
      popular: true,
      features: [
        "Unlimited team blocks",
        "100 guest collaborators",
        "Priority AI search",
        "30-day page history",
        "Unlimited file uploads",
      ],
    },
    {
      name: "Business",
      price: isAnnual ? "$18" : "$22",
      originalPrice: "$22",
      annualTotal: "Billed annually as $216/yr (Save $48/yr)",
      period: "seat / month",
      desc: "For growing companies & orgs",
      buttonText: "Start Free Trial",
      buttonStyle: "bg-neutral-900 text-white hover:bg-black font-extrabold",
      cardStyle: "bg-white border border-neutral-300 text-black shadow-xs hover:border-neutral-900",
      popular: false,
      features: [
        "Everything in Plus",
        "SAML SSO authentication",
        "Private team spaces",
        "250 guest collaborators",
        "90-day version history",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "tailored billing",
      desc: "Advanced security & controls",
      buttonText: "Request Enterprise Demo",
      buttonStyle: "bg-[#0078df] text-white hover:bg-[#006dcc] font-extrabold shadow-md",
      cardStyle: "bg-purple-50/30 border border-purple-300 text-black shadow-sm hover:border-purple-500",
      popular: false,
      features: [
        "Everything in Business",
        "User SCIM provisioning",
        "Advanced Audit Log exporting",
        "Workspace DLP security",
        "Dedicated CSM & 99.9% SLA",
      ],
    },
  ];

  return (
    <main className="relative min-h-screen bg-white text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="mx-auto max-w-[1120px] px-5 pt-16 pb-10 text-center">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#0078df]">
          Workspace Upgrade
        </span>
        <h1 className="mt-3 text-[40px] font-[850] tracking-tight text-black sm:text-[56px] leading-[1.1]">
          Pricing Plans &amp; Enterprise
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg font-bold text-neutral-800">
          Choose the right plan to power up your workspace with AI tools, team collaboration, and security.
        </p>

        {/* Toggle */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className={`text-sm font-extrabold ${!isAnnual ? "text-black" : "text-neutral-500"}`}>
            Billed Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative h-7 w-14 rounded-full bg-neutral-200 p-1 transition-colors hover:bg-neutral-300 border border-neutral-300"
            aria-label="Toggle annual billing"
          >
            <div
              className={`h-5 w-5 rounded-full bg-[#0078df] shadow-md transition-transform ${
                isAnnual ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm font-extrabold flex items-center gap-2 ${isAnnual ? "text-black" : "text-neutral-500"}`}>
            Billed Yearly
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 border border-emerald-300">
              Save 20%
            </span>
          </span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-[1120px] px-5 py-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`relative flex flex-col justify-between rounded-2xl p-7 transition-all ${p.cardStyle}`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#0078df] px-3.5 py-1 text-xs font-extrabold text-white shadow-md flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Most Popular
                </div>
              )}

              <div>
                <h3 className="text-2xl font-extrabold text-black">{p.name}</h3>
                <p className="mt-2 text-xs font-bold text-neutral-700 min-h-[36px] leading-snug">
                  {p.desc}
                </p>

                <div className="mt-6 flex flex-col border-b border-neutral-200 pb-5">
                  <div className="flex items-baseline gap-1.5">
                    {isAnnual && p.originalPrice ? (
                      <span className="text-xl font-bold text-neutral-400 line-through mr-1">{p.originalPrice}</span>
                    ) : null}
                    <span className="text-4xl font-extrabold text-black">{p.price}</span>
                    <span className="text-xs font-bold text-neutral-600">/ {p.period}</span>
                  </div>
                  {isAnnual && p.annualTotal ? (
                    <span className="text-[11px] font-extrabold text-emerald-600 mt-1">
                      {p.annualTotal}
                    </span>
                  ) : (
                    <span className="text-[11px] font-extrabold text-neutral-500 mt-1">
                      {p.name === "Free" || p.name === "Enterprise" ? "Flexible billing" : "Billed monthly"}
                    </span>
                  )}
                </div>

                <ul className="mt-6 flex flex-col gap-3.5">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-extrabold text-black">
                      <Check className="h-4 w-4 shrink-0 text-[#0078df] stroke-[3] mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={
                    p.name === "Enterprise"
                      ? "/request-demo"
                      : p.name === "Plus"
                      ? `/checkout?plan=pro&billing=${isAnnual ? "annual" : "monthly"}`
                      : p.name === "Business"
                      ? `/checkout?plan=ultimate&billing=${isAnnual ? "annual" : "monthly"}`
                      : "/signup"
                  }
                >
                  <Button
                    className={`w-full h-11 rounded-xl text-sm font-extrabold shadow-sm ${p.buttonStyle}`}
                  >
                    {p.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notion AI Upgrade Banner */}
      <section className="mx-auto max-w-[1120px] px-5 py-14">
        <div className="rounded-3xl border border-purple-300 bg-gradient-to-r from-purple-900 via-indigo-900 to-black p-8 sm:p-10 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/30 px-3.5 py-1 text-xs font-extrabold text-purple-200 border border-purple-400/40 mb-4">
                <Bot className="h-4 w-4 text-purple-300" /> Notion AI Upgrade Add-On
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Add Notion AI to any plan for $8 / member / month.
              </h2>
              <p className="mt-3 text-sm text-purple-100/90 leading-relaxed font-medium">
                Get unlimited access to AI Q&amp;A search across Notion, Slack, and Google Drive, automated document summaries, AI writing assistant, and custom AI agent routines.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-white">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400 shrink-0" /> AI Q&amp;A Search across all workspace connected apps
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-300 shrink-0" /> Unlimited AI writing assistant &amp; autofill
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-400 shrink-0" /> Autonomous AI Agents for routine team tasks
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" /> Zero data retention for AI model training
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch sm:items-center gap-3 shrink-0">
              <Link href="/signup">
                <Button className="h-12 px-8 rounded-xl bg-purple-500 text-white font-extrabold text-base hover:bg-purple-600 shadow-lg">
                  Add Notion AI <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <span className="text-xs text-purple-200 text-center font-bold">Cancel or adjust seats anytime</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
