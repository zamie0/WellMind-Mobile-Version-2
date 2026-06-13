import Counselor from "../models/Counselor.js";
import User from "../models/User.js";

const FCM_ENDPOINT = "https://fcm.googleapis.com/fcm/send";

const getParticipantTokens = async (role, participantId) => {
  const Model = role === "counselor" ? Counselor : User;
  const participant = await Model.findById(participantId).select("pushTokens");
  return (participant?.pushTokens || []).map((item) => item.token).filter(Boolean);
};

export async function sendPushToParticipant(role, participantId, payload) {
  const serverKey = process.env.FCM_SERVER_KEY;
  if (!serverKey) {
    console.warn("FCM_SERVER_KEY is not configured; push notification skipped.");
    return;
  }

  const tokens = await getParticipantTokens(role, participantId);
  if (!tokens.length) return;

  await Promise.all(tokens.map(async (token) => {
    try {
      const response = await fetch(FCM_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `key=${serverKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: token,
          priority: "high",
          notification: {
            title: payload.title,
            body: payload.body,
          },
          data: payload.data || {},
        }),
      });

      if (!response.ok) {
        console.warn("FCM push failed:", await response.text());
      }
    } catch (error) {
      console.error("Failed to send FCM push:", error);
    }
  }));
}
