import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
    role: { type: String, enum: ["user"], default: "user", immutable: true },
    pinHash: { type: String },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
    assignedCounselor: { type: mongoose.Schema.Types.ObjectId, ref: "Counselor" },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    profile: {
      reminderTime: String,
      onboardingCompleted: { type: Boolean, default: false },
      notificationsEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
