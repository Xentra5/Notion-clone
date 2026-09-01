"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface RemoteCollaborator {
  id: string;
  name: string;
  email: string;
  color: string;
  activePageId: string;
  lastSeen?: number;
  blockId?: string;
}

export interface RemoteCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  blockId?: string;
}

interface UseCollaborationOptions {
  pageId?: string;
  enabled?: boolean;
}

export function useCollaboration({ pageId, enabled = true }: UseCollaborationOptions) {
  const { data: session } = useSession();
  const [collaborators, setCollaborators] = useState<RemoteCollaborator[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [activeCollaboratorBlocks, setActiveCollaboratorBlocks] = useState<Map<string, RemoteCollaborator>>(new Map());

  const cursorsMapRef = useRef<Map<string, RemoteCursor & { lastSeen: number }>>(new Map());
  const activeBlocksMapRef = useRef<Map<string, RemoteCollaborator>>(new Map());
  const lastSentRef = useRef<number>(0);
  const pendingCursorRef = useRef<{ x: number; y: number; blockId?: string } | null>(null);
  const currentBlockIdRef = useRef<string | undefined>(undefined);

  const currentUserEmail = session?.user?.email;
  const currentUserName = session?.user?.name;

  // Flush throttled cursor coordinates to server and local BroadcastChannel
  const sendCursorUpdate = useCallback(
    async (x: number, y: number, blockId?: string) => {
      if (!pageId || !enabled) return;

      // Broadcast locally immediately (0ms cross-tab in same browser)
      try {
        const bc = new BroadcastChannel(`notion-collab-${pageId}`);
        bc.postMessage({
          type: "cursor-move",
          user: {
            id: currentUserEmail || "anon",
            name: currentUserName || "Collaborator",
            email: currentUserEmail,
            color: "#2383e2",
          },
          x,
          y,
          blockId,
        });
        bc.close();
      } catch {
        // BroadcastChannel may not be available in some environments
      }

      // Send to server event endpoint
      try {
        await fetch(`/api/collaboration/${pageId}/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cursor", x, y, blockId }),
          keepalive: true,
        });
      } catch {
        // ignore beacon network failures
      }
    },
    [pageId, enabled, currentUserEmail, currentUserName]
  );

  // Throttled mouse movement tracker (50ms rate limit)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const now = Date.now();
      pendingCursorRef.current = {
        x: e.clientX,
        y: e.clientY,
        blockId: currentBlockIdRef.current,
      };

      if (now - lastSentRef.current >= 50) {
        lastSentRef.current = now;
        const target = pendingCursorRef.current;
        if (target) {
          void sendCursorUpdate(target.x, target.y, target.blockId);
        }
      }
    },
    [sendCursorUpdate]
  );

  // Focus a specific block by ID
  const broadcastBlockFocus = useCallback(
    (blockId?: string) => {
      currentBlockIdRef.current = blockId;
      if (pendingCursorRef.current) {
        pendingCursorRef.current.blockId = blockId;
        void sendCursorUpdate(pendingCursorRef.current.x, pendingCursorRef.current.y, blockId);
      }
    },
    [sendCursorUpdate]
  );

  // Main SSE + BroadcastChannel synchronization effect
  useEffect(() => {
    if (!pageId || !enabled || !currentUserEmail) return;

    let eventSource: EventSource | null = null;
    let localChannel: BroadcastChannel | null = null;
    let isCancelled = false;

    // Prune stale cursors (inactive > 4 seconds)
    const pruneTimer = setInterval(() => {
      const threshold = Date.now() - 4000;
      let changed = false;

      for (const [key, cursor] of cursorsMapRef.current.entries()) {
        if (cursor.lastSeen < threshold) {
          cursorsMapRef.current.delete(key);
          changed = true;
        }
      }

      if (changed) {
        setRemoteCursors(Array.from(cursorsMapRef.current.values()));
      }
    }, 1000);

    // 1. Setup local BroadcastChannel for multi-tab sync
    try {
      localChannel = new BroadcastChannel(`notion-collab-${pageId}`);
      localChannel.onmessage = (e) => {
        if (isCancelled || !e.data) return;
        handleIncomingMessage(e.data);
      };
    } catch {
      // BroadcastChannel optional fallback
    }

    function handleIncomingMessage(msg: {
      type: string;
      user?: RemoteCollaborator;
      users?: RemoteCollaborator[];
      userId?: string;
      email?: string;
      x?: number;
      y?: number;
      blockId?: string;
    }) {
      if (msg.type === "presence-sync" && Array.isArray(msg.users)) {
        const others = msg.users.filter((u) => u.email !== currentUserEmail);
        setCollaborators(others);
      } else if (msg.type === "user-join" && msg.user && msg.user.email !== currentUserEmail) {
        setCollaborators((prev) => {
          if (prev.some((u) => u.email === msg.user!.email)) return prev;
          return [...prev, msg.user!];
        });
      } else if (msg.type === "user-leave") {
        const leaveEmail = msg.email;
        if (leaveEmail) {
          setCollaborators((prev) => prev.filter((u) => u.email !== leaveEmail));
          cursorsMapRef.current.delete(leaveEmail);
          setRemoteCursors(Array.from(cursorsMapRef.current.values()));
          activeBlocksMapRef.current.delete(leaveEmail);
          setActiveCollaboratorBlocks(new Map(activeBlocksMapRef.current));
        }
      } else if (msg.type === "cursor-move" && msg.user && msg.user.email !== currentUserEmail) {
        const { user, x, y, blockId } = msg;
        if (typeof x === "number" && typeof y === "number") {
          cursorsMapRef.current.set(user.email, {
            id: user.email,
            name: user.name,
            color: user.color,
            x,
            y,
            blockId,
            lastSeen: Date.now(),
          });
          setRemoteCursors(Array.from(cursorsMapRef.current.values()));
        }

        if (blockId) {
          activeBlocksMapRef.current.set(user.email, user);
          setActiveCollaboratorBlocks(new Map(activeBlocksMapRef.current));
        } else {
          activeBlocksMapRef.current.delete(user.email);
          setActiveCollaboratorBlocks(new Map(activeBlocksMapRef.current));
        }
      }
    }

    // 2. Setup SSE connection to server
    try {
      eventSource = new EventSource(`/api/collaboration/${pageId}/stream`);

      eventSource.onmessage = (event) => {
        if (isCancelled || !event.data) return;
        try {
          const parsed = JSON.parse(event.data);
          handleIncomingMessage(parsed);
        } catch {
          // ignore non-JSON pings
        }
      };

      eventSource.onerror = () => {
        // Browser automatically attempts reconnect with exponential backoff
      };
    } catch (err) {
      console.warn("Collaboration EventSource not supported:", err);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      isCancelled = true;
      clearInterval(pruneTimer);
      window.removeEventListener("mousemove", handleMouseMove);

      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (localChannel) {
        localChannel.close();
        localChannel = null;
      }
    };
  }, [pageId, enabled, currentUserEmail, handleMouseMove]);

  return {
    collaborators,
    remoteCursors,
    activeCollaboratorBlocks,
    broadcastBlockFocus,
  };
}
