/**
 * lib/cache.ts
 *
 * Dual-Tier Distributed Cache Engine (L1 Fast In-Memory + L2 Distributed Redis / Upstash)
 * 
 * Architecture:
 * 1. L1 (In-Memory LRU Cache): Sub-millisecond reads (<0.1ms), local to the current process.
 * 2. L2 (Distributed Cache via Upstash REST / Redis): Shared across all serverless instances,
 *    lambdas, and containers. Works with zero extra native dependencies via HTTP REST API.
 * 3. Graceful Fallback: If Redis/Upstash is not configured, silently operates in pure L1 mode.
 * 4. 100% Backward Compatible: Existing synchronous `serverCache.get()`, `serverCache.set()`,
 *    `serverCache.invalidate()`, and `serverCache.invalidatePrefix()` work seamlessly with
 *    automatic background write-through and invalidation.
 */

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
  l2Enabled: boolean;
  l2Hits: number;
  l2Misses: number;
  l2Sets: number;
  l2Errors: number;
}

export interface MemoryCacheOptions {
  maxEntries?: number;
  defaultTtlSeconds?: number;
  cleanupIntervalSeconds?: number;
  upstashUrl?: string;
  upstashToken?: string;
}

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxEntries: number;
  private defaultTtlSeconds: number;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  // L1 Metrics
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private expiredCleaned = 0;

  // L2 Distributed Config & Metrics
  private upstashUrl: string | null = null;
  private upstashToken: string | null = null;
  private l2Hits = 0;
  private l2Misses = 0;
  private l2Sets = 0;
  private l2Errors = 0;

  constructor(options: number | MemoryCacheOptions = 3000) {
    if (typeof options === "number") {
      this.maxEntries = options;
      this.defaultTtlSeconds = 60;
    } else {
      this.maxEntries = options.maxEntries ?? 3000;
      this.defaultTtlSeconds = options.defaultTtlSeconds ?? 60;
      this.upstashUrl = options.upstashUrl ?? process.env.UPSTASH_REDIS_REST_URL ?? null;
      this.upstashToken = options.upstashToken ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? null;
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

  // ───────────────────────────────────────────────────────────────────────────
  // L2 Upstash / Redis REST Driver
  // ───────────────────────────────────────────────────────────────────────────

  private isL2Configured(): boolean {
    const url = this.upstashUrl || process.env.UPSTASH_REDIS_REST_URL;
    const token = this.upstashToken || process.env.UPSTASH_REDIS_REST_TOKEN;
    return Boolean(url && token && url.startsWith("http") && !token.includes("replace_with"));
  }

  private async callL2<T = unknown>(command: string[]): Promise<T | null> {
    if (!this.isL2Configured()) return null;

    const url = this.upstashUrl || process.env.UPSTASH_REDIS_REST_URL;
    const token = this.upstashToken || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) {
        this.l2Errors++;
        return null;
      }

      const json = (await res.json()) as { result?: T };
      return json.result ?? null;
    } catch {
      this.l2Errors++;
      return null;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Core L1 Operations (Synchronous, Sub-Millisecond)
  // ───────────────────────────────────────────────────────────────────────────

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

    // Bump LRU order
    this.store.delete(key);
    this.store.set(key, entry);

    return true;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds !== undefined ? ttlSeconds : this.defaultTtlSeconds;

    // 1. Write to L1 Memory
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxEntries) {
      this.cleanExpired();
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

    // 2. Asynchronous write-through to L2 Distributed Redis
    if (this.isL2Configured()) {
      void this.setL2Async(key, value, ttl);
    }
  }

  private async setL2Async<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      const payload = typeof value === "string" ? value : JSON.stringify(value);
      await this.callL2(["SET", `notion:${key}`, payload, "EX", String(ttlSeconds)]);
      this.l2Sets++;
    } catch {
      this.l2Errors++;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Dual-Tier Asynchronous Distributed Read / Fetch
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Reads from L1 Memory first (<0.1ms). If missed, checks L2 Distributed Redis (~5-15ms).
   * If found in L2, warms L1 and returns the value.
   */
  async getDistributed<T>(key: string): Promise<T | null> {
    // 1. L1 Check
    const l1Value = this.get<T>(key);
    if (l1Value !== null) {
      return l1Value;
    }

    // 2. L2 Distributed Check
    if (this.isL2Configured()) {
      try {
        const l2Raw = await this.callL2<string>(["GET", `notion:${key}`]);
        if (l2Raw !== null) {
          let parsed: T;
          try {
            parsed = JSON.parse(l2Raw) as T;
          } catch {
            parsed = l2Raw as unknown as T;
          }

          // Warm L1 for subsequent sub-ms reads
          this.set(key, parsed, this.defaultTtlSeconds);
          this.l2Hits++;
          return parsed;
        } else {
          this.l2Misses++;
        }
      } catch {
        this.l2Errors++;
      }
    }

    return null;
  }

  /**
   * Dual-tier Stale-While-Revalidate Helper:
   * Checks L1 -> L2 -> calls fetcher() -> writes through to L1 + L2.
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.getDistributed<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Dual Invalidation (L1 + L2)
  // ───────────────────────────────────────────────────────────────────────────

  invalidate(key: string): boolean {
    const deleted = this.store.delete(key);

    // Asynchronous L2 invalidation
    if (this.isL2Configured()) {
      void this.callL2(["DEL", `notion:${key}`]);
    }

    return deleted;
  }

  invalidatePrefix(prefix: string): number {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }

    // Purge prefix from L2 if configured (via SCAN + DEL)
    if (this.isL2Configured()) {
      void (async () => {
        try {
          const scanRes = await this.callL2<[string, string[]]>([
            "SCAN",
            "0",
            "MATCH",
            `notion:${prefix}*`,
            "COUNT",
            "100",
          ]);
          if (scanRes && Array.isArray(scanRes[1]) && scanRes[1].length > 0) {
            await this.callL2(["DEL", ...scanRes[1]]);
          }
        } catch {
          // Graceful ignore
        }
      })();
    }

    return count;
  }

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
      l2Enabled: this.isL2Configured(),
      l2Hits: this.l2Hits,
      l2Misses: this.l2Misses,
      l2Sets: this.l2Sets,
      l2Errors: this.l2Errors,
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

// Global Singleton Cache Instance
declare global {
  // eslint-disable-next-line no-var
  var __appServerCache: MemoryCache | undefined;
}

if (!global.__appServerCache) {
  global.__appServerCache = new MemoryCache({
    maxEntries: 4000,
    defaultTtlSeconds: 60,
    cleanupIntervalSeconds: 60,
  });
}

// Always export the global singleton
export const serverCache = global.__appServerCache;
