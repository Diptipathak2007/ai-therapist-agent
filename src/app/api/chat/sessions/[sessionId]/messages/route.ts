import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:3001";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const { message } = await req.json();
    const authHeader = req.headers.get("Authorization");

    console.log(`Sending message to session ${sessionId}:`, message);
    console.log("Token present:", !!authHeader);

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // FIXED: Added /api prefix and Authorization header
    const response = await fetch(
      `${BACKEND_API_URL}/api/chat/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ message }),
      }
    );

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error response:", errorText);
      
      try {
        const error = JSON.parse(errorText);
        return NextResponse.json(
          { error: error.error || error.message || "Failed to process chat message" },
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
    console.log("Message sent successfully:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}