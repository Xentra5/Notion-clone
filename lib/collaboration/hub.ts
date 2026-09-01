/**
 * lib/collaboration/hub.ts
 *
 * In-memory real-time collaboration hub for Next.js 16 App Router.
 * Uses globalThis singleton to maintain active SSE connections across module reloads.
 */

export interface CollaboratorInfo {
  id: string;
  name: string;
  email: string;
  color: string;
  activePageId: string;
  lastSeen: number;
  cursor?: {
    x: number;
    y: number;
  };
  blockId?: string;
}

interface Subscriber {
  connectionId: string;
  user: CollaboratorInfo;
  controller: ReadableStreamDefaultController;
}

class CollaborationHub {
  // Map of pageId -> Map of connectionId -> Subscriber
  private rooms = new Map<string, Map<string, Subscriber>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodically prune stale connections (every 10 seconds)
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.pruneStale(), 10000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Register a new SSE subscriber for a specific page.
   */
  addSubscriber(
    pageId: string,
    connectionId: string,
    user: Omit<CollaboratorInfo, "lastSeen" | "activePageId">,
    controller: ReadableStreamDefaultController
  ): void {
    if (!this.rooms.has(pageId)) {
      this.rooms.set(pageId, new Map());
    }
    const room = this.rooms.get(pageId)!;

    const collab: CollaboratorInfo = {
      ...user,
      activePageId: pageId,
      lastSeen: Date.now(),
    };

    room.set(connectionId, {
      connectionId,
      user: collab,
      controller,
    });

    // Notify other subscribers that a new user joined
    this.broadcast(
      pageId,
      {
        type: "user-join",
        user: collab,
      },
      connectionId
    );

    // Send immediate snapshot of current room presence to the newly joined subscriber
    const presenceList = Array.from(room.values()).map((s) => s.user);
    this.sendToController(controller, {
      type: "presence-sync",
      users: presenceList,
    });
  }

  /**
   * Remove a subscriber when SSE stream is closed or aborted.
   */
  removeSubscriber(pageId: string, connectionId: string): void {
    const room = this.rooms.get(pageId);
    if (!room) return;

    const sub = room.get(connectionId);
    if (sub) {
      room.delete(connectionId);
      this.broadcast(pageId, {
        type: "user-leave",
        userId: sub.user.id,
        email: sub.user.email,
      });
    }

    if (room.size === 0) {
      this.rooms.delete(pageId);
    }
  }

  /**
   * Update cursor position or active block for a specific connection.
   */
  updatePresence(
    pageId: string,
    connectionId: string,
    data: { x?: number; y?: number; blockId?: string }
  ): void {
    const room = this.rooms.get(pageId);
    if (!room) return;

    const sub = room.get(connectionId);
    if (!sub) return;

    sub.user.lastSeen = Date.now();
    if (data.x !== undefined && data.y !== undefined) {
      sub.user.cursor = { x: data.x, y: data.y };
    }
    if (data.blockId !== undefined) {
      sub.user.blockId = data.blockId;
    }

    // Broadcast cursor position to others in the room
    this.broadcast(
      pageId,
      {
        type: "cursor-move",
        user: sub.user,
        x: data.x,
        y: data.y,
        blockId: data.blockId,
      },
      connectionId
    );
  }

  /**
   * Broadcast a notification when a document is updated.
   */
  notifyPageUpdated(pageId: string, byUserEmail: string, title?: string): void {
    this.broadcast(pageId, {
      type: "page-updated",
      pageId,
      by: byUserEmail,
      title,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Get all active collaborators on a page.
   */
  getCollaborators(pageId: string): CollaboratorInfo[] {
    const room = this.rooms.get(pageId);
    if (!room) return [];
    return Array.from(room.values()).map((s) => s.user);
  }

  /**
   * Broadcast SSE event to all connected subscribers of a page.
   */
  private broadcast(pageId: string, message: unknown, excludeConnectionId?: string): void {
    const room = this.rooms.get(pageId);
    if (!room) return;

    const deadConnections: string[] = [];

    for (const [connId, sub] of room.entries()) {
      if (excludeConnectionId && connId === excludeConnectionId) continue;
      const success = this.sendToController(sub.controller, message);
      if (!success) {
        deadConnections.push(connId);
      }
    }

    for (const deadId of deadConnections) {
      this.removeSubscriber(pageId, deadId);
    }
  }

  private sendToController(controller: ReadableStreamDefaultController, data: unknown): boolean {
    try {
      const payload = `data: ${JSON.stringify(data)}\n\n`;
      controller.enqueue(new TextEncoder().encode(payload));
      return true;
    } catch {
      return false;
    }
  }

  private pruneStale(): void {
    const cutoff = Date.now() - 25000; // 25 seconds of silence
    for (const [pageId, room] of this.rooms.entries()) {
      const staleKeys: string[] = [];
      for (const [connId, sub] of room.entries()) {
        if (sub.user.lastSeen < cutoff) {
          staleKeys.push(connId);
        }
      }
      for (const key of staleKeys) {
        this.removeSubscriber(pageId, key);
      }
    }
  }
}

// Attach to globalThis to preserve state across dev reloads
declare global {
  var __collaborationHub: CollaborationHub | undefined;
}

export const collaborationHub: CollaborationHub =
  globalThis.__collaborationHub ?? (globalThis.__collaborationHub = new CollaborationHub());
