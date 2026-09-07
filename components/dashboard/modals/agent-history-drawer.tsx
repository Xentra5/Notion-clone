"use client";

import { useState, useEffect } from "react";
import {
  History,
  Calendar,
  FileText,
  X,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  PlusCircle,
  MessagesSquare,
  Plus,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ActionLog {
  _id: string;
  actionType:
    | "create_calendar_event"
    | "update_calendar_event"
    | "delete_calendar_event"
    | "create_page"
    | "update_page"
    | "remember_fact";
  entityId?: string;
  entityTitle: string;
  details: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface ChatSessionItem {
  _id: string;
  title: string;
  personaId: string;
  lastMessageAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface AgentHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "chats" | "actions";
  onSelectSession?: (sessionId: string) => void;
  currentSessionId?: string | null;
  onNewChat?: () => void;
}

export function AgentHistoryDrawer({
  isOpen,
  onClose,
  initialTab = "chats",
  onSelectSession,
  currentSessionId,
  onNewChat,
}: AgentHistoryDrawerProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"chats" | "actions">(initialTab);
  const [actions, setActions] = useState<ActionLog[]>([]);
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      fetchData();
    }
  }, [isOpen, initialTab]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [historyRes, sessionsRes] = await Promise.all([
        fetch("/api/ai/agent/history").catch(() => null),
        fetch("/api/ai/agent/sessions").catch(() => null),
      ]);

      if (historyRes && historyRes.ok) {
        const data = await historyRes.json();
        setActions(data.actions || []);
      }

      if (sessionsRes && sessionsRes.ok) {
        const sData = await sessionsRes.json();
        setSessions(sData.sessions || []);
      }
    } catch {
      toast.error("Failed to load history");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      setDeletingId(sessionId);
      const res = await fetch(`/api/ai/agent/sessions/${sessionId}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s._id !== sessionId));
        toast.success("Deleted chat conversation");
        if (currentSessionId === sessionId && onNewChat) {
          onNewChat();
        }
      }
    } catch {
      toast.error("Failed to delete chat");
    } finally {
      setDeletingId(null);
    }
  }

  function getActionBadge(type: ActionLog["actionType"]) {
    switch (type) {
      case "create_calendar_event":
        return { label: "Calendar Created", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Calendar };
      case "update_calendar_event":
        return { label: "Calendar Revised", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Edit3 };
      case "delete_calendar_event":
        return { label: "Calendar Deleted", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: Trash2 };
      case "create_page":
        return { label: "Page Created", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: PlusCircle };
      case "update_page":
        return { label: "Page Revised", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", icon: FileText };
      case "remember_fact":
        return { label: "Memory Stored", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", icon: CheckCircle2 };
      default:
        return { label: "Action Executed", color: "text-zinc-400 bg-white/5 border-white/10", icon: CheckCircle2 };
    }
  }

  function handleNavigate(action: ActionLog) {
    if (
      action.actionType === "create_calendar_event" ||
      action.actionType === "update_calendar_event" ||
      action.actionType === "delete_calendar_event"
    ) {
      onClose();
      router.push("/dashboard/calendar");
    } else if (action.actionType === "create_page" || action.actionType === "update_page") {
      onClose();
      const pageId =
        action.entityId ||
        (action.metadata?.entityId as string) ||
        action.details?.match(/ID:\s*([a-f0-9]+)/i)?.[1];
      if (pageId) {
        router.push(`/dashboard/${pageId}`);
      } else {
        router.push("/dashboard");
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0d0d12] border-l border-white/15 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Agent History & Chats
              </h2>
              <p className="text-[11px] text-zinc-400">
                Switch previous conversations or review autonomous actions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-4 pt-3 pb-2 border-b border-white/[0.08] bg-[#0c0c11] gap-2">
          <button
            onClick={() => setTab("chats")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
              tab === "chats"
                ? "bg-white/10 text-white shadow-xs border border-white/15"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <MessagesSquare className="h-3.5 w-3.5 text-sky-400" />
            <span>Previous Chats</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-300 font-mono">
              {sessions.length}
            </span>
          </button>

          <button
            onClick={() => setTab("actions")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
              tab === "actions"
                ? "bg-white/10 text-white shadow-xs border border-white/15"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Actions Log</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-300 font-mono">
              {actions.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/15">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-400 space-y-2">
              <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
              <p className="text-xs">Loading history...</p>
            </div>
          ) : tab === "chats" ? (
            /* ── Previous Chats List ── */
            <div className="space-y-2.5">
              {/* Start new chat button inside drawer */}
              <button
                onClick={() => {
                  onClose();
                  onNewChat?.();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-white text-xs font-semibold hover:bg-sky-500/30 transition active:scale-[0.99]"
              >
                <Plus className="h-4 w-4 text-sky-400" />
                <span>Start New Chat</span>
              </button>

              {sessions.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 space-y-2">
                  <MessagesSquare className="h-8 w-8 mx-auto text-zinc-600" />
                  <p className="text-sm font-medium text-zinc-400">No previous chats</p>
                  <p className="text-xs text-zinc-600 max-w-xs mx-auto">
                    Start a conversation with Notion Agent and your chat sessions will be preserved here.
                  </p>
                </div>
              ) : (
                sessions.map((s) => {
                  const isActive = currentSessionId === s._id;
                  const dateStr = s.lastMessageAt || s.updatedAt || s.createdAt;
                  return (
                    <div
                      key={s._id}
                      onClick={() => {
                        onClose();
                        onSelectSession?.(s._id);
                      }}
                      className={`group relative p-3 rounded-xl border cursor-pointer transition text-left space-y-1.5 ${
                        isActive
                          ? "bg-white/10 border-white/20 text-white shadow-md ring-1 ring-sky-500/30"
                          : "bg-zinc-900/40 border-white/10 text-zinc-300 hover:bg-zinc-900/80 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-sky-400" : "text-zinc-500"}`} />
                          <span className="font-semibold text-xs truncate">
                            {s.title || "Untitled Conversation"}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 font-medium shrink-0">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
                        <span>
                          {dateStr
                            ? new Date(dateStr).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Recent"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDeleteSession(s._id, e)}
                            disabled={deletingId === s._id}
                            title="Delete conversation"
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-white/5 transition"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <span className="text-sky-400 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
                            Open <ArrowUpRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* ── Actions Audit Trail List ── */
            actions.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 space-y-2">
                <Clock className="h-8 w-8 mx-auto text-zinc-600" />
                <p className="text-sm font-medium text-zinc-400">No actions recorded yet</p>
                <p className="text-xs text-zinc-600 max-w-xs mx-auto">
                  Actions like creating calendar events, rescheduling meetings, or drafting pages will appear here.
                </p>
              </div>
            ) : (
              actions.map((act) => {
                const badge = getActionBadge(act.actionType);
                const BadgeIcon = badge.icon;
                const isCalendar = act.actionType.includes("calendar");
                const isPage = act.actionType.includes("page");

                return (
                  <div
                    key={act._id}
                    className="p-3.5 rounded-xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-900/80 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${badge.color}`}
                      >
                        <BadgeIcon className="h-3 w-3" />
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-sans">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                      {act.details || act.entityTitle}
                    </p>

                    {(isCalendar || isPage) && (
                      <div className="pt-1 flex items-center justify-end">
                        <button
                          onClick={() => handleNavigate(act)}
                          className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition font-medium"
                        >
                          <span>{isCalendar ? "Open in Calendar" : "View Page"}</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
          <span>{tab === "chats" ? "Chat session switcher" : "Real-time action audit trail"}</span>
          <button
            onClick={fetchData}
            className="text-xs text-sky-400 hover:text-sky-300 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
