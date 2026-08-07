"use client";

import { useEffect, useState } from "react";
import { ArchiveRestore, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { getTrashPages, permanentlyDeletePage, restorePage, type Page } from "@/lib/actions/pages";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export function TrashModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [permanentDeleteTargetId, setPermanentDeleteTargetId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setPages(await getTrashPages());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  async function restore(id: string) {
    try {
      await restorePage(id);
      await load();
      toast.success("Page restored from Trash");
      window.dispatchEvent(new Event("page-updated"));
    } catch {
      toast.error("Failed to restore page");
    }
  }

  async function confirmPermanentDelete() {
    if (!permanentDeleteTargetId) return;
    const id = permanentDeleteTargetId;
    setPermanentDeleteTargetId(null);
    try {
      await permanentlyDeletePage(id);
      await load();
      toast.success("Page permanently deleted");
      window.dispatchEvent(new Event("page-updated"));
    } catch {
      toast.error("Failed to permanently delete page");
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2 font-semibold">
              <Trash2 className="h-4 w-4" /> Trash
            </div>
            <button onClick={onClose} className="rounded-md p-1 hover:bg-accent">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-3">
            {loading ? (
              <p className="p-5 text-center text-xs text-muted-foreground">Loading trash…</p>
            ) : pages.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">Trash is empty</p>
            ) : (
              pages.map((page) => (
                <div key={page._id} className="flex items-center justify-between gap-3 rounded-xl p-3 hover:bg-accent transition">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{page.icon} {page.title}</p>
                    <p className="text-[11px] text-muted-foreground">Deleted page</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => restore(page._id)}
                      title="Restore"
                      className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground transition"
                    >
                      <ArchiveRestore className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPermanentDeleteTargetId(page._id)}
                      title="Delete permanently"
                      className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end border-t border-border px-5 py-3">
            <button onClick={onClose} className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold hover:bg-accent/80 transition">
              Done
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!permanentDeleteTargetId}
        onClose={() => setPermanentDeleteTargetId(null)}
        onConfirm={confirmPermanentDelete}
        title="Permanently delete page?"
        description="This action cannot be undone. This page will be deleted permanently from your workspace."
        confirmText="Delete permanently"
      />
    </>
  );
}