"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Sparkles,
  Plus,
  Check,
  GripVertical,
  Heading,
  List,
  MessageSquareQuote,
  Smile,
  Mic,
  MicOff,
  Pause,
  RefreshCw,
  Volume2,
  Download,
  Clock,
  User,
  Bot,
  Zap,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Strands from "./Strands";

interface DocumentCanvasProps {
  activeTitle: string;
  onOpenAi: () => void;
  onSelectSubPage: (title: string) => void;
}

interface ChecklistItem {
  id: string;
  type: "todo" | "heading" | "quote" | "bullet";
  text: string;
  checked?: boolean;
  hasSubPage?: boolean;
  hasAiSparkle?: boolean;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  {
    id: "1",
    type: "todo",
    text: "Tap anywhere and start typing",
    checked: false,
  },
  {
    id: "2",
    type: "todo",
    text: "Tap the + above your keyboard to add content — headers, sub pages, etc.",
    checked: false,
    hasSubPage: true,
  },
  {
    id: "3",
    type: "todo",
    text: "Highlight text and use the bar above your keyboard to format",
    checked: false,
  },
  {
    id: "4",
    type: "todo",
    text: "Tap and hold this line, then drag",
    checked: false,
  },
  {
    id: "5",
    type: "todo",
    text: "Tap the home tab button at the bottom left to see your pages",
    checked: false,
  },
  {
    id: "6",
    type: "todo",
    text: "Tap anywhere and select ✨ in the bar above your keyboard to check out Notion AI",
    checked: false,
    hasAiSparkle: true,
  },
];

export function DocumentCanvas({
  activeTitle,
  onOpenAi,
  onSelectSubPage,
}: DocumentCanvasProps) {
  const { data: session } = useSession();
  const [pageEmoji, setPageEmoji] = useState("📱");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(activeTitle);
  const [items, setItems] = useState<ChecklistItem[]>(DEFAULT_ITEMS);
  const [newItemText, setNewItemText] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");

  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState<"transcript" | "summary">("transcript");
  const [transcripts, setTranscripts] = useState<string[]>([
    "Press 'Start AI Recording' to begin real-time speech processing...",
  ]);

  useEffect(() => {
    let timerInterval: ReturnType<typeof setInterval>;
    let transcriptInterval: ReturnType<typeof setInterval>;

    if (isRecording) {
      timerInterval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      const phrases = [
        "Analyzing key meeting objectives and speaker voice signatures...",
        "Speaker 1: Welcome everyone, let's align on the Next.js theme architecture.",
        "Speaker 2: I think we should install next-themes to handle state switches seamlessly.",
        "Notion AI: Drafted meeting summary - ThemeProvider wrapping AuthProvider in RootLayout.",
        "Speaker 1: Sounds perfect. Let's make sure the sidebar and AI panels adapt correctly.",
        "Speaker 2: Yes, and let's add a custom WebGL waveform for the voice note recorder.",
        "Notion AI: Added Action Item - Integrate Strands animation component to visualizer.",
      ];

      let phraseIdx = 0;
      transcriptInterval = setInterval(() => {
        if (phraseIdx < phrases.length) {
          setTranscripts((prev) => [...prev, phrases[phraseIdx]]);
          phraseIdx++;
        }
      }, 4000);
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(transcriptInterval);
    };
  }, [isRecording]);

  function formatTime(sec: number) {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Track whether the user has actually made edits (don't save on first render)
  const hasMounted = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When activeTitle changes from sidebar, reset the canvas to a fresh page
  useEffect(() => {
    setCurrentTitle(activeTitle);
    setItems(DEFAULT_ITEMS);
    setShowEmojiPicker(false);
    setShowSlashMenu(false);
    setNewItemText("");
    hasMounted.current = false;
  }, [activeTitle]);

  // Debounced auto-save to MongoDB
  const savePage = useCallback(async (title: string, blocks: ChecklistItem[]) => {
    setSaveStatus("saving");
    try {
      await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category: "Private",
          blocks: blocks.map((item) => ({
            id: item.id,
            type: item.type === "todo" ? "to_do" : item.type === "bullet" ? "bulleted_list_item" : item.type,
            properties: { text: item.text, checked: !!item.checked },
          })),
        }),
      });
      setSaveStatus("saved");
    } catch (err) {
      console.error("Auto-save error:", err);
      setSaveStatus("idle");
    }
  }, []);

  useEffect(() => {
    // Skip auto-save on the very first render / page switch
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    // Clear any existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Debounce: wait 2s of inactivity before saving
    saveTimerRef.current = setTimeout(() => {
      savePage(currentTitle, items);
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [currentTitle, items, savePage]);

  const emojis = ["📱", "📄", "🚀", "⚡", "💡", "🎨", "📝", "✨", "📌", "🌐"];

  function toggleCheck(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }

  function handleAddItem(type: "todo" | "heading" | "quote" | "bullet" = "todo") {
    const textToAdd = newItemText.replace(/^\//, "").trim() || "New block item";
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        text: textToAdd,
        checked: false,
      },
    ]);
    setNewItemText("");
    setShowSlashMenu(false);
  }

  if (activeTitle === "AI Meeting Note") {
    return (
      <div className="flex-1 bg-background text-foreground overflow-y-auto relative selection:bg-primary/30 selection:text-foreground font-sans">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10 space-y-7 animate-in fade-in duration-300">

          {/* Header & Studio Badges */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-[11px] font-bold tracking-wider uppercase">
                <Sparkles className="h-3 w-3 fill-purple-400/20" />
                AI Voice Studio 2.0
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-border text-muted-foreground text-[11px] font-medium">
                <Volume2 className="h-3 w-3 text-blue-500" />
                48kHz High-Fidelity Audio
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-3xl">🎙️</span>
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="Untitled Meeting"
                  className="flex-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground bg-transparent outline-none border-b border-transparent focus:border-border transition"
                />
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => alert("Transcript exported to Notion doc")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-accent text-xs font-semibold text-foreground transition shadow-sm"
                  title="Export Transcript"
                >
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Strands WebGL Visualizer Card */}
          <div className="h-[440px] w-full relative rounded-3xl overflow-hidden bg-[#050508] border border-neutral-800/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] group transition-all duration-300">
            {/* Strands WebGL Background */}
            <div className="absolute inset-0 z-0">
              <Strands
                colors={["#a61f1f", "#5c4d77", "#06B6D4"]}
                count={isRecording ? 4 : 2}
                speed={isRecording ? 0.8 : 0.4}
                amplitude={isRecording ? 1.4 : 0.9}
                waviness={isRecording ? 2.0 : 1.5}
                thickness={0.65}
                glow={2.6}
                taper={3}
                spread={1}
                intensity={isRecording ? 0.8 : 0.5}
                saturation={2}
                opacity={1}
                scale={1.5}
                glass={false}
                refraction={1}
                dispersion={1}
                glassSize={1}
                hueShift={0}
              />
            </div>

            {/* Top Right Floating Status Pill */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-3 bg-black/50 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-lg">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${isRecording ? "bg-red-500 animate-ping" : "bg-neutral-500"}`} />
                <span className="text-sm font-mono font-bold tracking-widest text-white">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <div className="h-3 w-[1px] bg-white/20" />
              <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-wider">
                {isRecording ? "LIVE RECORDING" : "IDLE"}
              </span>
            </div>

            {/* Top Left Audio Spec Pill */}
            <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full text-[10px] text-neutral-300 font-medium tracking-wide">
              <Zap className="h-3 w-3 text-cyan-400" />
              <span>NEON WAVEFORM ENGINE</span>
            </div>

            {/* Floating Glass Action Dock (Bottom Center) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-2xl border border-white/15 p-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition duration-300 group-hover:border-white/25">

              {/* Record / Pause Toggle Button */}
              {!isRecording ? (
                <button
                  onClick={() => {
                    if (recordingTime === 0) {
                      setTranscripts(["Recording initialized... Real-time transcription engine active."]);
                    }
                    setIsRecording(true);
                  }}
                  className="flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-extrabold rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] transition duration-200"
                >
                  <Mic className="h-4 w-4" />
                  <span>Start AI Recording</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsRecording(false)}
                  className="flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 active:scale-95 text-white text-xs font-extrabold rounded-full shadow-[0_0_20px_rgba(225,29,72,0.5)] transition duration-200"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause Recording</span>
                </button>
              )}

              {/* Mute Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 rounded-full transition ${isMuted
                  ? "bg-red-500/20 border border-red-500/40 text-red-400"
                  : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                title={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              {/* Reset Session */}
              <button
                onClick={() => {
                  setIsRecording(false);
                  setRecordingTime(0);
                  setTranscripts(["Meeting session reset. Ready to record."]);
                }}
                disabled={recordingTime === 0 && !isRecording}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition"
                title="Reset session"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Intelligence Hub (Tabs: Live Transcript & AI Summary) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab("transcript")}
                  className={`flex items-center gap-2 pb-2 text-xs font-bold transition border-b-2 ${activeTab === "transcript"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Live Transcript ({transcripts.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("summary")}
                  className={`flex items-center gap-2 pb-2 text-xs font-bold transition border-b-2 ${activeTab === "summary"
                    ? "border-purple-500 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>AI Summary & Insights</span>
                </button>
              </div>

              {isRecording && (
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold animate-pulse flex items-center gap-1.5 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping" />
                  Real-time Processing...
                </span>
              )}
            </div>

            {/* Transcript Stream Tab */}
            {activeTab === "transcript" && (
              <div className="bg-card border border-border rounded-3xl p-5 min-h-[180px] max-h-[320px] overflow-y-auto space-y-3.5 font-sans text-sm no-scrollbar shadow-sm">
                {transcripts.map((phrase, idx) => {
                  const isAi = phrase.startsWith("Notion AI:");
                  const isSystem = idx === 0 && phrase.includes("Press");
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all duration-300 ${isAi
                        ? "bg-purple-950/20 dark:bg-purple-950/40 border-purple-800/40 text-purple-700 dark:text-purple-300 font-medium"
                        : isSystem
                          ? "bg-muted/40 border-dashed border-border text-muted-foreground text-center"
                          : "bg-background border-border text-foreground shadow-sm"
                        } animate-in slide-in-from-bottom-2 duration-150 flex items-start gap-3`}
                    >
                      {isAi ? (
                        <Sparkles className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                      ) : isSystem ? (
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 mx-auto" />
                      ) : (
                        <User className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">{phrase}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI Summary Tab */}
            {activeTab === "summary" && (
              <div className="bg-card border border-border rounded-3xl p-6 space-y-5 animate-in fade-in duration-200 shadow-sm">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-purple-500" />
                    Key Topics Covered
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs font-semibold">
                      # Theme Engine Setup
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-semibold">
                      # WebGL Strands Shader
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-semibold">
                      # React 19 / Next.js 16
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Generated Action Items
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm font-medium text-foreground">
                    <li className="flex items-center gap-2 p-2 rounded-xl hover:bg-accent transition">
                      <span className="h-2 w-2 rounded-full bg-purple-500" />
                      <span>Wrap RootLayout with next-themes ThemeProvider and suppressHydrationWarning</span>
                    </li>
                    <li className="flex items-center gap-2 p-2 rounded-xl hover:bg-accent transition">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Integrate OGL Strands animation for AI Voice Studio meeting notes</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground overflow-y-auto relative selection:bg-primary/30 selection:text-foreground font-sans">
      <div className="max-w-3xl mx-auto px-6 sm:px-12 py-12 sm:py-16 space-y-6">
        {/* Page Emoji Icon Picker Header */}
        <div className="relative group/emoji">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-4xl p-1.5 rounded-xl hover:bg-accent transition inline-block select-none"
            title="Change icon"
          >
            {pageEmoji}
          </button>

          {showEmojiPicker && (
            <div className="absolute left-0 top-full mt-2 p-2 bg-popover border border-border rounded-2xl shadow-2xl z-40 flex items-center gap-2 animate-in fade-in duration-100">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setPageEmoji(emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-2xl p-1.5 rounded-lg hover:bg-accent transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Document Title Header (Editable) */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            placeholder="Untitled Page"
            className="flex-1 text-3xl sm:text-4xl font-bold tracking-tight text-foreground bg-transparent outline-none border-b border-transparent focus:border-border transition"
          />
          {saveStatus === "saving" && (
            <span className="text-[10px] text-muted-foreground animate-pulse shrink-0">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-[10px] text-emerald-500 shrink-0">✓ Saved</span>
          )}
        </div>

        {/* Welcome Callout Banner */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border text-sm text-foreground">
          <span className="text-base">👋</span>
          <span className="font-semibold">Welcome to Notion!</span>
        </div>

        {/* Section Subtext */}
        <div className="text-xs sm:text-sm font-medium text-muted-foreground pt-1">
          Here are the basics:
        </div>

        {/* Interactive Checklist & Block Items */}
        <div className="space-y-3.5 pt-1">
          {items.map((item) => (
            <div key={item.id} className="group flex items-start gap-2 -ml-6 pl-1 rounded-lg hover:bg-accent/40 py-1 transition">
              {/* Drag Handle Icon on Hover */}
              <div className="opacity-0 group-hover:opacity-100 transition text-muted-foreground cursor-grab pt-1 shrink-0">
                <GripVertical className="h-4 w-4" />
              </div>

              <div className="flex-1 space-y-2">
                {item.type === "todo" && (
                  <div className="flex items-start gap-3 text-sm text-foreground leading-relaxed">
                    <button
                      type="button"
                      onClick={() => toggleCheck(item.id)}
                      className={`mt-0.5 h-4 w-4 rounded border transition flex items-center justify-center shrink-0 ${item.checked
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border bg-transparent hover:border-muted-foreground"
                        }`}
                      aria-label="Toggle checkbox"
                    >
                      {item.checked && <Check className="h-3 w-3 stroke-[2.5]" />}
                    </button>

                    <span
                      className={`flex-1 ${item.checked ? "line-through text-muted-foreground" : ""
                        }`}
                    >
                      {item.hasAiSparkle ? (
                        <>
                          Tap anywhere and select{" "}
                          <button
                            onClick={onOpenAi}
                            className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-medium hover:underline mx-0.5"
                          >
                            <Sparkles className="h-3.5 w-3.5 inline fill-purple-500/20" />
                          </button>{" "}
                          in the bar above your keyboard to check out{" "}
                          <button
                            onClick={onOpenAi}
                            className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                          >
                            Notion AI
                          </button>
                        </>
                      ) : (
                        item.text
                      )}
                    </span>
                  </div>
                )}

                {item.type === "heading" && (
                  <h2 className="text-xl font-bold text-foreground pt-1">
                    {item.text}
                  </h2>
                )}

                {item.type === "quote" && (
                  <blockquote className="border-l-2 border-primary pl-3 py-1 text-sm text-muted-foreground italic bg-accent/30 rounded-r-lg">
                    {item.text}
                  </blockquote>
                )}

                {item.type === "bullet" && (
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-muted-foreground font-bold">•</span>
                    <span>{item.text}</span>
                  </div>
                )}

                {/* Sub page link if present */}
                {item.hasSubPage && (
                  <div className="pl-7 pt-0.5">
                    <button
                      onClick={() => onSelectSubPage("Example sub page")}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card hover:bg-accent border border-border hover:border-border/80 text-xs font-medium text-foreground transition group/sub shadow-sm"
                    >
                      <FileText className="h-3.5 w-3.5 text-muted-foreground group-hover/sub:text-foreground transition" />
                      <span className="underline underline-offset-2 decoration-neutral-400 dark:decoration-[#555] group-hover/sub:decoration-foreground">
                        Example sub page
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add block input with '/' popup command menu */}
        <div className="relative pt-4">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setShowSlashMenu(!showSlashMenu)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
              title="Add block (/)"
            >
              <Plus className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => {
                const val = e.target.value;
                setNewItemText(val);
                if (val.startsWith("/")) setShowSlashMenu(true);
                else setShowSlashMenu(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddItem("todo");
                }
              }}
              placeholder="Type '/' for commands or press Enter to add a block..."
              className="flex-1 bg-transparent border-b border-transparent hover:border-border focus:border-primary px-1 py-1 text-sm text-foreground placeholder:text-muted-foreground outline-none transition"
            />
          </div>

          {/* Slash Menu Popover */}
          {showSlashMenu && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-popover border border-border rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in duration-100">
              <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Basic blocks
              </div>
              <button
                onClick={() => handleAddItem("todo")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-accent text-left text-foreground hover:text-foreground transition"
              >
                <div className="p-1 rounded bg-background border border-border">
                  <Check className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold">To-do list</div>
                  <div className="text-[10px] text-muted-foreground">Track tasks with a checkbox</div>
                </div>
              </button>
              <button
                onClick={() => handleAddItem("heading")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-accent text-left text-foreground hover:text-foreground transition"
              >
                <div className="p-1 rounded bg-background border border-border">
                  <Heading className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold">Heading</div>
                  <div className="text-[10px] text-muted-foreground">Large section header</div>
                </div>
              </button>
              <button
                onClick={() => handleAddItem("quote")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-accent text-left text-foreground hover:text-foreground transition"
              >
                <div className="p-1 rounded bg-background border border-border">
                  <MessageSquareQuote className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold">Quote</div>
                  <div className="text-[10px] text-muted-foreground">Capture quotes or highlights</div>
                </div>
              </button>
              <button
                onClick={() => handleAddItem("bullet")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-accent text-left text-foreground hover:text-foreground transition"
              >
                <div className="p-1 rounded bg-background border border-border">
                  <List className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <div className="font-semibold">Bulleted list</div>
                  <div className="text-[10px] text-muted-foreground">Create a simple bulleted list</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom-Right Avatar Badge */}
      <div className="fixed bottom-5 right-5 z-20">
        <button
          onClick={onOpenAi}
          className="h-8 w-8 rounded-full bg-card border border-border hover:border-purple-500 shadow-xl flex items-center justify-center text-xs font-serif font-bold text-foreground hover:scale-110 active:scale-95 transition"
          title="Notion User Avatar"
        >
          {session?.user?.name ? session.user.name.charAt(0).toLowerCase() : "u"}
        </button>
      </div>
    </div>
  );
}
