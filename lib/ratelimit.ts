import { NextRequest } from "next/server";

// Simple in-memory token bucket sliding window fallback for environments without Upstash Redis
const memoryStore = new Map<string, { count: number; expiresAt: number }>();

export interface RateLimitOptions {
  limit?: number; // max requests
  windowMs?: number; // duration window in ms
}

export async function checkRateLimit(
  req: NextRequest,
  keyPrefix = "global",
  options: RateLimitOptions = {}
): Promise<{ success: boolean; limit: number; remaining: number }> {
  const limit = options.limit || 10;
  const windowMs = options.windowMs || 60 * 1000; // default 1 minute

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  const record = memoryStore.get(key);

  if (!record || now > record.expiresAt) {
    memoryStore.set(key, { count: 1, expiresAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, limit, remaining: 0 };
  }

  record.count += 1;
  return { success: true, limit, remaining: limit - record.count };
}
