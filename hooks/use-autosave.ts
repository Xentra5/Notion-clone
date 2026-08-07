import { useCallback, useRef } from "react";
import { updatePage } from "@/lib/actions/pages";
import type { ChecklistItem } from "./use-pages";


interface UseAutosaveOptions {
  pageId: string | undefined;
  onStatusChange: (status: "saved" | "saving" | "idle") => void;
  delayMs?: number;
}

/**
 * Provides a debounced autosave trigger that PATCHes /api/pages/[pageId].
 * Call `scheduleAutosave(title, blocks)` whenever content changes; the hook
 * debounces writes and cancels any pending save on unmount.
 */
export function useAutosave({ pageId, onStatusChange, delayMs = 2000 }: UseAutosaveOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (title: string, blocks: ChecklistItem[]) => {
      if (!pageId) return; // No ID yet — page must be created first

      onStatusChange("saving");
      try {
        await updatePage(pageId, {
          title,
          blocks: blocks.map((item) => ({
            id: item.id,
            type:
              item.type === "todo"
                ? "to_do"
                : item.type === "bullet"
                ? "bulleted_list_item"
                : item.type,
            properties: {
              text: item.text,
              checked: !!item.checked,
              language: item.codeLanguage ?? "javascript",
            },
          })) as never,
        });
        onStatusChange("saved");
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("page-updated", { detail: { updatedAt: new Date(), title } })
          );
        }
      } catch (err) {
        console.error("Auto-save error:", err);
        onStatusChange("idle");
      }

    },
    [pageId, onStatusChange]
  );

  const scheduleAutosave = useCallback(
    (title: string, blocks: ChecklistItem[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => save(title, blocks), delayMs);
    },
    [save, delayMs]
  );

  const cancelAutosave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { scheduleAutosave, cancelAutosave };
}
