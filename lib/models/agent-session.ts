import mongoose, { Schema, Document } from "mongoose";

export interface IToolCall {
  tool: string;
  input: string;
  output: string;
}

export interface IAgentMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  toolCalls?: IToolCall[];
  mode?: "fast" | "think" | "deepsearch";
  timestamp: Date;
}

export interface IAgentSession extends Document {
  userId: string;
  title: string;
  personaId: string;
  messages: IAgentMessage[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ToolCallSchema = new Schema<IToolCall>(
  {
    tool: { type: String, required: true },
    input: { type: String, default: "" },
    output: { type: String, default: "" },
  },
  { _id: false }
);

const AgentMessageSchema = new Schema<IAgentMessage>(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, required: true },
    toolCalls: { type: [ToolCallSchema], default: [] },
    mode: { type: String, enum: ["fast", "think", "deepsearch"], default: "fast" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AgentSessionSchema = new Schema<IAgentSession>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, default: "New Chat", trim: true },
    personaId: { type: String, default: "project_hr" },
    messages: { type: [AgentMessageSchema], default: [] },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AgentSessionSchema.index({ userId: 1, updatedAt: -1 });

if (process.env.NODE_ENV !== "production" && mongoose.models.AgentSession) {
  mongoose.deleteModel("AgentSession");
}

const AgentSession =
  mongoose.models.AgentSession ||
  mongoose.model<IAgentSession>("AgentSession", AgentSessionSchema);

export default AgentSession;
