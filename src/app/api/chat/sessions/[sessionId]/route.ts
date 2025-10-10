// FILE LOCATION: app/api/chat/sessions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const sessions = new Map<string, {
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  title?: string;
}>();

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");

    console.log("[Sessions] Creating new chat session");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    const sessionId = randomUUID();
    const now = new Date();

    const session = {
      sessionId,
      createdAt: now,
      updatedAt: now,
      title: "New Conversation",
    };

    sessions.set(sessionId, session);

    console.log(`[Sessions] Created session: ${sessionId}`);

    return NextResponse.json({
      sessionId,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error("[Sessions] Error creating chat session:", error);
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");

    console.log("[Sessions] Fetching all chat sessions");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    const allSessions = Array.from(sessions.values()).map(session => ({
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      title: session.title,
      messages: [],
    }));

    allSessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    console.log(`[Sessions] Retrieved ${allSessions.length} sessions`);

    return NextResponse.json(allSessions);
  } catch (error) {
    console.error("[Sessions] Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}