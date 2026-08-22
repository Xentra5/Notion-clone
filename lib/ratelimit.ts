import { NextRequest } from "next/server";
import { MemoryCache } from "@/lib/cache";

// ─────────────────────────────────────────────────────────────────────────────
// Bounded in-memory store — replaces the previous raw Map which grew unbounded.
//
// MemoryCache provides:
//   • Automatic TTL expiry checked on every read
//   • A background sweep every 120s to reclaim memory from stale entries
//   • LRU eviction when the 10,000-entry cap is reached
//
// This is used as a fallback when Upstash Redis is not configured.
// ─────────────────────────────────────────────────────────────────────────────

interface RateLimitRecord {
  count: number;
  expiresAt: number;
}

const memoryStore = new MemoryCache({
  maxEntries: 10_000,          // ~10k unique IP+prefix combos before LRU eviction
  defaultTtlSeconds: 60,       // matches the default rate-limit window
  cleanupIntervalSeconds: 120, // sweep expired entries every 2 minutes
});

export interface RateLimitOptions {
  limit?: number;    // max requests per window
  windowMs?: number; // duration window in ms
}

export async function checkRateLimit(
  req: NextRequest,
  keyPrefix = "global",
  options: RateLimitOptions = {}
): Promise<{ success: boolean; limit: number; remaining: number }> {
  const limit = options.limit ?? 10;
  const windowMs = options.windowMs ?? 60 * 1000; // default 1 minute
  const windowSec = Math.ceil(windowMs / 1000);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  const record = memoryStore.get<RateLimitRecord>(key);

  // No record or previous window has expired — start a fresh window
  if (!record || now > record.expiresAt) {
    memoryStore.set(key, { count: 1, expiresAt: now + windowMs }, windowSec);
    return { success: true, limit, remaining: limit - 1 };
  }

  // Window still active but limit exceeded
  if (record.count >= limit) {
    return { success: false, limit, remaining: 0 };
  }

  // Increment in-place and re-store with remaining TTL
  const remainingWindowSec = Math.max(1, Math.ceil((record.expiresAt - now) / 1000));
  record.count += 1;
  memoryStore.set(key, record, remainingWindowSec);

  return { success: true, limit, remaining: limit - record.count };
}
