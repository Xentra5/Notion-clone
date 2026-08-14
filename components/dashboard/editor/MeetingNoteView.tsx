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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import Strands from "../Strands";

interface MeetingNoteViewProps {
  currentTitle: string;
  onTitleChange: (title: string) => void;
}

interface MeetingSummary {
  summary: string;
  keyDecisions: string[];
  actionItems: string[];
  topics: string[];
}

// Speech recognition interface definitions for browser compatibility
interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface ISpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function MeetingNoteView({ currentTitle, onTitleChange }: MeetingNoteViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState<"transcript" | "summary">("transcript");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<string[]>([
    "Press 'Start Recording' to begin — your speech will appear here in real-time.",
  ]);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep a live ref to the transcript lines so we can read them at stop-time without stale closure
  const transcriptsRef = useRef<string[]>(transcripts);
  useEffect(() => { transcriptsRef.current = transcripts; }, [transcripts]);

  // Timer tick
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  // Mute / unmute: pause or resume the microphone tracks
  useEffect(() => {
    const stream = mediaStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => { t.enabled = !isMuted; });
  }, [isMuted]);

  const startRecording = useCallback(async () => {
    setRecordingError(null);
    try {
      // Request microphone
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const SR = (typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) as (new () => ISpeechRecognitionInstance) | undefined;
      if (!SR) {
        setRecordingError(
          "Speech recognition is not supported in this browser. Use Chrome or Edge for real-time transcription."
        );
        // Still start the timer / recording state so the user can manually type
        setTranscripts(["⚠️ Speech recognition unavailable — recording audio only. Type notes below manually."]);
        setIsRecording(true);
        return;
      }

      const recog = new SR();
      recog.continuous = true;
      recog.interimResults = false; // only emit final results for clean lines
      recog.lang = "en-US";
      recognitionRef.current = recog;

      recog.onresult = (event: ISpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const text = event.results[i][0].transcript.trim();
            if (text) {
              setTranscripts((prev) => [...prev, `🎤 ${text}`]);
            }
          }
        }
      };

      recog.onerror = (event: { error: string }) => {
        if (event.error !== "no-speech") {
          console.warn("SpeechRecognition error:", event.error);
        }
      };

      // Auto-restart recognition if it ends (Chrome stops after ~60s of silence)
      recog.onend = () => {
        if (isRecording) {
          try { recog.start(); } catch { /* already stopped */ }
        }
      };

      recog.start();
      setTranscripts(["🔴 Recording started — speak clearly and your words will appear here."]);
      setIsRecording(true);
    } catch {
      setRecordingError(
        "Microphone access was blocked. Please allow microphone access in your browser and try again."
      );
    }
  }, [isRecording]);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // prevent auto-restart
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    // Release microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    // Build the transcript text from everything collected (skip the initial prompt line)
    const lines = transcriptsRef.current.filter(
      (l) => !l.includes("Press 'Start Recording'") && !l.includes("Recording started")
    );
    const rawTranscript = lines.map((l) => l.replace(/^🎤 /, "")).join("\n");

    setTranscripts((prev) => [...prev, "⏹️ Recording stopped. Generating AI summary…"]);
    setIsFinalizing(true);
    setSummary(null);
    setSummaryError(null);
    setActiveTab("summary");

    try {
      const res = await fetch("/api/ai/meeting-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: rawTranscript || "No spoken words detected.", title: currentTitle }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as MeetingSummary;
      setSummary(data);
      toast.success("AI summary generated!");
    } catch (err) {
      console.error("Meeting summary error:", err);
      setSummaryError("Failed to generate summary. Please check your connection and try again.");
    } finally {
      setIsFinalizing(false);
    }
  }, [currentTitle]);

  const meetingStatus = isFinalizing
    ? "Processing"
    : isRecording
    ? "Recording"
    : recordingTime > 0
    ? "Ready for review"
    : "Ready to record";

  function formatTime(sec: number) {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function handleReset() {
    setIsRecording(false);
    setRecordingTime(0);
    setSummary(null);
    setSummaryError(null);
    setIsFinalizing(false);
    setRecordingError(null);
    setTranscripts(["Press 'Start Recording' to begin — your speech will appear here in real-time."]);
    setActiveTab("transcript");
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleExport() {
    const lines = [
      `# ${currentTitle}`,
      `Duration: ${formatTime(recordingTime)}`,
      "",
      "## Transcript",
      ...transcripts,
    ];
    if (summary) {
      lines.push("", "## AI Summary", summary.summary);
      if (summary.keyDecisions.length) {
        lines.push("", "### Key Decisions");
        summary.keyDecisions.forEach((d) => lines.push(`- ${d}`));
      }
      if (summary.actionItems.length) {
        lines.push("", "### Action Items");
        summary.actionItems.forEach((a) => lines.push(`- ${a}`));
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentTitle.replace(/\s+/g, "-")}-meeting-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Notes exported as Markdown");
  }

  return (
    <div className="flex-1 bg-background text-foreground overflow-y-auto relative selection:bg-primary/30 selection:text-foreground font-sans">
      <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10 space-y-7 animate-in fade-in duration-300">

        {/* Header & Studio Badges */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-[11px] font-bold tracking-wider uppercase">
              <Sparkles className="h-3 w-3 fill-purple-400/20" />
              AI Voice Studio
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-border text-muted-foreground text-[11px] font-medium">
              <Volume2 className="h-3 w-3 text-blue-500" />
              Real-time Transcription
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
                onClick={handleExport}
                disabled={recordingTime === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-accent text-xs font-semibold text-foreground transition shadow-sm disabled:opacity-40"
                title="Export notes as Markdown"
              >
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Meeting context */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
              <span className={`h-1.5 w-1.5 rounded-full ${isRecording ? "bg-red-500 animate-ping" : isFinalizing ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
              {meetingStatus}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</p>
            <p className="mt-1 text-xs font-semibold tabular-nums">{formatTime(recordingTime)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Lines</p>
            <p className="mt-1 text-xs font-semibold">{Math.max(0, transcripts.length - 1)} captured</p>
          </div>
          <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Engine</p>
            <p className="mt-1 text-xs font-semibold">Gemini 2.5 Flash</p>
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

          {/* Top Right Status Pill */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-3 bg-black/50 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-lg">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isRecording ? "bg-red-500 animate-ping" : isFinalizing ? "bg-amber-500 animate-pulse" : "bg-neutral-500"}`} />
              <span className="text-sm font-mono font-bold tracking-widest text-white">{formatTime(recordingTime)}</span>
            </div>
            <div className="h-3 w-[1px] bg-white/20" />
            <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-wider">
              {isRecording ? "LIVE REC" : isFinalizing ? "PROCESSING" : "READY"}
            </span>
          </div>

          {/* Top Left Pill */}
          <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full text-[10px] text-neutral-300 font-medium tracking-wide">
            <Zap className="h-3 w-3 text-cyan-400" />
            <span>NEON WAVEFORM ENGINE</span>
          </div>

          {/* Floating Glass Action Dock (Bottom Center) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-2xl border border-white/15 p-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition duration-300 group-hover:border-white/25">

            {/* Record / Stop Toggle */}
            {!isRecording ? (
              <button
                onClick={() => { void startRecording(); }}
                disabled={isFinalizing}
                className="flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-extrabold rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] transition duration-200 disabled:opacity-50"
              >
                <Mic className="h-4 w-4" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                onClick={() => { void stopRecording(); }}
                disabled={isFinalizing}
                className="flex items-center gap-2.5 px-5 py-2.5 bg-white text-neutral-900 hover:bg-neutral-200 active:scale-95 text-xs font-extrabold rounded-full transition duration-200 disabled:opacity-60"
              >
                <Pause className="h-4 w-4" />
                <span>{isFinalizing ? "Generating summary…" : "Stop & Summarize"}</span>
              </button>
            )}

            {/* Mute Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              disabled={!isRecording}
              className={`p-2.5 rounded-full transition disabled:opacity-30 ${
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
              onClick={handleReset}
              disabled={recordingTime === 0 && !isRecording}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition"
              title="Reset session"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Error banner */}
        {recordingError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
            <MicOff className="mt-0.5 h-4 w-4 shrink-0" />
            <div><p className="font-semibold">Microphone unavailable</p><p className="mt-0.5 text-red-400/80">{recordingError}</p></div>
          </div>
        )}

        {/* Intelligence Hub: Transcript / AI Summary Tabs */}
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
                <span>Live Transcript ({Math.max(0, transcripts.length - 1)})</span>
              </button>

              <button
                onClick={() => setActiveTab("summary")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  activeTab === "summary" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Summary {summary ? "✓" : ""}</span>
              </button>
            </div>

            {isRecording && (
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold animate-pulse flex items-center gap-1.5 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping" />
                Real-time Transcription
              </span>
            )}
          </div>

          {/* ── Transcript Tab ── */}
          {activeTab === "transcript" && (
            <div className="bg-card/60 border border-border rounded-2xl p-4 min-h-[180px] max-h-[360px] overflow-y-auto space-y-2.5 font-sans text-sm no-scrollbar shadow-sm">
              {transcripts.map((phrase, idx) => {
                const isSystem = idx === 0;
                const isStopped = phrase.startsWith("⏹️");
                const isStarted = phrase.startsWith("🔴");
                const isSpeech = phrase.startsWith("🎤");
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3 ${
                      isSystem || isStopped || isStarted
                        ? "bg-muted/40 border-dashed border-border text-muted-foreground"
                        : isSpeech
                        ? "bg-background border-border text-foreground shadow-sm"
                        : "bg-muted/20 border-border/50 text-foreground/80"
                    } animate-in slide-in-from-bottom-2 duration-150`}
                  >
                    {isSystem || isStopped || isStarted ? (
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    ) : (
                      <User className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">{phrase}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── AI Summary Tab ── */}
          {activeTab === "summary" && (
            <div className="space-y-3 animate-in fade-in duration-200">

              {/* Loading state */}
              {isFinalizing && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card/60 p-12 text-center">
                  <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                  <p className="text-sm font-semibold text-foreground">Generating AI Summary…</p>
                  <p className="text-xs text-muted-foreground">Gemini is analyzing your transcript</p>
                </div>
              )}

              {/* Error state */}
              {summaryError && !isFinalizing && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div><p className="font-semibold">Summary failed</p><p className="mt-0.5">{summaryError}</p></div>
                </div>
              )}

              {/* Prompt to record */}
              {!summary && !isFinalizing && !summaryError && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
                  <Sparkles className="h-8 w-8 text-purple-500/50" />
                  <p className="text-sm font-semibold text-foreground/60">No summary yet</p>
                  <p className="text-xs text-muted-foreground">Record a meeting and click "Stop &amp; Summarize" to generate your AI summary</p>
                </div>
              )}

              {/* Real AI summary */}
              {summary && !isFinalizing && (
                <>
                  {/* Overview card */}
                  <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500 mb-2">Meeting Overview</p>
                    <p className="text-sm leading-relaxed text-foreground">{summary.summary}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Key Decisions */}
                    {summary.keyDecisions.length > 0 && (
                      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Key Decisions
                        </p>
                        <ul className="space-y-1.5">
                          {summary.keyDecisions.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Items */}
                    {summary.actionItems.length > 0 && (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Action Items
                        </p>
                        <ul className="space-y-1.5">
                          {summary.actionItems.map((a, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Topics */}
                  {summary.topics.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-purple-500" />
                        Topics Covered
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {summary.topics.map((t, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-semibold"
                          >
                            # {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
