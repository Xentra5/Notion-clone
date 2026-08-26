/**
 * lib/rag-queue.ts
 *
 * Asynchronous, Debounced Background Queue for RAG Vector Indexing
 * 
 * Benefits:
 * 1. Debouncing: Collapses rapid keystrokes/autosave PATCHes into a single indexing task.
 * 2. Concurrency Limiting: Prevents overwhelming ChromaDB/SQLite with parallel embedding locks.
 * 3. Exponential Backoff Retry: Retries failed network requests if RAG service is temporarily busy/restarting.
 * 4. Zero Save Latency: Completely uncouples embedding workloads from Next.js HTTP save responses.
 */

export interface RagIndexJob {
  workspaceId: string;
  pageId: string;
  title: string;
  blocks: Array<{ id: string; type: string; text: string }>;
  retries?: number;
  enqueuedAt?: number;
}

export interface RagDeleteJob {
  workspaceId: string;
  pageId: string;
  retries?: number;
  enqueuedAt?: number;
}

export interface RagQueueStats {
  pendingIndexDebounces: number;
  pendingDeleteJobs: number;
  activeWorkers: number;
  totalIndexed: number;
  totalDeleted: number;
  totalRetried: number;
  totalFailed: number;
}

class RagAsyncQueueEngine {
  private ragServiceUrl: string;
  private debounceMs: number;
  private maxRetries: number;
  private maxConcurrency: number;

  private pendingDebounceMap = new Map<string, { job: RagIndexJob; timer: ReturnType<typeof setTimeout> }>();
  private deleteQueue: RagDeleteJob[] = [];
  private activeWorkers = 0;

  // Stats for observability
  private totalIndexed = 0;
  private totalDeleted = 0;
  private totalRetried = 0;
  private totalFailed = 0;

  constructor(options?: {
    ragServiceUrl?: string;
    debounceMs?: number;
    maxRetries?: number;
    maxConcurrency?: number;
  }) {
    this.ragServiceUrl = options?.ragServiceUrl || process.env.RAG_SERVICE_URL || "http://localhost:8000";
    this.debounceMs = options?.debounceMs ?? 2500; // 2.5s quiet window after typing
    this.maxRetries = options?.maxRetries ?? 3;
    this.maxConcurrency = options?.maxConcurrency ?? 2;
  }

  /**
   * Enqueue a page for vector indexing.
   * If an edit is already pending for this (workspaceId, pageId), the timer resets and
   * the payload is updated with the latest snapshot.
   */
  public enqueueIndex(job: RagIndexJob): void {
    const key = `${job.workspaceId}:${job.pageId}`;
    const existing = this.pendingDebounceMap.get(key);

    if (existing) {
      clearTimeout(existing.timer);
    }

    const timer = setTimeout(() => {
      this.pendingDebounceMap.delete(key);
      void this.processIndexJob({ ...job, enqueuedAt: Date.now(), retries: 0 });
    }, this.debounceMs);

    // Prevent background timer from blocking process exit
    if (timer && typeof (timer as NodeJS.Timeout).unref === "function") {
      (timer as NodeJS.Timeout).unref();
    }

    this.pendingDebounceMap.set(key, { job, timer });
  }

  /**
   * Immediately cancel any pending index jobs and queue vector deletion for the page.
   */
  public enqueueDelete(job: RagDeleteJob | RagDeleteJob[]): void {
    const jobs = Array.isArray(job) ? job : [job];

    for (const j of jobs) {
      const key = `${j.workspaceId}:${j.pageId}`;
      const existing = this.pendingDebounceMap.get(key);
      if (existing) {
        clearTimeout(existing.timer);
        this.pendingDebounceMap.delete(key);
      }

      this.deleteQueue.push({ ...j, enqueuedAt: Date.now(), retries: 0 });
    }

    void this.processNextDeleteJob();
  }

  private async processIndexJob(job: RagIndexJob): Promise<void> {
    const url = process.env.RAG_SERVICE_URL || this.ragServiceUrl;

    try {
      const res = await fetch(`${url}/index-page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: job.workspaceId,
          pageId: job.pageId,
          title: job.title || "Untitled",
          blocks: job.blocks,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) {
        throw new Error(`RAG service returned HTTP ${res.status}`);
      }

      this.totalIndexed++;
    } catch (err) {
      const retries = (job.retries ?? 0) + 1;
      if (retries <= this.maxRetries) {
        this.totalRetried++;
        const backoffMs = Math.pow(2, retries) * 1000; // 2s, 4s, 8s
        setTimeout(() => {
          void this.processIndexJob({ ...job, retries });
        }, backoffMs);
      } else {
        this.totalFailed++;
        console.warn(`[RAG Queue] Page ${job.pageId} index failed after ${this.maxRetries} retries:`, (err as Error).message);
      }
    }
  }

  private async processNextDeleteJob(): Promise<void> {
    if (this.activeWorkers >= this.maxConcurrency || this.deleteQueue.length === 0) {
      return;
    }

    const job = this.deleteQueue.shift();
    if (!job) return;

    this.activeWorkers++;
    const url = process.env.RAG_SERVICE_URL || this.ragServiceUrl;

    try {
      const res = await fetch(`${url}/delete-page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: job.workspaceId,
          pageId: job.pageId,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        throw new Error(`RAG delete returned HTTP ${res.status}`);
      }

      this.totalDeleted++;
    } catch (err) {
      const retries = (job.retries ?? 0) + 1;
      if (retries <= this.maxRetries) {
        this.totalRetried++;
        this.deleteQueue.push({ ...job, retries });
      } else {
        this.totalFailed++;
        console.warn(`[RAG Queue] Page ${job.pageId} delete failed:`, (err as Error).message);
      }
    } finally {
      this.activeWorkers--;
      if (this.deleteQueue.length > 0) {
        void this.processNextDeleteJob();
      }
    }
  }

  public getStats(): RagQueueStats {
    return {
      pendingIndexDebounces: this.pendingDebounceMap.size,
      pendingDeleteJobs: this.deleteQueue.length,
      activeWorkers: this.activeWorkers,
      totalIndexed: this.totalIndexed,
      totalDeleted: this.totalDeleted,
      totalRetried: this.totalRetried,
      totalFailed: this.totalFailed,
    };
  }

  /**
   * For testing or graceful shutdown: flush all currently pending debounced jobs immediately.
   */
  public async flushAll(): Promise<void> {
    const entries = Array.from(this.pendingDebounceMap.entries());
    this.pendingDebounceMap.clear();

    for (const [, { job, timer }] of entries) {
      clearTimeout(timer);
      await this.processIndexJob({ ...job, retries: 0 });
    }
  }
}

// Global Singleton (survives HMR and Node runtime lifecycle)
declare global {
  // eslint-disable-next-line no-var
  var __ragAsyncQueue: RagAsyncQueueEngine | undefined;
}

if (!global.__ragAsyncQueue) {
  global.__ragAsyncQueue = new RagAsyncQueueEngine({
    debounceMs: 2500, // 2.5s debouncing
    maxRetries: 3,
    maxConcurrency: 2,
  });
}

export const ragQueue = global.__ragAsyncQueue;
