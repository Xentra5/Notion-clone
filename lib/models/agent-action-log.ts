import mongoose, { Schema, Document } from "mongoose";

export interface IAgentActionLog extends Document {
  userId: string;
  actionType:
    | "create_calendar_event"
    | "update_calendar_event"
    | "delete_calendar_event"
    | "create_page"
    | "update_page"
    | "remember_fact";
  entityId?: string;
  entityTitle: string;
  details: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AgentActionLogSchema = new Schema<IAgentActionLog>(
  {
    userId: { type: String, required: true, index: true },
    actionType: {
      type: String,
      required: true,
      enum: [
        "create_calendar_event",
        "update_calendar_event",
        "delete_calendar_event",
        "create_page",
        "update_page",
        "remember_fact",
      ],
    },
    entityId: { type: String, default: "" },
    entityTitle: { type: String, required: true },
    details: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AgentActionLogSchema.index({ userId: 1, createdAt: -1 });

if (process.env.NODE_ENV !== "production" && mongoose.models.AgentActionLog) {
  mongoose.deleteModel("AgentActionLog");
}

const AgentActionLog =
  mongoose.models.AgentActionLog ||
  mongoose.model<IAgentActionLog>("AgentActionLog", AgentActionLogSchema);

export default AgentActionLog;
