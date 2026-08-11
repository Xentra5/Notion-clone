"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  ChevronDown,
  MessageSquarePlus,
  PanelRightClose,
  Sparkles,
  X,
  Plus,
  SlidersHorizontal,
  Mic,
  ArrowUp,
  FileText,
  Bot,
  User as UserIcon,
  Columns2,
  Lock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { PricingModal } from "./pricing-modal";

interface NotionAiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPageTitle: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp?: string;
}

export function NotionAiPanel({
  isOpen,
  onClose,
  currentPageTitle,
}: NotionAiPanelProps) {
  const { data: session, update } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [contextTag, setContextTag] = useState<string | null>(currentPageTitle);
  const [modelMode, setModelMode] = useState("Auto");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const plan = session?.user?.plan || "free";
  const aiUsageCount = session?.user?.aiUsageCount || 0;
  const isLimitReached = plan === "free" && aiUsageCount >= 3;

  if (!isOpen) return null;

  async function handleSend(promptText?: string) {
    const textToSend = (promptText || input).trim();
    if (!textToSend) return;

    if (isLimitReached) {
      setShowPricing(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsGenerating(true);

    try {
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

      await update();

      // Simulate smart Notion AI response
      setTimeout(() => {
        let responseText = `Here's what I found for "${textToSend}":\n\n• Organized key points from your current page: "${currentPageTitle}".\n• Identified action items and next steps.`;

        if (textToSend.toLowerCase().includes("html") || textToSend.toLowerCase().includes("create html")) {
          responseText = `Here is a custom HTML template for your page:\n\`\`\`html\n<div class="card">\n  <h2>Getting Started</h2>\n  <p>Welcome to your Notion workspace.</p>\n</div>\n\`\`\``;
        } else if (textToSend.toLowerCase().includes("personalize")) {
          responseText = "You can customize Notion AI's tone, default language, and preferred formatting in Workspace Settings > AI Preferences.";
        } else if (textToSend.toLowerCase().includes("translate")) {
          responseText = "Translated Summary:\n\nBienvenido a Notion. Aquí están los aspectos básicos para comenzar en dispositivos móviles.";
        } else if (textToSend.toLowerCase().includes("analyze")) {
          responseText = "Insights Analysis:\n\n1. Page Length: 6 setup items.\n2. Completeness: Ready for initial user onboarding.\n3. Recommended next action: Invite teammates to collaborate.";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            text: responseText,
          },
        ]);
        setIsGenerating(false);
      }, 900);
    } catch (e) {
      console.error("AI panel send error:", e);
      setIsGenerating(false);
    }
  }

  function handleNewChat() {
    setMessages([]);
    setInput("");
  }

  return (
    <aside className="w-full sm:w-[380px] lg:w-[420px] bg-sidebar border-l border-sidebar-border flex flex-col h-full text-foreground select-none font-sans shrink-0 animate-in slide-in-from-right duration-200">
      {/* Top Header Bar */}
      <div className="h-11 border-b border-sidebar-border px-3 flex items-center justify-between text-xs text-muted-foreground shrink-0 bg-sidebar">
        {/* Left: Options & AI Chat Selector */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleNewChat()}
            className="p-1 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
            title="Options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          <button
            onClick={() => handleNewChat()}
            className="flex items-center gap-1 font-semibold text-foreground px-1.5 py-0.5 rounded hover:bg-sidebar-accent transition"
          >
            <span>New AI chat</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition text-muted-foreground"
            title="New AI Chat"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition text-muted-foreground"
            title="Split view"
          >
            <Columns2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition text-muted-foreground"
            title="Collapse AI panel"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar flex flex-col justify-between">
        {messages.length === 0 ? (
          /* Initial Empty State matching Screenshot 2 */
          <div className="space-y-6 pt-4 animate-in fade-in duration-300">
            {/* Notion Hand-Drawn Sketch Face Avatar */}
            <div className="h-16 w-16 rounded-full bg-card border border-border flex items-center justify-center shadow-lg">
              <NotionSketchFace />
            </div>

            {/* Main Greeting */}
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              How can I help you today?
            </h2>

            {/* Quick Action Prompt List */}
            <div className="space-y-2.5 pt-1 text-sm font-medium text-foreground">
              {/* Item 1 */}
              <button
                onClick={() => handleSend("Personalize your Notion AI")}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition text-left group border border-transparent hover:border-border"
              >
                <span className="text-base">🦆</span>
                <span className="group-hover:text-foreground transition">
                  Personalize your Notion AI
                </span>
              </button>

              {/* Item 2 with 'New' Badge */}
              <button
                onClick={() => handleSend("Create HTML template")}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition text-left group border border-transparent hover:border-border"
              >
                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition shrink-0" />
                <span className="group-hover:text-foreground transition flex items-center gap-2">
                  Create HTML
                  <span className="bg-[#0078df] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    New
                  </span>
                </span>
              </button>

              {/* Item 3 */}
              <button
                onClick={() => handleSend("Translate this page")}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition text-left group border border-transparent hover:border-border"
              >
                <span className="text-xs font-mono font-bold text-muted-foreground border border-border px-1 py-0.5 rounded">
                  A/文
                </span>
                <span className="group-hover:text-foreground transition">
                  Translate this page
                </span>
              </button>

              {/* Item 4 */}
              <button
                onClick={() => handleSend("Analyze for insights")}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition text-left group border border-transparent hover:border-border"
              >
                <Sparkles className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition shrink-0" />
                <span className="group-hover:text-foreground transition">
                  Analyze for insights
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="space-y-4 pt-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user"
                      ? "bg-[#0078df] text-white"
                      : "bg-card border border-border text-purple-500 dark:text-purple-400"
                  }`}
                >
                  {msg.role === "user" ? (
                    <UserIcon className="h-3.5 w-3.5" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#0078df] text-white font-medium"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-purple-500 dark:text-purple-400 pl-9 animate-pulse">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>Notion AI is processing...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Glowing Input Box (Exact Copy of Screenshot 2) */}
      <div className="p-4 bg-sidebar border-t border-sidebar-border">
        <div className="relative bg-background border-2 border-primary rounded-2xl p-3 shadow-2xl focus-within:ring-2 focus-within:ring-primary/40 transition-all">
          {/* Context Tag Pill */}
          {contextTag && (
            <div className="mb-2 inline-flex items-center gap-1.5 bg-accent border border-border px-2.5 py-1 rounded-full text-xs text-foreground">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span className="truncate max-w-[200px] font-medium">
                {contextTag}
              </span>
              <button
                onClick={() => setContextTag(null)}
                className="p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-[#333] text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}

          {/* Textarea Input */}
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Do anything with AI..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
          />

          {/* Input Bottom Toolbar */}
          <div className="mt-2 flex items-center justify-between pt-1 border-t border-border/60">
            {/* Left Controls */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <button
                onClick={() => setContextTag(currentPageTitle)}
                className="p-1 rounded-md hover:bg-accent hover:text-foreground transition"
                title="Add page context"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                className="p-1 rounded-md hover:bg-accent hover:text-foreground transition"
                title="AI parameters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Model Mode Pill */}
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-background border border-border rounded-md transition"
                >
                  {modelMode}
                </button>

                {showModelDropdown && (
                  <div className="absolute right-0 bottom-full mb-1 w-32 bg-popover border border-border rounded-lg shadow-xl p-1 z-50 text-xs text-popover-foreground">
                    <button
                      onClick={() => {
                        setModelMode("Auto");
                        setShowModelDropdown(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-accent text-foreground"
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => {
                        setModelMode("GPT-4o");
                        setShowModelDropdown(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-accent text-foreground"
                    >
                      GPT-4o
                    </button>
                    <button
                      onClick={() => {
                        setModelMode("Claude 3.5");
                        setShowModelDropdown(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-accent text-foreground"
                    >
                      Claude 3.5
                    </button>
                  </div>
                )}
              </div>

              {/* Voice Mic Button */}
              <button
                className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition"
                title="Voice input"
              >
                <Mic className="h-4 w-4" />
              </button>

              {/* Send Button with Green Bot Badge */}
              <div className="relative">
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="h-7 w-7 rounded-full bg-neutral-200 dark:bg-[#2a2a2a] hover:bg-primary dark:hover:bg-primary text-foreground dark:text-white flex items-center justify-center disabled:opacity-40 transition"
                  title="Send to Notion AI"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                {/* Green bot badge */}
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                  <Bot className="h-1.5 w-1.5 text-black" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Limit Reached Card / Overlay */}
        {isLimitReached && (
          <div className="absolute inset-x-0 bottom-0 top-11 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 z-10">
            <div className="p-3 bg-purple-950/60 border border-purple-800/40 text-purple-400 rounded-full mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Free Trial Limit Reached</h3>
            <p className="text-[11px] text-neutral-400 max-w-[280px] mb-6 leading-relaxed">
              You have sent {aiUsageCount}/3 free trial messages. Upgrade to the Pro plan for unlimited queries, priority support, and advanced AI models.
            </p>
            <button
              onClick={() => setShowPricing(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition shadow-lg shadow-purple-500/20 active:scale-95"
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
      />
    </aside>
  );
}

/* Iconic Notion Sketch Face SVG */
function NotionSketchFace() {
  return (
    <svg viewBox="0 0 100 100" className="h-10 w-10 text-foreground fill-none stroke-current stroke-[4]">
      {/* Head Outline */}
      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="4" fill="var(--card)" />
      {/* Left Eye */}
      <circle cx="36" cy="42" r="3" fill="currentColor" />
      {/* Right Eye */}
      <circle cx="64" cy="42" r="3" fill="currentColor" />
      {/* Eyebrows */}
      <path d="M30 34 Q36 30 42 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 35 Q64 30 70 34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Nose */}
      <path d="M50 42 L46 56 L54 56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Smile */}
      <path d="M38 66 Q50 76 62 66" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
