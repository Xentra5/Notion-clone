"use client";

import { useState } from "react";
import { Sparkles, X, Send, Bot, User as UserIcon, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { PricingModal } from "../pricing-modal";

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiChatModal({ isOpen, onClose }: AiChatModalProps) {
  const { data: session, update } = useSession();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Hello! I'm Notion AI. How can I help you write, edit, summarize, or organize your workspace today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const plan = session?.user?.plan || "free";
  const aiUsageCount = session?.user?.aiUsageCount || 0;
  const isLimitReached = plan === "free" && aiUsageCount >= 3;

  async function handleSend() {
    if (!input.trim()) return;

    if (isLimitReached) {
      setShowPricing(true);
      return;
    }

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsGenerating(true);

    try {
      // 1. Post to update AI usage
      const response = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "incrementAiUsage" }),
      });

      if (!response.ok) {
        const errData = await response.json();
        if (errData.limitReached) {
          await update();
          setShowPricing(true);
          setIsGenerating(false);
          return;
        }
      }

      // Sync user data
      await update();

      // 2. Generate simulation reply
      setTimeout(() => {
        let reply = "I can help with that! Notion AI can automatically generate summaries, draft blog posts, organize meeting notes, and extract action items directly within your workspace.";
        if (userMsg.toLowerCase().includes("mobile") || userMsg.toLowerCase().includes("task")) {
          reply = "Here are key tips for mobile editing:\n• Use quick actions in the bottom bar\n• Tap '+' to insert blocks\n• Hold and drag items to reorder them.";
        } else if (userMsg.toLowerCase().includes("calendar") || userMsg.toLowerCase().includes("meeting")) {
          reply = "You can connect your Google or Outlook calendar in the Meetings tab to auto-generate meeting notes!";
        }

        setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
        setIsGenerating(false);
      }, 800);
    } catch (error) {
      console.error("AI chat error:", error);
      setIsGenerating(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-4 fade-in duration-200">
        <div className="flex flex-col w-full h-[520px] bg-[#202020] border border-[#333333] rounded-xl shadow-2xl overflow-hidden text-neutral-200 relative">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2d2d] bg-[#191919]">
            <div className="flex items-center gap-2 text-sm font-medium text-purple-400">
              <Sparkles className="h-4 w-4 fill-purple-400/20 text-purple-400" />
              <span>Notion AI</span>
              <span className="text-[11px] bg-purple-950/80 border border-purple-800/60 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                {plan === "ultimate" ? "Ultimate" : plan === "pro" ? "Pro" : "Trial"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-[#2c2c2c] transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Message Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user"
                      ? "bg-[#0078df] text-white"
                      : "bg-purple-900/60 text-purple-300 border border-purple-700/50"
                  }`}
                >
                  {msg.role === "user" ? <UserIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-lg px-3.5 py-2.5 whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#0078df] text-white"
                      : "bg-[#282828] border border-[#373737] text-neutral-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-purple-400 pl-10">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>Notion AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Limit Reached Card / Overlay */}
          {isLimitReached && (
            <div className="absolute inset-x-0 bottom-0 top-[45px] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 z-10">
              <div className="p-3 bg-purple-950/60 border border-purple-800/40 text-purple-400 rounded-full mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Free Trial Limit Reached</h3>
              <p className="text-xs text-neutral-400 max-w-sm mb-6 leading-relaxed">
                You have sent {aiUsageCount}/3 free trial messages. Upgrade to the Pro plan for unlimited queries, priority support, and advanced AI models.
              </p>
              <button
                onClick={() => setShowPricing(true)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-purple-500/20 active:scale-95"
              >
                View Upgrade Options
              </button>
            </div>
          )}

          {/* Quick Prompts */}
          {!isLimitReached && (
            <div className="px-4 py-2 bg-[#191919] border-t border-[#2a2a2a] flex items-center gap-2 overflow-x-auto text-[11px] text-neutral-400 no-scrollbar">
              <span className="shrink-0 text-neutral-500 font-medium">Try:</span>
              <button
                onClick={() => setInput("Summarize my tasks")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-[#252525] border border-[#333] hover:border-purple-500/50 hover:text-purple-300 transition"
              >
                ✨ Summarize tasks
              </button>
              <button
                onClick={() => setInput("How do I add a sub page?")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-[#252525] border border-[#333] hover:border-purple-500/50 hover:text-purple-300 transition"
              >
                📄 Sub page help
              </button>
              <button
                onClick={() => setInput("Connect calendar guide")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-[#252525] border border-[#333] hover:border-purple-500/50 hover:text-purple-300 transition"
              >
                📅 Calendar integration
              </button>
            </div>
          )}

          {/* Input Footer */}
          {!isLimitReached && (
            <div className="p-3 bg-[#191919] border-t border-[#2d2d2d] flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Notion AI anything or type a prompt..."
                className="flex-1 bg-[#252525] border border-[#373737] rounded-lg px-3 py-2 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-9 w-9 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center disabled:opacity-40 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
      />
    </>
  );
}
