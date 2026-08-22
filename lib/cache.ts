import crypto from "crypto";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export interface CacheStats {
  size: number;
  maxEntries: number;
  hits: number;
  misses: number;
  evictions: number;
  expiredCleaned: number;
}

export interface MemoryCacheOptions {
  maxEntries?: number;
  defaultTtlSeconds?: number;
  cleanupIntervalSeconds?: number;
}

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxEntries: number;
  private defaultTtlSeconds: number;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private expiredCleaned = 0;

  constructor(options: number | MemoryCacheOptions = 2000) {
    if (typeof options === "number") {
      this.maxEntries = options;
      this.defaultTtlSeconds = 60;
    } else {
      this.maxEntries = options.maxEntries ?? 2000;
      this.defaultTtlSeconds = options.defaultTtlSeconds ?? 60;
    }

    const cleanupInterval =
      typeof options === "object" && options.cleanupIntervalSeconds !== undefined
        ? options.cleanupIntervalSeconds
        : 60;

    if (cleanupInterval > 0 && typeof setInterval !== "undefined") {
      this.cleanupTimer = setInterval(() => {
        this.cleanExpired();
      }, cleanupInterval * 1000);

      // Prevent background timer from blocking process exit
      if (this.cleanupTimer && typeof (this.cleanupTimer as NodeJS.Timeout).unref === "function") {
        (this.cleanupTimer as NodeJS.Timeout).unref();
      }
    }
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.expiredCleaned++;
      this.misses++;
      return null;
    }

    // Refresh order in Map for LRU semantics
    this.store.delete(key);
    this.store.set(key, entry);

    this.hits++;
    return entry.value as T;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.expiredCleaned++;
      return false;
    }

    return true;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds !== undefined ? ttlSeconds : this.defaultTtlSeconds;

    // If key already exists, delete first to update value and reset order
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxEntries) {
      // 1. First sweep expired items to reclaim space
      this.cleanExpired();

      // 2. If still at capacity, evict oldest / least-recently-used item
      if (this.store.size >= this.maxEntries) {
        const oldestKey = this.store.keys().next().value;
        if (oldestKey !== undefined) {
          this.store.delete(oldestKey);
          this.evictions++;
        }
      }
    }

    const now = Date.now();
    this.store.set(key, {
      value,
      expiresAt: now + ttl * 1000,
      createdAt: now,
    });
  }

  /**
   * Returns remaining TTL in seconds for a given key, or -1 if missing or expired.
   */
  getRemainingTtl(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return -1;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.store.delete(key);
      this.expiredCleaned++;
      return -1;
    }

    return Math.max(0, Math.ceil((entry.expiresAt - now) / 1000));
  }

  /**
   * Sweeps and removes all expired entries from memory.
   * Returns the count of removed expired keys.
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        cleaned++;
      }
    }
    this.expiredCleaned += cleaned;
    return cleaned;
  }

  invalidate(key: string): boolean {
    return this.store.delete(key);
  }

  invalidatePrefix(prefix: string): number {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  getStats(): CacheStats {
    return {
      size: this.store.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      expiredCleaned: this.expiredCleaned,
    };
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.store.clear();
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

export const serverCache =
  global.__appServerCache ||
  new MemoryCache({
    maxEntries: 3000,
    defaultTtlSeconds: 60,
    cleanupIntervalSeconds: 60,
  });

if (process.env.NODE_ENV !== "production") {
  global.__appServerCache = serverCache;
}
