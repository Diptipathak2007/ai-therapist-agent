import { Request, Response } from "express";
import { ChatSession, IChatSession } from "../models/ChatSession";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { User } from "../models/User";
import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";
import inngest from "../inngest";
import { InngestEvent } from "../types/inngest";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

// Create a new chat session
export const createChatSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    console.log("createChatSession - userId from token:", userId);
    console.log("createChatSession - full req.user:", req.user);
    
    if (!userId) {
      console.log("createChatSession - No userId found");
      return res.status(401).json({ message: "Unauthorized - User not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("createChatSession - User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a unique sessionId
    const sessionId = uuidv4();

    const session = new ChatSession({
      sessionId,
      userId: new Types.ObjectId(userId),
      startTime: new Date(),
      status: "active",
      messages: [],
    });

    await session.save();
    console.log("createChatSession - Session created:", session.sessionId);

    res.status(201).json({
      message: "Chat session created successfully",
      sessionId: session.sessionId,
    });
  } catch (error) {
    logger.error("Error creating chat session:", error);
    res.status(500).json({
      message: "Error creating chat session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all chat sessions
export const getAllChatSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    console.log("getAllChatSessions - userId from token:", userId);
    
    if (!userId) {
      console.log("getAllChatSessions - No userId found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessions = await ChatSession.find({ userId }).sort({ startTime: -1 });
    console.log("getAllChatSessions - found sessions:", sessions.length);
    res.json(sessions);
  } catch (error) {
    logger.error("Get all sessions error:", error);
    res.status(500).json({ message: "Error fetching chat sessions" });
  }
};

// Get single chat session
export const getChatSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;
    console.log("getChatSession - userId from token:", userId);
    logger.info(`Getting chat session: ${sessionId}`);

    if (!userId) {
      console.log("getChatSession - No userId found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await ChatSession.findOne({ sessionId, userId });
    if (!session) {
      console.log("getChatSession - Session not found:", sessionId);
      logger.warn(`Chat session not found: ${sessionId}`);
      return res.status(404).json({ message: "Session not found" });
    }

    logger.info(`Found chat session: ${sessionId}`);
    res.json(session);
  } catch (error) {
    logger.error("Failed to get chat session:", error);
    res.status(500).json({ message: "Error fetching chat session" });
  }
};

// Get chat history
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;
    console.log("getChatHistory - userId from token:", userId);

    if (!userId) {
      console.log("getChatHistory - No userId found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await ChatSession.findOne({ sessionId, userId });
    if (!session) {
      console.log("getChatHistory - Session not found:", sessionId);
      return res.status(404).json({ message: "Session not found" });
    }

    console.log("getChatHistory - returning messages:", session.messages.length);
    res.json(session.messages);
  } catch (error) {
    logger.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
};

// Send message with AI therapy integration
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = req.user?.userId;
    
    console.log("sendMessage - userId from token:", userId);
    logger.info("Processing message:", { sessionId, message });

    if (!userId) {
      console.log("sendMessage - No userId found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!message) {
      console.log("sendMessage - No message provided");
      return res.status(400).json({ message: "Message required" });
    }

    // Find session by sessionId
    const session = await ChatSession.findOne({ sessionId, userId });
    if (!session) {
      console.log("sendMessage - Session not found:", sessionId);
      logger.warn("Session not found:", { sessionId });
      return res.status(404).json({ message: "Session not found" });
    }

    // Create Inngest event for message processing (if inngest is configured)
    try {
      const event: InngestEvent = {
        name: "therapy/session.message",
        data: {
          message,
          history: session.messages,
          memory: {
            userProfile: {
              emotionalState: [],
              riskLevel: 0,
              preferences: {},
            },
            sessionContext: {
              conversationThemes: [],
              currentTechnique: null,
            },
          },
          goals: [],
          systemPrompt: `You are an AI therapist assistant. Your role is to:
          1. Provide empathetic and supportive responses
          2. Use evidence-based therapeutic techniques
          3. Maintain professional boundaries
          4. Monitor for risk factors
          5. Guide users toward their therapeutic goals
          6. Be supportive but not replace professional therapy`,
        },
      };

      logger.info("Sending message to Inngest:", { event });
      // Send event to Inngest for logging and analytics
      if (inngest) {
        await inngest.send(event);
      }
    } catch (inngestError) {
      logger.warn("Inngest event failed, continuing with AI processing:", inngestError);
    }

    // Process the message directly using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Analyze the message
    const analysisPrompt = `Analyze this therapy message and provide insights. Return ONLY a valid JSON object with no markdown formatting or additional text.
    Message: ${message}
    Previous messages: ${JSON.stringify(session.messages.slice(-5))} // Last 5 messages for context
    
    Required JSON structure:
    {
      "emotionalState": "string (e.g., anxious, depressed, hopeful, angry, neutral)",
      "themes": ["string array of conversation themes"],
      "riskLevel": number (0-10, where 0 is no risk, 10 is high risk),
      "recommendedApproach": "string (CBT, mindfulness, validation, etc.)",
      "progressIndicators": ["string array of positive/negative indicators"]
    }`;

    let analysis;
    try {
      const analysisResult = await model.generateContent(analysisPrompt);
      const analysisText = analysisResult.response.text().trim();
      const cleanAnalysisText = analysisText
        .replace(/```json\n|\n```/g, "")
        .trim();
      analysis = JSON.parse(cleanAnalysisText);
      logger.info("Message analysis:", analysis);
    } catch (analysisError) {
      logger.warn("Analysis failed, using default:", analysisError);
      analysis = {
        emotionalState: "neutral",
        themes: ["general"],
        riskLevel: 0,
        recommendedApproach: "supportive",
        progressIndicators: ["engaged in conversation"]
      };
    }

    // Generate therapeutic response
    const responsePrompt = `You are an AI therapy assistant. Provide a supportive, empathetic response that:

    1. Acknowledges the user's feelings and validates their experience
    2. Uses appropriate therapeutic techniques based on the analysis
    3. Maintains professional boundaries while being warm and supportive
    4. Considers safety and well-being
    5. Encourages positive coping strategies
    6. Does not diagnose or replace professional therapy

    User's message: ${message}
    Analysis: ${JSON.stringify(analysis)}
    Recent conversation context: ${JSON.stringify(session.messages.slice(-3))}

    Provide a thoughtful, professional therapeutic response that helps the user process their thoughts and feelings while maintaining appropriate boundaries.`;

    let response;
    let debugError;
    try {
      const responseResult = await model.generateContent(responsePrompt);
      response = responseResult.response.text().trim();
      logger.info("Generated AI response successfully");
    } catch (aiError) {
      logger.error("AI response generation failed:", aiError);
      debugError = aiError instanceof Error ? aiError.message : String(aiError);
      response = "I understand you're sharing something important with me. While I'm experiencing a technical issue right now, I want you to know that your feelings and experiences matter. If you're in crisis or need immediate support, please consider reaching out to a mental health professional or crisis hotline.";
    }

    // Add messages to session history
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    session.messages.push({
      role: "assistant",
      content: response,
      timestamp: new Date(),
      metadata: {
        analysis,
        progress: {
          emotionalState: analysis.emotionalState,
          riskLevel: analysis.riskLevel,
        },
      },
    });

    // Save the updated session
    await session.save();
    console.log("sendMessage - Messages saved, total messages:", session.messages.length);
    logger.info("Session updated successfully:", { sessionId });

    // Return the response
    res.json({
      response,
      message: response,
      analysis,
      metadata: {
        progress: {
          emotionalState: analysis.emotionalState,
          riskLevel: analysis.riskLevel,
        },
        debugError, // Include error details for frontend debugging
      },
    });
  } catch (error) {
    logger.error("Error in sendMessage:", error);
    res.status(500).json({
      message: "Error processing message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get session history (legacy support)
export const getSessionHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await ChatSession.findOne({ sessionId, userId }) as IChatSession;
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({
      messages: session.messages,
      startTime: session.startTime,
      status: session.status,
    });
  } catch (error) {
    logger.error("Error fetching session history:", error);
    res.status(500).json({ message: "Error fetching session history" });
  }
};