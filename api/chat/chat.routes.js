import express from "express";
import {
  getOrCreateConversation,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
  updateUserConversationName,
} from "./chat.controller.js";

const router = express.Router();

router.get("/conversations", listConversations);
router.post("/conversations", getOrCreateConversation);
router.patch("/users/:userId/display-name", updateUserConversationName);
router.get("/conversations/:conversationId/messages", listMessages);
router.post("/conversations/:conversationId/messages", sendMessage);
router.patch("/conversations/:conversationId/read", markConversationRead);

export default router;
