"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const moodController_1 = require("../controllers/moodController");
const router = express_1.default.Router();
// All mood routes are protected
router.use(auth_1.auth);
// Test endpoint - add this temporarily for debugging
router.post("/test", moodController_1.testMoodEndpoint);
// POST /api/mood
router.post("/", moodController_1.createMood);
exports.default = router;
//# sourceMappingURL=mood.js.map