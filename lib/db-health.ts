/**
 * db-health.ts
 *
 * Background health monitor for the database connection.
 *
 * Usage:
 *   - Call `startDbHealthMonitor()` once at app startup (e.g. in a layout or
 *     a middleware) to begin periodic pinging.
 *   - Call `stopDbHealthMonitor()` to stop it (e.g. during graceful shutdown).
 *   - Call `pingDatabase()` from the /api/health/db route for on-demand checks.
 */

import mongoose from "mongoose";
import {
  connectToDatabase,
  getActiveDbSource,
  isConnectionAlive,
  resetDbCache,
  type DbSource,
} from "./mongodb";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DbStatus = "ok" | "degraded" | "error";

export interface DbHealthResult {
  status: DbStatus;
  /** Which DB is serving traffic right now */
  active: DbSource | null;
  /** Round-trip ping latency in milliseconds, or null on error */
  latencyMs: number | null;
  /** ISO timestamp of when this check ran */
  checkedAt: string;
  /** Human-readable message */
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PING_INTERVAL_MS = 30_000; // Ping every 30 seconds

// ─────────────────────────────────────────────────────────────────────────────
// Monitor state
// ─────────────────────────────────────────────────────────────────────────────

let monitorInterval: ReturnType<typeof setInterval> | null = null;
let lastHealthResult: DbHealthResult | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Core ping logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Performs a lightweight ping against the active MongoDB connection.
 * If the ping fails, the connection cache is reset so the next API request
 * automatically triggers the primary→backup failover logic.
 */
export async function pingDatabase(): Promise<DbHealthResult> {
  const checkedAt = new Date().toISOString();
  const t0 = Date.now();

  // ── Ensure we have (or re-establish) a connection first ─────────────────
  try {
    await connectToDatabase();
  } catch (err) {
    const result: DbHealthResult = {
      status: "error",
      active: null,
      latencyMs: null,
      checkedAt,
      message: `Cannot connect to any database: ${(err as Error).message}`,
    };
    lastHealthResult = result;
    return result;
  }

  // ── Send a lightweight adminCommand ping ────────────────────────────────
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error("No db instance on mongoose connection");

    await db.admin().command({ ping: 1 });
    const latencyMs = Date.now() - t0;
    const active = getActiveDbSource();

    const result: DbHealthResult = {
      status: active === "BACKUP" ? "degraded" : "ok",
      active,
      latencyMs,
      checkedAt,
      message:
        active === "BACKUP"
          ? "Running on BACKUP database — primary is unreachable"
          : "Primary database is healthy",
    };
    lastHealthResult = result;
    return result;
  } catch (err) {
    // Ping failed on an existing connection — mark it dead so the next
    // request triggers a fresh failover attempt.
    console.error("[DB Health] Ping failed:", (err as Error).message);
    resetDbCache();

    const result: DbHealthResult = {
      status: "error",
      active: null,
      latencyMs: null,
      checkedAt,
      message: `Database ping failed: ${(err as Error).message}`,
    };
    lastHealthResult = result;
    return result;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Monitor lifecycle
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Start a background interval that pings the database every 30 seconds.
 *
 * Safe to call multiple times — subsequent calls are no-ops if the monitor
 * is already running.
 *
 * NOTE: Only call this in long-lived server environments (e.g. a custom
 * Next.js server or a sidecar process). In standard serverless / edge
 * deployments, use the /api/health/db route with an external uptime monitor
 * (e.g. UptimeRobot) to trigger pings instead.
 */
export function startDbHealthMonitor(): void {
  if (monitorInterval) return; // Already running

  console.log(
    `[DB Health] Monitor started — pinging every ${PING_INTERVAL_MS / 1000}s`
  );

  monitorInterval = setInterval(async () => {
    const result = await pingDatabase();

    if (result.status === "ok") {
      console.log(
        `[DB Health] ✅ ${result.active} | ${result.latencyMs}ms | ${result.checkedAt}`
      );
    } else if (result.status === "degraded") {
      console.warn(
        `[DB Health] ⚠️  DEGRADED — running on BACKUP | ${result.latencyMs}ms | ${result.checkedAt}`
      );
    } else {
      console.error(
        `[DB Health] 🚨 ERROR — both databases unreachable | ${result.checkedAt}`
      );
    }
  }, PING_INTERVAL_MS);
}

/**
 * Stop the background health monitor (e.g. during graceful shutdown).
 */
export function stopDbHealthMonitor(): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    console.log("[DB Health] Monitor stopped");
  }
}

/**
 * Returns the most recent health result without performing a new ping.
 * Returns null if no ping has been performed yet.
 */
export function getLastHealthResult(): DbHealthResult | null {
  return lastHealthResult;
}
