"use client";

import { useState, useEffect } from "react";
import { History, Calendar, FileText, X, ArrowUpRight, Loader2, CheckCircle2, Clock, Trash2, Edit3, PlusCircle } from "lucide-react";
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
  entityTitle: string;
  details: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface AgentHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentHistoryDrawer({ isOpen, onClose }: AgentHistoryDrawerProps) {
  const router = useRouter();
  const [actions, setActions] = useState<ActionLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchHistory();
  }, [isOpen]);

  async function fetchHistory() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/agent/history");
      if (res.ok) {
        const data = await res.json();
        setActions(data.actions || []);
      }
    } catch {
      toast.error("Failed to load action history");
    } finally {
      setIsLoading(false);
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
      router.push("/dashboard");
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
                Changes & Action History
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono">
                  {actions.length}
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Log of autonomous actions and revisions by your agent.
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

        {/* Action List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/15">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-400 space-y-2">
              <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
              <p className="text-xs">Loading activity audit log...</p>
            </div>
          ) : actions.length === 0 ? (
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
                        <span>{isCalendar ? "Open in Calendar" : "View Pages"}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
          <span>Real-time action audit trail</span>
          <button
            onClick={fetchHistory}
            className="text-xs text-sky-400 hover:text-sky-300 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
