// lib/api/auth.ts - FIXED VERSION

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function registerUser(name: string, email: string, password: string) {
  console.log("=== REGISTER DEBUG ===");
  console.log("API_BASE_URL:", API_BASE_URL);
  console.log("Request data:", { name, email, password: "***" });

  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {  // ✅ Fixed!
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ name, email, password }),
  });

  console.log("Response status:", res.status);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error("Registration error:", error);
    throw new Error(error.message || "Registration failed");
  }

  const data = await res.json();
  console.log("Registration response:", data);

  if (data.token) {
    localStorage.setItem("token", data.token);
    console.log("Token stored in localStorage after registration:", data.token.substring(0, 10) + "...");
  }

  return data;
}

export async function loginUser(email: string, password: string) {
  console.log("=== LOGIN DEBUG ===");
  console.log("API_BASE_URL:", API_BASE_URL);
  console.log("Request data:", { email, password: "***" });

  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {  // ✅ Fixed!
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ email, password }),
  });

  console.log("Response status:", res.status);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error("Login error:", error);
    throw new Error(error.message || "Login failed");
  }

  const data = await res.json();
  console.log("Login response:", data);

  // Save token in localStorage
  if (data.token) {
    localStorage.setItem("token", data.token);
    console.log("Token stored in localStorage:", data.token.substring(0, 10) + "...");
  } else {
    console.warn("No token received from login API");
  }

  return data;
}

export async function logoutUser() {
  const token = localStorage.getItem("token");
  
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Clear token regardless of API call success
  localStorage.removeItem("token");
}

// Helper function to get current user
export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("No authentication token found");
  }

  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      throw new Error("Session expired");
    }
    throw new Error("Failed to get user data");
  }

  return res.json();
}