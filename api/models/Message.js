import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: { type: String, required: true, index: true },
    senderRole: { type: String, enum: ["user", "counselor"], required: true },
    senderName: { type: String, default: "" },
    text: { type: String, default: "", trim: true, maxlength: 4000 },
    attachment: {
      id: { type: String },
      name: { type: String, trim: true, maxlength: 180 },
      type: { type: String, enum: ["image", "file"] },
      mimeType: { type: String, trim: true, maxlength: 120 },
      base64: { type: String, maxlength: 7000000 },
      size: { type: Number, min: 0, max: 5 * 1024 * 1024 },
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
