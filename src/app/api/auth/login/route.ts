import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const API_URL =
    process.env.BACKEND_API_URL ||
    "https://ai-therapist-agent-backend.onrender.com";

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Check if the response is OK (status 200-299)
    if (!res.ok) {
      // Try to get error message from response
      let errorMessage = "Login failed";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = res.statusText || errorMessage;
      }

      // Return proper error response
      return NextResponse.json(
        { 
          message: errorMessage,
          success: false 
        },
        { status: res.status }
      );
    }

    // Success case - parse and return the data
    const data = await res.json();
    
    return NextResponse.json(
      { 
        ...data,
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { 
        message: "Internal server error",
        success: false 
      },
      { status: 500 }
    );
  }
}