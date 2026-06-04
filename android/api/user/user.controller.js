import connectDB from "../../config/db.js";
import User from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const publicUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: "user",
  status: user.status,
  createdAt: user.createdAt,
});

export async function registerUser(req, res) {
  try {
    await connectDB();
    const { email, password, name } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      name: String(name || "").trim(),
      profile: {
        reminderTime: "",
        onboardingCompleted: false,
        notificationsEnabled: true,
      },
    });

    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "User registration failed" });
  }
}

export async function loginUser(req, res) {
  try {
    await connectDB();
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || "").toLowerCase().trim() });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "User login failed" });
  }
}
