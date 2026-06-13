import mongoose from "mongoose";
import connectDB from "../../config/db.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Counselor from "../models/Counselor.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

const toConversationDto = (conversation) => ({
  id: conversation._id.toString(),
  userId: conversation.userId.toString(),
  counselorId: conversation.counselorId.toString(),
  userName: conversation.userName,
  counselorName: conversation.counselorName,
  lastMessage: conversation.lastMessage,
  lastMessageAt: conversation.lastMessageAt || conversation.updatedAt,
  unreadForUser: conversation.unreadForUser,
  unreadForCounselor: conversation.unreadForCounselor,
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
});

const toMessageDto = (message) => ({
  id: message._id.toString(),
  conversationId: message.conversationId.toString(),
  senderId: message.senderId.toString(),
  senderRole: message.senderRole,
  senderName: message.senderName,
  text: message.text,
  attachment: message.attachment?.base64 ? message.attachment : undefined,
  isRead: message.isRead,
  createdAt: message.createdAt,
});

const sanitizeAttachment = (attachment) => {
  if (!attachment || typeof attachment !== "object") return null;

  const name = String(attachment.name || "").trim();
  const type = attachment.type === "image" ? "image" : attachment.type === "file" ? "file" : "";
  const mimeType = String(attachment.mimeType || "").trim() || (type === "image" ? "image/jpeg" : "application/octet-stream");
  const base64 = String(attachment.base64 || "");
  const size = Number(attachment.size || 0);

  if (!name || !type || !base64 || !Number.isFinite(size) || size <= 0 || size > 5 * 1024 * 1024) {
    return null;
  }

  return {
    id: String(attachment.id || new mongoose.Types.ObjectId().toString()),
    name: name.slice(0, 180),
    type,
    mimeType: mimeType.slice(0, 120),
    base64,
    size,
  };
};

const emitConversationUpdate = (req, conversation) => {
  const io = req.app.get("io");
  if (!io) return;
  const dto = toConversationDto(conversation);
  io.to(`user:${dto.userId}`).to(`counselor:${dto.counselorId}`).emit("conversation:updated", dto);
};

const emitMessage = (req, conversation, message) => {
  const io = req.app.get("io");
  if (!io) return;
  const dto = toMessageDto(message);
  io.to(`conversation:${dto.conversationId}`).emit("message:new", dto);
  emitConversationUpdate(req, conversation);
};

export async function getOrCreateConversation(req, res) {
  try {
    await connectDB();

    const { userId, counselorId, userName } = req.body || {};
    if (!String(userId || "").trim() || !isObjectId(counselorId)) {
      return res.status(400).json({ message: "Valid userId and counselorId are required" });
    }

    const counselor = await Counselor.findById(counselorId);
    if (!counselor) return res.status(404).json({ message: "Counselor not found" });

    const user = isObjectId(userId) ? await User.findById(userId) : null;
    const safeUserName = String(userName || user?.name || "Anonymous").trim() || "Anonymous";

    const conversation = await Conversation.findOneAndUpdate(
      { userId, counselorId },
      {
        $setOnInsert: {
          userId,
          counselorId,
        },
        $set: {
          userName: safeUserName,
          counselorName: counselor.displayName,
        },
      },
      { returnDocument: "after", upsert: true },
    );

    emitConversationUpdate(req, conversation);
    return res.status(200).json({ conversation: toConversationDto(conversation) });
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return res.status(500).json({ message: "Failed to create conversation" });
  }
}

export async function listConversations(req, res) {
  try {
    await connectDB();

    const { role, participantId } = req.query;
    if (!["user", "counselor"].includes(role) || !String(participantId || "").trim()) {
      return res.status(400).json({ message: "Valid role and participantId are required" });
    }

    const filter = role === "user" ? { userId: participantId } : { counselorId: participantId };
    const conversations = await Conversation.find(filter).sort({ updatedAt: -1 }).limit(100);

    return res.status(200).json({ conversations: conversations.map(toConversationDto) });
  } catch (error) {
    console.error("Failed to list conversations:", error);
    return res.status(500).json({ message: "Failed to list conversations" });
  }
}

export async function listMessages(req, res) {
  try {
    await connectDB();

    const { conversationId } = req.params;
    if (!isObjectId(conversationId)) {
      return res.status(400).json({ message: "Valid conversationId is required" });
    }

    const limit = Math.min(Number(req.query.limit || 80), 200);
    const messages = await Message.find({ conversationId }).sort({ createdAt: -1 }).limit(limit);

    return res.status(200).json({ messages: messages.reverse().map(toMessageDto) });
  } catch (error) {
    console.error("Failed to list messages:", error);
    return res.status(500).json({ message: "Failed to list messages" });
  }
}

export async function sendMessage(req, res) {
  try {
    await connectDB();

    const { conversationId } = req.params;
    const { senderId, senderRole, senderName, text, attachment } = req.body || {};
    const cleanText = String(text || "").trim();
    const cleanAttachment = sanitizeAttachment(attachment);

    if (!isObjectId(conversationId) || !String(senderId || "").trim() || !["user", "counselor"].includes(senderRole) || (!cleanText && !cleanAttachment)) {
      return res.status(400).json({ message: "conversationId, senderId, senderRole, and text or attachment are required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    const expectedSenderId = senderRole === "user" ? conversation.userId : conversation.counselorId;
    if (expectedSenderId.toString() !== String(senderId)) {
      return res.status(403).json({ message: "Sender is not a participant in this conversation" });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      senderRole,
      senderName: String(senderName || "").trim(),
      text: cleanText,
      attachment: cleanAttachment || undefined,
      isRead: false,
    });

    conversation.lastMessage = cleanText || (cleanAttachment?.type === "image" ? "Image attachment" : cleanAttachment?.name || "Attachment");
    conversation.lastMessageAt = message.createdAt;
    if (senderRole === "user") {
      conversation.unreadForCounselor += 1;
      conversation.unreadForUser = 0;
    } else {
      conversation.unreadForUser += 1;
      conversation.unreadForCounselor = 0;
    }
    await conversation.save();

    emitMessage(req, conversation, message);
    return res.status(201).json({ message: toMessageDto(message), conversation: toConversationDto(conversation) });
  } catch (error) {
    console.error("Failed to send message:", error);
    return res.status(500).json({ message: "Failed to send message" });
  }
}

export async function markConversationRead(req, res) {
  try {
    await connectDB();

    const { conversationId } = req.params;
    const { readerRole } = req.body || {};
    if (!isObjectId(conversationId) || !["user", "counselor"].includes(readerRole)) {
      return res.status(400).json({ message: "Valid conversationId and readerRole are required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    await Message.updateMany(
      { conversationId, senderRole: { $ne: readerRole }, isRead: false },
      { $set: { isRead: true } },
    );

    if (readerRole === "user") conversation.unreadForUser = 0;
    else conversation.unreadForCounselor = 0;
    await conversation.save();

    emitConversationUpdate(req, conversation);
    return res.status(200).json({ conversation: toConversationDto(conversation) });
  } catch (error) {
    console.error("Failed to mark conversation read:", error);
    return res.status(500).json({ message: "Failed to mark conversation read" });
  }
}
