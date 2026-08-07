"use client";

import {
  FileText,
  Sparkles,
  Pause,
  RefreshCw,
  Volume2,
  Download,
  Clock,
  User,
  Mic,
  MicOff,
  Zap,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Strands from "../Strands";

interface MeetingNoteViewProps {
  currentTitle: string;
  onTitleChange: (title: string) => void;
}

export function MeetingNoteView({ currentTitle, onTitleChange }: MeetingNoteViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState<"transcript" | "summary">("transcript");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
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

  async function startRecording() {
    setRecordingError(null);
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      if (recordingTime === 0) setTranscripts(["Recording initialized… Real-time transcription engine active."]);
      setIsRecording(true);
    } catch {
      setRecordingError("Microphone access was blocked. Allow microphone access and try again.");
    }
  }

  function stopRecording() {
    setIsRecording(false);
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setTranscripts((prev) => [...prev, "Recording stopped. Preparing your AI summary…"]);
    setIsFinalizing(true);
    window.setTimeout(() => {
      setIsFinalizing(false);
      setActiveTab("summary");
    }, 650);
  }
  const meetingStatus = isFinalizing ? "Processing" : isRecording ? "Recording" : recordingTime > 0 ? "Ready for review" : "Ready to record";

  function formatTime(sec: number) {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

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
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Untitled Meeting"
                className="flex-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground bg-transparent outline-none border-b border-transparent focus:border-border transition"
              />
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => toast.success("Transcript exported to Notion doc")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-accent text-xs font-semibold text-foreground transition shadow-sm"
                title="Export Transcript"
              >
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
        {/* Meeting context */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p><p className="mt-1 flex items-center gap-1.5 text-xs font-semibold"><span className={`h-1.5 w-1.5 rounded-full ${isRecording ? "bg-red-500" : isFinalizing ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />{meetingStatus}</p></div>
          <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</p><p className="mt-1 text-xs font-semibold tabular-nums">{formatTime(recordingTime)}</p></div>
          <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Participants</p><p className="mt-1 text-xs font-semibold">You · 2 speakers</p></div>
          <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Capture</p><p className="mt-1 text-xs font-semibold">Live transcript</p></div>
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
              {isRecording ? "LIVE RECORDING" : "READY"}
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
                onClick={() => { void startRecording(); }}
                className="flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-extrabold rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] transition duration-200"
              >
                <Mic className="h-4 w-4" />
                <span>Start AI Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                disabled={isFinalizing}
                className="flex items-center gap-2.5 px-5 py-2.5 bg-white text-neutral-900 hover:bg-neutral-200 active:scale-95 text-xs font-extrabold rounded-full transition duration-200 disabled:opacity-60"
              >
                <Pause className="h-4 w-4" />
                <span>{isFinalizing ? "Generating summary…" : "Stop & summarize"}</span>
              </button>
            )}

            {/* Mute Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 rounded-full transition ${
                isMuted
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

        {recordingError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
            <MicOff className="mt-0.5 h-4 w-4 shrink-0" />
            <div><p className="font-semibold">Microphone unavailable</p><p className="mt-0.5 text-red-400/80">{recordingError}</p></div>
          </div>
        )}
        {/* Intelligence Hub (Tabs: Live Transcript & AI Summary) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1">
              <button
                onClick={() => setActiveTab("transcript")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  activeTab === "transcript" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Live Transcript ({transcripts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("summary")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  activeTab === "summary" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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
            <div className="bg-card/60 border border-border rounded-2xl p-4 min-h-[180px] max-h-[320px] overflow-y-auto space-y-2.5 font-sans text-sm no-scrollbar shadow-sm">
              {transcripts.map((phrase, idx) => {
                const isAi = phrase.startsWith("Notion AI:");
                const isSystem = idx === 0 && phrase.includes("Press");
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                      isAi
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
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Key decision</p><p className="mt-2 text-sm font-medium">Theme architecture direction was agreed.</p><p className="mt-1 text-xs text-muted-foreground">Extracted from the conversation</p></div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Next step</p><p className="mt-2 text-sm font-medium">Integrate the recording workflow.</p><p className="mt-1 text-xs text-muted-foreground">Suggested action item</p></div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
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
              </div>
          )}
        </div>

      </div>
    </div>
  );
}
