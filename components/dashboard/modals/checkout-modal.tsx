"use client";

import { useState } from "react";
import { X, Lock, CheckCircle2, ArrowRight, CreditCard, Globe } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: "pro" | "ultimate";
  isAnnual: boolean;
  onSuccess?: () => void;
}

export function CheckoutModal({ isOpen, onClose, plan, isAnnual, onSuccess }: CheckoutModalProps) {
  const { data: session, update } = useSession();
  const [paymentType, setPaymentType] = useState<"card" | "upi">("card");

  // Form Fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState(session?.user?.name || "");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [upiId, setUpiId] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const planTitle = plan === "pro" ? "Plus Workspace" : "Business Workspace";
  const monthlyPrice = plan === "pro" ? (isAnnual ? 10 : 12) : (isAnnual ? 18 : 22);
  const totalAmount = isAnnual ? monthlyPrice * 12 : monthlyPrice;
  const originalAmount = plan === "pro" ? 144 : 264;
  const savings = originalAmount - totalAmount;

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

  async function handleSubmitPayment(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);

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
          setIsSuccess(false);
          if (onSuccess) onSuccess();
          onClose();
        }, 1600);
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-sans select-text animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden text-zinc-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#121215]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#27272a] border border-[#3f3f46] flex items-center justify-center font-bold text-xs text-white">
              N
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white leading-none">Notion Checkout</h3>
              <p className="text-[11px] text-zinc-400 mt-1 font-normal">
                {session?.user?.email || "Account Checkout"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#27272a] transition"
            aria-label="Close checkout"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Subscription Active</h2>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Your workspace is now on <strong className="text-white">{planTitle}</strong>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#27272a]">
            {/* Left: Summary Panel */}
            <div className="md:col-span-5 p-6 bg-[#121215] flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Subscribe to
                </span>
                <h4 className="text-lg font-bold text-white mt-1">{planTitle}</h4>
                <span className="inline-block text-[11px] font-medium text-zinc-400 mt-0.5">
                  {isAnnual ? "Billed annually" : "Billed monthly"}
                </span>

                <div className="mt-6 space-y-2.5 border-t border-[#27272a] pt-4 text-xs">
                  <div className="flex justify-between text-zinc-300">
                    <span>Base Subscription</span>
                    <span className="font-semibold">${monthlyPrice}/mo</span>
                  </div>
                  {isAnnual && (
                    <div className="flex justify-between text-emerald-400 text-[11px] font-medium">
                      <span>Annual Discount (20%)</span>
                      <span>-${savings}.00</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>Taxes &amp; VAT</span>
                    <span>$0.00</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline pt-4 border-t border-[#27272a] mb-4">
                  <span className="text-xs font-semibold text-zinc-300">Total Due Now</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">${totalAmount}.00</span>
                    <span className="text-[10px] text-zinc-400 block">{isAnnual ? "per year" : "per month"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <Lock className="h-3 w-3 text-zinc-400 shrink-0" />
                  <span>Guaranteed 256-bit SSL encryption</span>
                </div>
              </div>
            </div>

            {/* Right: Payment Inputs */}
            <form onSubmit={handleSubmitPayment} className="md:col-span-7 p-6 space-y-4 bg-[#18181b]">
              {/* Payment Method Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType("card")}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition ${
                      paymentType === "card"
                        ? "bg-[#27272a] border-[#3f3f46] text-white shadow-sm"
                        : "bg-[#121215] border-[#27272a] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Credit or Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType("upi")}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition ${
                      paymentType === "upi"
                        ? "bg-[#27272a] border-[#3f3f46] text-white shadow-sm"
                        : "bg-[#121215] border-[#27272a] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>UPI / NetBanking</span>
                  </button>
                </div>
              </div>

              {paymentType === "card" ? (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-3 py-2 rounded-lg bg-[#121215] border border-[#27272a] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-400 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-zinc-400">Card Number</label>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500">
                        <span>VISA</span>
                        <span>•</span>
                        <span>MC</span>
                        <span>•</span>
                        <span>AMEX</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="4532 0000 0000 0000"
                        className="w-full px-3 py-2 rounded-lg bg-[#121215] border border-[#27272a] text-xs font-mono text-white placeholder:text-zinc-600 outline-none focus:border-zinc-400 transition"
                      />
                      <CreditCard className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400">Expires</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM / YY"
                        className="w-full px-3 py-2 rounded-lg bg-[#121215] border border-[#27272a] text-xs font-mono text-white placeholder:text-zinc-600 outline-none focus:border-zinc-400 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400">CVC</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                        placeholder="123"
                        className="w-full px-3 py-2 rounded-lg bg-[#121215] border border-[#27272a] text-xs font-mono text-white placeholder:text-zinc-600 outline-none focus:border-zinc-400 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Postal / Zip Code</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="10001"
                      className="w-full px-3 py-2 rounded-lg bg-[#121215] border border-[#27272a] text-xs font-mono text-white placeholder:text-zinc-600 outline-none focus:border-zinc-400 transition"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">UPI Virtual Payment Address</label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="name@okhdfcbank"
                      className="w-full px-3 py-2 rounded-lg bg-[#121215] border border-[#27272a] text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-400 transition"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    You will receive a payment request notification on your UPI app to complete authorization.
                  </p>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-[0.99] cursor-pointer mt-2"
              >
                <span>{isProcessing ? "Processing Payment..." : `Pay $${totalAmount}.00`}</span>
                {!isProcessing && <ArrowRight className="h-3.5 w-3.5" />}
              </button>

              <div className="text-center pt-1">
                <span className="text-[10px] text-zinc-500">
                  Powered by Stripe • Cancel or switch plans anytime
                </span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
