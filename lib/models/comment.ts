import { Schema, models, model } from "mongoose";

const CommentSchema = new Schema(
  {
    pageId: { type: String, required: true, index: true },
    blockId: { type: String, default: "" },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Comment = models.Comment || model("Comment", CommentSchema);

export default Comment;
