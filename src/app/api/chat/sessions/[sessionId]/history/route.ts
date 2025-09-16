import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:3001";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const authHeader = req.headers.get("Authorization");
    
    console.log(`Getting chat history for session ${sessionId}`);
    console.log("Token present:", !!authHeader);

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    // FIXED: Added /api prefix and Authorization header
    const response = await fetch(
      `${BACKEND_API_URL}/api/chat/sessions/${sessionId}/history`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to get chat history:", errorText);
      
      try {
        const error = JSON.parse(errorText);
        return NextResponse.json(
          { error: error.error || error.message || "Failed to get chat history" },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { error: `Backend error: ${response.status} - ${errorText}` },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log("Chat history retrieved successfully:", data);

    // Format the response to match the frontend's expected format
    const formattedMessages = data.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      metadata: msg.metadata,
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("Error getting chat history:", error);
    return NextResponse.json(
      { error: "Failed to get chat history" },
      { status: 500 }
    );
  }
}