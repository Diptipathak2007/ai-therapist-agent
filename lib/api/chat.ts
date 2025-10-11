// lib/api/chat.ts - FIXED VERSION

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    technique: string;
    goal: string;
    progress: any[];
    analysis?: {
      emotionalState: string;
      themes: string[];
      riskLevel: number;
      recommendedApproach: string;
      progressIndicators: string[];
    };
  };
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse {
  message: string;
  response?: string;
  analysis?: {
    emotionalState: string;
    themes: string[];
    riskLevel: number;
    recommendedApproach: string;
    progressIndicators: string[];
  };
  metadata?: {
    technique: string;
    goal: string;
    progress: any[];
  };
}

// Use the same API_BASE_URL as your auth.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function to get auth headers with better error handling
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    console.warn("No authentication token found in localStorage");
    // You might want to redirect to login here
    throw new Error("Authentication required. Please log in.");
  }

  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

// Enhanced error handler
const handleApiError = async (response: Response, context: string) => {
  console.error(`API Error in ${context}:`, {
    status: response.status,
    statusText: response.statusText,
    url: response.url
  });

  let errorData;
  try {
    errorData = await response.json();
  } catch {
    errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
  }

  console.error(`Error details for ${context}:`, errorData);

  // Handle specific HTTP status codes
  if (response.status === 401) {
    localStorage.removeItem("token");
    throw new Error("Session expired. Please log in again.");
  } else if (response.status === 404) {
    throw new Error(`API endpoint not found: ${context}`);
  } else if (response.status >= 500) {
    throw new Error("Server error. Please try again later.");
  }

  throw new Error(errorData.error || errorData.message || `Failed to ${context}`);
};

export const getChatHistory = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    console.log(`🔍 Fetching chat history for session: ${sessionId}`);
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const headers = getAuthHeaders();
    console.log("Request headers:", { ...headers, Authorization: "Bearer ***" });

    const response = await fetch(
      `${API_BASE_URL}/api/chat/sessions/${sessionId}/history`, // ✅ Fixed: Added /api prefix
      {
        method: "GET",
        headers: headers,
      }
    );

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      await handleApiError(response, "fetch chat history");
    }

    const data = await response.json();
    console.log("✅ Received chat history data:", data);

    if (!Array.isArray(data)) {
      console.error("❌ Invalid chat history format - expected array:", data);
      throw new Error("Invalid chat history format: expected array of messages");
    }

    // Transform and validate the response data
    const messages = data.map((msg: any, index: number) => {
      if (!msg.role || !msg.content) {
        console.warn(`Invalid message at index ${index}:`, msg);
      }

      return {
        role: msg.role || "assistant",
        content: msg.content || "",
        timestamp: new Date(msg.timestamp || Date.now()),
        metadata: msg.metadata,
      };
    });

    console.log(`✅ Successfully processed ${messages.length} messages`);
    return messages;

  } catch (error) {
    console.error("❌ Error in getChatHistory:", error);
    
    // Re-throw with more context if it's not already an Error object
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Unexpected error fetching chat history: ${error}`);
    }
  }
};

export const createChatSession = async (): Promise<string> => {
  try {
    console.log("🆕 Creating new chat session...");
    
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/chat/sessions`, { // ✅ Fixed: Added /api prefix
      method: "POST",
      headers: headers,
    });

    console.log(`📡 Create session response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      await handleApiError(response, "create chat session");
    }

    const data = await response.json();
    console.log("✅ Chat session created:", data);
    
    if (!data.sessionId) {
      throw new Error("No session ID received from server");
    }

    return data.sessionId;
  } catch (error) {
    console.error("❌ Error creating chat session:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  sessionId: string,
  message: string
): Promise<ApiResponse> => {
  try {
    console.log(`📤 Sending message to session ${sessionId}:`, message);
    
    if (!sessionId || !message?.trim()) {
      throw new Error("Session ID and message are required");
    }

    const headers = getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/chat/sessions/${sessionId}/messages`, // ✅ Fixed: Added /api prefix
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ message: message.trim() }),
      }
    );

    console.log(`📡 Send message response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      await handleApiError(response, "send message");
    }

    const data = await response.json();
    console.log("✅ Message sent successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Error sending chat message:", error);
    throw error;
  }
};

export const getAllChatSessions = async (): Promise<ChatSession[]> => {
  try {
    console.log("📋 Fetching all chat sessions...");
    
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/chat/sessions`, { // ✅ Fixed: Added /api prefix
      headers: headers,
    });

    console.log(`📡 Get sessions response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      await handleApiError(response, "fetch chat sessions");
    }

    const data = await response.json();
    console.log("✅ Received chat sessions:", data);

    if (!Array.isArray(data)) {
      console.error("❌ Invalid sessions format - expected array:", data);
      throw new Error("Invalid sessions format: expected array");
    }

    return data.map((session: any) => {
      const createdAt = new Date(session.createdAt || Date.now());
      const updatedAt = new Date(session.updatedAt || Date.now());

      return {
        sessionId: session.sessionId || session._id || `session-${Date.now()}`,
        messages: (session.messages || []).map((msg: any) => ({
          role: msg.role || "assistant",
          content: msg.content || "",
          timestamp: new Date(msg.timestamp || Date.now()),
          metadata: msg.metadata,
        })),
        createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
        updatedAt: isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
      };
    });
  } catch (error) {
    console.error("❌ Error fetching chat sessions:", error);
    throw error;
  }
};

// Utility function to check if user is authenticated
export const checkAuthStatus = async (): Promise<boolean> => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};