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
    text: { type: String, required: true, trim: true, maxlength: 4000 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
