// FILE LOCATION: app/api/chat/sessions/[sessionId]/messages/route.ts
// This is the MAIN AI AGENT that processes all messages

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// In-memory chat storage (for development)
const chatSessions = new Map<string, Array<{
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: any;
}>>();

// Next.js 15 App Router type fix
interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    // Await the params
    const { sessionId } = await context.params;
    const { message } = await req.json();
    const authHeader = req.headers.get("Authorization");

    console.log(`[AI Agent] Processing message for session: ${sessionId}`);
    console.log(`[AI Agent] User message:`, message);

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("[AI Agent] ERROR: GEMINI_API_KEY not found");
      return NextResponse.json(
        { error: "AI service is not configured. Please add GEMINI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    // Get or create chat history
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, []);
    }
    const history = chatSessions.get(sessionId)!;

    // Add user message
    history.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Configure Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are an intelligent, empathetic, and helpful AI assistant.

Core Responsibilities:
1. Answer EVERY question comprehensively and accurately
2. Maintain conversation context across multiple messages
3. Be conversational, warm, and supportive
4. Provide detailed explanations when needed
5. Ask clarifying questions if something is unclear
6. Admit when you don't know something
7. Be respectful, professional, and inclusive

Conversation Style:
- Use a friendly, natural tone
- Break down complex topics into digestible parts
- Provide examples to illustrate points
- Show empathy and understanding
- Remember previous messages in this conversation
- Be patient with all types of questions`,
    });

    // Convert history to Gemini format
    const geminiHistory = history.slice(0, -1).map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Start chat with history
    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    console.log(`[AI Agent] Sending message to Gemini...`);

    // Get AI response
    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    console.log(`[AI Agent] Received response`);

    // Add AI response to history
    history.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
      metadata: {
        technique: "conversational-ai",
        goal: "helpful-assistance",
        progress: [],
      },
    });

    chatSessions.set(sessionId, history);

    // Return response
    return NextResponse.json({
      message: "Message sent successfully",
      response: aiResponse,
      analysis: {
        emotionalState: "engaged",
        themes: ["conversation"],
        riskLevel: 0,
        recommendedApproach: "continue-dialogue",
        progressIndicators: ["active-engagement"],
      },
      metadata: {
        technique: "conversational-ai",
        goal: "helpful-assistance",
        progress: [],
      },
    });

  } catch (error: any) {
    console.error("[AI Agent] ERROR:", error);
    
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "AI service authentication failed" },
        { status: 500 }
      );
    }

    if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      return NextResponse.json(
        { error: "AI service is temporarily busy" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process your message" },
      { status: 500 }
    );
  }
}