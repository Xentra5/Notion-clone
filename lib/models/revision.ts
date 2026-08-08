import { Schema, models, model } from "mongoose";

const RevisionSchema = new Schema(
  {
    pageId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    blocks: { type: Schema.Types.Mixed, default: [] },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

const Revision = models.Revision || model("Revision", RevisionSchema);

export default Revision;
