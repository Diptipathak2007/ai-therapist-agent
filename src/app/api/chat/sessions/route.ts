import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:3001";

// GET /api/chat/sessions - Get all chat sessions
export async function GET(req: NextRequest) {
  try {
    console.log("=== GET /api/chat/sessions DEBUG ===");
    const authHeader = req.headers.get("Authorization");
    
    console.log("Token present:", !!authHeader);
    console.log("Full Authorization header:", authHeader); // Show full header
    console.log("Backend URL:", BACKEND_API_URL);

    if (!authHeader) {
      console.log("❌ No authorization header");
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    // FIXED: Added /api prefix to match your backend
    const backendUrl = `${BACKEND_API_URL}/api/chat/sessions`;
    console.log("📞 Calling backend URL:", backendUrl);
    console.log("📋 Sending headers:", {
      "Content-Type": "application/json",
      Authorization: authHeader.substring(0, 30) + "..." // Show first 30 chars
    });

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    console.log("📥 Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      console.error("❌ Response status:", response.status);
      
      try {
        const error = JSON.parse(errorText);
        return NextResponse.json(
          { error: error.error || error.message || "Failed to fetch chat sessions" },
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
    console.log("✅ Chat sessions fetched:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}

// POST /api/chat/sessions - Create new chat session
export async function POST(req: NextRequest) {
  try {
    console.log("Creating new chat session...");
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    // FIXED: Added /api prefix to match your backend
    const backendUrl = `${BACKEND_API_URL}/api/chat/sessions`;
    console.log("📞 Calling backend URL:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    console.log("📥 Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      
      try {
        const error = JSON.parse(errorText);
        return NextResponse.json(
          { error: error.error || error.message || "Failed to create chat session" },
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
    console.log("✅ Chat session created:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error creating chat session:", error);
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}