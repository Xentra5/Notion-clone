import { useCallback, useEffect, useRef } from "react";
import { updatePage } from "@/lib/actions/pages";
import type { ChecklistItem } from "./use-pages";

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

  const flush = useCallback(async () => {
    if (!pageId || savingRef.current) return;
    savingRef.current = true;
    onStatusChange("saving");
    try {
      while (latestRef.current) {
        const snapshot = latestRef.current;
        latestRef.current = null;
        try {
          await updatePage(pageId, {
            title: snapshot.title,
            blocks: snapshot.blocks.map((item) => ({
              id: item.id,
              type: item.type === "todo" ? "to_do" : item.type === "bullet" ? "bulleted_list_item" : item.type,
              properties: {
                text: item.text, checked: !!item.checked, language: item.codeLanguage ?? "javascript",
                subPageId: item.subPageId ?? "", kanbanColumns: item.kanbanColumns ?? [], url: item.url ?? "",
                fileName: item.fileName ?? "", fileSize: item.fileSize ?? "",
              },
            })) as never,
          });
          if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("page-updated", { detail: { updatedAt: new Date(), title: snapshot.title } }));
        } catch (error) {
          if (!latestRef.current) latestRef.current = snapshot;
          throw error;
        }
      }
      if (mountedRef.current) onStatusChange("saved");
    } catch (error) {
      console.error("Auto-save error:", error);
      if (mountedRef.current) onStatusChange("error");
    } finally { savingRef.current = false; }
  }, [pageId, onStatusChange]);

  const scheduleAutosave = useCallback((title: string, blocks: ChecklistItem[]) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    latestRef.current = { title, blocks };
    timerRef.current = setTimeout(() => { timerRef.current = null; void flush(); }, delayMs);
  }, [flush, delayMs]);

  const immediatelySave = useCallback((title: string, blocks: ChecklistItem[]) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null; latestRef.current = { title, blocks }; void flush();
  }, [flush]);

  const cancelAutosave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);
  const retryAutosave = useCallback(() => { void flush(); }, [flush]);
  useEffect(() => () => { mountedRef.current = false; }, []);
  return { scheduleAutosave, immediatelySave, cancelAutosave, retryAutosave };
}
