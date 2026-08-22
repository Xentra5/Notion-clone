import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db-health";

/**
 * GET /api/health/db
 *
 * On-demand database health check.
 *
 * Response shape:
 * ```json
 * {
 *   "status":    "ok" | "degraded" | "error",
 *   "active":    "PRIMARY" | "BACKUP" | null,
 *   "latencyMs": 12 | null,
 *   "checkedAt": "2026-08-23T00:00:00.000Z",
 *   "message":   "Primary database is healthy"
 * }
 * ```
 *
 * HTTP status codes:
 *   200 → ok or degraded (backup is running, so the app is still operational)
 *   503 → error (no database available — the app cannot serve requests)
 *
 * Use this route with an external uptime monitor (UptimeRobot, BetterStack,
 * etc.) to get alerted the moment your primary DB goes down.
 */
export async function GET() {
  const result = await pingDatabase();

  const httpStatus = result.status === "error" ? 503 : 200;

  return NextResponse.json(result, { status: httpStatus });
}
