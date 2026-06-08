import express from "express";
import {
  getOrCreateConversation,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
} from "./chat.controller.js";

const router = express.Router();

router.get("/conversations", listConversations);
router.post("/conversations", getOrCreateConversation);
router.get("/conversations/:conversationId/messages", listMessages);
router.post("/conversations/:conversationId/messages", sendMessage);
router.patch("/conversations/:conversationId/read", markConversationRead);

export default router;
