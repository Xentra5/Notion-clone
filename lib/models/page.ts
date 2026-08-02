import mongoose, { Schema, models, model } from "mongoose";

const BlockSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["paragraph", "heading", "to_do", "page", "code", "callout", "bulleted_list_item", "quote", "bullet"],
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
  },
  { timestamps: true }
);

// Compound index for fast lookups on upsert (userId + title)
PageSchema.index({ userId: 1, title: 1 }, { unique: true });

// Text search index for searching across pages
PageSchema.index({ title: "text", "blocks.properties.text": "text" });

const Page = models.Page || model("Page", PageSchema);

export default Page;
