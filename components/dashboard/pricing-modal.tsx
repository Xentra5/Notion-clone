"use client";

import { useState } from "react";
import { X, Check, Sparkles, Building2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess?: () => void;
}

export function PricingModal({ isOpen, onClose, onUpgradeSuccess }: PricingModalProps) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async (plan: string) => {
    if (plan === "enterprise") {
      onClose();
      router.push("/request-demo");
      return;
    }
    if (plan === "pro" || plan === "ultimate") {
      onClose();
      const billingParam = isAnnual ? "annual" : "monthly";
      router.push(`/checkout?plan=${plan}&billing=${billingParam}`);
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

  const currentPlan = session?.user?.plan || "free";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-150 select-text">
      <div className="relative w-full max-w-5xl bg-[#121215] border border-[#27272a] rounded-2xl shadow-2xl p-6 md:p-8 text-zinc-100 overflow-y-auto max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#27272a] transition"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Plans &amp; Pricing
          </h2>
          <p className="text-zinc-400 text-xs md:text-sm max-w-md mx-auto mt-1.5 font-normal">
            Select the best plan for your team and workspace collaboration.
          </p>

          {/* Segmented Billing Toggle */}
          <div className="inline-flex items-center gap-1 mt-5 p-1 rounded-xl bg-[#18181b] border border-[#27272a]">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                !isAnnual ? "bg-[#27272a] text-white shadow-xs" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Monthly billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isAnnual ? "bg-[#27272a] text-white shadow-xs" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Annual billing</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded-md">
                20% off
              </span>
            </button>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Free Plan */}
          <div className="flex flex-col justify-between p-5 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Free</h3>
              <p className="text-xs text-zinc-400 mb-4 min-h-[32px]">
                For personal notes &amp; organizing
              </p>
              <div className="border-b border-[#27272a] pb-4 mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">$0</span>
                  <span className="text-xs text-zinc-400">/ month</span>
                </div>
                <span className="text-[11px] text-zinc-500 block mt-1">Free forever</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>1 user workspace</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>5 guest collaborators</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>7-day page history</span>
                </li>
              </ul>
            </div>

            <button
              disabled={currentPlan === "free"}
              onClick={() => handlePurchase("free")}
              className="w-full py-2 rounded-lg border border-[#27272a] font-semibold text-xs text-center bg-[#121215] hover:bg-[#27272a] text-zinc-300 disabled:opacity-40 transition cursor-pointer"
            >
              {currentPlan === "free" ? "Current Plan" : "Downgrade"}
            </button>
          </div>

          {/* Plus Plan (Most Popular) */}
          <div className="flex flex-col justify-between p-5 bg-[#18181b] border-2 border-blue-500/80 rounded-xl relative shadow-lg">
            <div className="absolute -top-3 left-4 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Most Popular
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-1 mt-1">Plus</h3>
              <p className="text-xs text-zinc-400 mb-4 min-h-[32px]">
                For small teams &amp; active projects
              </p>

              <div className="border-b border-[#27272a] pb-4 mb-4">
                <div className="flex items-baseline gap-1.5">
                  {isAnnual ? (
                    <>
                      <span className="text-base text-zinc-500 line-through font-medium">$12</span>
                      <span className="text-3xl font-bold text-white">$10</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-white">$12</span>
                  )}
                  <span className="text-xs text-zinc-400">/ seat / mo</span>
                </div>
                {isAnnual ? (
                  <span className="text-[11px] font-medium text-emerald-400 block mt-1">
                    $120 billed yearly (save $24)
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-500 block mt-1">Billed monthly</span>
                )}
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-200 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>Unlimited team blocks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>100 guest collaborators</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>Priority AI search</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>30-day page history</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handlePurchase("pro")}
              disabled={loading || currentPlan === "pro"}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs text-center shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {currentPlan === "pro" ? "Current Plan" : loading ? "Loading..." : "Upgrade to Plus"}
            </button>
          </div>

          {/* Business Plan */}
          <div className="flex flex-col justify-between p-5 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Business</h3>
              <p className="text-xs text-zinc-400 mb-4 min-h-[32px]">
                For growing companies &amp; orgs
              </p>

              <div className="border-b border-[#27272a] pb-4 mb-4">
                <div className="flex items-baseline gap-1.5">
                  {isAnnual ? (
                    <>
                      <span className="text-base text-zinc-500 line-through font-medium">$22</span>
                      <span className="text-3xl font-bold text-white">$18</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-white">$22</span>
                  )}
                  <span className="text-xs text-zinc-400">/ seat / mo</span>
                </div>
                {isAnnual ? (
                  <span className="text-[11px] font-medium text-emerald-400 block mt-1">
                    $216 billed yearly (save $48)
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-500 block mt-1">Billed monthly</span>
                )}
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>Everything in Plus</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>SAML SSO authentication</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>Private team spaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>90-day version history</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handlePurchase("ultimate")}
              disabled={loading || currentPlan === "ultimate"}
              className="w-full py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs text-center shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {currentPlan === "ultimate" ? "Current Plan" : loading ? "Loading..." : "Upgrade to Business"}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="flex flex-col justify-between p-5 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Enterprise</h3>
              <p className="text-xs text-zinc-400 mb-4 min-h-[32px]">
                Advanced security &amp; controls
              </p>

              <div className="border-b border-[#27272a] pb-4 mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">Custom</span>
                </div>
                <span className="text-[11px] text-zinc-500 block mt-1">Tailored billing</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>Everything in Business</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>SCIM user provisioning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>Audit log exporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>Dedicated CSM &amp; 99.9% SLA</span>
                </li>
              </ul>
            </div>

            <Link href="/request-demo" onClick={onClose}>
              <button
                className="w-full py-2 rounded-lg border border-[#27272a] hover:bg-[#27272a] text-white font-semibold text-xs text-center transition cursor-pointer"
              >
                Contact Sales
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
