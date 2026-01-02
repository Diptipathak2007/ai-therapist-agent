"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const chat_1 = require("../controllers/chat");
const router = express_1.default.Router();
// All chat routes require authentication
router.use(auth_1.auth);
// Chat session routes
router.post("/sessions", chat_1.createChatSession); // create a new session
router.get("/sessions", chat_1.getAllChatSessions); // get all sessions
router.get("/sessions/:sessionId", chat_1.getChatSession); // get one session
router.get("/sessions/:sessionId/history", chat_1.getChatHistory); // session messages
router.post("/sessions/:sessionId/messages", chat_1.sendMessage); // send message
exports.default = router;
//# sourceMappingURL=chat.js.map