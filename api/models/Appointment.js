import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: "Anonymous" },
    counselorId: { type: String, required: true, index: true },
    counselorName: { type: String, default: "Counselor" },
    appointmentDate: { type: String, required: true },
    slot: { type: String, required: true },
    consultationType: { type: String, enum: ["chat", "video"], default: "chat" },
    reminders: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      local: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ["requested", "confirmed", "completed", "cancelled", "missed"],
      default: "requested",
      index: true,
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

appointmentSchema.index({ counselorId: 1, appointmentDate: 1, slot: 1 });
appointmentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
