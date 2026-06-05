import connectDB from "../../config/db.js";
import Counselor from "../models/Counselor.js";

const formatPeer = (counselor) => ({
  id: counselor._id.toString(),
  displayName: counselor.displayName,
  isAnonymous: counselor.isAnonymous,
  status: counselor.status,
  bio: counselor.bio,
  supportTopics: counselor.supportTopics,
  specialization: counselor.specialization,
  rating: counselor.rating,
  experienceYears: counselor.experienceYears,
  consultationMethods: counselor.consultationMethods,
  joinedAt: counselor.joinedAt,
  isActive: counselor.isActive,
});

export async function listPeers(req, res) {
  try {
    await connectDB();

    const peers = await Counselor.find({ isActive: true }).sort({ rating: -1 });

    return res.status(200).json({
      peers: peers.map(formatPeer),
      total: peers.length,
    });
  } catch (error) {
    console.error("Error listing peers:", error);
    return res.status(500).json({ message: "Failed to fetch peers" });
  }
}

export async function getPeerById(req, res) {
  try {
    await connectDB();
    const { peerId } = req.params;

    const counselor = await Counselor.findById(peerId);

    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    return res.status(200).json({ counselor: formatPeer(counselor) });
  } catch (error) {
    console.error("Error fetching counselor:", error);
    return res.status(500).json({ message: "Failed to fetch counselor" });
  }
}

export async function searchPeers(req, res) {
  try {
    await connectDB();
    const { topic, specialization } = req.query;

    let query = { isActive: true };

    if (topic) {
      query.supportTopics = { $in: [topic] };
    }

    if (specialization) {
      query.specialization = specialization;
    }

    const peers = await Counselor.find(query).sort({ rating: -1 });

    return res.status(200).json({
      peers: peers.map(formatPeer),
      total: peers.length,
    });
  } catch (error) {
    console.error("Error searching peers:", error);
    return res.status(500).json({ message: "Failed to search peers" });
  }
}
