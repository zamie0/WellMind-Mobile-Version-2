import connectDB from "../../config/db.js";
import Appointment from "../models/Appointment.js";
import Counselor from "../models/Counselor.js";

const toDto = (appointment) => ({
  id: appointment._id.toString(),
  userId: appointment.userId,
  userName: appointment.userName,
  clientId: appointment.userId,
  clientName: appointment.userName,
  counselorId: appointment.counselorId,
  counselorName: appointment.counselorName,
  appointmentDate: appointment.appointmentDate,
  slot: appointment.slot,
  consultationType: appointment.consultationType,
  reminders: appointment.reminders,
  status: appointment.status,
  notes: appointment.notes,
  persistence: "remote",
  createdAt: appointment.createdAt,
  updatedAt: appointment.updatedAt,
});

const emitAppointment = (req, appointment) => {
  const io = req.app.get("io");
  if (!io) return;
  const dto = toDto(appointment);
  io.to(`user:${dto.userId}`).to(`counselor:${dto.counselorId}`).emit("appointment:updated", dto);
};

export async function listAppointments(req, res) {
  try {
    await connectDB();
    const { role, participantId } = req.query;
    if (!["user", "counselor"].includes(role) || !String(participantId || "").trim()) {
      return res.status(400).json({ message: "Valid role and participantId are required" });
    }

    const filter = role === "user" ? { userId: participantId } : { counselorId: participantId };
    const appointments = await Appointment.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.status(200).json({ appointments: appointments.map(toDto) });
  } catch (error) {
    console.error("Failed to list appointments:", error);
    return res.status(500).json({ message: "Failed to list appointments" });
  }
}

export async function createAppointment(req, res) {
  try {
    await connectDB();
    const {
      userId,
      userName,
      counselorId,
      appointmentDate,
      slot,
      consultationType,
      reminders,
      notes,
    } = req.body || {};

    if (!String(userId || "").trim() || !String(counselorId || "").trim() || !appointmentDate || !slot) {
      return res.status(400).json({ message: "userId, counselorId, appointmentDate, and slot are required" });
    }

    const counselor = await Counselor.findById(counselorId);
    if (!counselor) return res.status(404).json({ message: "Counselor not found" });

    const existing = await Appointment.findOne({
      counselorId,
      appointmentDate,
      slot,
      status: { $in: ["requested", "confirmed"] },
    });
    if (existing) return res.status(409).json({ message: "That slot is no longer available" });

    const appointment = await Appointment.create({
      userId: String(userId),
      userName: String(userName || "Anonymous").trim() || "Anonymous",
      counselorId: String(counselorId),
      counselorName: counselor.displayName,
      appointmentDate,
      slot,
      consultationType: consultationType === "video" ? "video" : "chat",
      reminders: reminders || undefined,
      notes: String(notes || "").trim(),
    });

    emitAppointment(req, appointment);
    return res.status(201).json({ appointment: toDto(appointment) });
  } catch (error) {
    console.error("Failed to create appointment:", error);
    return res.status(500).json({ message: "Failed to create appointment" });
  }
}

export async function updateAppointmentStatus(req, res) {
  try {
    await connectDB();
    const { appointmentId } = req.params;
    const { status } = req.body || {};
    if (!["requested", "confirmed", "completed", "cancelled", "missed"].includes(status)) {
      return res.status(400).json({ message: "Valid status is required" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: { status } },
      { returnDocument: "after" },
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    emitAppointment(req, appointment);
    return res.status(200).json({ appointment: toDto(appointment) });
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return res.status(500).json({ message: "Failed to update appointment" });
  }
}
