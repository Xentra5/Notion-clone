import React from "react";
import Link from "next/link";
import { Navbar } from "../_components/navbar";
import { Footer } from "../_components/footer";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, KeyRound, FileCheck, Headphones, Server, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Enterprise - Notion Security & Governance",
  description: "Enterprise-grade security, SAML SSO, audit logs, and dedicated support for organizations.",
};

export default function EnterprisePage() {
  const enterprisePillars = [
    {
      icon: <Lock className="h-6 w-6 text-blue-600" />,
      title: "SAML SSO & SCIM User Provisioning",
      desc: "Integrate with Okta, Azure AD, OneLogin, or Ping Identity for automated user provisioning and single sign-on.",
    },
    {
      icon: <FileCheck className="h-6 w-6 text-emerald-600" />,
      title: "Advanced Audit Logs",
      desc: "Track workspace export activity, permission updates, page moves, and member access in detailed SIEM audit logs.",
    },
    {
      icon: <KeyRound className="h-6 w-6 text-purple-600" />,
      title: "Granular Permissions & IP Restrict",
      desc: "Restrict page sharing externally, disable copy/download actions, and enforce IP range whitelist rules.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-amber-600" />,
      title: "SOC 2 Type II & ISO 27001 Certified",
      desc: "Fully compliant with GDPR, HIPAA business associate agreements, and end-to-end data encryption at rest and in transit.",
    },
    {
      icon: <Headphones className="h-6 w-6 text-pink-600" />,
      title: "Dedicated Success Manager & 99.9% SLA",
      desc: "Get priority 24/7 technical support, custom team training onboarding, and uptime performance guarantees.",
    },
    {
      icon: <Server className="h-6 w-6 text-indigo-600" />,
      title: "Custom Data Loss Prevention (DLP)",
      desc: "Scan workspace documents automatically for sensitive credit card information, API keys, or PII.",
    },
  ];

  return (
    <main className="relative min-h-screen bg-white text-black">
      <Navbar />

      <section className="mx-auto max-w-[1120px] px-5 pt-16 pb-16 text-center">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#0078df]">
          Enterprise Grade
        </span>
        <h1 className="mt-3 text-[40px] font-[850] tracking-tight text-[#050505] sm:text-[56px] leading-[1.1]">
          Security and control for global organizations.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed">
          Scale your workspace with confidence. Complete governance, strict administrative controls, and enterprise-grade SLA compliance.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/request-demo">
            <Button className="h-11 rounded-lg bg-[#0078df] px-6 text-[16px] font-bold text-white hover:bg-[#006dcc]">
              Contact Enterprise Team <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {enterprisePillars.map((p, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-7 shadow-xs hover:border-neutral-400 hover:bg-white transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-neutral-200">
                {p.icon}
              </div>
              <h3 className="mt-4 text-xl font-bold text-neutral-900">{p.title}</h3>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
