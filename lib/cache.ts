import crypto from "crypto";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxEntries: number;

  constructor(maxEntries = 2000) {
    this.maxEntries = maxEntries;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds = 60): void {
    if (this.store.size >= this.maxEntries) {
      // Evict oldest entry (first insertion in Map)
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

/** Generate deterministic hash for queries, prompt text, and payloads */
export function hashQuery(input: string): string {
  return crypto.createHash("sha256").update(input.trim().toLowerCase()).digest("hex").slice(0, 16);
}

// Global cache instance to survive Next.js dev server hot module reloading
declare global {
  // eslint-disable-next-line no-var
  var __appServerCache: MemoryCache | undefined;
}

export const serverCache = global.__appServerCache || new MemoryCache(3000);

if (process.env.NODE_ENV !== "production") {
  global.__appServerCache = serverCache;
}
