"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  color: string;
  activePageId: string;
}

// Color generator based on string hash
function getRandomColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#2383e2", "#0f7b6c", "#d9730d", "#d44040", "#8a3fe2", "#19a797"];
  return colors[Math.abs(hash) % colors.length];
}

export function LivePresenceBar({ pageId }: { pageId?: string }) {
  const { data: session } = useSession();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    if (!pageId || !session?.user?.email) return;

    // Use BroadcastChannel API for multi-tab browser sync
    const channel = new BroadcastChannel("notion-presence");

    const activeUser = {
      id: session.user.email,
      name: session.user.name || "Anonymous",
      email: session.user.email,
      color: getRandomColor(session.user.email),
      activePageId: pageId,
    };

    // Heartbeat ping interval
    const pingInterval = setInterval(() => {
      channel.postMessage({ type: "ping", user: activeUser });
    }, 1000);

    // Keep track of active ticks per collaborator to prune inactive ones
    const activeTicks: Record<string, number> = {};

    const handleMessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg && msg.user && msg.user.email !== session.user?.email) {
        if (msg.type === "ping" && msg.user.activePageId === pageId) {
          activeTicks[msg.user.email] = Date.now();
          setCollaborators((prev) => {
            if (prev.some((c) => c.email === msg.user.email)) return prev;
            return [...prev, msg.user];
          });
        }
      }
    };

    channel.addEventListener("message", handleMessage);

    // Initial ping
    channel.postMessage({ type: "ping", user: activeUser });

    // Prune loop (collaborators who haven't pinged in 3.5 seconds are removed)
    const pruneInterval = setInterval(() => {
      const threshold = Date.now() - 3500;
      setCollaborators((prev) =>
        prev.filter((c) => {
          const lastSeen = activeTicks[c.email] || 0;
          return lastSeen > threshold;
        })
      );
    }, 1000);

    return () => {
      clearInterval(pingInterval);
      clearInterval(pruneInterval);
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [pageId, session]);

  if (collaborators.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 mr-2">
      <div className="flex -space-x-1.5 overflow-hidden">
        {collaborators.map((c) => {
          const initials = c.name.charAt(0).toUpperCase();
          return (
            <div
              key={c.email}
              title={`${c.name} (${c.email})`}
              className="relative inline-flex items-center justify-center h-5 w-5 rounded-full ring-2 ring-background border-none select-none text-[9px] font-bold text-white shrink-0 animate-in fade-in zoom-in-75 duration-200"
              style={{ backgroundColor: c.color }}
            >
              {initials}
              <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
          );
        })}
      </div>
      <span className="text-[10px] text-muted-foreground font-medium hidden md:inline">
        {collaborators.length === 1 ? "1 editor viewing" : `${collaborators.length} editors viewing`}
      </span>
    </div>
  );
}
