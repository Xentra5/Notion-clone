"use client";

import { useState, useEffect } from "react";
import { History, X, RotateCcw, Clock } from "lucide-react";
import { toast } from "sonner";

interface RevisionItem {
  _id: string;
  title: string;
  createdAt: string;
  createdBy: string;
  blocks: any[];
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId?: string;
  onRestored?: () => void;
}

export function HistoryModal({ isOpen, onClose, pageId, onRestored }: HistoryModalProps) {
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && pageId) {
      fetchRevisions();
    }
  }, [isOpen, pageId]);

  async function fetchRevisions() {
    if (!pageId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/revisions`);
      const data = await res.json();
      if (data.revisions) {
        setRevisions(data.revisions);
      }
    } catch (err) {
      console.error("Failed to load revisions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCheckpoint() {
    if (!pageId) return;
    try {
      const res = await fetch(`/api/pages/${pageId}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createSnapshot" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Version checkpoint created!");
        fetchRevisions();
      }
    } catch (err) {
      toast.error("Failed to create snapshot");
    }
  }

  async function handleRestore(revisionId: string) {
    if (!pageId) return;
    setRestoringId(revisionId);
    try {
      const res = await fetch(`/api/pages/${pageId}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restoreSnapshot", revisionId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Page restored to selected version!");
        onClose();
        if (onRestored) onRestored();
        window.location.reload();
      }
    } catch (err) {
      toast.error("Failed to restore version");
    } finally {
      setRestoringId(null);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-text">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl animate-in zoom-in-95 duration-150 p-5 space-y-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Page Revision History</h3>
              <p className="text-[11px] text-muted-foreground">
                View past version snapshots & restore previous edits
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-foreground">Snapshots Timeline</span>
          <button
            onClick={handleCreateCheckpoint}
            className="px-3 py-1 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
          >
            + Create Checkpoint
          </button>
        </div>

        <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 min-h-[200px]">
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
              Loading revision timeline...
            </div>
          ) : revisions.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No version snapshots recorded yet. Click "Create Checkpoint" to save your first snapshot.
            </div>
          ) : (
            revisions.map((rev) => (
              <div
                key={rev._id}
                className="p-3 rounded-xl border border-border bg-background hover:border-primary/40 transition flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground truncate max-w-[220px]">
                      {rev.title || "Untitled"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(rev.createdAt).toLocaleString()} • {rev.createdBy}
                  </div>
                </div>
                <button
                  onClick={() => handleRestore(rev._id)}
                  disabled={restoringId === rev._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent hover:bg-accent/80 text-foreground transition border border-border"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{restoringId === rev._id ? "Restoring..." : "Restore"}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
