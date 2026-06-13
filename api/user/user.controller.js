import connectDB from "../../config/db.js";
import User from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const publicUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: "user",
  status: user.status,
  avatar: user.profile?.avatar,
  onboardingCompleted: user.profile?.onboardingCompleted ?? false,
  notificationsEnabled: user.profile?.notificationsEnabled ?? true,
  hasPin: Boolean(user.pinHash),
  createdAt: user.createdAt,
});

const isValidPin = (pin) => /^\d{6}$/.test(String(pin || ""));

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

export async function updateUserProfile(req, res) {
  try {
    await connectDB();

    const { userId } = req.params;
    const { name, avatar, onboardingCompleted, notificationsEnabled } = req.body || {};
    const $set = {};
    const $unset = {};

    if (typeof name === "string") {
      const cleanName = name.trim();
      if (!cleanName) return res.status(400).json({ message: "Name is required" });
      if (cleanName.length > 80) return res.status(400).json({ message: "Name is too long" });
      $set.name = cleanName;
    }

    if (typeof avatar === "string") {
      $set["profile.avatar"] = avatar;
    } else if (avatar === null) {
      $unset["profile.avatar"] = "";
    }

    if (typeof onboardingCompleted === "boolean") {
      $set["profile.onboardingCompleted"] = onboardingCompleted;
    }

    if (typeof notificationsEnabled === "boolean") {
      $set["profile.notificationsEnabled"] = notificationsEnabled;
    }

    if (Object.keys($set).length === 0 && Object.keys($unset).length === 0) {
      return res.status(400).json({ message: "No profile changes provided" });
    }

    const update = {};
    if (Object.keys($set).length > 0) update.$set = $set;
    if (Object.keys($unset).length > 0) update.$unset = $unset;

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "User profile update failed" });
  }
}

export async function updateUserPin(req, res) {
  try {
    await connectDB();
    const { userId } = req.params;
    const { pin } = req.body || {};

    if (!isValidPin(pin)) {
      return res.status(400).json({ message: "PIN must be 6 digits" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { pinHash: hashPassword(String(pin)) } },
      { new: true },
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "PIN update failed" });
  }
}

export async function verifyUserPin(req, res) {
  try {
    await connectDB();
    const { userId } = req.params;
    const { pin } = req.body || {};

    if (!isValidPin(pin)) {
      return res.status(400).json({ message: "PIN must be 6 digits" });
    }

    const user = await User.findById(userId);
    if (!user || !user.pinHash || !verifyPassword(String(pin), user.pinHash)) {
      return res.status(401).json({ message: "Incorrect PIN" });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "PIN verification failed" });
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
