import connectDB from "../../config/db.js";
import Counselor from "../models/Counselor.js";
import { verifyPassword } from "../utils/password.js";

const publicCounselor = (counselor) => ({
  id: counselor._id.toString(),
  email: counselor.email,
  role: "counselor",
  counselorName: counselor.displayName,
  displayName: counselor.displayName,
  specialization: counselor.specializations,
  bio: counselor.bio,
  availability: counselor.availability,
  isVerified: counselor.isVerified,
  status: counselor.status,
  createdAt: counselor.createdAt,
});

export async function listCounselors(_req, res) {
  try {
    await connectDB();
    const counselors = await Counselor.find({ status: "approved" }).sort({ rating: -1 });

    return res.status(200).json({ counselors: counselors.map(publicCounselor) });
  } catch (error) {
    console.error("Failed to list counselors:", error);
    return res.status(500).json({ message: "Failed to list counselors" });
  }
}

export async function loginCounselor(req, res) {
  try {
    await connectDB();
    const { email, password } = req.body;
    const counselor = await Counselor.findOne({ email: String(email || "").toLowerCase().trim() });

    if (!counselor || !verifyPassword(password, counselor.passwordHash)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (counselor.status !== "approved") {
      return res.status(403).json({ message: "Counselor account is not approved yet" });
    }

    return res.json({ counselor: publicCounselor(counselor) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Counselor login failed" });
  }
}
