import { useCallback, useEffect, useRef } from "react";
import { updatePage } from "@/lib/actions/pages";
import type { ChecklistItem } from "./use-pages";
import { workspaceStore } from "@/store/workspace-store";

interface UseAutosaveOptions {
  pageId: string | undefined;
  onStatusChange: (status: "saved" | "saving" | "idle" | "error") => void;
  delayMs?: number;
}

/** Debounced, serialized page saving. The newest snapshot always wins. */
export function useAutosave({ pageId, onStatusChange, delayMs = 2000 }: UseAutosaveOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef<{ title: string; blocks: ChecklistItem[] } | null>(null);
  const savingRef = useRef(false);
  const mountedRef = useRef(true);
  // Track whether the USER has actually made a change since the editor mounted.
  // This prevents the autosave effect from saving on first render / remount.
  const hasUserChangedRef = useRef(false);

  const flush = useCallback(async () => {
    if (!pageId || savingRef.current) return;
    const snapshot = latestRef.current;
    if (!snapshot) return;

    // CRITICAL: Never save an empty block list. This would wipe the page.
    if (!snapshot.blocks || snapshot.blocks.length === 0) {
      console.warn("[autosave] Blocked attempt to save empty blocks array.");
      latestRef.current = null;
      return;
    }

    savingRef.current = true;
    onStatusChange("saving");
    try {
      while (latestRef.current) {
        const snap = latestRef.current;
        latestRef.current = null;

        // Double-check the snapshot being persisted is not empty
        if (!snap.blocks || snap.blocks.length === 0) {
          console.warn("[autosave] Skipped empty snapshot mid-loop.");
          break;
        }

        try {
          await updatePage(pageId, {
            title: snap.title,
            blocks: snap.blocks.map((item) => ({
              id: item.id,
              type: item.type === "todo" ? "to_do" : item.type === "bullet" ? "bulleted_list_item" : item.type,
              properties: {
                text: item.text, checked: !!item.checked, language: item.codeLanguage ?? "javascript",
                subPageId: item.subPageId ?? "", kanbanColumns: item.kanbanColumns ?? [], url: item.url ?? "",
                fileName: item.fileName ?? "", fileSize: item.fileSize ?? "",
              },
            })) as never,
          });
          // Notify the store so TopBar title and timestamp update without window events
          workspaceStore.getState().setActivePage({ title: snap.title, updatedAt: new Date() });
          workspaceStore.getState().refreshPages();
        } catch (error) {
          if (!latestRef.current) latestRef.current = snap;
          throw error;
        }
      }
      if (mountedRef.current) {
        onStatusChange("saved");
        setTimeout(() => {
          if (mountedRef.current) onStatusChange("idle");
        }, 2500);
      }
    } catch (error) {
      console.error("Auto-save error:", error);
      if (mountedRef.current) onStatusChange("error");
    } finally {
      savingRef.current = false;
    }
  }, [pageId, onStatusChange]);

  const scheduleAutosave = useCallback((title: string, blocks: ChecklistItem[]) => {
    if (!hasUserChangedRef.current) return; // Never schedule until user has made a change
    if (!blocks || blocks.length === 0) return; // Never schedule empty blocks
    if (timerRef.current) clearTimeout(timerRef.current);
    latestRef.current = { title, blocks };
    timerRef.current = setTimeout(() => { timerRef.current = null; void flush(); }, delayMs);
  }, [flush, delayMs]);

  const immediatelySave = useCallback((title: string, blocks: ChecklistItem[]) => {
    if (!blocks || blocks.length === 0) {
      console.warn("[autosave] Blocked immediatelySave with empty blocks.");
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    latestRef.current = { title, blocks };
    void flush();
  }, [flush]);

  /** Call this when the user has actually made a change to mark the editor as dirty. */
  const markDirty = useCallback(() => {
    hasUserChangedRef.current = true;
  }, []);

  const cancelAutosave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Do NOT flush here — this is called when dependencies change, not when user navigates away
  }, []);

  const retryAutosave = useCallback(() => { void flush(); }, [flush]);

  useEffect(() => {
    mountedRef.current = true;
    hasUserChangedRef.current = false; // Reset on page ID change

    const onBeforeUnload = () => {
      // Only flush if user actually made changes
      if (latestRef.current && hasUserChangedRef.current) {
        void flush();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("beforeunload", onBeforeUnload);
      // Flush pending changes on unmount ONLY if user made changes
      if (latestRef.current && hasUserChangedRef.current) {
        void flush();
      }
    };
  }, [flush, pageId]);

  return { scheduleAutosave, immediatelySave, cancelAutosave, retryAutosave, markDirty };
}
