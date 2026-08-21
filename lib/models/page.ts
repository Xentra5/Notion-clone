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
    isAiMeetingNote: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    permission: {
      type: String,
      enum: ["Private", "Workspace", "Public"],
      default: "Private",
    },
    blocks: [BlockSchema],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);


// Performance Indexes
PageSchema.index({ userId: 1, deletedAt: 1, updatedAt: -1 });
PageSchema.index({ parentPageId: 1, userId: 1, deletedAt: 1 });
PageSchema.index({ title: "text", "blocks.properties.text": "text" });

const Page = mongoose.models.Page || mongoose.model("Page", PageSchema);

export default Page;

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