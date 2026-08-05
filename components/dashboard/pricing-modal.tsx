"use client";

import { useState } from "react";
import { X, Check, Sparkles, Shield, Building2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess?: () => void;
}

export function PricingModal({ isOpen, onClose, onUpgradeSuccess }: PricingModalProps) {
  const { data: session, update } = useSession();
  const [isAnnual, setIsAnnual] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async (plan: string) => {
    if (plan === "enterprise") {
      onClose();
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upgrade", plan }),
      });
      if (response.ok) {
        await update();
        if (onUpgradeSuccess) onUpgradeSuccess();
        onClose();
      } else {
        console.error("Upgrade failed");
      }
    } catch (error) {
      console.error("Error upgrading:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-[#121212] border border-[#2a2a2a] rounded-3xl shadow-2xl p-6 md:p-8 text-white overflow-y-auto max-h-[92vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-[#252525] transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Title */}
        <div className="text-center mb-8">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#0078df]">
            Workspace Upgrade
          </span>
          <h1 className="text-3xl md:text-4xl font-[850] tracking-tight text-white mt-1 mb-2">
            Pricing Plans &amp; Enterprise
          </h1>
          <p className="text-neutral-400 text-sm max-w-md mx-auto font-medium">
            Choose the right plan to power up your workspace with AI tools, team collaboration, and security.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-xs font-extrabold ${!isAnnual ? "text-white" : "text-neutral-400"}`}>
              Monthly billing
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full bg-[#2a2a2a] p-0.5 transition-colors duration-200 ease-in-out hover:bg-[#333]"
              aria-label="Toggle annual billing"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0078df] shadow-md transition duration-200 ease-in-out ${
                  isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-extrabold flex items-center gap-1.5 ${isAnnual ? "text-white" : "text-neutral-400"}`}>
              Annual billing
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full font-extrabold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* 4 Cards Grid: Free, Plus, Business, Enterprise */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free Plan */}
          <div className="flex flex-col justify-between p-6 bg-[#1a1a1a] border border-[#2b2b2b] rounded-2xl shadow-sm hover:border-[#444] transition-all">
            <div>
              <h3 className="text-xl font-extrabold text-white mb-1">Free</h3>
              <p className="text-xs font-medium text-neutral-400 mb-4 min-h-[32px]">
                For individuals getting organized
              </p>
              <div className="flex items-baseline mb-6 border-b border-[#2b2b2b] pb-4">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs font-bold text-neutral-400 ml-1">/ forever</span>
              </div>

              <ul className="space-y-3 text-xs font-bold text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>Single user workspace</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>5 guest collaborators</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>Basic page analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>7-day version history</span>
                </li>
              </ul>
            </div>

            <button
              disabled={session?.user?.plan === "free"}
              onClick={() => handlePurchase("free")}
              className="w-full py-3 rounded-xl border border-[#333] font-extrabold text-xs sm:text-sm text-center bg-[#252525] hover:bg-[#303030] text-white disabled:opacity-50 transition cursor-pointer"
            >
              {session?.user?.plan === "free" ? "Current Plan" : "Downgrade"}
            </button>
          </div>

          {/* Plus Plan (Popular) */}
          <div className="flex flex-col justify-between p-6 bg-gradient-to-b from-[#182638] to-[#121c2b] border-2 border-[#0078df] rounded-2xl shadow-xl shadow-blue-950/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#0078df] text-white text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-bl-xl flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Most Popular
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white mb-1">Plus</h3>
              <p className="text-xs font-medium text-blue-200/80 mb-4 min-h-[32px]">
                For small teams planning together
              </p>
              <div className="flex items-baseline mb-6 border-b border-blue-900/50 pb-4">
                <span className="text-4xl font-extrabold text-white">
                  {isAnnual ? "$10" : "$12"}
                </span>
                <span className="text-xs font-bold text-blue-200/80 ml-1">
                  / seat / month
                </span>
              </div>

              <ul className="space-y-3 text-xs font-bold text-white mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>Unlimited team blocks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>100 guest collaborators</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>Priority AI search</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>30-day page history</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>Unlimited file uploads</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handlePurchase("pro")}
              disabled={loading || session?.user?.plan === "pro"}
              className="w-full py-3 rounded-xl bg-[#0078df] hover:bg-[#0066bd] text-white font-extrabold text-xs sm:text-sm text-center shadow-lg transition disabled:opacity-50 cursor-pointer"
            >
              {session?.user?.plan === "pro" ? "Current Plan" : loading ? "Upgrading..." : "Upgrade to Plus"}
            </button>
          </div>

          {/* Business Plan */}
          <div className="flex flex-col justify-between p-6 bg-[#1a1a1a] border border-[#2b2b2b] rounded-2xl shadow-sm hover:border-[#444] transition-all">
            <div>
              <h3 className="text-xl font-extrabold text-white mb-1">Business</h3>
              <p className="text-xs font-medium text-neutral-400 mb-4 min-h-[32px]">
                For growing companies &amp; orgs
              </p>
              <div className="flex items-baseline mb-6 border-b border-[#2b2b2b] pb-4">
                <span className="text-4xl font-extrabold text-white">
                  {isAnnual ? "$18" : "$22"}
                </span>
                <span className="text-xs font-bold text-neutral-400 ml-1">
                  / seat / month
                </span>
              </div>

              <ul className="space-y-3 text-xs font-bold text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>Everything in Plus</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>SAML SSO authentication</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>Private team spaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>250 guest collaborators</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#0078df] stroke-[3] shrink-0" />
                  <span>90-day version history</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handlePurchase("ultimate")}
              disabled={loading || session?.user?.plan === "ultimate"}
              className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm text-center shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {session?.user?.plan === "ultimate" ? "Current Plan" : loading ? "Upgrading..." : "Upgrade to Business"}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="flex flex-col justify-between p-6 bg-gradient-to-b from-[#251936] to-[#181124] border border-purple-500/50 rounded-2xl shadow-xl shadow-purple-950/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-bl-xl flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Enterprise
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white mb-1">Enterprise</h3>
              <p className="text-xs font-medium text-purple-200/80 mb-4 min-h-[32px]">
                Advanced security &amp; controls
              </p>
              <div className="flex items-baseline mb-6 border-b border-purple-900/50 pb-4">
                <span className="text-3xl font-extrabold text-white">Custom</span>
                <span className="text-xs font-bold text-purple-200/80 ml-1">/ tailored billing</span>
              </div>

              <ul className="space-y-3 text-xs font-bold text-white mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-400 stroke-[3] shrink-0" />
                  <span>Everything in Business</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-400 stroke-[3] shrink-0" />
                  <span>User SCIM provisioning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-400 stroke-[3] shrink-0" />
                  <span>Advanced Audit Log exporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-400 stroke-[3] shrink-0" />
                  <span>Workspace DLP security</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-400 stroke-[3] shrink-0" />
                  <span>Dedicated CSM &amp; 99.9% SLA</span>
                </li>
              </ul>
            </div>

            <Link href="/request-demo" onClick={onClose}>
              <button
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs sm:text-sm text-center shadow-lg transition cursor-pointer"
              >
                Request Enterprise Demo
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
