import mongoose, { Schema, Document } from "mongoose";

export interface IAgentMemory extends Document {
  userId: string;
  category: "preference" | "schedule_habit" | "workspace_fact" | "general";
  content: string;
  source?: string;
  importance?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AgentMemorySchema = new Schema<IAgentMemory>(
  {
    userId: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ["preference", "schedule_habit", "workspace_fact", "general"],
      default: "general",
    },
    content: { type: String, required: true, trim: true },
    source: { type: String, default: "chat" },
    importance: { type: Number, default: 1, min: 1, max: 5 },
  },
  { timestamps: true }
);

AgentMemorySchema.index({ userId: 1, createdAt: -1 });

if (process.env.NODE_ENV !== "production" && mongoose.models.AgentMemory) {
  mongoose.deleteModel("AgentMemory");
}

const AgentMemory =
  mongoose.models.AgentMemory ||
  mongoose.model<IAgentMemory>("AgentMemory", AgentMemorySchema);

export default AgentMemory;
