import mongoose from "mongoose";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DbSource = "PRIMARY" | "BACKUP";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  activeSource: DbSource | null;
}

declare global {
  var mongooseCached: MongooseCache;
}

// ─────────────────────────────────────────────────────────────────────────────
// Global cache (survives hot-reloads in dev / serverless reuse in prod)
// ─────────────────────────────────────────────────────────────────────────────

let cached = global.mongooseCached;

if (!cached) {
  cached = global.mongooseCached = {
    conn: null,
    promise: null,
    activeSource: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared connection options
// ─────────────────────────────────────────────────────────────────────────────

const CONNECT_OPTS: mongoose.ConnectOptions = {
  bufferCommands: false,
  family: 4,                      // Force IPv4 — avoids 30s DNS hang on Windows & Atlas
  serverSelectionTimeoutMS: 5000, // Give up on a server after 5s (not the default 30s)
  connectTimeoutMS: 8000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Attempt a single mongoose.connect() call. Returns null on any failure. */
async function tryConnect(
  uri: string,
  label: DbSource
): Promise<typeof mongoose | null> {
  try {
    // Disconnect any lingering connection first so we start clean
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    const instance = await mongoose.connect(uri, CONNECT_OPTS);
    console.log(`[DB] ✅ Connected to ${label} database`);
    return instance;
  } catch (err) {
    console.error(
      `[DB] ❌ Failed to connect to ${label} database:`,
      (err as Error).message
    );
    return null;
  }
}

/** Returns true when the cached mongoose connection is alive. */
export function isConnectionAlive(): boolean {
  return (
    cached.conn !== null && mongoose.connection.readyState === 1
  );
}

/** Returns which DB source is currently being used, or null if disconnected. */
export function getActiveDbSource(): DbSource | null {
  return isConnectionAlive() ? cached.activeSource : null;
}

/** Force-reset the cache so the next call to connectToDatabase() re-connects. */
export function resetDbCache(): void {
  cached.conn = null;
  cached.promise = null;
  cached.activeSource = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main connection function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Connect to the database with automatic failover.
 *
 * Strategy:
 *   1. Return the cached connection if it is still alive.
 *   2. Try the PRIMARY_MONGODB_URI.
 *   3. On failure, try the BACKUP_MONGODB_URI.
 *   4. If both fail, throw — the caller must handle the error.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // ── Fast path: healthy cached connection ────────────────────────────────
  if (isConnectionAlive()) {
    return cached.conn!;
  }

  // If there is a pending promise (another concurrent request is already
  // connecting), wait for it to resolve so we don't spawn duplicate connections.
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      if (isConnectionAlive()) return cached.conn!;
    } catch {
      // The in-flight connection failed; reset and fall through to retry logic.
    }
    cached.promise = null;
    cached.conn = null;
  }

  const primaryUri = process.env.MONGODB_URI;
  const backupUri = process.env.MONGODB_BACKUP_URI;

  if (!primaryUri) {
    throw new Error(
      "[DB] MONGODB_URI is not defined. Set it in your .env file."
    );
  }

  // ── Try PRIMARY ─────────────────────────────────────────────────────────
  cached.promise = (async () => {
    let instance = await tryConnect(primaryUri, "PRIMARY");

    if (instance) {
      cached.activeSource = "PRIMARY";
      return instance;
    }

    // ── Try BACKUP ───────────────────────────────────────────────────────
    if (!backupUri) {
      throw new Error(
        "[DB] PRIMARY database is unreachable and MONGODB_BACKUP_URI is not defined. " +
          "Add a backup connection string to your .env file."
      );
    }

    console.warn("[DB] ⚠️  Primary failed — attempting failover to BACKUP database…");
    instance = await tryConnect(backupUri, "BACKUP");

    if (instance) {
      cached.activeSource = "BACKUP";
      return instance;
    }

    throw new Error(
      "[DB] 🚨 Both PRIMARY and BACKUP databases are unreachable. " +
        "Check your connection strings and cluster status."
    );
  })();

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset so the next request triggers a fresh attempt rather than
    // waiting on a rejected promise forever.
    cached.promise = null;
    cached.conn = null;
    cached.activeSource = null;
    throw e;
  }

  return cached.conn;
}
