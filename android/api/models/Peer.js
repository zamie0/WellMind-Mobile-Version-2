import mongoose from "mongoose";

const peerSchema = new mongoose.Schema(
  {
    displayName: { type: String, required: true, trim: true },
    isAnonymous: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["online", "offline", "away", "busy"],
      default: "online",
    },
    bio: { type: String, default: "" },
    supportTopics: [{ type: String, trim: true }],
    specialization: { type: String, trim: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    experienceYears: { type: Number, default: 0, min: 0 },
    consultationMethods: [
      {
        type: String,
        enum: ["chat", "video"],
      },
    ],
    isActive: { type: Boolean, default: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

peerSchema.index({ displayName: 1 });
peerSchema.index({ isActive: 1, status: 1 });

export default mongoose.models.Counselor || mongoose.model("Counselor", peerSchema);
