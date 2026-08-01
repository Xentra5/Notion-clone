"use client";

import { useState } from "react";
import { Sparkles, X, Send, Bot, User as UserIcon } from "lucide-react";

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiChatModal({ isOpen, onClose }: AiChatModalProps) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Hello! I'm Notion AI. How can I help you write, edit, summarize, or organize your workspace today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  function handleSend() {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsGenerating(true);

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
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-xl h-[520px] bg-[#202020] border border-[#333333] rounded-xl shadow-2xl overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2d2d] bg-[#191919]">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-400">
            <Sparkles className="h-4 w-4 fill-purple-400/20 text-purple-400" />
            <span>Notion AI</span>
            <span className="text-[11px] bg-purple-950/80 border border-purple-800/60 text-purple-300 px-2 py-0.5 rounded-full font-mono">
              Beta
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

        {/* Quick Prompts */}
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

        {/* Input Footer */}
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
      </div>
    </div>
  );
}
