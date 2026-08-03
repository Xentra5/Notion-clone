"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { useSession } from "next-auth/react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess?: () => void;
}

export function PricingModal({ isOpen, onClose, onUpgradeSuccess }: PricingModalProps) {
  const { data: session, update } = useSession();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async (plan: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upgrade", plan }),
      });
      if (response.ok) {
        // Trigger session update
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#191919] border border-neutral-200 dark:border-[#333] rounded-2xl shadow-2xl p-6 md:p-8 text-neutral-800 dark:text-neutral-200 overflow-y-auto max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Pricing</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Check out our affordable pricing plans
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-xs font-semibold ${!isAnnual ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}>
              Monthly billing
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                isAnnual ? "bg-neutral-950 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-700"
              } focus:outline-none`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? "translate-x-5 bg-white dark:bg-[#191919]" : "translate-x-0 bg-white"
                }`}
              />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}>
              Annual billing
              <span className="text-[10px] bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="flex flex-col justify-between p-6 bg-neutral-50 dark:bg-[#202020] border border-neutral-200 dark:border-[#333] rounded-xl">
            <div>
              <h3 className="text-xl font-bold mb-1">Free</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                For individuals getting started
              </p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
                  {isAnnual ? "per year" : "per month"}
                </span>
              </div>

              {/* Checklist */}
              <ul className="space-y-3 text-xs sm:text-sm mb-8 text-neutral-600 dark:text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span>Single user</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span>Basic components library</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span>Community support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span>1GB storage space</span>
                </li>
              </ul>
            </div>

            <button
              disabled={session?.user?.plan === "free"}
              onClick={() => handlePurchase("free")}
              className="w-full py-2.5 rounded-xl border border-neutral-300 dark:border-[#444] font-semibold text-xs sm:text-sm text-center bg-white dark:bg-[#2a2a2a] hover:bg-neutral-50 dark:hover:bg-[#333] disabled:opacity-50 transition cursor-pointer"
            >
              {session?.user?.plan === "free" ? "Current Plan" : "Downgrade"}
            </button>
          </div>

          {/* Pro Tier */}
          <div className="flex flex-col justify-between p-6 bg-neutral-50 dark:bg-[#202020] border border-neutral-200 dark:border-[#333] rounded-xl relative overflow-hidden">
            {/* Active Badge */}
            <div className="absolute top-0 right-0 bg-neutral-900 text-white dark:bg-white dark:text-black text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-bl-lg">
              Popular
            </div>

            <div>
              <h3 className="text-xl font-bold mb-1">Pro</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                For professionals
              </p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold">
                  {isAnnual ? "$468" : "$49"}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
                  {isAnnual ? "per year" : "per month"}
                </span>
              </div>

              {/* Checklist */}
              <ul className="space-y-3 text-xs sm:text-sm mb-8 text-neutral-600 dark:text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-900 dark:text-neutral-200 shrink-0" />
                  <span>Up to 5 team members</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-900 dark:text-neutral-200 shrink-0" />
                  <span>Advanced components library</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-900 dark:text-neutral-200 shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-900 dark:text-neutral-200 shrink-0" />
                  <span>2GB storage space</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-900 dark:text-neutral-200 shrink-0" />
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-900 dark:text-neutral-200 shrink-0" />
                  <span>Custom branding</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handlePurchase("pro")}
              disabled={loading || session?.user?.plan === "pro"}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold text-xs sm:text-sm text-center transition hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              {session?.user?.plan === "pro" ? "Current Plan" : loading ? "Upgrading..." : "Purchase"}
            </button>
          </div>

          {/* Ultimate Tier */}
          <div className="flex flex-col justify-between p-6 bg-neutral-900 dark:bg-black text-white border border-neutral-800 dark:border-neutral-900 rounded-xl shadow-lg relative overflow-hidden">
            {/* Highlighted Badge */}
            <div className="absolute top-0 right-0 bg-neutral-100 text-neutral-950 dark:bg-neutral-800 dark:text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-bl-lg">
              Ultimate
            </div>

            <div>
              <h3 className="text-xl font-bold mb-1">Ultimate</h3>
              <p className="text-xs text-neutral-400 mb-4">
                For organizations & scale
              </p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold">
                  {isAnnual ? "$948" : "$99"}
                </span>
                <span className="text-xs text-neutral-400 ml-1">
                  {isAnnual ? "per year" : "per month"}
                </span>
              </div>

              {/* Checklist */}
              <ul className="space-y-3 text-xs sm:text-sm mb-8 text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-200 shrink-0" />
                  <span>Unlimited team members</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-200 shrink-0" />
                  <span>10GB storage space</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-200 shrink-0" />
                  <span>Custom domain mapping</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-200 shrink-0" />
                  <span>Dedicated 24/7 support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-200 shrink-0" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-200 shrink-0" />
                  <span>Infinite version history</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handlePurchase("ultimate")}
              disabled={loading || session?.user?.plan === "ultimate"}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs sm:text-sm text-center transition hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              {session?.user?.plan === "ultimate" ? "Current Plan" : loading ? "Upgrading..." : "Purchase"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
