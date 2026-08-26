/**
 * scripts/backfill-ancestors.mts
 *
 * One-time migration: populate the `ancestors` materialized-path field
 * for all existing pages that were created before this field existed.
 *
 * Run once with:
 *   npx tsx scripts/backfill-ancestors.mts
 *
 * Safe to re-run: already-populated root pages are skipped.
 */

import "dotenv/config";
import mongoose from "mongoose";

// ─── Minimal inline schema (avoids importing Next.js app modules) ─────────────

const PageSchema = new mongoose.Schema(
  {
    userId:       { type: String },
    parentPageId: { type: String, default: null },
    ancestors:    { type: [String], default: [] },
    title:        { type: String },
    deletedAt:    { type: Date, default: null },
  },
  { timestamps: true, strict: false }
);

const Page =
  (mongoose.models.Page as mongoose.Model<mongoose.Document>) ||
  mongoose.model("Page", PageSchema);

// ─── Types ────────────────────────────────────────────────────────────────────

type RawPage = {
  _id: mongoose.Types.ObjectId;
  parentPageId?: string | null;
  ancestors?: string[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Recursively build the full ancestors array for a page.
 * Uses an in-memory cache so each page is looked up at most once per run.
 */
async function buildAncestors(
  pageId: string,
  cache: Map<string, string[]>
): Promise<string[]> {
  if (cache.has(pageId)) return cache.get(pageId)!;

  const page = await Page.findById(pageId).select("parentPageId").lean() as RawPage | null;
  if (!page || !page.parentPageId) {
    cache.set(pageId, []);
    return [];
  }

  const parentAncestors = await buildAncestors(page.parentPageId, cache);
  const result = [...parentAncestors, page.parentPageId];
  cache.set(pageId, result);
  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌  MONGODB_URI env var is not set.");
    process.exit(1);
  }

  console.log("🔗  Connecting to MongoDB…");
  await mongoose.connect(uri, { family: 4 });
  console.log("✅  Connected.\n");

  // Only target child pages (parentPageId is set) whose ancestors haven't been
  // computed yet — i.e. ancestors is missing or still an empty array.
  const query = {
    parentPageId: { $nin: [null, ""] },
    $or: [{ ancestors: { $exists: false } }, { ancestors: { $size: 0 } }],
  };

  const total = await Page.countDocuments(query);
  console.log(`📄  Pages needing backfill: ${total}`);

  if (total === 0) {
    console.log("✅  Nothing to do — all child pages already have ancestors set.");
    await mongoose.disconnect();
    return;
  }

  const cache = new Map<string, string[]>();
  let processed = 0;
  const BATCH = 200;
  // Use any[] to sidestep the mongodb-vs-mongoose dual-type resolution conflict
  // that appears when importing mongoose types in a standalone tsx script.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bulkOps: any[] = [];

  const cursor = Page.find(query).select("_id parentPageId").lean().cursor();

  for await (const rawDoc of cursor) {
    const doc = rawDoc as RawPage;
    const ancestors = await buildAncestors(doc._id.toString(), cache);

    bulkOps.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { ancestors } },
      },
    });

    processed++;

    if (bulkOps.length >= BATCH) {
      await Page.bulkWrite(bulkOps.splice(0, BATCH));
      process.stdout.write(`  … ${processed} / ${total} updated\r`);
    }
  }

  if (bulkOps.length > 0) {
    await Page.bulkWrite(bulkOps);
  }

  console.log(`\n✅  Done. ${processed} pages backfilled.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
