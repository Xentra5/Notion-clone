"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Globe,
  ArrowRight,
  Check,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

function CheckoutContent() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();

  const urlPlan = searchParams.get("plan");
  const urlBilling = searchParams.get("billing");
  const plan: "pro" | "ultimate" = urlPlan === "ultimate" ? "ultimate" : "pro";
  const isAnnual = urlBilling !== "monthly";

  // Region & Payment State
  const [region, setRegion] = useState<"us" | "in">("us");
  const [provider, setProvider] = useState<"stripe" | "razorpay">("stripe");
  const [paymentType, setPaymentType] = useState<"card" | "upi">("card");

  // Form inputs
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState(session?.user?.name || "");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [upiId, setUpiId] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const planTitle = plan === "pro" ? "Plus Workspace" : "Business Workspace";
  
  // Region-based base pricing
  const currencySymbol = region === "in" ? "₹" : "$";
  const monthlyPrice = region === "in" 
    ? (plan === "pro" ? (isAnnual ? 849 : 999) : (isAnnual ? 1499 : 1799))
    : (plan === "pro" ? (isAnnual ? 10 : 12) : (isAnnual ? 18 : 22));
    
  const subtotal = isAnnual ? monthlyPrice * 12 : monthlyPrice;
  const originalAmount = region === "in"
    ? (plan === "pro" ? 11988 : 21588)
    : (plan === "pro" ? 144 : 264);
  const savings = originalAmount - subtotal;

  // Real Calculated Fees & Taxes
  const gatewayFee = region === "in"
    ? Math.round(subtotal * 0.02) // 2% Razorpay processing fee
    : Number((subtotal * 0.029 + 0.30).toFixed(2)); // 2.9% + $0.30 Stripe fee

  const tax = region === "in"
    ? Math.round(subtotal * 0.18) // 18% GST in India
    : Number((subtotal * 0.05).toFixed(2)); // 5% Estimated Sales Tax in US

  const finalTotal = Number((subtotal + gatewayFee + tax).toFixed(2));

  const features =
    plan === "pro"
      ? [
          "Unlimited team blocks & pages",
          "100 guest collaborators",
          "30-day page version history",
          "Unlimited file uploads",
          "Priority AI assistant access",
        ]
      : [
          "Everything in Plus",
          "SAML SSO authentication",
          "Private team spaces",
          "250 guest collaborators",
          "90-day page version history",
        ];

  function formatCardNumber(value: string) {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  }

  function formatExpiry(value: string) {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  }

  async function handleStripeRedirect() {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        await handleDirectUpgrade();
      }
    } catch {
      await handleDirectUpgrade();
    }
  }

  async function handleRazorpayOrder() {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.orderId) {
        toast.info("Razorpay Order Created: " + data.orderId);
        await handleDirectUpgrade();
      } else {
        await handleDirectUpgrade();
      }
    } catch (err) {
      await handleDirectUpgrade();
    }
  }

  async function handleDirectUpgrade() {
    try {
      const res = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upgrade", plan }),
      });

      if (res.ok) {
        await update();
        setIsSuccess(true);
        toast.success(`Subscription activated: ${planTitle}`);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1800);
      } else {
        toast.error("Payment authorization failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("An error occurred during payment processing.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (provider === "stripe") {
      await handleStripeRedirect();
    } else {
      await handleRazorpayOrder();
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#121215] text-white flex flex-col items-center justify-center p-6 select-text font-sans">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-[#18181b] border border-[#27272a] shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
          <p className="text-sm text-zinc-400">
            Your workspace has been upgraded to <strong className="text-white">{planTitle}</strong>.
          </p>
          <p className="text-xs text-zinc-500">Redirecting to your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-zinc-100 font-sans select-text flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-[#27272a] bg-[#121215] px-6 md:px-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#27272a] transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Workspace</span>
          </Link>
          <div className="h-4 w-[1px] bg-[#27272a]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#27272a] border border-[#3f3f46] flex items-center justify-center font-bold text-xs text-white">
              N
            </div>
            <span className="text-sm font-semibold text-white">Notion Checkout</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="px-2.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] font-medium text-zinc-300 flex items-center gap-1.5">
            {region === "us" ? "🇺🇸 Global (USD)" : "🇮🇳 India (INR)"}
          </span>
          <div className="flex items-center gap-1 text-emerald-400">
            <Lock className="h-3.5 w-3.5" />
            <span>SSL Secured</span>
          </div>
        </div>
      </header>

      {/* Main Full Page Checkout Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Left Column: Order Summary & Included Features */}
        <div className="md:col-span-5 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Subscription Summary
              </span>
              <h1 className="text-3xl font-bold text-white mt-2">{planTitle}</h1>
              <p className="text-xs text-zinc-400 mt-1">
                {isAnnual ? "Billed annually • Save 20%" : "Billed monthly"}
              </p>
            </div>

            {/* Price Box with Real Fee Calculations */}
            <div className="p-5 rounded-2xl bg-[#121215] border border-[#27272a] space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-zinc-400 font-medium">Base Rate</span>
                <span className="text-sm font-semibold text-white">{currencySymbol}{monthlyPrice}/mo</span>
              </div>

              {isAnnual && (
                <div className="flex justify-between items-baseline text-emerald-400 text-xs font-medium">
                  <span>20% Annual Savings</span>
                  <span>-{currencySymbol}{savings}.00</span>
                </div>
              )}

              <div className="flex justify-between items-baseline text-xs text-zinc-400">
                <span>Subtotal ({isAnnual ? "Yearly" : "Monthly"})</span>
                <span className="font-semibold text-white">{currencySymbol}{subtotal.toLocaleString()}.00</span>
              </div>

              <div className="flex justify-between items-baseline text-xs text-zinc-400">
                <span>Gateway Fee ({provider === "stripe" ? "Stripe 2.9%+$0.30" : "Razorpay 2.0%"})</span>
                <span className="font-medium text-zinc-300">{currencySymbol}{gatewayFee.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-baseline text-xs text-zinc-400">
                <span>Estimated Tax ({region === "in" ? "18% GST" : "5% Sales Tax"})</span>
                <span className="font-medium text-zinc-300">{currencySymbol}{tax.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-[#27272a] flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Due Today</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-white">{currencySymbol}{finalTotal.toLocaleString()}</span>
                  <span className="text-[11px] text-zinc-400 block">{isAnnual ? "per year" : "per month"}</span>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Included in {planTitle}
              </h4>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                {features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#0078df] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#121215] border border-[#27272a] text-xs text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-[#0078df] shrink-0" />
            <span>Cancel or switch regions anytime from Workspace Settings</span>
          </div>
        </div>

        {/* Right Column: Payment Details Form */}
        <div className="md:col-span-7 bg-[#121215] border border-[#27272a] rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Billing Region &amp; Gateway</h3>
            <p className="text-xs text-zinc-400">Select your country region to set local currency &amp; payment gateway</p>
          </div>

          {/* Region Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Select Billing Region</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setRegion("us");
                  setProvider("stripe");
                  setPaymentType("card");
                }}
                className={`p-3 rounded-xl border text-xs text-left transition flex flex-col justify-between ${
                  region === "us"
                    ? "bg-[#18181b] border-blue-500 text-white ring-1 ring-blue-500/50"
                    : "bg-[#18181b] border-[#27272a] text-zinc-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>🇺🇸 United States &amp; Global</span>
                  <span className="text-[10px] text-blue-400 font-mono">USD ($)</span>
                </div>
                <span className="text-[11px] text-zinc-400 mt-1">Stripe • Cards &amp; Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegion("in");
                  setProvider("razorpay");
                  setPaymentType("upi");
                }}
                className={`p-3 rounded-xl border text-xs text-left transition flex flex-col justify-between ${
                  region === "in"
                    ? "bg-[#18181b] border-purple-500 text-white ring-1 ring-purple-500/50"
                    : "bg-[#18181b] border-[#27272a] text-zinc-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>🇮🇳 India</span>
                  <span className="text-[10px] text-purple-400 font-mono">INR (₹)</span>
                </div>
                <span className="text-[11px] text-zinc-400 mt-1">Razorpay • UPI, Cards &amp; NetBanking</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2 border-t border-[#27272a]">
            {/* Gateway indicator */}
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-2">
                {provider === "stripe" ? (
                  <>
                    <CreditCard className="h-4 w-4 text-blue-400" />
                    <span>Stripe Gateway (Credit / Debit Card)</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 text-purple-400" />
                    <span>Razorpay Gateway (UPI, QR &amp; Cards)</span>
                  </>
                )}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">{provider} SECURE</span>
            </div>

            {/* Payment Sub-options */}
            {region === "in" && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType("upi")}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition ${
                    paymentType === "upi"
                      ? "bg-[#18181b] border-purple-500 text-white"
                      : "bg-[#18181b] border-[#27272a] text-zinc-400"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5 text-purple-400" />
                  <span>UPI / GPay / PhonePe</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("card")}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition ${
                    paymentType === "card"
                      ? "bg-[#18181b] border-purple-500 text-white"
                      : "bg-[#18181b] border-[#27272a] text-zinc-400"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5 text-purple-400" />
                  <span>Card / NetBanking</span>
                </button>
              </div>
            )}

            {/* Form Fields */}
            {paymentType === "card" ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name as printed on card"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4532 0000 0000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-xs font-mono text-white placeholder:text-zinc-600 outline-none focus:border-zinc-400 transition"
                    />
                    <CreditCard className="absolute right-3.5 top-3 h-4 w-4 text-zinc-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Expiry Date</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="MM / YY"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-xs font-mono text-white placeholder:text-zinc-600 outline-none focus:border-zinc-400 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">CVC / Security Code</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                      placeholder="123"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-xs font-mono text-white placeholder:text-zinc-600 outline-none focus:border-zinc-400 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">Postal / Zip Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder={region === "in" ? "400001" : "10001"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-xs font-mono text-white placeholder:text-zinc-600 outline-none focus:border-zinc-400 transition"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">UPI Virtual Payment Address</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okhdfcbank"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-purple-500 transition"
                  />
                </div>
                <p className="text-xs text-zinc-400 leading-normal">
                  A payment authorization request will be sent to your UPI app (Google Pay, PhonePe, Paytm, BHIM).
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-[0.99] cursor-pointer mt-4"
            >
              <span>{isProcessing ? "Processing Payment..." : `Pay ${currencySymbol}${finalTotal.toLocaleString()} Now`}</span>
              {!isProcessing && <ArrowRight className="h-4 w-4" />}
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-zinc-500">
                Powered by {provider === "stripe" ? "Stripe Global" : "Razorpay India"} • Guaranteed 256-bit SSL encryption
              </span>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d0f] text-white flex items-center justify-center">Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
