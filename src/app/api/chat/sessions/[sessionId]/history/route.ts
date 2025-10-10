// FILE LOCATION: app/api/chat/sessions/[sessionId]/history/route.ts

import { NextRequest, NextResponse } from "next/server";

const chatSessions = new Map<string, Array<{
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: any;
}>>();

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const authHeader = req.headers.get("Authorization");

    console.log(`[History] Fetching history for session: ${sessionId}`);

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    const history = chatSessions.get(sessionId) || [];

    console.log(`[History] Found ${history.length} messages`);

    const formattedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      metadata: msg.metadata,
    }));

    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error("[History] Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}