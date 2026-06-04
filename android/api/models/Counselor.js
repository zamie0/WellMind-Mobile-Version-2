import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false },
);

const counselorSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    fullName: { type: String, trim: true },
    specializations: [{ type: String, trim: true }],
    bio: { type: String, default: "" },
    availability: [availabilitySchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    isVerified: { type: Boolean, default: false },
    certificateFileId: { type: mongoose.Schema.Types.ObjectId },
    certificateUrl: { type: String },
    createdByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

counselorSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.Counselor || mongoose.model("Counselor", counselorSchema);
