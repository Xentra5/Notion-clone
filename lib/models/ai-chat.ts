import mongoose, { Schema } from "mongoose";

const ChatMessageSchema = new Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  text: { type: String, required: true },
  citations: { type: [Schema.Types.Mixed], default: [] },
  source: { type: String, default: "" },
}, { _id: false });

const AiChatSchema = new Schema({
  userId: { type: String, required: true, index: true },
  pageId: { type: String, default: "workspace", index: true },
  messages: { type: [ChatMessageSchema], default: [] },
}, { timestamps: true });

if (process.env.NODE_ENV !== "production" && mongoose.models.AiChat) mongoose.deleteModel("AiChat");
const AiChat = mongoose.models.AiChat || mongoose.model("AiChat", AiChatSchema);
export default AiChat;
