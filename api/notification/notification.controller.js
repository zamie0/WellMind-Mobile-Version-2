import connectDB from "../../config/db.js";
import Counselor from "../models/Counselor.js";
import User from "../models/User.js";

export async function registerPushToken(req, res) {
  try {
    await connectDB();

    const { role, participantId, token, platform } = req.body || {};
    if (!["user", "counselor"].includes(role) || !participantId || !token) {
      return res.status(400).json({ message: "role, participantId, and token are required" });
    }

    const Model = role === "counselor" ? Counselor : User;
    const participant = await Model.findById(participantId);
    if (!participant) return res.status(404).json({ message: "Participant not found" });

    participant.pushTokens = [
      ...(participant.pushTokens || []).filter((item) => item.token !== token),
      {
        token,
        platform: String(platform || "android"),
        updatedAt: new Date(),
      },
    ].slice(-5);

    await participant.save();
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Failed to register push token:", error);
    return res.status(500).json({ message: "Failed to register push token" });
  }
}
