"use client";

import { useState, useEffect } from "react";
import { Brain, Trash2, Plus, X, Sparkles, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface Memory {
  _id: string;
  content: string;
  category: "preference" | "schedule_habit" | "workspace_fact" | "general";
  importance?: number;
  source?: string;
  createdAt: string;
}

interface AgentMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoryChanged?: () => void;
}

export function AgentMemoryModal({ isOpen, onClose, onMemoryChanged }: AgentMemoryModalProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"preference" | "schedule_habit" | "workspace_fact" | "general">("preference");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchMemories();
  }, [isOpen]);

  async function fetchMemories() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/agent/memory");
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
      }
    } catch {
      toast.error("Failed to load memories");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddMemory(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/ai/agent/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newContent.trim(),
          category: newCategory,
          source: "user_manual",
        }),
      });

      if (res.ok) {
        toast.success("Memory saved!");
        setNewContent("");
        fetchMemories();
        onMemoryChanged?.();
      } else {
        toast.error("Failed to save memory");
      }
    } catch {
      toast.error("Error creating memory");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteMemory(id: string) {
    try {
      const res = await fetch(`/api/ai/agent/memory?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMemories((prev) => prev.filter((m) => m._id !== id));
        toast.success("Memory removed");
        onMemoryChanged?.();
      } else {
        toast.error("Failed to delete memory");
      }
    } catch {
      toast.error("Error deleting memory");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-[#0e0e14] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Agent Long-Term Memory
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                  {memories.length} facts
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Facts, habits, and preferences remembered across all conversations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add Memory Bar */}
        <form onSubmit={handleAddMemory} className="p-4 border-b border-white/10 bg-zinc-900/40 space-y-2.5">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. User prefers team syncs on Tuesday afternoons..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
            />
            <select
              value={newCategory}
              onChange={(e: any) => setNewCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="preference">Preference</option>
              <option value="schedule_habit">Schedule Habit</option>
              <option value="workspace_fact">Workspace Fact</option>
              <option value="general">General</option>
            </select>
            <button
              type="submit"
              disabled={isAdding || !newContent.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Memory List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin scrollbar-thumb-white/15">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-400 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              <p className="text-xs">Loading persistent memories...</p>
            </div>
          ) : memories.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <Brain className="h-8 w-8 mx-auto text-zinc-600" />
              <p className="text-sm font-medium text-zinc-300">No memories saved yet</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                The agent automatically learns your preferences during chats, or you can add them manually above.
              </p>
            </div>
          ) : (
            memories.map((m) => (
              <div
                key={m._id}
                className="group p-3.5 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-900/90 transition flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="text-sm text-zinc-200 leading-relaxed">{m.content}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                      {m.category.replace("_", " ")}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {new Date(m.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMemory(m._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                  title="Delete memory"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
          <span>Memories are automatically recalled into every prompt.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
