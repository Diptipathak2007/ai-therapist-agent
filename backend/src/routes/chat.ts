import express from "express";
import { auth } from "../middleware/auth";
import {
  createChatSession,
  sendMessage,
  getChatHistory,
  getChatSession,
  getAllChatSessions,
} from "../controllers/chat";

const router = express.Router();

// All chat routes require authentication
router.use(auth);

// Chat session routes
router.post("/sessions", createChatSession); // create a new session
router.get("/sessions", getAllChatSessions); // get all sessions
router.get("/sessions/:sessionId", getChatSession); // get one session
router.get("/sessions/:sessionId/history", getChatHistory); // session messages
router.post("/sessions/:sessionId/messages", sendMessage); // send message

export default router;
