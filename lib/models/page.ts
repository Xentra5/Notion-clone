import mongoose, { Schema } from "mongoose";

const BlockSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      default: "paragraph",
    },
    properties: {
      title: { type: String, default: "" },
      text: { type: String, default: "" },
      checked: { type: Boolean, default: false },
      language: { type: String, default: "" },
      subPageId: { type: String, default: "" },
      kanbanColumns: { type: Schema.Types.Mixed, default: [] },
      url: { type: String, default: "" },
      fileName: { type: String, default: "" },
      fileSize: { type: String, default: "" },
      toggleChildren: { type: String, default: "" },
      calloutIcon: { type: String, default: "" },
      tableData: { type: Schema.Types.Mixed, default: [] },
    },
    content: [{ type: String }],
    parent: { type: String, default: "workspace" },
  },
  { _id: false, timestamps: false }
);

const PageSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, default: "Untitled" },
    icon: { type: String, default: "📄" },
    coverImage: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Private", "Shared", "Meetings"],
      default: "Private",
    },
    parentPageId: { type: String, default: null, index: true },
    /**
     * Materialized Path: ordered list of ancestor page IDs from root → direct parent.
     * e.g. root page  → ancestors: []
     *      child page → ancestors: ["rootId"]
     *      grandchild → ancestors: ["rootId", "childId"]
     *
     * Enables O(1) subtree queries: Page.find({ ancestors: pageId })
     * instead of N+1 recursive MongoDB round-trips.
     */
    ancestors: { type: [String], default: [] },
    isAiMeetingNote: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    permission: {
      type: String,
      enum: ["Private", "Workspace", "Public"],
      default: "Private",
    },
    // The document body stays in blocks; this powers collection-style views.
    workspaceMeta: {
      kind: { type: String, enum: ["page", "guide", "sop", "template", "task"], default: "page" },
      description: { type: String, default: "" },
      tags: { type: [String], default: [] },
      owner: { type: String, default: "" },
      verifiedAt: { type: String, default: "" },
      verificationExpiresAt: { type: String, default: "" },
      templateSourceId: { type: String, default: "" },
      templateUses: { type: Number, default: 0 },
      task: {
        due: { type: String, default: "" },
        priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
        status: { type: String, enum: ["open", "done"], default: "open" },
      },
    },
    blocks: [BlockSchema],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);


// Performance Indexes
PageSchema.index({ userId: 1, deletedAt: 1, updatedAt: -1 });
PageSchema.index({ parentPageId: 1, userId: 1, deletedAt: 1 });
PageSchema.index({ userId: 1, isStarred: 1, deletedAt: 1 });
PageSchema.index({ userId: 1, category: 1, deletedAt: 1, updatedAt: -1 });
// Materialized path index — powers O(1) subtree queries
PageSchema.index({ ancestors: 1, userId: 1 });
PageSchema.index({ title: "text", "blocks.properties.text": "text" });
PageSchema.index({ userId: 1, "workspaceMeta.kind": 1, updatedAt: -1 });

const Page = mongoose.models.Page || mongoose.model("Page", PageSchema);

export default Page;

/**
 * Resolve the full ancestor chain (root → parent) for a given parentPageId.
 * Returns an empty array if parentPageId is null.
 *
 * Uses the stored `ancestors` field on the parent to reconstruct the path in
 * a single DB read — O(1) instead of an N-deep recursive walk.
 */
export async function resolveAncestors(parentPageId: string | null): Promise<string[]> {
  if (!parentPageId) return [];
  const parent = await Page.findById(parentPageId).select("ancestors").lean() as { ancestors?: string[] } | null;
  if (!parent) return [];
  return [...(parent.ancestors ?? []), parentPageId];
}

let legacyTitleIndexMigration: Promise<void> | null = null;

/** Remove the old schema index that incorrectly allowed only one title per user. */
export async function removeLegacyTitleIndex() {
  if (!legacyTitleIndexMigration) {
    legacyTitleIndexMigration = Page.collection
      .dropIndex("userId_1_title_1")
      .then(() => undefined)
      .catch((error: { code?: number }) => {
        // MongoDB error 27 means the index is already absent.
        if (error.code !== 27) throw error;
      });
  }
  await legacyTitleIndexMigration;
}
