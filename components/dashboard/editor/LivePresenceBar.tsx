"use client";

import { useWorkspaceStore } from "@/store/workspace-store";

export function LivePresenceBar({ pageId }: { pageId?: string }) {
  const collaborators = useWorkspaceStore((s) => s.collaborators);

  // If no page is open or no other collaborators are currently present, don't render
  if (!pageId || collaborators.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 mr-2 animate-in fade-in duration-300">
      <div className="flex -space-x-1.5 overflow-hidden py-0.5">
        {collaborators.map((c) => {
          const initials = (c.name || "A").charAt(0).toUpperCase();
          return (
            <div
              key={c.id || c.email}
              title={`${c.name} (${c.email})`}
              className="relative inline-flex items-center justify-center h-5 w-5 rounded-full ring-2 ring-background border-none select-none text-[9px] font-bold text-white shrink-0 shadow-sm transition-transform hover:scale-110 duration-150"
              style={{ backgroundColor: c.color || "#2383e2" }}
            >
              {initials}
              {/* Online pulsing green dot */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-1 ring-background" />
              </span>
            </div>
          );
        })}
      </div>
      <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline select-none">
        {collaborators.length === 1 ? "1 collaborator online" : `${collaborators.length} collaborators online`}
      </span>
    </div>
  );
}

