/**
 * lib/storage/local-store.ts
 *
 * Local-First IndexedDB Persistence & Optimistic Sync Engine
 * 
 * Provides:
 * 1. 0ms instant document and workspace list retrieval from IndexedDB.
 * 2. Multi-tab synchronization using HTML5 BroadcastChannel.
 * 3. Offline & optimistic mutation queue with background auto-sync and retry.
 * 4. Stale-While-Revalidate (SWR) cache semantics.
 */

import type { Page } from "@/lib/actions/pages";

const DB_NAME = "notion_workspace_db";
const DB_VERSION = 1;
const STORE_PAGES = "pages";
const STORE_META = "metadata";
const STORE_MUTATIONS = "mutation_queue";

export interface QueuedMutation {
  id: string;
  type: "create" | "update" | "delete";
  pageId: string;
  payload?: unknown;
  timestamp: number;
  retryCount: number;
}

class LocalStoreEngine {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private channel: BroadcastChannel | null = null;
  private memoryPages = new Map<string, Page>();
  private memoryMeta = new Map<string, unknown>();
  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  private isSyncing = false;
  private listeners = new Set<(event: { type: string; pageId?: string; data?: unknown }) => void>();

  constructor() {
    if (typeof window !== "undefined") {
      this.initBroadcastChannel();
      this.initNetworkListeners();
      this.openDatabase().catch((err) => {
        console.warn("IndexedDB initialization warning:", err);
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // IndexedDB Initializer
  // ───────────────────────────────────────────────────────────────────────────

  private openDatabase(): Promise<IDBDatabase | null> {
    if (typeof window === "undefined" || !window.indexedDB) {
      return Promise.resolve(null);
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        try {
          const request = window.indexedDB.open(DB_NAME, DB_VERSION);

          request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_PAGES)) {
              db.createObjectStore(STORE_PAGES, { keyPath: "_id" });
            }
            if (!db.objectStoreNames.contains(STORE_META)) {
              db.createObjectStore(STORE_META, { keyPath: "key" });
            }
            if (!db.objectStoreNames.contains(STORE_MUTATIONS)) {
              db.createObjectStore(STORE_MUTATIONS, { keyPath: "id" });
            }
          };

          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = (err) => {
            console.warn("IndexedDB open error:", err);
            resolve(null);
          };
        } catch {
          resolve(null);
        }
      });
    }

    return this.dbPromise;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Multi-tab Sync Channel
  // ───────────────────────────────────────────────────────────────────────────

  private initBroadcastChannel() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel("notion_local_sync");
        this.channel.onmessage = (event) => {
          const { type, pageId, data } = event.data || {};
          if (type === "page_updated" && data) {
            this.memoryPages.set((data as Page)._id, data as Page);
          } else if (type === "page_deleted" && pageId) {
            this.memoryPages.delete(pageId);
          }
          this.notifyListeners({ type, pageId, data });
        };
      } catch {
        this.channel = null;
      }
    }
  }

  private initNetworkListeners() {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      this.isOnline = true;
      this.flushMutationQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  public subscribe(callback: (event: { type: string; pageId?: string; data?: unknown }) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(event: { type: string; pageId?: string; data?: unknown }) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error("Local store listener error:", err);
      }
    });
  }

  private broadcast(event: { type: string; pageId?: string; data?: unknown }) {
    this.notifyListeners(event);
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (err) {
        console.warn("BroadcastChannel error:", err);
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Instant Read Operations (0ms)
  // ───────────────────────────────────────────────────────────────────────────

  public async getPageLocal(id: string): Promise<Page | null> {
    // 1. Fast Memory Cache check
    if (this.memoryPages.has(id)) {
      return this.memoryPages.get(id)!;
    }

    // 2. Persistent IndexedDB check
    const db = await this.openDatabase();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_PAGES, "readonly");
        const store = tx.objectStore(STORE_PAGES);
        const req = store.get(id);

        req.onsuccess = () => {
          const page = req.result as Page | undefined;
          if (page) {
            this.memoryPages.set(id, page);
            resolve(page);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  public async getPagesListLocal(): Promise<Page[] | null> {
    // Check metadata store for cached pages list
    const db = await this.openDatabase();
    if (!db) {
      const mem = this.memoryMeta.get("pages_list") as Page[] | undefined;
      return mem || null;
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_META, "readonly");
        const store = tx.objectStore(STORE_META);
        const req = store.get("pages_list");

        req.onsuccess = () => {
          const result = req.result as { key: string; data: Page[]; timestamp: number } | undefined;
          if (result && Array.isArray(result.data)) {
            this.memoryMeta.set("pages_list", result.data);
            resolve(result.data);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Optimistic Write & Cache Operations
  // ───────────────────────────────────────────────────────────────────────────

  public async setPageLocal(page: Page): Promise<void> {
    this.memoryPages.set(page._id, page);

    const db = await this.openDatabase();
    if (db) {
      try {
        const tx = db.transaction(STORE_PAGES, "readwrite");
        const store = tx.objectStore(STORE_PAGES);
        store.put(page);
      } catch (err) {
        console.warn("Failed to write page to IndexedDB:", err);
      }
    }

    this.broadcast({ type: "page_updated", pageId: page._id, data: page });
  }

  public async setPagesListLocal(pages: Page[]): Promise<void> {
    this.memoryMeta.set("pages_list", pages);
    // Warm individual pages in memory
    for (const p of pages) {
      this.memoryPages.set(p._id, p);
    }

    const db = await this.openDatabase();
    if (db) {
      try {
        const tx = db.transaction([STORE_META, STORE_PAGES], "readwrite");
        const metaStore = tx.objectStore(STORE_META);
        const pagesStore = tx.objectStore(STORE_PAGES);

        metaStore.put({ key: "pages_list", data: pages, timestamp: Date.now() });
        for (const p of pages) {
          pagesStore.put(p);
        }
      } catch (err) {
        console.warn("Failed to write pages list to IndexedDB:", err);
      }
    }

    this.broadcast({ type: "pages_list_updated", data: pages });
  }

  public async removePageLocal(id: string): Promise<void> {
    this.memoryPages.delete(id);

    const db = await this.openDatabase();
    if (db) {
      try {
        const tx = db.transaction(STORE_PAGES, "readwrite");
        const store = tx.objectStore(STORE_PAGES);
        store.delete(id);
      } catch (err) {
        console.warn("Failed to delete page from IndexedDB:", err);
      }
    }

    this.broadcast({ type: "page_deleted", pageId: id });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Mutation Queue (Background & Offline Sync)
  // ───────────────────────────────────────────────────────────────────────────

  public async enqueueMutation(mutation: Omit<QueuedMutation, "id" | "timestamp" | "retryCount">): Promise<void> {
    const item: QueuedMutation = {
      ...mutation,
      id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const db = await this.openDatabase();
    if (db) {
      try {
        const tx = db.transaction(STORE_MUTATIONS, "readwrite");
        tx.objectStore(STORE_MUTATIONS).put(item);
      } catch (err) {
        console.warn("Failed to enqueue mutation:", err);
      }
    }

    // Try flushing immediately if online
    if (this.isOnline) {
      void this.flushMutationQueue();
    }
  }

  public async flushMutationQueue(): Promise<void> {
    if (this.isSyncing || !this.isOnline) return;
    this.isSyncing = true;

    try {
      const db = await this.openDatabase();
      if (!db) return;

      const mutations = await new Promise<QueuedMutation[]>((resolve) => {
        try {
          const tx = db.transaction(STORE_MUTATIONS, "readonly");
          const req = tx.objectStore(STORE_MUTATIONS).getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch {
          resolve([]);
        }
      });

      for (const mut of mutations) {
        try {
          if (mut.type === "update" && mut.payload) {
            await fetch(`/api/pages/${mut.pageId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(mut.payload),
            });
          } else if (mut.type === "delete") {
            await fetch(`/api/pages/${mut.pageId}`, { method: "DELETE" });
          }

          // Remove successfully synced mutation from persistent queue
          const txDone = db.transaction(STORE_MUTATIONS, "readwrite");
          txDone.objectStore(STORE_MUTATIONS).delete(mut.id);
        } catch (err) {
          console.warn(`Retry mutation ${mut.id} failed (attempt ${mut.retryCount + 1}):`, err);

          // Increment and PERSIST retryCount so it survives page reloads
          mut.retryCount++;

          if (mut.retryCount > 5) {
            // Drop unrecoverable poison-pill mutation after 5 failed attempts
            console.error(`Dropping unrecoverable mutation ${mut.id} after 5 retries.`);
            const txDrop = db.transaction(STORE_MUTATIONS, "readwrite");
            txDrop.objectStore(STORE_MUTATIONS).delete(mut.id);
          } else {
            // Write updated retryCount back to IndexedDB so count survives a reload
            const txUpdate = db.transaction(STORE_MUTATIONS, "readwrite");
            txUpdate.objectStore(STORE_MUTATIONS).put(mut);
          }
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }
}

// Global Singleton Local Store
export const localStore = new LocalStoreEngine();
