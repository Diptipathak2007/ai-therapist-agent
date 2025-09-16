import express from "express";
import { auth } from "../middleware/auth";
import { createMood, testMoodEndpoint } from "../controllers/moodController";

const router = express.Router();

// All mood routes are protected
router.use(auth);

// Test endpoint - add this temporarily for debugging
router.post("/test", testMoodEndpoint);

// POST /api/mood
router.post("/", createMood);

export default router;