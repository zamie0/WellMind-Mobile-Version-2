import connectDB from "../../config/db.js";
import Peer from "../models/Peer.js";

const INITIAL_PEERS = [
  {
    displayName: "Khoo Weng Yen",
    isAnonymous: false,
    status: "online",
    bio: "Anxiety and stress management specialist with 1 year of peer support experience",
    supportTopics: ["Anxiety", "Stress", "Work-life balance"],
    specialization: "Anxiety & Stress Specialist",
    rating: 4.9,
    experienceYears: 1,
    consultationMethods: ["chat", "video"],
    isActive: true,
    joinedAt: new Date("2024-01-15"),
  },
  {
    displayName: "Aina Yusuf",
    isAnonymous: false,
    status: "online",
    bio: "Specialized in student mental health and life transitions",
    supportTopics: ["Depression", "Loneliness", "Life transitions"],
    specialization: "Student Mental Health Support",
    rating: 4.7,
    experienceYears: 5,
    consultationMethods: ["chat", "video"],
    isActive: true,
    joinedAt: new Date("2024-02-20"),
  },
  {
    displayName: "Daniel Tan",
    isAnonymous: false,
    status: "away",
    bio: "Expert in relationship counseling and emotional wellness",
    supportTopics: ["Academic stress", "Relationships", "Self-esteem"],
    specialization: "Relationship & Emotional Wellness",
    rating: 4.8,
    experienceYears: 6,
    consultationMethods: ["chat", "video"],
    isActive: true,
    joinedAt: new Date("2024-03-10"),
  },
  {
    displayName: "Mei Lin",
    isAnonymous: false,
    status: "online",
    bio: "Mindfulness coach focused on wellness and coping strategies",
    supportTopics: ["General support", "Mindfulness", "Coping strategies"],
    specialization: "Mindfulness & Wellness Coach",
    rating: 4.6,
    experienceYears: 4,
    consultationMethods: ["chat", "video"],
    isActive: true,
    joinedAt: new Date("2024-04-05"),
  },
  {
    displayName: "Ravi Nair",
    isAnonymous: false,
    status: "busy",
    bio: "Grief counselor with expertise in family issues and personal growth",
    supportTopics: ["Family issues", "Grief", "Personal growth"],
    specialization: "Grief & Family Counsellor",
    rating: 4.8,
    experienceYears: 7,
    consultationMethods: ["chat", "video"],
    isActive: true,
    joinedAt: new Date("2024-05-12"),
  },
];

export async function seedPeers() {
  try {
    await connectDB();

    // Check if peers already exist
    const existingCount = await Peer.countDocuments();
    if (existingCount > 0) {
      console.log(`Peers already seeded (found ${existingCount} peers). Skipping seed.`);
      return;
    }

    const inserted = await Peer.insertMany(INITIAL_PEERS);
    console.log(`Successfully seeded ${inserted.length} peers`);
  } catch (error) {
    console.error("Error seeding peers:", error);
  }
}

export async function seedPeersAPI(req, res) {
  try {
    await connectDB();

    const existingCount = await Peer.countDocuments();
    if (existingCount > 0) {
      return res.status(200).json({
        message: "Peers already exist",
        count: existingCount,
      });
    }

    const inserted = await Peer.insertMany(INITIAL_PEERS);
    return res.status(201).json({
      message: "Peers seeded successfully",
      count: inserted.length,
    });
  } catch (error) {
    console.error("Error seeding peers:", error);
    return res.status(500).json({ message: "Failed to seed peers" });
  }
}
