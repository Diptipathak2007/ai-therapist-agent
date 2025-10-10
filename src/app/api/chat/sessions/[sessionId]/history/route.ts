import { NextRequest, NextResponse } from "next/server";

// Next.js 15 App Router type fix
interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Await the params
    const { sessionId } = await context.params;
    
    const API_URL =
      process.env.BACKEND_API_URL ||
      "https://ai-therapist-agent-backend.onrender.com";

    const res = await fetch(`${API_URL}/chat/sessions/${sessionId}/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Failed to fetch chat history" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}