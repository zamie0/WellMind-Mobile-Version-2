import connectDB from "../../config/db.js";
import Peer from "../models/Peer.js";

const formatPeer = (peer) => ({
  id: peer._id.toString(),
  displayName: peer.displayName,
  isAnonymous: peer.isAnonymous,
  status: peer.status,
  bio: peer.bio,
  supportTopics: peer.supportTopics,
  specialization: peer.specialization,
  rating: peer.rating,
  experienceYears: peer.experienceYears,
  consultationMethods: peer.consultationMethods,
  joinedAt: peer.joinedAt,
  isActive: peer.isActive,
});

export async function listPeers(req, res) {
  try {
    await connectDB();

    const peers = await Peer.find({ isActive: true }).sort({ rating: -1 });

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

    const peer = await Peer.findById(peerId);

    if (!peer) {
      return res.status(404).json({ message: "Peer not found" });
    }

    return res.status(200).json({ peer: formatPeer(peer) });
  } catch (error) {
    console.error("Error fetching peer:", error);
    return res.status(500).json({ message: "Failed to fetch peer" });
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

    const peers = await Peer.find(query).sort({ rating: -1 });

    return res.status(200).json({
      peers: peers.map(formatPeer),
      total: peers.length,
    });
  } catch (error) {
    console.error("Error searching peers:", error);
    return res.status(500).json({ message: "Failed to search peers" });
  }
}
