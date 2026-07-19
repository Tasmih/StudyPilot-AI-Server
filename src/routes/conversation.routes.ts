import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createConversation,
  getConversations,
  getConversationById,
  deleteConversation,
  addMessageToConversation,
} from "../controllers/conversation.controller.js";

const conversationRouter = Router();

// Apply requireAuth middleware to protect all conversation routes
conversationRouter.use(requireAuth);

conversationRouter.post("/", createConversation);
conversationRouter.get("/", getConversations);
conversationRouter.get("/:id", getConversationById);
conversationRouter.delete("/:id", deleteConversation);
conversationRouter.post("/:id/messages", addMessageToConversation);

export default conversationRouter;
