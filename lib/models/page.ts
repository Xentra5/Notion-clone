import mongoose, { Schema, models, model } from "mongoose";

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
    isAiMeetingNote: { type: Boolean, default: false },
    blocks: [BlockSchema],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);


// Text search index for searching across pages
PageSchema.index({ title: "text", "blocks.properties.text": "text" });

const Page = models.Page || model("Page", PageSchema);

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