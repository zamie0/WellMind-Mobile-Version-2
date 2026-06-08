import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    counselorId: { type: String, required: true, index: true },
    userName: { type: String, default: "Anonymous" },
    counselorName: { type: String, default: "Counselor" },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date },
    unreadForUser: { type: Number, default: 0, min: 0 },
    unreadForCounselor: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

conversationSchema.index({ userId: 1, counselorId: 1 }, { unique: true });
conversationSchema.index({ counselorId: 1, updatedAt: -1 });
conversationSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
